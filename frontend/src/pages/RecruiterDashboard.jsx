import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle, Clock, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [jobName, setJobName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, complete
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: acceptedFiles => {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  });

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const processBatch = async () => {
    if (files.length === 0 || !jobDescription.trim() || !jobName.trim()) return;
    
    setStatus('processing');
    setProgress(0);
    setResults([]);

    const sortedResults = [];
    
    let campaignId = null;
    if (user) {
      // Create or get the Job Campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('job_campaigns')
        .upsert(
          { user_id: user.id, job_name: jobName, job_description: jobDescription },
          { onConflict: 'user_id, job_name' }
        )
        .select()
        .single();
        
      if (campaignError) console.error("Campaign Creation Error:", campaignError);
      if (campaignData) campaignId = campaignData.id;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('job_description', jobDescription);

        const response = await fetch('http://localhost:8000/analyze', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const analysisData = {
            candidate_name: file.name,
            ...data
          };
          
          sortedResults.push(analysisData);
          setResults([...sortedResults].sort((a, b) => b.ats_score - a.ats_score));

          if (user) {
            // Upload PDF to Supabase Storage
            let resumeUrl = null;
            const filePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
            const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, file);
            if (!uploadError) resumeUrl = filePath;

            // Save to Supabase
            await supabase.from('analysis_history').insert([{
              user_id: user.id,
              campaign_id: campaignId,
              resume_url: resumeUrl,
              candidate_name: file.name,
              ats_score: data.ats_score,
              match_level: data.match_level,
              full_results: data
            }]);
          }
        }
      } catch (err) {
        console.error(`Failed to process ${file.name}:`, err);
      }

      setProgress(((i + 1) / files.length) * 100);

      // Throttling: Google Gemini Free limits to 15 Requests Per Minute
      // We wait 4 seconds between requests to ensure we stay around ~15 RPM safely.
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 4200));
      }
    }

    setStatus('complete');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-text flex items-center gap-3">
            <Trophy className="w-8 h-8 text-accent" /> Batch Studio
          </h2>
          <p className="text-textMuted mt-2">Upload multiple resumes to generate a ranked leaderboard.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Upload Column */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-textMuted">Upload Resumes (Up to 100 PDFs)</label>
          <div 
            {...getRootProps()} 
            className={`glass-panel border-2 border-dashed rounded-2xl p-8 hover:bg-surface/90 transition-all cursor-pointer text-center h-48 flex flex-col items-center justify-center
              ${isDragActive ? 'border-accent bg-accent/5' : 'border-white/20'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-8 h-8 text-textMuted mb-2" />
            <p className="font-medium text-text">Drag & drop multiple PDFs</p>
            <p className="text-sm text-textMuted mt-1">or click to browse files</p>
          </div>

          {files.length > 0 && (
            <div className="glass-panel rounded-xl p-4 max-h-48 overflow-y-auto">
              <p className="text-xs font-bold text-textMuted mb-2 uppercase">{files.length} Files Queued</p>
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-2 rounded-lg text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300 ml-4">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* JD & Controls Column */}
        <div className="space-y-4 flex flex-col">
          <label className="block text-sm font-medium text-textMuted">Job Name / Campaign Title</label>
          <input 
            type="text"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-text placeholder-textMuted focus:outline-none focus:border-accent"
            placeholder="e.g. Senior Software Engineer - May 2026"
          />

          <label className="block text-sm font-medium text-textMuted mt-4">Job Description</label>
          <div className="glass-panel rounded-2xl p-1 flex-1 min-h-[12rem]">
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-full bg-transparent resize-none outline-none p-4 text-sm scrollbar-thin placeholder-textMuted/50"
              placeholder="Paste the target job description here..."
            />
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
            <div className="text-sm text-textMuted flex items-center gap-2">
              <Clock className="w-4 h-4" /> Estimated Wait: {files.length * 4.2 > 60 ? `${(files.length * 4.2 / 60).toFixed(1)} mins` : `${Math.ceil(files.length * 4.2)} secs`}
            </div>
            
            <button
              onClick={processBatch}
              disabled={status === 'processing' || files.length === 0 || !jobDescription || !jobName}
              className="bg-accent hover:bg-accent/80 text-white px-6 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {status === 'processing' ? 'Processing...' : 'Rank Candidates'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Leaderboard */}
      {(status === 'processing' || status === 'complete' || results.length > 0) && (
        <div className="glass-panel rounded-2xl p-6">
          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <h3 className="text-xl font-bold text-text flex items-center gap-2">
                Candidate Leaderboard {status === 'complete' && <CheckCircle className="w-5 h-5 text-green-500" />}
              </h3>
              <span className="text-accent text-sm font-bold">{Math.round(progress)}% Completed</span>
            </div>
            <div className="w-full bg-surface h-2 rounded-full overflow-hidden">
              <div 
                className="bg-accent h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((candidate, idx) => (
                <div key={idx} className="bg-surface border border-white/5 p-4 rounded-xl flex items-center gap-6">
                  <div className="text-2xl font-bold text-textMuted w-8">#{idx + 1}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-text text-lg">{candidate.candidate_name}</h4>
                    <p className="text-sm text-textMuted line-clamp-1">{candidate.summary}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      candidate.match_level === 'Excellent' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      candidate.match_level === 'Good' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                     }`}>
                      {candidate.match_level}
                    </span>
                    <div className={`text-xl font-black ${
                      candidate.ats_score >= 80 ? 'text-green-500' : 
                      candidate.ats_score >= 60 ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                      {candidate.ats_score}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-textMuted">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
              Processing first candidate...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ResultsDisplay from './ResultsDisplay';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  });

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume first.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('job_description', jobDescription);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Upload Column */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-textMuted ml-1">1. Upload Resume (PDF)</label>
          <div 
            {...getRootProps()} 
            className={`glass-panel border-2 border-dashed rounded-2xl p-8 hover:bg-surface/90 transition-all cursor-pointer text-center h-64 flex flex-col items-center justify-center
              ${isDragActive ? 'border-primary-500 bg-primary-500/5' : 'border-white/20'}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary-500" />
                </div>
                <p className="font-semibold text-text">{file.name}</p>
                <p className="text-xs text-textMuted mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </motion.div>
            ) : (
              <>
                <div className="w-16 h-16 bg-surface border border-white/5 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-textMuted" />
                </div>
                <p className="font-medium text-text">Drag & drop your PDF here</p>
                <p className="text-sm text-textMuted mt-2">or click to browse files</p>
              </>
            )}
          </div>
        </div>

        {/* JD Column */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-textMuted ml-1">2. Paste Job Description</label>
          <div className="glass-panel rounded-2xl p-1 h-64 flex flex-col">
            <textarea 
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="flex-1 w-full bg-transparent resize-none outline-none p-4 text-sm scrollbar-thin placeholder-textMuted/50"
              placeholder="Paste the full job description here..."
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button 
          onClick={handleAnalyze} 
          disabled={loading || !file || !jobDescription}
          className="relative overflow-hidden group bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold tracking-wide transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] flex items-center gap-3"
        >
          {loading ? (
             <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</>
          ) : (
             <><Sparkles className="w-5 h-5" /> Analyze Resume Fitness</>
          )}
          
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-[-10%] rounded-xl transition-transform duration-300 pointer-events-none hidden md:block"></div>
        </button>
      </div>

      {results && (
        <div className="mt-12">
          <ResultsDisplay results={results} />
        </div>
      )}
    </div>
  );
}

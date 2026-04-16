import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2, Calendar, TrendingUp, Folder, ArrowLeft, DownloadCloud, FileText } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';

export default function History() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    if (user) fetchCampaigns();
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('job_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const viewCampaign = async (campaign) => {
    setActiveCampaign(campaign);
    setLoadingCandidates(true);
    try {
      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('ats_score', { ascending: false });

      if (error) throw error;
      setCandidates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const downloadPdf = async (resumeUrl, candidateName) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resumeUrl, 60 * 60); // 1 hour valid

      if (error) throw error;
      
      // Open in new tab or trigger download
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to securely fetch the PDF. It may have been deleted.");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  // Render Campaign Details / Leaderboard
  if (activeCampaign) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
        <button 
          onClick={() => setActiveCampaign(null)}
          className="flex items-center gap-2 text-textMuted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Campaigns
        </button>

        <h2 className="text-3xl font-bold mb-2 text-text flex items-center gap-3">
          <Folder className="w-8 h-8 text-primary-500" /> {activeCampaign.job_name}
        </h2>
        <p className="text-textMuted mb-8 pl-11 line-clamp-2 max-w-2xl text-sm">
          {activeCampaign.job_description || "No description provided."}
        </p>

        {loadingCandidates ? (
           <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
        ) : candidates.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <p className="text-textMuted">No candidates found for this campaign.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {candidates.map((candidate, idx) => (
              <div key={candidate.id} className="bg-surface border border-white/5 p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6 group">
                <div className="text-2xl font-bold text-textMuted w-8 flex-shrink-0">#{idx + 1}</div>
                
                <div className="flex-1">
                  <h4 className="font-bold text-text text-lg flex items-center gap-2">
                    {candidate.candidate_name}
                  </h4>
                  <p className="text-sm text-textMuted mt-1 line-clamp-2 max-w-2xl">
                    {candidate.full_results?.summary || "No summary available."}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                  {candidate.resume_url ? (
                    <button 
                      onClick={() => downloadPdf(candidate.resume_url, candidate.candidate_name)}
                      className="cursor-pointer flex items-center gap-2 text-xs font-medium bg-white/5 hover:bg-primary-500/20 text-white hover:text-primary-400 px-4 py-2 rounded-lg border border-white/10 transition-colors"
                    >
                      <DownloadCloud className="w-4 h-4" /> View PDF
                    </button>
                  ) : (
                    <span className="text-xs text-textMuted italic px-4">No PDF</span>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      candidate.match_level === 'Excellent' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      candidate.match_level === 'Good' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                     }`}>
                      {candidate.match_level}
                    </span>
                    <div className="w-12 h-12 flex-shrink-0">
                      <CircularProgressbar 
                        value={candidate.ats_score} 
                        text={`${candidate.ats_score}`} 
                        styles={buildStyles({
                          textColor: '#fff',
                          pathColor: candidate.ats_score >= 80 ? '#10b981' : candidate.ats_score >= 60 ? '#f59e0b' : '#ef4444',
                          trailColor: '#334155',
                          textSize: '28px'
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render Campaigns List
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in">
      <h2 className="text-3xl font-bold mb-8 text-text flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-primary-500" /> Job Campaigns
      </h2>

      {campaigns.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <p className="text-textMuted text-lg mb-4">You haven't run any campaigns yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp) => (
            <div 
              key={camp.id} 
              onClick={() => viewCampaign(camp)}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between cursor-pointer hover:border-primary-500/50 transition-all hover:bg-surface/90"
            >
              <div>
                <div className="flex items-start gap-3 mb-2">
                  <div className="bg-primary-500/10 p-2 rounded-xl mt-1">
                    <Folder className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text text-lg line-clamp-1">{camp.job_name}</h3>
                    <div className="flex items-center gap-1 text-xs text-textMuted mt-1">
                      <Calendar className="w-3 h-3" /> {new Date(camp.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-textMuted mt-4 line-clamp-2 pl-10 border-l border-white/5 ml-2">
                {camp.job_description}
              </p>
              
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                <span className="text-sm text-primary-400 font-medium group-hover:underline">View Results →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

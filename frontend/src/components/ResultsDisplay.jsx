import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { CheckCircle2, XCircle, TrendingUp, BookOpen, Briefcase, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ResultsDisplay({ results }) {
  const { 
    ats_score, match_level, summary, matched_skills, missing_skills, 
    experience_match, education_match, suggestions 
  } = results;

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getMatchBadge = (level) => {
    const colors = {
      'Excellent': 'bg-green-500/10 text-green-500 border-green-500/20',
      'Good': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Fair': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      'Poor': 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    const style = colors[level] || colors['Fair'];
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>{level} Match</span>;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {/* Score Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 mb-4">
            <CircularProgressbar 
              value={ats_score} 
              text={`${ats_score}%`} 
              styles={buildStyles({
                textColor: '#fff',
                pathColor: getScoreColor(ats_score),
                trailColor: '#334155',
              })}
            />
          </div>
          <h3 className="text-xl font-bold text-text mb-2">ATS Score</h3>
          {getMatchBadge(match_level)}
        </div>

        {/* Summary Card */}
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-text flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            AI Executive Summary
          </h3>
          <p className="text-textMuted leading-relaxed">{summary}</p>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-blue-400" /> Experience
              </h4>
              <p className="text-xs text-textMuted">{experience_match}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-sm font-medium text-text flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Education
              </h4>
              <p className="text-xs text-textMuted">{education_match}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-green-500">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" /> Matches ({matched_skills?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {matched_skills?.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-green-500/10 text-green-400 text-sm rounded-lg border border-green-500/10">
                {skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border-t-4 border-t-red-500">
          <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" /> Missing ({missing_skills?.length || 0})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing_skills?.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-400 text-sm rounded-lg border border-red-500/10">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Suggestions */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" /> Improvement Suggestions
        </h3>
        <div className="space-y-3">
          {suggestions?.map((sug, i) => (
            <div key={i} className="bg-surface border border-white/5 p-4 rounded-xl flex items-start gap-4">
              <div className={`mt-1 flex-shrink-0 w-2 h-2 rounded-full ${sug.priority === 'High' ? 'bg-red-500' : sug.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
              <div>
                <p className="text-sm font-semibold text-text mb-1">{sug.action}</p>
                <p className="text-xs text-textMuted">{sug.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </motion.div>
  );
}

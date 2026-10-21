import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import type { EEGAnalysisResult } from '../types/analysis';

interface AnalysisPanelProps {
  result: EEGAnalysisResult;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ result }) => {
  const summaryItems = [
    { label: 'Input type', value: 'EEG report image' },
    { label: 'Channels detected', value: result.channelsDetected.toString() },
    { label: 'Signal quality', value: result.signalQuality.charAt(0).toUpperCase() + result.signalQuality.slice(1) },
    { label: 'Analysis status', value: 'Complete' },
    { label: 'Model', value: 'EEG Seizure Detection Model' },
    {
      label: 'Model output',
      value: `Non-seizure ${result.nonSeizureProbability.toFixed(1)}% / Seizure ${result.seizureProbability.toFixed(1)}%`,
    },
    {
      label: 'Processing time',
      value: `${(result.processingTimeMs / 1000).toFixed(1)}s`,
    },
  ];

  return (
    <div
      className="bg-white rounded-2xl border border-[#DDE4DC] overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      role="region"
      aria-labelledby="analysis-summary-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDE4DC]">
        <h3
          id="analysis-summary-heading"
          className="text-sm font-bold text-[#111614]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Analysis Summary
        </h3>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#087A46]" style={{ fontFamily: 'Inter, sans-serif' }}>
          <Clock size={12} />
          {(result.processingTimeMs / 1000).toFixed(1)}s
        </div>
      </div>

      {/* Summary items */}
      <div className="divide-y divide-[#F0F0EE]">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between px-5 py-3">
            <span
              className="text-xs text-[#5F6862]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {item.label}
            </span>
            <span
              className="text-xs font-semibold text-[#111614] text-right max-w-[60%]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================
// Channel Analysis Component
// ============================
interface ChannelAnalysisProps {
  result: EEGAnalysisResult;
}

export const ChannelAnalysis: React.FC<ChannelAnalysisProps> = ({ result }) => {
  return (
    <div
      className="bg-white rounded-2xl border border-[#DDE4DC] overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      role="region"
      aria-labelledby="channel-analysis-heading"
    >
      <div className="px-5 py-4 border-b border-[#DDE4DC]">
        <h3
          id="channel-analysis-heading"
          className="text-sm font-bold text-[#111614]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Channel Analysis
        </h3>
        <p className="text-xs text-[#5F6862] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          {result.channelsDetected} channels detected
        </p>
      </div>

      <div className="divide-y divide-[#F0F0EE]">
        {result.channels.map((ch) => (
          <div key={ch.id} className="flex items-center justify-between px-5 py-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded-lg bg-[#DCEBDD] flex items-center justify-center text-[10px] font-bold text-[#005C35]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
                aria-hidden="true"
              >
                {ch.id}
              </div>
              <span className="text-xs font-medium text-[#111614]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Channel {ch.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {ch.status === 'analyzed' && (
                <>
                  <CheckCircle2 size={13} className="text-[#087A46]" aria-hidden="true" />
                  <span
                    className="text-[11px] font-semibold text-[#087A46]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Analyzed
                  </span>
                </>
              )}
              {ch.status === 'skipped' && (
                <span
                  className="text-[11px] text-[#5F6862]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Skipped
                </span>
              )}
              {ch.status === 'error' && (
                <span
                  className="text-[11px] text-red-500"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Error
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisPanel;

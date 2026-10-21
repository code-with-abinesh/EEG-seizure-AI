import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import type { EEGAnalysisResult, SignalQuality } from '../types/analysis';

interface SignalQualityCardProps {
  result: EEGAnalysisResult;
}

const qualityConfig: Record<SignalQuality, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
  note?: string;
}> = {
  good: {
    label: 'Good',
    color: '#087A46',
    bg: '#DCEBDD',
    border: '#087A46',
    icon: <CheckCircle size={16} className="text-[#087A46]" />,
  },
  fair: {
    label: 'Fair',
    color: '#B45309',
    bg: '#FEF3C7',
    border: '#D97706',
    icon: <AlertTriangle size={16} className="text-amber-600" />,
    note: 'Some channels may have reduced clarity.',
  },
  poor: {
    label: 'Poor',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#DC2626',
    icon: <XCircle size={16} className="text-red-600" />,
    note: 'Image quality may limit waveform extraction. Try uploading a clearer EEG report.',
  },
};

const checks = [
  { key: 'waveform', label: 'Waveform visibility' },
  { key: 'grid', label: 'Grid detection' },
  { key: 'channels', label: 'Channel detection' },
  { key: 'clarity', label: 'Image clarity' },
];

const SignalQualityCard: React.FC<SignalQualityCardProps> = ({ result }) => {
  const config = qualityConfig[result.signalQuality];

  // Visual quality summary based on the backend quality classification
  const getCheckState = (index: number): 'pass' | 'warn' | 'fail' => {
    if (result.signalQuality === 'good') return 'pass';
    if (result.signalQuality === 'fair' && index === checks.length - 1) return 'warn';
    if (result.signalQuality === 'poor' && index >= checks.length - 2) return 'fail';
    return 'pass';
  };

  return (
    <div
      className="bg-white rounded-2xl border border-[#DDE4DC] overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      role="region"
      aria-labelledby="signal-quality-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDE4DC]">
        <h3
          id="signal-quality-heading"
          className="text-sm font-bold text-[#111614]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Signal Quality
        </h3>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border"
          style={{
            color: config.color,
            backgroundColor: config.bg,
            borderColor: config.border,
            fontFamily: 'Inter, sans-serif',
          }}
          role="status"
          aria-label={`Signal quality: ${config.label}`}
        >
          {config.icon}
          {config.label}
        </span>
      </div>

      {/* Checks */}
      <div className="px-5 py-4 space-y-3">
        {checks.map((check, i) => {
          const state = getCheckState(i);
          return (
            <div key={check.key} className="flex items-center justify-between">
              <span className="text-sm text-[#5F6862]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {check.label}
              </span>
              <span aria-label={`${check.label}: ${state}`}>
                {state === 'pass' && <CheckCircle size={16} className="text-[#087A46]" aria-hidden="true" />}
                {state === 'warn' && <AlertTriangle size={16} className="text-amber-500" aria-hidden="true" />}
                {state === 'fail' && <XCircle size={16} className="text-red-500" aria-hidden="true" />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Note for fair/poor */}
      {config.note && (
        <div className="mx-5 mb-4 flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
          <Info size={13} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-amber-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {config.note}
          </p>
        </div>
      )}
    </div>
  );
};

export default SignalQualityCard;

import React from 'react';
import type { EEGAnalysisResult } from '../types/analysis';

interface ProbabilityCardProps {
  type: 'non_seizure' | 'seizure';
  probability: number;
  isDemo?: boolean;
}

const ProbabilityCard: React.FC<ProbabilityCardProps> = ({ type, probability, isDemo = false }) => {
  const isSeizure = type === 'seizure';

  return (
    <div
      className={`rounded-2xl border p-6 flex flex-col gap-3 transition-all duration-200 hover:shadow-md ${
        isSeizure
          ? 'bg-white border-orange-200'
          : 'bg-white border-[#DDE4DC]'
      }`}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      role="article"
      aria-label={`${isSeizure ? 'Seizure' : 'Non-seizure'} probability: ${probability}%`}
    >
      {/* Label */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isSeizure ? 'text-orange-600' : 'text-[#087A46]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {isSeizure ? 'Seizure' : 'Non-Seizure'}
        </span>
        {isDemo && (
          <span
            className="text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Demo
          </span>
        )}
      </div>

      {/* Probability value */}
      <div className="flex items-end gap-1">
        <span
          className={`text-4xl font-extrabold leading-none ${
            isSeizure ? 'text-orange-600' : 'text-[#087A46]'
          }`}
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {probability.toFixed(1)}
        </span>
        <span
          className={`text-lg font-bold mb-0.5 ${isSeizure ? 'text-orange-500' : 'text-[#14945A]'}`}
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          %
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#F0F0EE] rounded-full h-2 overflow-hidden" aria-hidden="true">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            isSeizure ? 'bg-orange-400' : 'bg-[#087A46]'
          }`}
          style={{ width: `${probability}%` }}
        />
      </div>

      {/* Description */}
      <p className="text-xs text-[#5F6862]" style={{ fontFamily: 'Inter, sans-serif' }}>
        Model probability
      </p>
    </div>
  );
};

// ============================
// Combined Probability Section
// ============================
interface ProbabilitySectionProps {
  result: EEGAnalysisResult;
}

export const ProbabilitySection: React.FC<ProbabilitySectionProps> = ({ result }) => {
  return (
    <section aria-labelledby="probability-heading">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="probability-heading"
          className="text-xl font-bold text-[#111614]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          Analysis Result
        </h2>
      </div>

      {/* Probability cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <ProbabilityCard
          type="non_seizure"
          probability={result.nonSeizureProbability}
          isDemo={result.isDemoResult}
        />
        <ProbabilityCard
          type="seizure"
          probability={result.seizureProbability}
          isDemo={result.isDemoResult}
        />
      </div>

      {/* Visual probability bar */}
      <div
        className="bg-white rounded-2xl border border-[#DDE4DC] p-5"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        aria-label="Probability visualization"
      >
        <div className="space-y-4">
          {/* Non-seizure bar */}
          <div className="flex items-center gap-4">
            <div className="w-28 shrink-0">
              <span
                className="text-xs font-semibold text-[#111614]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Non-seizure
              </span>
            </div>
            <div className="flex-1 bg-[#F0F0EE] rounded-full h-3 overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-[#087A46] rounded-full transition-all duration-1200 ease-out"
                style={{ width: `${result.nonSeizureProbability}%` }}
              />
            </div>
            <div className="w-12 text-right shrink-0">
              <span
                className="text-sm font-bold text-[#087A46]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {result.nonSeizureProbability.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Seizure bar */}
          <div className="flex items-center gap-4">
            <div className="w-28 shrink-0">
              <span
                className="text-xs font-semibold text-[#111614]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Seizure
              </span>
            </div>
            <div className="flex-1 bg-[#F0F0EE] rounded-full h-3 overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-1200 ease-out"
                style={{ width: `${result.seizureProbability}%` }}
              />
            </div>
            <div className="w-12 text-right shrink-0">
              <span
                className="text-sm font-bold text-orange-600"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {result.seizureProbability.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Overall result status */}
      <div
        className={`mt-4 rounded-2xl border p-5 flex items-center gap-4 ${
          result.result === 'non_seizure'
            ? 'bg-[#DCEBDD]/50 border-[#087A46]/30'
            : 'bg-orange-50 border-orange-200'
        }`}
        role="status"
        aria-live="polite"
        aria-label={`Overall model result: ${result.result === 'non_seizure' ? 'No seizure-like pattern detected' : 'Seizure-like pattern detected'}`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            result.result === 'non_seizure' ? 'bg-[#087A46]' : 'bg-orange-500'
          }`}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {result.result === 'non_seizure' ? (
              <path d="M3 9L7 13L15 5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M9 4V10M9 13V14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            )}
          </svg>
        </div>
        <div>
          <div
            className={`text-[10px] font-bold uppercase tracking-widest mb-0.5 ${
              result.result === 'non_seizure' ? 'text-[#005C35]' : 'text-orange-700'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Overall model result
          </div>
          <div
            className={`text-base font-bold ${
              result.result === 'non_seizure' ? 'text-[#005C35]' : 'text-orange-700'
            }`}
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {result.result === 'non_seizure'
              ? 'No Seizure-Like Pattern Detected'
              : 'Seizure-Like Pattern Detected'}
          </div>
          <p className="text-xs text-[#5F6862] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            This reflects the model's analysis of the uploaded EEG signal only.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProbabilityCard;

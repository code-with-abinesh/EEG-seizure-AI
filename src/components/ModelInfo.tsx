import React from 'react';
import { Cpu, GitBranch, Binary, ArrowRight, FlaskConical } from 'lucide-react';

const MODEL_CARDS = [
  {
    id: 'input',
    icon: <Binary size={20} className="text-[#087A46]" />,
    label: 'Input',
    value: 'Digitized EEG waveform',
    description: 'Extracted from uploaded EEG report image',
  },
  {
    id: 'task',
    icon: <GitBranch size={20} className="text-[#087A46]" />,
    label: 'Task',
    value: 'Binary EEG pattern classification',
    description: 'Non-seizure vs. Seizure-like pattern',
  },
  {
    id: 'output',
    icon: <Cpu size={20} className="text-[#087A46]" />,
    label: 'Output',
    value: 'Non-seizure / Seizure probability',
    description: 'Softmax probability over two classes',
  },
  {
    id: 'status',
    icon: <FlaskConical size={20} className="text-[#087A46]" />,
    label: 'Model status',
    value: 'Prototype',
    description: 'Research and educational use only',
  },
];

const ModelInfo: React.FC = () => {
  return (
    <section
      id="technology"
      className="py-20 lg:py-28 bg-[#F8F6EC]"
      aria-labelledby="model-info-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="max-w-2xl mb-12">
          <div
            className="text-[11px] font-bold text-[#087A46] uppercase tracking-widest mb-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Technical details
          </div>
          <h2
            id="model-info-heading"
            className="text-3xl lg:text-4xl font-extrabold text-[#111614] tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Model Information
          </h2>
          <p
            className="mt-3 text-base text-[#5F6862] leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Technical overview of the EEG analysis pipeline and model architecture.
          </p>
        </div>

        {/* Pipeline visualization */}
        <div
          className="bg-white rounded-2xl border border-[#DDE4DC] p-5 mb-8 flex flex-wrap items-center gap-2"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          aria-label="Analysis pipeline: Image to Waveform to Signal to Model"
        >
          <span
            className="text-[11px] font-bold text-[#5F6862] uppercase tracking-widest mr-2"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Pipeline:
          </span>
          {['Image', 'Waveform extraction', 'Numerical signal', 'AI model', 'Probability output'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <span
                className="px-3 py-1 bg-[#DCEBDD] text-[#005C35] text-xs font-semibold rounded-full border border-[#087A46]/20"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {step}
              </span>
              {i < arr.length - 1 && (
                <ArrowRight size={14} className="text-[#087A46]/50 shrink-0" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Model cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODEL_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl border border-[#DDE4DC] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
              role="article"
            >
              <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <div
                className="text-[10px] font-bold text-[#5F6862] uppercase tracking-widest mb-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {card.label}
              </div>
              <div
                className="text-sm font-bold text-[#111614] mb-1"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {card.value}
              </div>
              <p
                className="text-[11px] text-[#5F6862] leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* Disclaimer note */}
        <div className="mt-6 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
          <FlaskConical size={14} className="text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-amber-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            Model accuracy metrics will be published when the trained model is integrated. Do not rely on this tool for clinical decision-making.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ModelInfo;

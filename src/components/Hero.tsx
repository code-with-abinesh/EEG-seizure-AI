import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';

// =============================
// EEG Visualization Component
// =============================
const EEGVisualizationPanel: React.FC = () => {
  const channels = [
    {
      label: 'Fp1',
      color: '#087A46',
      path: 'M0,40 C5,20 10,55 15,40 C20,25 25,60 30,35 C35,15 40,55 45,40 C50,25 55,50 60,38 C65,28 70,55 75,42 C80,30 85,52 90,40 C95,28 98,45 100,40',
    },
    {
      label: 'Fp2',
      color: '#14945A',
      path: 'M0,40 C6,50 12,28 18,42 C24,55 30,20 36,45 C42,62 48,22 54,40 C60,55 66,30 72,44 C78,58 84,25 90,42 C96,55 99,35 100,40',
    },
    {
      label: 'F3',
      color: '#005C35',
      path: 'M0,40 C4,30 8,52 14,38 C20,25 26,58 32,40 C38,22 44,60 50,38 C56,20 62,55 68,40 C74,27 80,52 86,38 C92,26 97,48 100,40',
    },
    {
      label: 'F4',
      color: '#087A46',
      path: 'M0,40 C7,55 14,22 21,42 C28,60 35,18 42,40 C49,60 56,15 63,42 C70,62 77,20 84,42 C91,60 96,30 100,40',
    },
    {
      label: 'C3',
      color: '#14945A',
      path: 'M0,40 C5,35 10,50 16,40 C22,30 28,55 34,38 C40,22 46,58 52,40 C58,24 64,54 70,40 C76,28 82,52 88,40 C94,30 98,46 100,40',
    },
  ];

  return (
    <div
      className="relative bg-[#FCFBF5] rounded-2xl border border-[#DDE4DC] overflow-hidden"
      style={{ boxShadow: '0 8px 40px rgba(0,92,53,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}
      aria-label="EEG signal visualization preview"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#DDE4DC] bg-white/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#087A46]" />
          <span className="text-xs font-semibold text-[#111614]" style={{ fontFamily: 'Inter, sans-serif' }}>
            EEG Signal Monitor
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#5F6862] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            25 mm/s · 10 µV/mm
          </span>
        </div>
      </div>

      {/* Grid background */}
      <div className="relative px-4 pt-3 pb-2" style={{ background: 'linear-gradient(rgba(220,235,221,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(220,235,221,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        {channels.map((ch, i) => (
          <div key={ch.label} className="flex items-center gap-3 mb-1">
            <span
              className="text-[10px] font-semibold w-7 text-right shrink-0"
              style={{ color: ch.color, fontFamily: 'Inter, sans-serif' }}
            >
              {ch.label}
            </span>
            <svg
              viewBox="0 0 100 80"
              className="w-full"
              style={{ height: '38px' }}
              preserveAspectRatio="none"
              role="img"
              aria-label={`${ch.label} EEG channel waveform`}
            >
              <path
                d={ch.path}
                stroke={ch.color}
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: `fadeIn 0.8s ease ${i * 0.12}s both`,
                }}
              />
            </svg>
          </div>
        ))}

        {/* Time axis */}
        <div className="flex items-center gap-0 mt-1 ml-10 border-t border-[#DDE4DC] pt-1.5">
          {['0s', '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '10s'].map((t) => (
            <span
              key={t}
              className="flex-1 text-[9px] text-[#5F6862] text-center"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Status card floating */}
      <div className="absolute bottom-14 right-4 bg-white rounded-xl border border-[#DDE4DC] px-4 py-3 shadow-lg">
        <div className="text-[9px] font-bold text-[#5F6862] uppercase tracking-widest mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
          AI Signal Analysis
        </div>
        <div className="text-xs font-semibold text-[#111614] mb-0.5" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Multi-channel EEG
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#087A46] animate-pulse-subtle" />
          <span className="text-[10px] text-[#087A46] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            Ready for analysis
          </span>
        </div>
      </div>

      {/* Annotations */}
      <div className="absolute top-12 left-16 opacity-70">
        <div className="text-[9px] text-[#087A46] font-semibold border border-[#087A46]/30 rounded px-1.5 py-0.5 bg-[#DCEBDD]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
          Alpha: 8–13 Hz
        </div>
      </div>
      <div className="absolute top-20 right-20 opacity-70">
        <div className="text-[9px] text-[#5F6862] font-semibold border border-[#DDE4DC] rounded px-1.5 py-0.5 bg-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
          Beta: 13–30 Hz
        </div>
      </div>
    </div>
  );
};

// =============================
// Hero Component
// =============================
const Hero: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    el.classList.add('animate-fade-in-up');
  }, []);

  const handleHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      className="relative min-h-screen flex items-center bg-[#F8F6EC] pt-16 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 70% 50%, rgba(8,122,70,0.04) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: Content */}
          <div ref={contentRef} className="animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1.5 bg-[#DCEBDD] text-[#005C35] text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border border-[#087A46]/20">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="3" fill="#087A46" className="animate-pulse-subtle" />
                  <circle cx="6" cy="6" r="5.5" stroke="#087A46" strokeWidth="1" opacity="0.4" />
                </svg>
                AI-Assisted EEG Analysis
              </div>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="text-[2.6rem] sm:text-5xl lg:text-[3.4rem] font-extrabold text-[#111614] leading-[1.08] tracking-tight mb-6"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Read the signal.{' '}
              <br />
              Understand the{' '}
              <span className="text-[#087A46]">pattern.</span>
            </h1>

            {/* Description */}
            <p
              className="text-[1.05rem] sm:text-lg text-[#5F6862] leading-relaxed mb-8 max-w-xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Upload an EEG report and NeuroTrace AI analyzes the extracted
              waveform to estimate seizure-like activity using a trained
              machine-learning model.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link
                to="/analyze"
                id="hero-primary-cta"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-white bg-[#087A46] hover:bg-[#005C35] active:bg-[#004A2A] transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Analyze an EEG
                <ArrowRight size={16} />
              </Link>
              <a
                href="#how-it-works"
                id="hero-secondary-cta"
                onClick={handleHowItWorks}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-semibold text-[#087A46] bg-transparent border border-[#087A46]/40 hover:bg-[#DCEBDD] hover:border-[#087A46] transition-all duration-200"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Explore how it works
                <ChevronDown size={16} />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 pt-8 border-t border-[#DDE4DC] flex flex-wrap gap-5">
              {[
                { label: 'Multi-channel', sub: 'EEG analysis' },
                { label: 'Research tool', sub: 'Educational prototype' },
                { label: 'Privacy first', sub: 'Local processing' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#087A46]" aria-hidden="true" />
                  <div>
                    <span className="text-xs font-semibold text-[#111614]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.label}
                    </span>
                    <span className="text-xs text-[#5F6862] ml-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      · {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: EEG Visualization */}
          <div className="animate-slide-in-right delay-200 hidden lg:block">
            <EEGVisualizationPanel />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-fade-in delay-600" aria-hidden="true">
        <div className="text-[10px] text-[#5F6862] font-medium tracking-widest uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
          Scroll
        </div>
        <ChevronDown size={16} className="text-[#5F6862] animate-bounce" />
      </div>
    </section>
  );
};

export default Hero;

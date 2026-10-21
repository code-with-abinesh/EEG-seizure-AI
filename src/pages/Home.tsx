import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Brain, BarChart3, FileSearch, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Hero from '../components/Hero';
import UploadZone from '../components/UploadZone';
import ModelInfo from '../components/ModelInfo';
import Disclaimer from '../components/Disclaimer';
import type { UploadedFile, UploadStatus } from '../types/analysis';
import { PROCESSING_STEPS } from '../types/analysis';
import { analyzeEEG } from '../services/api';

// ============================
// Metrics Strip
// ============================
const MetricsStrip: React.FC = () => {
  const metrics = [
    { icon: <Brain size={20} className="text-[#087A46]" />, label: 'EEG Signal', sub: 'Multi-channel analysis' },
    { icon: <FileSearch size={20} className="text-[#087A46]" />, label: 'Image Input', sub: 'Report digitization' },
    { icon: <BarChart3 size={20} className="text-[#087A46]" />, label: 'AI Model', sub: 'Probability-based output' },
    { icon: <Upload size={20} className="text-[#087A46]" />, label: 'Research', sub: 'Educational prototype' },
  ];

  return (
    <section
      className="bg-white border-y border-[#DDE4DC]"
      aria-label="Key features overview"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-[#DDE4DC]">
          {metrics.map((m) => (
            <div key={m.label} className="flex flex-col items-center text-center gap-2 lg:px-6">
              <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] flex items-center justify-center" aria-hidden="true">
                {m.icon}
              </div>
              <div
                className="text-sm font-bold text-[#111614]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {m.label}
              </div>
              <div
                className="text-xs text-[#5F6862]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {m.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================
// How It Works Section
// ============================
const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload',
      icon: <Upload size={22} className="text-[#087A46]" />,
      desc: 'Upload a clear EEG report image in PNG, JPG, or PDF format.',
    },
    {
      num: '02',
      title: 'Extract',
      icon: <FileSearch size={22} className="text-[#087A46]" />,
      desc: 'Detect and digitize waveform traces from the uploaded report.',
    },
    {
      num: '03',
      title: 'Analyze',
      icon: <Brain size={22} className="text-[#087A46]" />,
      desc: 'Convert extracted waveform into numerical signal data and process it through the trained model.',
    },
    {
      num: '04',
      title: 'Review',
      icon: <BarChart3 size={22} className="text-[#087A46]" />,
      desc: 'View model-estimated probabilities and detailed signal quality information.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-[#F8F6EC]"
      aria-labelledby="how-it-works-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <div
            className="text-[11px] font-bold text-[#087A46] uppercase tracking-widest mb-3"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            The process
          </div>
          <h2
            id="how-it-works-heading"
            className="text-3xl lg:text-4xl font-extrabold text-[#111614] tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            How It Works
          </h2>
          <p
            className="mt-3 text-base text-[#5F6862] leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Four steps from EEG report to AI analysis result.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="relative bg-white rounded-2xl border border-[#DDE4DC] p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)', animationDelay: `${i * 0.1}s` }}
              role="article"
            >
              {/* Step number */}
              <div
                className="text-[11px] font-black text-[#DDE4DC] mb-4 leading-none"
                style={{ fontFamily: 'Manrope, sans-serif', fontSize: '2.5rem', lineHeight: 1 }}
                aria-hidden="true"
              >
                {step.num}
              </div>
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#DCEBDD] flex items-center justify-center mb-3" aria-hidden="true">
                {step.icon}
              </div>
              {/* Content */}
              <h3
                className="text-base font-bold text-[#111614] mb-2"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                {step.title}
              </h3>
              <p
                className="text-sm text-[#5F6862] leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {step.desc}
              </p>

              {/* Connector arrow */}
              {i < steps.length - 1 && (
                <div
                  className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#DCEBDD] border border-[#DDE4DC] items-center justify-center"
                  aria-hidden="true"
                >
                  <ArrowRight size={12} className="text-[#087A46]" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================
// Upload Section on Homepage
// ============================
interface UploadSectionProps {
  onAnalyze: (file: UploadedFile) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze }) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<UploadStatus>('empty');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = useCallback((file: UploadedFile) => {
    setUploadedFile(file);
    setStatus('ready');
    setError(null);
  }, []);

  const handleFileRemoved = useCallback(() => {
    setUploadedFile(null);
    setStatus('empty');
    setError(null);
    setCurrentStep(0);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!uploadedFile) return;
    setStatus('processing');
    setError(null);
    setCurrentStep(0);

    try {
      // Simulate processing steps
      for (let i = 0; i < PROCESSING_STEPS.length; i++) {
        setCurrentStep(i);
        await new Promise(r => setTimeout(r, PROCESSING_STEPS[i].duration));
      }

      await analyzeEEG(uploadedFile.file);
      setStatus('success');
      onAnalyze(uploadedFile);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    }
  }, [uploadedFile, onAnalyze]);

  const handleRetry = useCallback(() => {
    setStatus('empty');
    setUploadedFile(null);
    setError(null);
    setCurrentStep(0);
  }, []);

  const isProcessing = status === 'processing';
  const isReady = status === 'ready' && !!uploadedFile;

  return (
    <section
      id="upload"
      className="py-20 lg:py-28 bg-white"
      aria-labelledby="upload-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left: copy */}
          <div>
            <div
              className="text-[11px] font-bold text-[#087A46] uppercase tracking-widest mb-3"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Start analysis
            </div>
            <h2
              id="upload-heading"
              className="text-3xl lg:text-4xl font-extrabold text-[#111614] tracking-tight mb-4"
              style={{ fontFamily: 'Manrope, sans-serif' }}
            >
              Upload an EEG report
            </h2>
            <p
              className="text-base text-[#5F6862] leading-relaxed mb-8"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Upload a clear EEG report image for waveform extraction and
              AI-assisted analysis. Best results come from high-quality scans.
            </p>

            {/* Journey steps */}
            <div className="space-y-3">
              {['Upload EEG', 'Analyze', 'Extract Waveform', 'Model Analysis', 'View Probabilities'].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all duration-300 ${
                      isProcessing && i <= currentStep
                        ? 'bg-[#087A46] text-white'
                        : status === 'success'
                        ? 'bg-[#087A46] text-white'
                        : 'bg-[#DCEBDD] text-[#087A46]'
                    }`}
                    aria-hidden="true"
                  >
                    {(status === 'success' || (isProcessing && i < currentStep)) ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-sm transition-all duration-300 ${
                      isProcessing && i === currentStep ? 'text-[#087A46] font-semibold' : 'text-[#5F6862]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {step}
                  </span>
                  {isProcessing && i === currentStep && (
                    <Loader2 size={12} className="text-[#087A46] animate-spin" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: upload card */}
          <div>
            <div
              className="bg-[#FCFBF5] rounded-2xl border border-[#DDE4DC] p-6"
              style={{ boxShadow: '0 4px 24px rgba(0,92,53,0.06)' }}
            >
              {/* Processing state overlay */}
              {isProcessing && (
                <div className="mb-6 rounded-xl bg-[#DCEBDD]/50 border border-[#087A46]/20 px-5 py-4 flex items-center gap-3" role="status" aria-live="polite">
                  <Loader2 size={18} className="text-[#087A46] animate-spin shrink-0" aria-hidden="true" />
                  <div>
                    <p
                      className="text-sm font-semibold text-[#005C35]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {PROCESSING_STEPS[currentStep]?.label ?? 'Processing...'}
                    </p>
                    <p
                      className="text-xs text-[#5F6862]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Step {currentStep + 1} of {PROCESSING_STEPS.length}
                    </p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {status === 'error' && (
                <div
                  className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4"
                  role="alert"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-semibold text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Analysis failed
                      </p>
                      <p className="text-xs text-red-600 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {error ?? 'An error occurred during analysis.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRetry}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 underline"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Try another image
                  </button>
                </div>
              )}

              <UploadZone
                onFileSelected={handleFileSelected}
                onFileRemoved={handleFileRemoved}
                uploadedFile={uploadedFile}
                disabled={isProcessing}
              />

              {/* Analyze button */}
              <div className="mt-5">
                <button
                  id="analyze-eeg-btn"
                  onClick={handleAnalyze}
                  disabled={!isReady || isProcessing}
                  className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[15px] font-semibold transition-all duration-200 ${
                    isReady && !isProcessing
                      ? 'bg-[#087A46] text-white hover:bg-[#005C35] shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                      : 'bg-[#DDE4DC] text-[#5F6862] cursor-not-allowed'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                  aria-disabled={!isReady || isProcessing}
                  aria-label={isReady ? 'Start EEG analysis' : 'Upload a file first to analyze'}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain size={16} aria-hidden="true" />
                      Analyze EEG
                    </>
                  )}
                </button>
                {!isReady && !isProcessing && (
                  <p
                    className="text-center text-xs text-[#5F6862] mt-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Upload an EEG report to enable analysis
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================
// Home Page
// ============================
const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleAnalyze = useCallback(async (file: UploadedFile) => {
    // Pass file data via location state so Analyze page can use it
    navigate('/analyze', {
      state: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        previewUrl: file.previewUrl,
      },
    });
  }, [navigate]);

  return (
    <main>
      <Hero />
      <MetricsStrip />
      <UploadSection onAnalyze={handleAnalyze} />
      <HowItWorks />
      <ModelInfo />
      <Disclaimer />
    </main>
  );
};

export default Home;

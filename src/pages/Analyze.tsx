import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Loader2, AlertCircle, RotateCcw, Brain } from 'lucide-react';
import UploadZone from '../components/UploadZone';
import EEGWaveform from '../components/EEGWaveform';
import { ProbabilitySection } from '../components/ProbabilityCard';
import SignalQualityCard from '../components/SignalQuality';
import AnalysisPanel, { ChannelAnalysis } from '../components/AnalysisPanel';
import type { EEGAnalysisResult, UploadedFile, UploadStatus } from '../types/analysis';
import { PROCESSING_STEPS } from '../types/analysis';
import { analyzeEEG } from '../services/api';

// ============================
// Processing overlay
// ============================
interface ProcessingViewProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ currentStep, totalSteps, stepLabel }) => {
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in" role="status" aria-live="polite" aria-label={`Processing: ${stepLabel}`}>
      {/* Animated EEG icon */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-2xl bg-[#DCEBDD] flex items-center justify-center">
          <Brain size={36} className="text-[#087A46]" aria-hidden="true" />
        </div>
        <div
          className="absolute -inset-2 rounded-[20px] border-2 border-[#087A46]/30 animate-pulse-subtle"
          aria-hidden="true"
        />
      </div>

      {/* Step label */}
      <p
        className="text-lg font-semibold text-[#111614] mb-2 text-center"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {stepLabel}
      </p>
      <p
        className="text-sm text-[#5F6862] mb-8"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        Step {currentStep + 1} of {totalSteps}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-xs bg-[#DDE4DC] rounded-full h-2 overflow-hidden" aria-hidden="true">
        <div
          className="h-full bg-[#087A46] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p
        className="text-xs text-[#5F6862] mt-2"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {progress}% complete
      </p>
    </div>
  );
};

// ============================
// Error View
// ============================
interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in" role="alert">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
      <AlertCircle size={28} className="text-red-500" aria-hidden="true" />
    </div>
    <h3
      className="text-lg font-bold text-[#111614] mb-2"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      Analysis failed
    </h3>
    <p
      className="text-sm text-[#5F6862] text-center max-w-sm mb-6"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {message}
    </p>
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={onRetry}
        id="retry-analysis-btn"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#087A46] hover:bg-[#005C35] transition-all duration-200"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <RotateCcw size={14} />
        Try another image
      </button>
    </div>
  </div>
);

// ============================
// Analyze Page
// ============================
const Analyze: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hasAutoStarted = useRef(false);

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [status, setStatus] = useState<UploadStatus>('empty');
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<EEGAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-start: navigated from Home with a file, OR ?demo=true URL parameter
  useEffect(() => {
    const isDemoMode = searchParams.get('demo') === 'true';
    const state = location.state as { fileName?: string; fileSize?: number; fileType?: string; previewUrl?: string } | null;
    if ((isDemoMode || state?.fileName) && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      setStatus('processing');
      runAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAnalysis = useCallback(async (file?: File) => {
    setStatus('processing');
    setError(null);
    setCurrentStep(0);
    setResult(null);

    try {
      if (!file) {
        throw new Error('Please select an EEG report before starting analysis.');
      }

      setCurrentStep(0);
      await new Promise(r => setTimeout(r, 250));
      setCurrentStep(1);

      const analysisPromise = analyzeEEG(file);
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 250));
      setCurrentStep(3);

      const analysisResult = await analysisPromise;
      setCurrentStep(4);
      setResult(analysisResult);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    }
  }, []);

  const handleFileSelected = useCallback((file: UploadedFile) => {
    setUploadedFile(file);
    setStatus('ready');
    setError(null);
    setResult(null);
  }, []);

  const handleFileRemoved = useCallback(() => {
    setUploadedFile(null);
    setStatus('empty');
    setError(null);
    setResult(null);
    setCurrentStep(0);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!uploadedFile && status !== 'empty') return;
    await runAnalysis(uploadedFile?.file);
  }, [uploadedFile, status, runAnalysis]);

  const handleRetry = useCallback(() => {
    setStatus('empty');
    setUploadedFile(null);
    setError(null);
    setResult(null);
    setCurrentStep(0);
    hasAutoStarted.current = false;
  }, []);

  const isProcessing = status === 'processing';
  const isSuccess = status === 'success' && !!result;
  const isError = status === 'error';
  const isReady = status === 'ready' && !!uploadedFile;

  return (
    <div className="min-h-screen bg-[#F8F6EC] pt-16 overflow-x-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#DDE4DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1.5 text-xs text-[#5F6862] hover:text-[#111614] mb-3 transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
                aria-label="Go back to home"
              >
                <ArrowLeft size={13} />
                Back to home
              </button>
              <h1
                className="text-2xl lg:text-3xl font-extrabold text-[#111614] tracking-tight"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                EEG Analysis
              </h1>
              <p
                className="text-sm text-[#5F6862] mt-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                AI-assisted analysis of the uploaded EEG report.
              </p>
            </div>

            {/* Status badge */}
            {isSuccess && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DCEBDD] border border-[#087A46]/30 text-[#005C35] text-sm font-semibold animate-fade-in"
                role="status"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <CheckCircle size={15} />
                Analysis Complete
              </div>
            )}
            {isProcessing && (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold"
                role="status"
                aria-live="polite"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                Processing...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

        {/* Processing */}
        {isProcessing && (
          <div className="bg-white rounded-2xl border border-[#DDE4DC] p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <ProcessingView
              currentStep={currentStep}
              totalSteps={PROCESSING_STEPS.length}
              stepLabel={PROCESSING_STEPS[currentStep]?.label ?? 'Processing...'}
            />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="bg-white rounded-2xl border border-[#DDE4DC] p-8" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <ErrorView
              message={error ?? 'An unexpected error occurred.'}
              onRetry={handleRetry}
            />
          </div>
        )}

        {/* Upload + Analyze */}
        {!isProcessing && !isError && !isSuccess && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-[#DDE4DC] p-6" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <h2
                className="text-base font-bold text-[#111614] mb-1"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Upload EEG Report
              </h2>
              <p
                className="text-xs text-[#5F6862] mb-5"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Upload a clear EEG report image or PDF for analysis.
              </p>
              <UploadZone
                onFileSelected={handleFileSelected}
                onFileRemoved={handleFileRemoved}
                uploadedFile={uploadedFile}
                disabled={isProcessing}
              />
              <button
                id="analyze-page-btn"
                onClick={handleAnalyze}
                disabled={!isReady}
                className={`mt-5 w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full text-[15px] font-semibold transition-all duration-200 ${
                  isReady
                    ? 'bg-[#087A46] text-white hover:bg-[#005C35] shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-[#DDE4DC] text-[#5F6862] cursor-not-allowed'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
                aria-disabled={!isReady}
              >
                <Brain size={16} aria-hidden="true" />
                Analyze EEG
              </button>
            </div>
            <div className="bg-[#FCFBF5] rounded-2xl border border-[#DDE4DC] p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#DCEBDD] flex items-center justify-center mb-2" aria-hidden="true">
                <Brain size={26} className="text-[#087A46]" />
              </div>
              <h3
                className="text-base font-bold text-[#111614]"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Ready to analyze
              </h3>
              <p
                className="text-sm text-[#5F6862] max-w-xs"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Upload an EEG report and click Analyze EEG to begin.
                The AI model will estimate seizure-like activity from the waveform.
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {isSuccess && result && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Main results grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Probability + sidebar */}
              <div className="lg:col-span-2 space-y-6 min-w-0">
                <ProbabilitySection result={result} />
                <EEGWaveform waveform={result.waveform} />
              </div>

              {/* Sidebar */}
              <div className="space-y-4 min-w-0">
                <SignalQualityCard result={result} />
                <ChannelAnalysis result={result} />
                <AnalysisPanel result={result} />

                {/* Analyze another button */}
                <button
                  onClick={handleRetry}
                  id="analyze-another-btn"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-semibold text-[#087A46] border border-[#087A46]/40 hover:bg-[#DCEBDD] transition-all duration-200"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <RotateCcw size={14} />
                  Analyze another EEG
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;

export type SignalQuality = 'good' | 'fair' | 'poor';
export type AnalysisResult = 'non_seizure' | 'seizure';
export type UploadStatus = 'empty' | 'ready' | 'processing' | 'success' | 'error';

export interface WaveformChannel {
  channel: string;
  label: string;
  values: number[];
}

export interface ChannelAnalysis {
  id: number;
  label: string;
  status: 'analyzed' | 'skipped' | 'error';
}

export interface ChannelProbability {
  id: number;
  label: string;
  seizureProbability: number;
  status: 'analyzed' | 'skipped' | 'error';
}

export interface EEGAnalysisResult {
  nonSeizureProbability: number;
  seizureProbability: number;
  result: AnalysisResult;
  signalQuality: SignalQuality;
  channelsDetected: number;
  waveform: WaveformChannel[];
  channels: ChannelAnalysis[];
  channelProbabilities?: ChannelProbability[];
  processingTimeMs: number;
  isDemoResult: boolean;
  decisionThreshold?: number;
  disclaimer?: string;
  fileName?: string;
}

export interface UploadedFile {
  file: File;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
}

export interface ProcessingStep {
  id: string;
  label: string;
  duration: number;
}

export const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'preparing', label: 'Preparing EEG report...', duration: 400 },
  { id: 'detecting', label: 'Detecting waveform traces...', duration: 400 },
  { id: 'signal', label: 'Preparing signal for analysis...', duration: 400 },
  { id: 'model', label: 'Running AI model...', duration: 400 },
  { id: 'finalizing', label: 'Finalizing results...', duration: 400 },
];

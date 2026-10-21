import type { EEGAnalysisResult } from '../types/analysis';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/** Send an EEG report image/PDF to the real FastAPI backend. */
export async function analyzeEEG(file: File): Promise<EEGAnalysisResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = 'EEG analysis failed.';
    try {
      const error = await response.json();
      if (typeof error?.detail === 'string') message = error.detail;
    } catch {
      // Keep the default message when the server response is not JSON.
    }
    throw new Error(message);
  }

  return response.json() as Promise<EEGAnalysisResult>;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export { API_BASE_URL };

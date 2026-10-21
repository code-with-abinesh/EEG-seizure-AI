import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, FileImage, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import type { UploadedFile } from '../types/analysis';

interface UploadZoneProps {
  onFileSelected: (file: UploadedFile) => void;
  onFileRemoved: () => void;
  uploadedFile: UploadedFile | null;
  disabled?: boolean;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const ACCEPTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.pdf'];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  onFileSelected,
  onFileRemoved,
  uploadedFile,
  disabled = false,
  maxSizeMB = 20,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))) {
      return 'Unsupported file type. Please upload a PNG, JPG, JPEG, or PDF file.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File is too large. Maximum allowed size is ${maxSizeMB} MB.`;
    }
    if (file.size === 0) {
      return 'File appears to be empty. Please upload a valid EEG report.';
    }
    return null;
  }, [maxSizeMB]);

  const processFile = useCallback((file: File) => {
    setValidationError(null);
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    const isImage = file.type.startsWith('image/');
    const uploaded: UploadedFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      previewUrl: isImage ? URL.createObjectURL(file) : undefined,
    };
    onFileSelected(uploaded);
  }, [validateFile, onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [disabled, processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  }, [processFile]);

  const handleRemove = useCallback(() => {
    setValidationError(null);
    if (uploadedFile?.previewUrl) {
      URL.revokeObjectURL(uploadedFile.previewUrl);
    }
    onFileRemoved();
  }, [uploadedFile, onFileRemoved]);

  const handleReplace = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !uploadedFile && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, [uploadedFile, disabled]);

  // === UPLOADED STATE ===
  if (uploadedFile) {
    return (
      <div
        className="rounded-2xl border border-[#087A46] bg-white p-6 animate-fade-in"
        role="region"
        aria-label="Uploaded file preview"
        style={{ boxShadow: '0 4px 20px rgba(8,122,70,0.08)' }}
      >
        <div className="flex items-start gap-4">
          {/* Preview / Icon */}
          <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-[#DCEBDD] flex items-center justify-center border border-[#DDE4DC]">
            {uploadedFile.previewUrl ? (
              <img
                src={uploadedFile.previewUrl}
                alt="EEG report preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <FileImage size={24} className="text-[#087A46]" />
            )}
          </div>

          {/* File info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={15} className="text-[#087A46] shrink-0" />
              <h3
                className="text-sm font-semibold text-[#111614] truncate"
                title={uploadedFile.name}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {uploadedFile.name}
              </h3>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-[#5F6862]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span>{formatBytes(uploadedFile.size)}</span>
              <span className="border-l border-[#DDE4DC] pl-3">
                {uploadedFile.type === 'application/pdf' ? 'PDF Document' : 'Image'}
              </span>
              <span className="border-l border-[#DDE4DC] pl-3 text-[#087A46] font-medium">
                Ready for analysis
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleReplace}
              className="p-2 rounded-lg text-[#5F6862] hover:text-[#087A46] hover:bg-[#DCEBDD] transition-all duration-200"
              title="Replace file"
              aria-label="Replace uploaded file"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 rounded-lg text-[#5F6862] hover:text-red-600 hover:bg-red-50 transition-all duration-200"
              title="Remove file"
              aria-label="Remove uploaded file"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Hidden input for replace */}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleInputChange}
          aria-label="Replace EEG report file"
        />
      </div>
    );
  }

  // === DROP ZONE STATE ===
  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Drop zone for EEG report upload. Press Enter or Space to open file browser."
        aria-describedby={validationError ? 'upload-error' : 'upload-instructions'}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center text-center p-10 min-h-[240px]
          ${isDragOver
            ? 'border-[#087A46] bg-[#f0f7f2]'
            : 'border-[#DDE4DC] bg-[#FCFBF5] hover:border-[#087A46]/60 hover:bg-[#FCFBF5]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${validationError ? 'border-red-300 bg-red-50/30' : ''}
        `}
      >
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 ${
            isDragOver ? 'bg-[#087A46] scale-110' : 'bg-[#DCEBDD]'
          }`}
          aria-hidden="true"
        >
          {validationError ? (
            <AlertCircle size={28} className="text-red-500" />
          ) : (
            <Upload size={28} className={isDragOver ? 'text-white' : 'text-[#087A46]'} />
          )}
        </div>

        {/* EEG waveform icon */}
        <svg
          width="80"
          height="20"
          viewBox="0 0 80 20"
          className="mb-4 opacity-40"
          aria-hidden="true"
        >
          <path
            d="M0,10 L8,10 L11,2 L14,18 L17,6 L20,14 L23,10 L30,10 L33,4 L36,16 L39,8 L42,12 L45,10 L52,10 L55,3 L58,17 L61,7 L64,13 L67,10 L74,10 L77,5 L80,10"
            stroke="#087A46"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h3
          className="text-base font-semibold text-[#111614] mb-1"
          style={{ fontFamily: 'Manrope, sans-serif' }}
        >
          {isDragOver ? 'Release to upload' : 'Drop your EEG report here'}
        </h3>
        <p
          id="upload-instructions"
          className="text-sm text-[#5F6862] mb-5"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          or browse from your device
        </p>

        <button
          type="button"
          tabIndex={-1}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-[#087A46] bg-white border border-[#087A46]/40 hover:bg-[#DCEBDD] hover:border-[#087A46] transition-all duration-200 shadow-sm"
          style={{ fontFamily: 'Inter, sans-serif' }}
          aria-hidden="true"
        >
          <Upload size={14} />
          Choose file
        </button>

        <p
          className="mt-4 text-[11px] text-[#5F6862]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Supported: PNG, JPG, JPEG, PDF · Maximum {maxSizeMB} MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
          aria-label="Upload EEG report file"
        />
      </div>

      {/* Validation error */}
      {validationError && (
        <div
          id="upload-error"
          role="alert"
          className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 animate-fade-in"
        >
          <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>
            {validationError}
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadZone;

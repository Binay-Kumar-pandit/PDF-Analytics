import React, { useState, useRef, useCallback } from 'react';
import { Upload, File as FileIcon, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: globalThis.File) => void;
  isProcessing: boolean;
  uploadProgress?: number;
}

export default function FileUpload({
  onFileSelect,
  isProcessing,
  uploadProgress = 0,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetErrorLater = useCallback(() => {
    setTimeout(() => setError(null), 3000);
  }, []);

  const validateAndSet = (file: globalThis.File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.'); 
      resetErrorLater();
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError('File exceeds 10MB size limit.');
      resetErrorLater();
      return;
    }
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSet(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        aria-label="PDF upload dropzone"
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyPress}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors focus:outline-none
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
          aria-label="Choose PDF file"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" aria-hidden="true" />
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">Upload Your PDF</p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop any PDF file here, or click to browse
            </p>
          </div>

          {selectedFile && (
            <div
              className="flex items-center justify-center space-x-2 text-sm text-green-600 bg-green-50 rounded-md p-2"
              aria-live="polite"
            >
              <FileIcon className="h-4 w-4" aria-hidden="true" />
              <span>{selectedFile.name}</span>
              <span className="text-xs text-gray-500">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-700 bg-red-50 rounded-md p-2">
              {error}
            </div>
          )}

          {isProcessing && uploadProgress > 0 && (
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
                aria-label={`Upload progress: ${uploadProgress}%`}
              ></div>
            </div>
          )}

          <button
            onClick={handleButtonClick}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            Choose File
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            <span>Supports all PDF types • GPT-4 powered analysis • Max 100MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

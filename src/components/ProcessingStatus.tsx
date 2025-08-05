import React from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error';
  message?: string;
  filename?: string;
  processingTime?: number;
  rowCount?: number;
  uploadProgress?: number;
}

export default function ProcessingStatus({ 
  status, 
  message, 
  filename, 
  processingTime, 
  rowCount,
  uploadProgress = 0
}: ProcessingStatusProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className={`
        rounded-lg p-4 border
        ${status === 'uploading' || status === 'processing' ? 'bg-blue-50 border-blue-200' : ''}
        ${status === 'success' ? 'bg-green-50 border-green-200' : ''}
        ${status === 'error' ? 'bg-red-50 border-red-200' : ''}
      `}>
        <div className="flex items-center space-x-3">
          {(status === 'uploading' || status === 'processing') && (
            <>
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium text-blue-900">
                  {status === 'uploading' ? 'Uploading PDF...' : 'AI is analyzing your PDF...'}
                </p>
                <p className="text-sm text-blue-700">{message || 'GPT-4 is creating intelligent insights'}</p>
              </div>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Processing Complete!</p>
                <div className="text-sm text-green-700 mt-1 space-y-1">
                  {filename && <p>File: {filename}</p>}
                  {typeof rowCount === 'number' && <p>Rows extracted: {rowCount}</p>}
                  {typeof processingTime === 'number' && (
                    <p>Processing time: {(processingTime / 1000).toFixed(2)}s</p>
                  )}
                </div>
              </div>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Processing Failed</p>
                <p className="text-sm text-red-700">{message || 'An error occurred while processing the PDF'}</p>
              </div>
            </>
          )}
        </div>
        
        {(status === 'uploading' || status === 'processing') && (
          <div className="mt-3">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{
                  width: status === 'uploading' ? `${uploadProgress}%` : '60%',
                  animation: status === 'processing' ? 'pulse 2s infinite' : 'none'
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
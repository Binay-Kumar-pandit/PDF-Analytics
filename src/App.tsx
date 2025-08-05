import React, { useState } from 'react';
import {
  FileText, Brain, MessageCircle, Download, Edit3,
  Sparkles, Upload, CheckCircle, ArrowRight
} from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import ChatInterface from './components/ChatInterface';
import PDFOverview from './components/PDFOverview';
import TextEditor from './components/TextEditor';
import HomePage from './components/HomePage';

interface ProcessingResult {
  success: boolean;
  filename: string;
  processingTime: number;
  overview: string;
  currencyTables: Array<{
    currency: string;
    total: number;
    items: Array<{ description: string; amount: number; }>;
  }>;
  extractedText: string;
  pageCount: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'edit'>('overview');
  const [showHomePage, setShowHomePage] = useState(true);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResult(null);
    setProcessingStatus('idle');
    setChatMessages([]);
    setUploadProgress(0);
    setShowHomePage(false);
  };

  const handleProcessPDF = async () => {
    if (!selectedFile) return;

    setProcessingStatus('uploading');
    setStatusMessage('Uploading PDF file...');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(percentComplete);
          setStatusMessage(`Uploading... ${Math.round(percentComplete)}% complete`);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              setResult(data);
              setProcessingStatus('success');
              setStatusMessage('');
              setChatMessages([{
                id: Date.now().toString(),
                type: 'ai',
                content: `PDF analysis complete! I've processed "${data.filename}" and created a comprehensive overview. You can now ask me any questions about the document content.`,
                timestamp: new Date()
              }]);
            } else {
              setProcessingStatus('error');
              setStatusMessage(data.error || 'Failed to process PDF (server error)');
            }
          } else {
            setProcessingStatus('error');
            setStatusMessage('Network error: Unable to connect to server');
          }
        } catch (parseError) {
          setProcessingStatus('error');
          setStatusMessage('PDF processing failed: possibly malformed or corrupted PDF file (bad XRef entry)');
          console.error('JSON parsing error:', parseError);
        }
      });

      xhr.addEventListener('error', () => {
        setProcessingStatus('error');
        setStatusMessage('Network error: Unable to connect to server');
      });

      setProcessingStatus('processing');
      setStatusMessage('AI is analyzing your PDF with GPT-4...');

      xhr.open('POST', 'http://localhost:3001/api/process-pdf');
      xhr.send(formData);

    } catch (error) {
      setProcessingStatus('error');
      setStatusMessage('Unexpected error during PDF processing.');
      console.error('Processing error:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!result) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          pdfContent: result.extractedText,
          filename: result.filename
        }),
      });

      const data = await response.json();

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const handleTextEdit = async (editInstructions: string) => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('pdf', selectedFile);
      formData.append('instructions', editInstructions);

      const response = await fetch('http://localhost:3001/api/edit-text', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const link = document.createElement('a');
        link.href = `http://localhost:3001${data.downloadUrl}`;
        link.download = data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to edit PDF: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Text editing error:', error);
      alert('Failed to edit PDF');
    }
  };

  const handleBackToHome = () => {
    setShowHomePage(true);
    setSelectedFile(null);
    setResult(null);
    setProcessingStatus('idle');
    setChatMessages([]);
    setUploadProgress(0);
  };

  if (showHomePage) {
    return <HomePage onGetStarted={() => setShowHomePage(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Intelligent PDF Assistant
                </h1>
                <p className="text-sm text-gray-600">Powered by GPT-4 for smart document analysis</p>
              </div>
            </div>
            <button
              onClick={handleBackToHome}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <FileUpload 
            onFileSelect={handleFileSelect} 
            isProcessing={processingStatus === 'uploading' || processingStatus === 'processing'} 
            uploadProgress={uploadProgress}
          />

          {selectedFile && processingStatus === 'idle' && (
            <div className="text-center mt-6">
              <button
                onClick={handleProcessPDF}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 space-x-3 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5" />
                <span>Analyze with GPT-4</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <ProcessingStatus
          status={processingStatus}
          message={statusMessage}
          filename={result?.filename}
          processingTime={result?.processingTime}
          uploadProgress={uploadProgress}
        />

        {result && processingStatus === 'success' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'AI Overview', icon: FileText },
                    { id: 'chat', label: 'Ask Questions', icon: MessageCircle },
                    { id: 'edit', label: 'Edit PDF', icon: Edit3 }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                        activeTab === id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <PDFOverview 
                    overview={result.overview}
                    currencyTables={result.currencyTables}
                    filename={result.filename}
                  />
                )}
                {activeTab === 'chat' && (
                  <ChatInterface
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isProcessing={false}
                  />
                )}
                {activeTab === 'edit' && (
                  <TextEditor
                    onEditText={handleTextEdit}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

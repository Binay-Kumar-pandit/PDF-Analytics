import React, { useState } from 'react';
import { FileText, Download, Plus, Minus } from 'lucide-react';

interface PageExtractorProps {
  pageCount: number;
  onExtractPages: (pageNumbers: number[]) => void;
}

export default function PageExtractor({ pageCount, onExtractPages }: PageExtractorProps) {
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [pageInput, setPageInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAddPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= pageCount && !selectedPages.includes(pageNumber)) {
      setSelectedPages([...selectedPages, pageNumber].sort((a, b) => a - b));
    }
  };

  const handleRemovePage = (pageNumber: number) => {
    setSelectedPages(selectedPages.filter(p => p !== pageNumber));
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = parseInt(pageInput);
    if (!isNaN(pageNumber)) {
      handleAddPage(pageNumber);
      setPageInput('');
    }
  };

  const handleExtract = async () => {
    if (selectedPages.length === 0) return;
    
    setIsExtracting(true);
    try {
      await onExtractPages(selectedPages);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleQuickSelect = (type: 'all' | 'first5' | 'last5' | 'clear') => {
    switch (type) {
      case 'all':
        setSelectedPages(Array.from({ length: pageCount }, (_, i) => i + 1));
        break;
      case 'first5':
        setSelectedPages(Array.from({ length: Math.min(5, pageCount) }, (_, i) => i + 1));
        break;
      case 'last5':
        const start = Math.max(1, pageCount - 4);
        setSelectedPages(Array.from({ length: pageCount - start + 1 }, (_, i) => start + i));
        break;
      case 'clear':
        setSelectedPages([]);
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Extract Specific Pages</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-4">
          Document has <strong>{pageCount}</strong> pages. Select pages to extract into a new PDF.
        </p>

        {/* Quick Select Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleQuickSelect('all')}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            All Pages
          </button>
          <button
            onClick={() => handleQuickSelect('first5')}
            className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            First 5
          </button>
          <button
            onClick={() => handleQuickSelect('last5')}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
          >
            Last 5
          </button>
          <button
            onClick={() => handleQuickSelect('clear')}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Add Page Input */}
        <form onSubmit={handlePageInputSubmit} className="flex space-x-2 mb-4">
          <input
            type="number"
            min="1"
            max={pageCount}
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            placeholder={`Enter page number (1-${pageCount})`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>

        {/* Selected Pages */}
        {selectedPages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Selected Pages ({selectedPages.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedPages.map((pageNumber) => (
                <div
                  key={pageNumber}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  <span>Page {pageNumber}</span>
                  <button
                    onClick={() => handleRemovePage(pageNumber)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extract Button */}
        <button
          onClick={handleExtract}
          disabled={selectedPages.length === 0 || isExtracting}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExtracting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Extracting Pages...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Extract Selected Pages</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
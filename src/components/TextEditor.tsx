import React, { useState } from 'react';
import { Edit3, Download, Wand2 } from 'lucide-react';

interface TextEditorProps {
  onEditText: (instructions: string) => void;
}

export default function TextEditor({ onEditText }: TextEditorProps) {
  const [editInstructions, setEditInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInstructions.trim()) return;

    setIsEditing(true);
    try {
      await onEditText(editInstructions.trim());
      setEditInstructions('');
    } finally {
      setIsEditing(false);
    }
  };

  const exampleInstructions = [
    "Change the discount from 10% to 20% in all tables",
    "Update the company name from 'ABC Corp' to 'XYZ Ltd'",
    "Replace all instances of 'Draft' with 'Final'",
    "Change the due date to 30 days from invoice date",
    "Update the tax rate from 18% to 12%",
    "Modify the payment terms to 'Net 15 days'"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Edit3 className="h-6 w-6 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">GPT-4 Powered Text Editing</h3>
      </div>

      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-start space-x-2">
          <Wand2 className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-orange-800">How it works</h4>
            <p className="text-sm text-orange-700 mt-1">
              Describe the changes you want to make in plain English. GPT-4 will understand your instructions 
              and modify the PDF accordingly, then provide a download link for the updated document.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Edit Instructions
          </label>
          <textarea
            id="instructions"
            value={editInstructions}
            onChange={(e) => setEditInstructions(e.target.value)}
            placeholder="Tell GPT-4 what you want to change in the PDF..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            disabled={isEditing}
          />
        </div>

        <button
          type="submit"
          disabled={!editInstructions.trim() || isEditing}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isEditing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>GPT-4 is applying changes...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Apply Changes & Download</span>
            </>
          )}
        </button>
      </form>

      {/* Example Instructions */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Example Instructions:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {exampleInstructions.map((instruction, index) => (
            <button
              key={index}
              onClick={() => setEditInstructions(instruction)}
              className="text-left p-2 text-sm bg-white rounded border hover:bg-blue-50 hover:border-blue-200 transition-colors"
              disabled={isEditing}
            >
              "{instruction}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
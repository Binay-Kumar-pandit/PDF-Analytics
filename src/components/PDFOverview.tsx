import React from 'react';
import { FileText, DollarSign, TrendingUp, Info } from 'lucide-react';

interface CurrencyTable {
  currency: string;
  total: number;
  items: Array<{ description: string; amount: number; }>;
}

interface PDFOverviewProps {
  overview: string;
  currencyTables: CurrencyTable[];
  filename: string;
}

export default function PDFOverview({ overview, currencyTables, filename }: PDFOverviewProps) {
  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'Rs': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toLocaleString()}`;
  };

  const renderOverview = (text: string) => {
    // Split by double newlines to get sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) return null;
      
      // Check if first line looks like a heading (starts with #, is all caps, or ends with :)
      const firstLine = lines[0].trim();
      const isHeading = firstLine.startsWith('#') || 
                       firstLine === firstLine.toUpperCase() || 
                       firstLine.endsWith(':') ||
                       firstLine.includes('OVERVIEW') ||
                       firstLine.includes('SUMMARY');
      
      if (isHeading && lines.length > 1) {
        return (
          <div key={index} className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Info className="h-5 w-5 mr-2 text-blue-600" />
              {firstLine.replace(/^#+\s*/, '').replace(/:$/, '')}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {lines.slice(1).map((line, lineIndex) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                  return (
                    <div key={lineIndex} className="flex items-start mb-2">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{trimmedLine.substring(1).trim()}</span>
                    </div>
                  );
                }
                return (
                  <p key={lineIndex} className="text-gray-700 mb-2">
                    {trimmedLine}
                  </p>
                );
              })}
            </div>
          </div>
        );
      } else {
        // Regular paragraph
        return (
          <div key={index} className="mb-4">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                return (
                  <div key={lineIndex} className="flex items-start mb-2">
                    <span className="text-blue-600 mr-2">•</span>
                    <span className="text-gray-700">{trimmedLine.substring(1).trim()}</span>
                  </div>
                );
              }
              return (
                <p key={lineIndex} className="text-gray-700 mb-2 leading-relaxed">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Analysis Overview</h2>
          <p className="text-sm text-gray-600">Intelligent summary of "{filename}"</p>
        </div>
      </div>

      {/* Overview Content */}
      <div className="bg-white rounded-lg border p-6">
        <div className="prose max-w-none">
          {renderOverview(overview)}
        </div>
      </div>

      {/* Currency Tables */}
      {currencyTables && currencyTables.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
          </div>
          
          {currencyTables.map((table, index) => (
            <div key={index} className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    {table.currency} Transactions
                  </h4>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">
                      Total: {formatCurrency(table.total, table.currency)}
                    </span>
                  </div>
                </div>
              </div>
              
              {table.items && table.items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {table.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(item.amount, table.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
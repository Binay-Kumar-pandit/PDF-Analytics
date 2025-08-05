import React from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';

interface DataTableProps {
  headers: string[];
  rows: Record<string, string>[];
  totals: Record<string, number>;
  onExportCSV: () => void;
  isExporting: boolean;
}

export default function DataTable({ headers, rows, totals, onExportCSV, isExporting }: DataTableProps) {
  if (!headers.length || !rows.length) {
    return (
      <div className="w-full max-w-6xl mx-auto mt-8 p-8 text-center bg-gray-50 rounded-lg border">
        <p className="text-gray-500">No table data extracted from the PDF</p>
      </div>
    );
  }

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    if (isNaN(num)) return value;
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(num);
  };

  const isNumericColumn = (header: string) => {
    return /price|amount|total|cost|sum|qty|quantity/i.test(header);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with export button */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Extracted Data ({rows.length} rows)
            </h3>
            <button
              onClick={onExportCSV}
              disabled={isExporting}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors space-x-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-white">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider"
                  >
                    <div className="flex items-center space-x-1">
                      {isNumericColumn(header) && <FileSpreadsheet className="h-4 w-4" />}
                      <span>{header}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`${
                    rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  {headers.map((header, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 text-sm ${
                        isNumericColumn(header) 
                          ? 'text-right font-mono' 
                          : 'text-gray-900'
                      }`}
                    >
                      {isNumericColumn(header) && !isNaN(parseFloat(row[header]?.replace(/[^\d.-]/g, '') || '0'))
                        ? formatCurrency(row[header] || '0')
                        : row[header] || '-'
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {/* Totals row */}
            {Object.keys(totals).length > 0 && (
              <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                <tr>
                  {headers.map((header, index) => (
                    <td
                      key={index}
                      className={`px-6 py-4 text-sm font-bold ${
                        totals[header] 
                          ? 'text-right font-mono text-gray-900' 
                          : 'text-gray-500'
                      }`}
                    >
                      {index === 0 ? (
                        'TOTALS'
                      ) : totals[header] ? (
                        formatCurrency(totals[header])
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { TrendingUp, DollarSign, Calculator, Percent } from 'lucide-react';

interface FinancialSummaryProps {
  summary: {
    totalMRP: number;
    totalSP: number;
    totalProfit: number;
    profitMargin: number;
  };
}

export default function FinancialSummary({ summary }: FinancialSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="h-6 w-6 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">Total MRP</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(summary.totalMRP)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Total SP</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {formatCurrency(summary.totalSP)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Total Profit</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {formatCurrency(summary.totalProfit)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center space-x-2">
            <Percent className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Profit Margin</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {formatPercentage(summary.profitMargin)}
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white rounded-lg border">
        <p className="text-sm text-gray-600">
          <strong>Calculation:</strong> Profit = MRP - SP | Profit Margin = (Profit / MRP) × 100
        </p>
      </div>
    </div>
  );
}
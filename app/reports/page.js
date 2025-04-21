// app/reports/page.js
'use client';

import { useState, useEffect } from 'react';
import { queryDocuments, where, orderBy } from '@/lib/firebase/db';

// Helper function to format date
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export default function ReportsPage() {
  const [inventoryCount, setInventoryCount] = useState(0);
  const [wasteData, setWasteData] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [reportDate, setReportDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Get current inventory
        const inventoryResult = await queryDocuments('inventory');
        
        // Get waste data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const wasteResult = await queryDocuments('waste', [
          where('disposalDate', '>=', thirtyDaysAgo),
          orderBy('disposalDate', 'desc')
        ]);
        
        // Get consumption data for the last 30 days
        const consumptionResult = await queryDocuments('consumption', [
          where('consumptionDate', '>=', thirtyDaysAgo),
          orderBy('consumptionDate', 'desc')
        ]);
        
        if (inventoryResult.error || wasteResult.error || consumptionResult.error) {
          setError('Failed to fetch report data');
        } else {
          setInventoryCount(inventoryResult.data.length);
          setWasteData(wasteResult.data);
          setConsumptionData(consumptionResult.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  // Calculate waste by reason
  const wasteByReason = wasteData.reduce((acc, entry) => {
    if (!acc[entry.reason]) {
      acc[entry.reason] = 0;
    }
    acc[entry.reason] += entry.quantity;
    return acc;
  }, {});
  
  // Calculate total waste
  const totalWaste = wasteData.reduce((sum, entry) => sum + entry.quantity, 0);
  
  // Calculate total consumption
  const totalConsumption = consumptionData.reduce((sum, entry) => sum + entry.quantity, 0);
  
  // Calculate waste percentage
  const wastePercentage = totalConsumption > 0 
    ? ((totalWaste / (totalWaste + totalConsumption)) * 100).toFixed(2)
    : 0;
  
  const handleGeneratePDF = () => {
    // In a real app, this would generate a PDF
    alert('In a production app, this would generate a PDF report');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Reports</h1>
        <div className="flex space-x-4">
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button 
            onClick={handleGeneratePDF}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Generate PDF
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Total Inventory</h2>
                <p className="text-3xl font-bold text-blue-600">{inventoryCount}</p>
                <p className="text-sm text-gray-600">Items currently tracked</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-red-50 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Food Waste</h2>
                <p className="text-3xl font-bold text-red-600">{wasteData.length}</p>
                <p className="text-sm text-gray-600">Entries logged</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Waste Percentage</h2>
                <p className="text-3xl font-bold text-green-600">{wastePercentage}%</p>
                <p className="text-sm text-gray-600">Of total used food</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Waste by Reason
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {Object.entries(wasteByReason).map(([reason, quantity]) => (
                <div key={reason} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full bg-red-${Math.floor((Math.random() * 5) + 3) * 100} mr-2`}></div>
                    <span className="text-sm font-medium text-gray-900 capitalize">{reason}</span>
                  </div>
                  <span className="text-sm text-gray-600">{quantity.toFixed(2)} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Waste Entries
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="overflow-y-auto max-h-64">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wasteData.slice(0, 5).map((entry) => (
                    <tr key={entry.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entry.itemName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.quantity} {entry.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(entry.disposalDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
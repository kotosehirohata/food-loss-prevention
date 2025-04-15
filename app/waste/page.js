'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { queryDocuments, orderBy } from '@/lib/firebase/db';
import { formatDate } from '@/lib/utils/dateUtils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function WastePage() {
  const [wasteEntries, setWasteEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchWasteEntries = async () => {
      setLoading(true);
      setError('');
      
      try {
        const result = await queryDocuments('waste', [
          orderBy('disposalDate', 'desc')
        ]);
        
        if (result.error) {
          setError(result.error.message || 'Failed to fetch waste entries');
        } else {
          setWasteEntries(result.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWasteEntries();
  }, []);
  
  // Calculate total waste quantities by reason
  const wasteByReason = wasteEntries.reduce((acc, entry) => {
    const reason = entry.reason;
    if (!acc[reason]) {
      acc[reason] = 0;
    }
    acc[reason] += entry.quantity;
    return acc;
  }, {});
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Waste Management</h1>
        <Link href="/waste/add">
          <Button>Log Waste</Button>
        </Link>
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
        <Card title="Waste by Reason">
          {Object.keys(wasteByReason).length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No waste data yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(wasteByReason).map(([reason, quantity]) => (
                <div key={reason} className="py-3 flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-900 capitalize">{reason}</div>
                  <div className="text-sm text-gray-500">{quantity.toFixed(2)} units</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : wasteEntries.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No waste entries</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start logging waste to track and reduce food loss.
            </p>
            <div className="mt-6">
              <Link href="/waste/add">
                <Button>Log Waste</Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card title="Waste Log">
          <div className="overflow-x-auto">
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
                    Reason
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wasteEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{entry.itemName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{entry.quantity} {entry.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                        {entry.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(entry.disposalDate.toDate())}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{entry.notes || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
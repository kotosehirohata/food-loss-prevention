'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { queryDocuments, where, orderBy } from '@/lib/firebase/db';
import { formatDate, daysUntilExpiry } from '@/lib/utils/dateUtils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function Dashboard() {
  const [expiringItems, setExpiringItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [wasteCount, setWasteCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch expiring items (next 3 days)
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        
        const expiringResult = await queryDocuments('inventory', [
          where('expiryDate', '>=', today),
          where('expiryDate', '<=', threeDaysLater),
          orderBy('expiryDate', 'asc')
        ]);
        
        // Fetch inventory count
        const inventoryResult = await queryDocuments('inventory');
        
        // Fetch waste count
        const wasteResult = await queryDocuments('waste');
        
        if (expiringResult.error || inventoryResult.error || wasteResult.error) {
          setError('Failed to fetch dashboard data');
        } else {
          setExpiringItems(expiringResult.data);
          setInventoryCount(inventoryResult.data.length);
          setWasteCount(wasteResult.data.length);
          
          // Identify items with low stock (arbitrary threshold)
          const lowStock = inventoryResult.data.filter(item => 
            (item.category === 'meat' && item.quantity < 2) ||
            (item.category === 'produce' && item.quantity < 3) ||
            (item.category === 'dairy' && item.quantity < 2) ||
            (item.quantity < 1)
          );
          setLowStockItems(lowStock);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
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
        <Card className="bg-blue-50">
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
          <div className="mt-4">
            <Link href="/inventory">
              <Button variant="outline" className="w-full">View Inventory</Button>
            </Link>
          </div>
        </Card>
        
        <Card className="bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Food Waste</h2>
              <p className="text-3xl font-bold text-red-600">{wasteCount}</p>
              <p className="text-sm text-gray-600">Waste entries logged</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/waste">
              <Button variant="outline" className="w-full">View Waste Log</Button>
            </Link>
          </div>
        </Card>
        
        <Card className="bg-yellow-50">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Expiring Soon</h2>
              <p className="text-3xl font-bold text-yellow-600">{expiringItems.length}</p>
              <p className="text-sm text-gray-600">Items expiring in 3 days</p>
            </div>
          </div>
          <div className="mt-4">
            <Link href="/inventory?filter=expiring-soon">
              <Button variant="outline" className="w-full">View Expiring Items</Button>
            </Link>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Items Expiring Soon">
          {expiringItems.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No items expiring soon.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringItems.map((item) => {
                    const days = daysUntilExpiry(item.expiryDate.toDate());
                    let statusClass = 'text-green-600';
                    if (days <= 1) statusClass = 'text-red-600';
                    else if (days <= 3) statusClass = 'text-yellow-600';
                    
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.quantity} {item.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${statusClass}`}>
                            {formatDate(item.expiryDate.toDate())}
                            {' '}
                            ({days === 0 ? 'Today' : `${days} days`})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link href={`/inventory/${item.id}`} className="text-blue-600 hover:text-blue-900">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        
        <Card title="Low Stock Items">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">All items have sufficient stock.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">{item.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600 font-medium">
                          {item.quantity} {item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/inventory/${item.id}`} className="text-blue-600 hover:text-blue-900">
                          Update
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
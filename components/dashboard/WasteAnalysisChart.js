// components/dashboard/WasteAnalysisChart.js

'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { queryDocuments, orderBy } from '@/lib/firebase/db';
import Card from '@/components/ui/Card';

const WasteAnalysisChart = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wasteData, setWasteData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [selectedView, setSelectedView] = useState('byReason');

  // Fetch waste data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await queryDocuments('waste', [
          orderBy('disposalDate', 'desc')
        ]);
        
        if (result.error) {
          setError(result.error.message || 'Failed to fetch waste data');
        } else {
          setWasteData(result.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Process data for charts
  useEffect(() => {
    if (wasteData.length === 0) return;
    
    if (selectedView === 'byReason') {
      // Group waste by reason
      const wasteByReason = wasteData.reduce((acc, entry) => {
        const reason = entry.reason || 'Unknown';
        if (!acc[reason]) {
          acc[reason] = 0;
        }
        acc[reason] += parseFloat(entry.quantity) || 0;
        return acc;
      }, {});
      
      // Convert to chart data format
      const chartDataArray = Object.entries(wasteByReason).map(([reason, amount]) => ({
        name: reason.charAt(0).toUpperCase() + reason.slice(1), // Capitalize first letter
        amount: parseFloat(amount.toFixed(2))
      }));
      
      setChartData(chartDataArray);
    } else if (selectedView === 'byDay') {
      // Group waste by day
      const wasteByDay = wasteData.reduce((acc, entry) => {
        // Handle both Firestore Timestamp and JS Date
        let date = new Date();
        if (entry.disposalDate) {
          date = entry.disposalDate.toDate ? entry.disposalDate.toDate() : entry.disposalDate;
        }
        
        const dateStr = date.toISOString().split('T')[0];
        
        if (!acc[dateStr]) {
          acc[dateStr] = 0;
        }
        acc[dateStr] += parseFloat(entry.quantity) || 0;
        return acc;
      }, {});
      
      // Convert to chart data format and sort by date
      const chartDataArray = Object.entries(wasteByDay)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .map(([date, amount]) => ({
          name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: parseFloat(amount.toFixed(2))
        }));
      
      setChartData(chartDataArray);
    } else if (selectedView === 'byCategory') {
      // Group waste by category - in real app we'd join with inventory collection
      // For this example, we'll use mock categories based on item names
      const wasteByCategory = wasteData.reduce((acc, entry) => {
        let category = 'Other';
        const itemName = entry.itemName ? entry.itemName.toLowerCase() : '';
        
        if (itemName.includes('milk') || itemName.includes('cheese') || itemName.includes('yogurt')) {
          category = 'Dairy';
        } else if (itemName.includes('meat') || itemName.includes('chicken') || itemName.includes('beef')) {
          category = 'Meat';
        } else if (itemName.includes('lettuce') || itemName.includes('tomato') || itemName.includes('vegetable')) {
          category = 'Produce';
        } else if (itemName.includes('bread') || itemName.includes('pastry')) {
          category = 'Bakery';
        }
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(entry.quantity) || 0;
        return acc;
      }, {});
      
      // Convert to chart data format
      const chartDataArray = Object.entries(wasteByCategory).map(([category, amount]) => ({
        name: category,
        amount: parseFloat(amount.toFixed(2))
      }));
      
      setChartData(chartDataArray);
    }
  }, [wasteData, selectedView]);

  return (
    <Card title="Waste Analysis">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center p-4 text-red-600">
          {error}
        </div>
      ) : wasteData.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No waste data available yet.
        </div>
      ) : (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'byReason' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setSelectedView('byReason')}
            >
              By Reason
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'byDay' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setSelectedView('byDay')}
            >
              By Day
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                selectedView === 'byCategory' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setSelectedView('byCategory')}
            >
              By Category
            </button>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} units`, 'Amount']} />
                <Legend />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  name={selectedView === 'byReason' ? 'Amount Wasted' : 
                        selectedView === 'byDay' ? 'Daily Waste' : 'Category Amount'} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Card>
  );
};

export default WasteAnalysisChart;
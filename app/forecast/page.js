// app/forecast/page.js
'use client';

import { useState, useEffect } from 'react';
import { queryDocuments, where, orderBy } from '@/lib/firebase/db';
import { 
  generateForecast, 
  groupConsumptionByDate, 
  getSortedConsumptionData,
  getLastNDays,
  getNextNDays,
  formatDateShort
} from '@/lib/utils/forecastUtils';

export default function ForecastPage() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [consumptionData, setConsumptionData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch inventory items
        const inventoryResult = await queryDocuments('inventory');
        
        // Fetch consumption data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const consumptionResult = await queryDocuments('consumption', [
          where('consumptionDate', '>=', thirtyDaysAgo),
          orderBy('consumptionDate', 'asc')
        ]);
        
        if (inventoryResult.error || consumptionResult.error) {
          setError('Failed to fetch forecast data');
        } else {
          setInventoryItems(inventoryResult.data);
          setConsumptionData(consumptionResult.data);
          
          // Set the first item as selected by default
          if (inventoryResult.data.length > 0 && !selectedItem) {
            setSelectedItem(inventoryResult.data[0]);
          }
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
  
  // Filter consumption data for selected item
  const getItemConsumption = () => {
    if (!selectedItem) return [];
    
    return consumptionData.filter(entry => entry.itemId === selectedItem.id);
  };
  
  // Generate forecast
  const getForecastData = () => {
    const itemConsumption = getItemConsumption();
    const groupedData = groupConsumptionByDate(itemConsumption);
    const sortedData = getSortedConsumptionData(groupedData);
    
    return generateForecast(sortedData, 7);
  };
  
  // Prepare data for display
  const prepareChartData = () => {
    const itemConsumption = getItemConsumption();
    const groupedData = groupConsumptionByDate(itemConsumption);
    
    // Get the last 7 days
    const last7Days = getLastNDays(7);
    const historical = last7Days.map(date => {
      return {
        date,
        quantity: groupedData[date] ? groupedData[date].quantity : 0
      };
    });
    
    // Get the next 7 days for forecast
    const next7Days = getNextNDays(7);
    const forecast = getForecastData();
    const forecastData = next7Days.map((date, index) => {
      return {
        date,
        quantity: forecast[index]
      };
    });
    
    return { historical, forecastData };
  };
  
  const handleItemChange = (e) => {
    const itemId = e.target.value;
    const item = inventoryItems.find(item => item.id === itemId);
    setSelectedItem(item || null);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const { historical, forecastData } = selectedItem ? prepareChartData() : { historical: [], forecastData: [] };
  
  // Convert data for chart display
  const chartLabels = [
    ...historical.map(item => formatDateShort(item.date)),
    ...forecastData.map(item => formatDateShort(item.date))
  ];
  
  const chartData = [
    ...historical.map(item => item.quantity),
    ...forecastData.map(item => item.quantity)
  ];
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Usage Forecast</h1>
      
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
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-4">
            <label htmlFor="itemSelect" className="block text-sm font-medium text-gray-700 mb-1">
              Select Item for Forecast
            </label>
            <select
              id="itemSelect"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={selectedItem?.id || ''}
              onChange={handleItemChange}
            >
              {inventoryItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.unit})
                </option>
              ))}
            </select>
          </div>
          
          {selectedItem && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Forecast for {selectedItem.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Based on your historical usage patterns, here's the predicted consumption for the next 7 days.
              </p>
              
              <div className="h-64 mt-4">
                {/* Simple Chart Display */}
                <div className="h-full flex items-end space-x-2">
                  {chartData.map((value, index) => {
                    const isHistorical = index < historical.length;
                    const height = Math.max(Math.min(value * 10, 100), 5); // Scale height between 5% and 100%
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full ${isHistorical ? 'bg-blue-500' : 'bg-green-500'}`} 
                          style={{ height: `${height}%` }}
                        ></div>
                        <div className="text-xs mt-1 transform -rotate-45 origin-top-left whitespace-nowrap">
                          {chartLabels[index]}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between mt-8">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 mr-2"></div>
                    <span className="text-sm">Historical Usage</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 mr-2"></div>
                    <span className="text-sm">Predicted Usage</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Forecast Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-500">Average Daily Usage</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {(chartData.slice(0, historical.length).reduce((sum, val) => sum + val, 0) / historical.length || 0).toFixed(2)} {selectedItem.unit}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-sm text-gray-500">Predicted Next Week</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {forecastData.reduce((sum, item) => sum + item.quantity, 0).toFixed(2)} {selectedItem.unit}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Forecasting Notes
          </h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="prose prose-sm">
            <p>
              This forecast is based on your historical usage patterns. The accuracy will improve with more data.
              For best results, consistently log all consumption.
            </p>
            <h4>How to use this forecast:</h4>
            <ul>
              <li>Plan your purchasing based on predicted usage</li>
              <li>Compare actual vs. predicted usage to identify patterns</li>
              <li>Adjust your inventory levels to minimize waste while avoiding stockouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
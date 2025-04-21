// app/consumption/page.js
"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { queryDocuments, orderBy } from "@/lib/firebase/db";

export default function ConsumptionPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [consumptionData, setConsumptionData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // We'll use the waste collection to show consumption data for now
        const result = await queryDocuments("waste", [orderBy("disposalDate", "desc")]);
        
        if (result.error) {
          setError(result.error.message || "Failed to fetch consumption data");
        } else {
          setConsumptionData(result.data);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Consumption Tracking</h1>
      
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

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Card>
          <div className="text-center p-6">
            <h3 className="text-lg font-medium text-gray-900">Consumption Tracking</h3>
            <p className="mt-2 text-gray-600">
              Track your inventory consumption patterns and analyze usage trends to optimize ordering and reduce waste.
            </p>
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                This feature is under development. Coming soon!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// app/forecast/page.js
"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { queryDocuments } from "@/lib/firebase/db";

export default function ForecastPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Forecast</h1>
      
      <Card>
        <div className="text-center p-6">
          <h3 className="text-lg font-medium text-gray-900">AI-Driven Forecasting</h3>
          <p className="mt-2 text-gray-600">
            Get accurate predictions for inventory needs based on historical data and consumption patterns.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              This feature is under development. Coming soon!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// app/reports/page.js
"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { queryDocuments } from "@/lib/firebase/db";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [wasteCount, setWasteCount] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const inventoryResult = await queryDocuments('inventory');
        const wasteResult = await queryDocuments('waste');
        
        if (!inventoryResult.error && !wasteResult.error) {
          setInventoryCount(inventoryResult.data.length);
          setWasteCount(wasteResult.data.length);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Inventory Summary">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Total Items:</span>
                <span className="font-bold">{inventoryCount}</span>
              </div>
              <p className="text-sm text-gray-500">
                Detailed inventory reports will be available soon.
              </p>
            </div>
          </Card>
          
          <Card title="Waste Summary">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Total Waste Entries:</span>
                <span className="font-bold">{wasteCount}</span>
              </div>
              <p className="text-sm text-gray-500">
                Detailed waste analysis reports will be available soon.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// app/sharing/page.js
"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { queryDocuments, where } from "@/lib/firebase/db";

export default function SharingPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sharingItems, setSharingItems] = useState([]);
  
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      
      try {
        const result = await queryDocuments("inventory", [
          where("sharingAvailable", "==", true)
        ]);
        
        if (result.error) {
          setError(result.error.message || "Failed to fetch shared items");
        } else {
          setSharingItems(result.data);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Sharing Marketplace</h1>
      
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
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : sharingItems.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items available for sharing</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mark items as "Available for sharing" in your inventory to see them here.
            </p>
          </div>
        </Card>
      ) : (
        <div>
          <Card title="Available for Sharing">
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
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sharingItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(item.expiryDate.toDate()).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
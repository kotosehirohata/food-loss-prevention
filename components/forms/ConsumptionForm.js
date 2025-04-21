// components/forms/ConsumptionForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addDocument, dateToTimestamp, queryDocuments, updateDocument } from '@/lib/firebase/db';
import { formatDateForInput } from '@/lib/utils/dateUtils';

export default function ConsumptionForm() {
  const router = useRouter();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    consumptionDate: formatDateForInput(new Date()),
    notes: '',
  });
  
  const [selectedItem, setSelectedItem] = useState(null);
  
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const result = await queryDocuments('inventory');
        if (result.error) {
          setError(result.error.message || 'Failed to fetch inventory');
        } else {
          setInventoryItems(result.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'itemId') {
      const item = inventoryItems.find(item => item.id === value);
      setSelectedItem(item || null);
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    if (!selectedItem) {
      setError('Please select an inventory item');
      setSubmitting(false);
      return;
    }
    
    if (parseFloat(formData.quantity) > selectedItem.quantity) {
      setError(`Consumption quantity cannot exceed available quantity (${selectedItem.quantity} ${selectedItem.unit})`);
      setSubmitting(false);
      return;
    }
    
    try {
      // Create consumption entry
      const consumptionData = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity: parseFloat(formData.quantity),
        unit: selectedItem.unit,
        consumptionDate: dateToTimestamp(new Date(formData.consumptionDate)),
        notes: formData.notes || '',
      };
      
      const result = await addDocument('consumption', consumptionData);
      
      if (result.error) {
        setError(result.error.message || 'Failed to log consumption');
      } else {
        // Update inventory quantity
        const updatedQuantity = selectedItem.quantity - parseFloat(formData.quantity);
        
        await updateDocument('inventory', selectedItem.id, {
          quantity: updatedQuantity
        });
        
        router.push('/consumption');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
      
      <div>
        <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">
          Select Inventory Item
        </label>
        <select
          id="itemId"
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          required
          disabled={loading}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Select an item</option>
          {inventoryItems.map(item => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.quantity} {item.unit})
            </option>
          ))}
        </select>
      </div>
      
      {selectedItem && (
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-blue-900">Selected Item Details</h3>
          <p className="mt-1 text-sm text-blue-700">
            {selectedItem.name} - {selectedItem.quantity} {selectedItem.unit} available
          </p>
        </div>
      )}
      
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          Quantity Consumed
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          max={selectedItem ? selectedItem.quantity : undefined}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="consumptionDate" className="block text-sm font-medium text-gray-700 mb-1">
          Consumption Date
        </label>
        <input
          type="date"
          id="consumptionDate"
          name="consumptionDate"
          value={formData.consumptionDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {submitting ? 'Saving...' : 'Log Consumption'}
        </button>
      </div>
    </form>
  );
}
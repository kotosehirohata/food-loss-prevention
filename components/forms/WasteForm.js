'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { addDocument, dateToTimestamp, queryDocuments } from '@/lib/firebase/db';
import { formatDateForInput } from '@/lib/utils/dateUtils';

const wasteReasonOptions = [
  { value: 'expired', label: 'Expired' },
  { value: 'spoiled', label: 'Spoiled' },
  { value: 'overproduction', label: 'Overproduction' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'quality', label: 'Quality Issue' },
  { value: 'other', label: 'Other' },
];

export default function WasteForm() {
  const router = useRouter();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: '',
    reason: '',
    disposalDate: formatDateForInput(new Date()),
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
      setError(`Waste quantity cannot exceed available quantity (${selectedItem.quantity} ${selectedItem.unit})`);
      setSubmitting(false);
      return;
    }
    
    try {
      const wasteData = {
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        quantity: parseFloat(formData.quantity),
        unit: selectedItem.unit,
        reason: formData.reason,
        notes: formData.notes,
        disposalDate: dateToTimestamp(new Date(formData.disposalDate)),
      };
      
      const result = await addDocument('waste', wasteData);
      
      if (result.error) {
        setError(result.error.message || 'Failed to log waste');
      } else {
        // Update inventory quantity
        const updatedQuantity = selectedItem.quantity - parseFloat(formData.quantity);
        
        // You would typically update the inventory item here
        // For simplicity, let's assume we have an updateInventoryQuantity function
        // await updateInventoryQuantity(selectedItem.id, updatedQuantity);
        
        router.push('/waste');
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
        <Select
          label="Select Inventory Item"
          name="itemId"
          value={formData.itemId}
          onChange={handleChange}
          required
          disabled={loading}
          options={inventoryItems.map(item => ({
            value: item.id,
            label: `${item.name} (${item.quantity} ${item.unit})`
          }))}
        />
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
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          step="0.01"
          min="0.01"
          max={selectedItem ? selectedItem.quantity : undefined}
          value={formData.quantity}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Select
          label="Reason for Waste"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          required
          options={wasteReasonOptions}
        />
      </div>
      
      <div>
        <Input
          label="Disposal Date"
          name="disposalDate"
          type="date"
          value={formData.disposalDate}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Input
          label="Notes (Optional)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={submitting}
        >
          Log Waste
        </Button>
      </div>
    </form>
  );
}
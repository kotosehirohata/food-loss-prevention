'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { addDocument, dateToTimestamp, updateDocument } from '@/lib/firebase/db';
import { calculateExpiryDate, formatDateForInput } from '@/lib/utils/dateUtils';

const categoryOptions = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'seafood', label: 'Seafood' },
  { value: 'produce', label: 'Produce' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'frozen', label: 'Frozen' },
  { value: 'prepared', label: 'Prepared Food' },
  { value: 'beverage', label: 'Beverage' },
  { value: 'other', label: 'Other' },
];

const unitOptions = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'ml', label: 'Milliliters (ml)' },
  { value: 'pcs', label: 'Pieces' },
  { value: 'box', label: 'Box' },
  { value: 'pack', label: 'Pack' },
];

export default function InventoryForm({ initialData = null }) {
  const isEditing = !!initialData;
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    quantity: initialData?.quantity || '',
    unit: initialData?.unit || '',
    category: initialData?.category || '',
    purchaseDate: initialData?.purchaseDate 
      ? formatDateForInput(initialData.purchaseDate.toDate())
      : formatDateForInput(new Date()),
    expiryDate: initialData?.expiryDate 
      ? formatDateForInput(initialData.expiryDate.toDate())
      : '',
    notes: initialData?.notes || '',
    sharingAvailable: initialData?.sharingAvailable || false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category' && !isEditing) {
      // Auto-calculate expiry date when category changes
      if (value) {
        const expiry = calculateExpiryDate(formData.purchaseDate, value);
        setFormData({
          ...formData,
          [name]: value,
          expiryDate: formatDateForInput(expiry)
        });
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const inventoryData = {
        name: formData.name,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        purchaseDate: dateToTimestamp(new Date(formData.purchaseDate)),
        expiryDate: dateToTimestamp(new Date(formData.expiryDate)),
        notes: formData.notes,
        sharingAvailable: formData.sharingAvailable,
      };
      
      let result;
      
      if (isEditing) {
        result = await updateDocument('inventory', initialData.id, inventoryData);
      } else {
        result = await addDocument('inventory', inventoryData);
      }
      
      if (result.error) {
        setError(result.error.message || 'Failed to save inventory item');
      } else {
        router.push('/inventory');
        router.refresh();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
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
        <Input
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          min="0"
          step="0.01"
          value={formData.quantity}
          onChange={handleChange}
          required
        />
        
        <Select
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={unitOptions}
          required
        />
      </div>
      
      <Select
        label="Category"
        name="category"
        value={formData.category}
        onChange={handleChange}
        options={categoryOptions}
        required
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Purchase Date"
          name="purchaseDate"
          type="date"
          value={formData.purchaseDate}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Expiry Date"
          name="expiryDate"
          type="date"
          value={formData.expiryDate}
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
      
      <div className="flex items-center">
        <input
          id="sharingAvailable"
          name="sharingAvailable"
          type="checkbox"
          checked={formData.sharingAvailable}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="sharingAvailable" className="ml-2 block text-sm text-gray-900">
          Available for sharing with other restaurants
        </label>
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
          isLoading={loading}
        >
          {isEditing ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
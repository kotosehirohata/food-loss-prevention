'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getDocument } from '@/lib/firebase/db';
import InventoryForm from '@/components/forms/InventoryForm';
import Card from '@/components/ui/Card';

export default function EditInventoryPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      setError('');
      
      try {
        const result = await getDocument('inventory', id);
        
        if (result.error) {
          setError(result.error.message || 'Failed to fetch item');
        } else if (!result.data) {
          setError('Item not found');
        } else {
          setItem(result.data);
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchItem();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
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
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Inventory Item</h1>
      <Card>
        <InventoryForm initialData={item} />
      </Card>
    </div>
  );
}
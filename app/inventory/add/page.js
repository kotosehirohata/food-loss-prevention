import Card from '@/components/ui/Card';
import InventoryForm from '@/components/forms/InventoryForm';

export default function AddInventoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Inventory Item</h1>
      <Card>
        <InventoryForm />
      </Card>
    </div>
  );
}
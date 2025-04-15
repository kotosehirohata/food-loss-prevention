import Card from '@/components/ui/Card';
import WasteForm from '@/components/forms/WasteForm';

export default function AddWastePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Food Waste</h1>
      <Card>
        <WasteForm />
      </Card>
    </div>
  );
}
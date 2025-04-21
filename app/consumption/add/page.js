// app/consumption/add/page.js
import ConsumptionForm from '@/components/forms/ConsumptionForm';

export default function AddConsumptionPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Log Consumption</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <ConsumptionForm />
        </div>
      </div>
    </div>
  );
}
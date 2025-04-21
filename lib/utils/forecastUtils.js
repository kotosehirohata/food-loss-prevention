// Simple linear regression for forecasting
export const generateForecast = (historicalData, daysToForecast = 7) => {
  if (!historicalData || historicalData.length < 3) {
    return new Array(daysToForecast).fill(0);
  }
  
  // Get the average daily consumption
  const totalConsumption = historicalData.reduce((sum, day) => sum + day.quantity, 0);
  const averageConsumption = totalConsumption / historicalData.length;
  
  // Simple forecast: use the average as prediction for future days
  // In a real app, you'd use more sophisticated methods like Prophet or ARIMA
  return new Array(daysToForecast).fill(averageConsumption);
};

// Group consumption data by date
export const groupConsumptionByDate = (consumptionData) => {
  return consumptionData.reduce((acc, entry) => {
    const date = new Date(entry.consumptionDate.toDate()).toISOString().split('T')[0];
    
    if (!acc[date]) {
      acc[date] = { date, quantity: 0 };
    }
    
    acc[date].quantity += entry.quantity;
    return acc;
  }, {});
};

// lib/utils/forecastUtils.js (continued)
// Convert grouped data to array and sort by date
export const getSortedConsumptionData = (groupedData) => {
  return Object.values(groupedData).sort((a, b) => new Date(a.date) - new Date(b.date));
};

// Generate last 7 days of dates
export const getLastNDays = (n = 7) => {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Generate next 7 days of dates
export const getNextNDays = (n = 7) => {
  const dates = [];
  for (let i = 1; i <= n; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Format date for display
export const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

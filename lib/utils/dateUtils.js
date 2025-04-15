// Calculate expiry date based on the food category
export const calculateExpiryDate = (purchaseDate, category) => {
    const date = new Date(purchaseDate);
    
    // Days to add based on food category
    const daysToAdd = {
      dairy: 7,
      meat: 3,
      seafood: 2,
      produce: 5,
      bakery: 4,
      grocery: 180, // 6 months
      frozen: 90,   // 3 months
      prepared: 3,
      beverage: 14,
      other: 7
    };
    
    date.setDate(date.getDate() + (daysToAdd[category] || 7));
    return date;
  };
  
  // Format date to YYYY-MM-DD for input fields
  export const formatDateForInput = (date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  
  // Format date to display format (e.g., Jan 1, 2023)
  export const formatDate = (date) => {
    if (!date) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };
  
  // Calculate days remaining until expiry
  export const daysUntilExpiry = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
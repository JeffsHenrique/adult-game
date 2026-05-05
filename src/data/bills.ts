export interface Bill {
  id: string
  name: string
  nameKey: string
  type: 'essential' | 'discretionary'
  priceRange: {
    min: number
    max: number
  }
}

export const BILLS: Bill[] = [
  { id: 'rent', name: 'Rent/Mortgage', nameKey: 'bill.rent', type: 'essential', priceRange: { min: 800, max: 2500 } },
  { id: 'groceries', name: 'Groceries', nameKey: 'bill.groceries', type: 'essential', priceRange: { min: 300, max: 800 } },
  { id: 'utilities', name: 'Utilities', nameKey: 'bill.utilities', type: 'essential', priceRange: { min: 100, max: 300 } },
  { id: 'internet', name: 'Internet', nameKey: 'bill.internet', type: 'essential', priceRange: { min: 50, max: 120 } },
  { id: 'phone', name: 'Phone Bill', nameKey: 'bill.phone', type: 'essential', priceRange: { min: 40, max: 100 } },
  { id: 'transport', name: 'Transportation', nameKey: 'bill.transport', type: 'essential', priceRange: { min: 60, max: 200 } },
  { id: 'insurance', name: 'Insurance', nameKey: 'bill.insurance', type: 'essential', priceRange: { min: 100, max: 400 } },
  { id: 'healthcare', name: 'Healthcare', nameKey: 'bill.healthcare', type: 'essential', priceRange: { min: 50, max: 300 } },
  { id: 'dining', name: 'Dining Out', nameKey: 'bill.dining', type: 'discretionary', priceRange: { min: 100, max: 500 } },
  { id: 'entertainment', name: 'Entertainment', nameKey: 'bill.entertainment', type: 'discretionary', priceRange: { min: 50, max: 200 } },
  { id: 'shopping', name: 'Shopping', nameKey: 'bill.shopping', type: 'discretionary', priceRange: { min: 100, max: 600 } },
  { id: 'subscriptions', name: 'Subscriptions', nameKey: 'bill.subscriptions', type: 'discretionary', priceRange: { min: 30, max: 150 } },
  { id: 'hobbies', name: 'Hobbies', nameKey: 'bill.hobbies', type: 'discretionary', priceRange: { min: 50, max: 300 } },
  { id: 'gym', name: 'Gym Membership', nameKey: 'bill.gym', type: 'discretionary', priceRange: { min: 30, max: 100 } },
  { id: 'charity', name: 'Charity', nameKey: 'bill.charity', type: 'discretionary', priceRange: { min: 20, max: 200 } },
]

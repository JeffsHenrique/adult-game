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
  { id: 'rent', name: 'Rent/Mortgage', nameKey: 'bills.rent', type: 'essential', priceRange: { min: 800, max: 2500 } },
  { id: 'groceries', name: 'Groceries', nameKey: 'bills.groceries', type: 'essential', priceRange: { min: 300, max: 800 } },
  { id: 'utilities', name: 'Utilities', nameKey: 'bills.utilities', type: 'essential', priceRange: { min: 100, max: 300 } },
  { id: 'internet', name: 'Internet', nameKey: 'bills.internet', type: 'essential', priceRange: { min: 50, max: 120 } },
  { id: 'phone', name: 'Phone Bill', nameKey: 'bills.phone', type: 'essential', priceRange: { min: 40, max: 100 } },
  { id: 'transport', name: 'Transportation', nameKey: 'bills.transport', type: 'essential', priceRange: { min: 60, max: 200 } },
  { id: 'insurance', name: 'Insurance', nameKey: 'bills.insurance', type: 'essential', priceRange: { min: 100, max: 400 } },
  { id: 'healthcare', name: 'Healthcare', nameKey: 'bills.healthcare', type: 'essential', priceRange: { min: 50, max: 300 } },
  { id: 'dining', name: 'Dining Out', nameKey: 'bills.dining', type: 'discretionary', priceRange: { min: 100, max: 500 } },
  { id: 'entertainment', name: 'Entertainment', nameKey: 'bills.entertainment', type: 'discretionary', priceRange: { min: 50, max: 200 } },
  { id: 'shopping', name: 'Shopping', nameKey: 'bills.shopping', type: 'discretionary', priceRange: { min: 100, max: 600 } },
  { id: 'subscriptions', name: 'Subscriptions', nameKey: 'bills.subscriptions', type: 'discretionary', priceRange: { min: 30, max: 150 } },
  { id: 'hobbies', name: 'Hobbies', nameKey: 'bills.hobbies', type: 'discretionary', priceRange: { min: 50, max: 300 } },
  { id: 'gym', name: 'Gym Membership', nameKey: 'bills.gym', type: 'discretionary', priceRange: { min: 30, max: 100 } },
  { id: 'charity', name: 'Charity', nameKey: 'bills.charity', type: 'discretionary', priceRange: { min: 20, max: 200 } },
]

import { BILLS } from '../data/bills'
import { mulberry32 } from './dailySeed'

export interface BillWithPrice {
  id: string
  nameKey: string
  name: string
  type: 'essential' | 'discretionary'
  priceRange: { min: number; max: number }
  price: number
}

export interface DailyGame {
  salary: number
  bills: BillWithPrice[]
  correctAnswer: string[]
}

const TIERS = [
  { min: 800, max: 2500, billCount: [5, 6] },
  { min: 2500, max: 5000, billCount: [6, 7] },
  { min: 5000, max: 15000, billCount: [7, 8] },
  { min: 15000, max: 25000, billCount: [7, 8] },
]

function randomInRange(rng: () => number, min: number, max: number): number {
  const rounded = Math.round((rng() * (max - min) + min) * 100) / 100
  return rounded
}

function shuffle<T>(rng: () => number, array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateDailyGame(seed: number): DailyGame {
  const rng = mulberry32(seed)

  // Pick salary tier
  const tier = TIERS[Math.floor(rng() * TIERS.length)]
  const salary = randomInRange(rng, tier.min, tier.max)

  // Select bills
  const billCount = Math.round(randomInRange(rng, tier.billCount[0], tier.billCount[1]))
  const essentialCount = Math.min(Math.max(3, Math.floor(billCount * 0.6)), BILLS.filter(b => b.type === 'essential').length)
  const discCount = billCount - essentialCount

  const essentials = shuffle(rng, BILLS.filter(b => b.type === 'essential'))
  const discretionary = shuffle(rng, BILLS.filter(b => b.type === 'discretionary'))

  const selectedBills = [
    ...essentials.slice(0, essentialCount),
    ...discretionary.slice(0, discCount),
  ]

  // Generate prices
  const billsWithPrices: BillWithPrice[] = selectedBills.map(bill => ({
    ...bill,
    price: randomInRange(rng, bill.priceRange.min, bill.priceRange.max),
  }))

  // Total bills should exceed salary
  const totalBills = billsWithPrices.reduce((sum, b) => sum + b.price, 0)
  if (totalBills <= salary) {
    // Scale up prices so total exceeds salary by at least 30%
    const scaleFactor = (salary * 1.4) / totalBills
    billsWithPrices.forEach(b => {
      b.price = Math.round(b.price * scaleFactor * 100) / 100
    })
  }

  // Generate completely random correct answer
  // Shuffle all bills and randomly pick a valid subset (total <= salary)
  const shuffled = shuffle(rng, billsWithPrices)
  const correctAnswer: string[] = []
  let correctTotal = 0

  for (const bill of shuffled) {
    // Use RNG to decide whether to try including this bill
    if (rng() > 0.5 && correctTotal + bill.price <= salary) {
      correctAnswer.push(bill.id)
      correctTotal += bill.price
    }
  }

  // If no bills were selected, force at least one random bill that fits
  if (correctAnswer.length === 0) {
    for (const bill of shuffled) {
      if (bill.price <= salary) {
        correctAnswer.push(bill.id)
        break
      }
    }
  }

  // If still empty (all bills exceed salary, very unlikely), pick cheapest
  if (correctAnswer.length === 0) {
    const cheapest = [...billsWithPrices].sort((a, b) => a.price - b.price)[0]
    correctAnswer.push(cheapest.id)
  }

  return {
    salary,
    bills: billsWithPrices,
    correctAnswer,
  }
}

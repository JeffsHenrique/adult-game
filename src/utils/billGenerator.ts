import { BILLS, Bill } from '../data/bills'
import { mulberry32 } from './dailySeed'

export interface BillWithPrice extends Bill {
  price: number
}

export interface DailyGame {
  salary: number
  bills: BillWithPrice[]
  correctAnswer: string[]
}

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

  // Pick bill count first (5-8 bills)
  const count = Math.floor(rng() * 4) + 5 // 5-8 bills

  // Shuffle and select bills
  const essentials = shuffle(rng, BILLS.filter(b => b.type === 'essential'))
  const discretionary = shuffle(rng, BILLS.filter(b => b.type === 'discretionary'))

  const essentialCount = Math.min(Math.max(3, Math.floor(count * 0.6)), essentials.length)
  const discCount = count - essentialCount

  const selectedBills = [
    ...essentials.slice(0, essentialCount),
    ...discretionary.slice(0, discCount),
  ]

  // Generate prices for selected bills
  const billsWithPrices: BillWithPrice[] = selectedBills.map(bill => ({
    ...bill,
    price: randomInRange(rng, bill.priceRange.min, bill.priceRange.max),
  }))

  // Calculate total of all bills
  const totalBills = billsWithPrices.reduce((sum, b) => sum + b.price, 0)

  // Salary should be 62.5-76.9% of total (so total exceeds salary by 30-60%)
  const salary = randomInRange(rng, totalBills / 1.6, totalBills / 1.3)

  // Generate correct answer: start with essential bills that fit
  let correctAnswer: string[] = []
  let correctTotal = 0

  // First, add essential bills that fit within 85% of salary
  const essentialBills = billsWithPrices.filter(b => b.type === 'essential')
  for (const bill of essentialBills) {
    if (correctTotal + bill.price <= salary * 0.85) {
      correctAnswer.push(bill.id)
      correctTotal += bill.price
    }
  }

  // Then, try to add discretionary bills if budget allows
  const discBills = billsWithPrices.filter(b => b.type === 'discretionary')
  for (const bill of discBills) {
    if (correctTotal + bill.price <= salary * 0.95) {
      correctAnswer.push(bill.id)
      correctTotal += bill.price
    }
  }

  // If correct answer is empty, force at least one essential bill
  if (correctAnswer.length === 0 && essentialBills.length > 0) {
    const cheapest = [...essentialBills].sort((a, b) => a.price - b.price)[0]
    correctAnswer = [cheapest.id]
  }

  return {
    salary,
    bills: billsWithPrices,
    correctAnswer,
  }
}

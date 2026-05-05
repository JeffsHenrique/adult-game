import { generateDailyGame } from '../billGenerator'

describe('generateDailyGame', () => {
  it('generates a valid game with seed 12345', () => {
    const game = generateDailyGame(12345)
    expect(game.salary).toBeGreaterThan(0)
    expect(game.bills.length).toBeGreaterThanOrEqual(5)
    expect(game.bills.length).toBeLessThanOrEqual(8)
    expect(game.correctAnswer.length).toBeGreaterThan(0)
  })

  it('correct answer total is within salary', () => {
    const game = generateDailyGame(12345)
    const correctTotal = game.correctAnswer.reduce((sum, id) => {
      const bill = game.bills.find(b => b.id === id)
      return sum + (bill?.price || 0)
    }, 0)
    expect(correctTotal).toBeLessThanOrEqual(game.salary)
  })

  it('total bills exceed salary', () => {
    const game = generateDailyGame(12345)
    const totalBills = game.bills.reduce((sum, b) => sum + b.price, 0)
    expect(totalBills).toBeGreaterThan(game.salary)
  })

  it('produces same game for same seed', () => {
    const game1 = generateDailyGame(42)
    const game2 = generateDailyGame(42)
    expect(game1.salary).toBe(game2.salary)
    expect(game1.bills.length).toBe(game2.bills.length)
    expect(game1.correctAnswer).toEqual(game2.correctAnswer)
  })

  it('produces different games for different seeds', () => {
    const game1 = generateDailyGame(1)
    const game2 = generateDailyGame(2)
    expect(game1.salary).not.toBe(game2.salary)
  })
})

import { generateDailyGame } from '../billGenerator'

describe('generateDailyGame', () => {
  describe('basic structure', () => {
    it('generates a valid game with seed 12345', () => {
      const game = generateDailyGame(12345)
      expect(game.salary).toBeGreaterThan(0)
      expect(game.bills.length).toBeGreaterThanOrEqual(5)
      expect(game.bills.length).toBeLessThanOrEqual(8)
      expect(game.correctAnswer.length).toBeGreaterThan(0)
    })

    it('has salary within tier ranges', () => {
      for (let seed = 1; seed <= 20; seed++) {
        const game = generateDailyGame(seed)
        expect(game.salary).toBeGreaterThanOrEqual(800)
        expect(game.salary).toBeLessThanOrEqual(25000)
      }
    })

    it('all bills have positive prices', () => {
      const game = generateDailyGame(999)
      game.bills.forEach(bill => {
        expect(bill.price).toBeGreaterThan(0)
      })
    })

    it('correct answer bills exist in the bills array', () => {
      const game = generateDailyGame(777)
      const billIds = game.bills.map(b => b.id)
      game.correctAnswer.forEach(id => {
        expect(billIds).toContain(id)
      })
    })
  })

  describe('budget constraints', () => {
    it('correct answer total is within salary', () => {
      for (let seed = 1; seed <= 50; seed++) {
        const game = generateDailyGame(seed)
        const correctTotal = game.correctAnswer.reduce((sum, id) => {
          const bill = game.bills.find(b => b.id === id)
          return sum + (bill?.price || 0)
        }, 0)
        expect(correctTotal).toBeLessThanOrEqual(game.salary)
      }
    })

    it('total bills exceed salary', () => {
      for (let seed = 1; seed <= 50; seed++) {
        const game = generateDailyGame(seed)
        const totalBills = game.bills.reduce((sum, b) => sum + b.price, 0)
        expect(totalBills).toBeGreaterThan(game.salary)
      }
    })
  })

  describe('determinism', () => {
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

  describe('random correct answer', () => {
    it('correct answer size varies across different seeds', () => {
      const sizes = new Set<number>()
      for (let seed = 1; seed <= 100; seed++) {
        const game = generateDailyGame(seed)
        sizes.add(game.correctAnswer.length)
      }
      // Should produce answers of varying sizes, not always the same count
      expect(sizes.size).toBeGreaterThan(1)
    })

    it('correct answer is not always all bills', () => {
      let allBillsCount = 0
      for (let seed = 1; seed <= 50; seed++) {
        const game = generateDailyGame(seed)
        if (game.correctAnswer.length === game.bills.length) {
          allBillsCount++
        }
      }
      // Should NOT always select all bills
      expect(allBillsCount).toBeLessThan(50)
    })

    it('correct answer is not always just one bill', () => {
      let oneBillCount = 0
      for (let seed = 1; seed <= 50; seed++) {
        const game = generateDailyGame(seed)
        if (game.correctAnswer.length === 1) {
          oneBillCount++
        }
      }
      // Should NOT always select just one bill
      expect(oneBillCount).toBeLessThan(50)
    })

    it('correct answer does not always include all essential bills', () => {
      let alwaysEssentialCount = 0
      for (let seed = 1; seed <= 50; seed++) {
        const game = generateDailyGame(seed)
        const essentialIds = game.bills.filter(b => b.type === 'essential').map(b => b.id)
        const allEssentialsSelected = essentialIds.every(id => game.correctAnswer.includes(id))
        if (allEssentialsSelected) {
          alwaysEssentialCount++
        }
      }
      // Should NOT always include all essential bills
      expect(alwaysEssentialCount).toBeLessThan(50)
    })

    it('correct answer can include discretionary bills', () => {
      let hasDiscretionary = false
      for (let seed = 1; seed <= 100; seed++) {
        const game = generateDailyGame(seed)
        const discIds = game.bills.filter(b => b.type === 'discretionary').map(b => b.id)
        if (discIds.some(id => game.correctAnswer.includes(id))) {
          hasDiscretionary = true
          break
        }
      }
      expect(hasDiscretionary).toBe(true)
    })

    it('correct answer can be only discretionary bills', () => {
      let onlyDiscretionary = false
      for (let seed = 1; seed <= 200; seed++) {
        const game = generateDailyGame(seed)
        const essentialIds = game.bills.filter(b => b.type === 'essential').map(b => b.id)
        const hasNoEssential = essentialIds.every(id => !game.correctAnswer.includes(id))
        if (hasNoEssential && game.correctAnswer.length > 0) {
          onlyDiscretionary = true
          break
        }
      }
      expect(onlyDiscretionary).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles very small seed values', () => {
      const game = generateDailyGame(0)
      expect(game.salary).toBeGreaterThan(0)
      expect(game.correctAnswer.length).toBeGreaterThan(0)
    })

    it('handles very large seed values', () => {
      const game = generateDailyGame(999999)
      expect(game.salary).toBeGreaterThan(0)
      expect(game.correctAnswer.length).toBeGreaterThan(0)
    })
  })
})

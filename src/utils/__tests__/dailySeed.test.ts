import { getDailySeed, mulberry32, getUTC3Date } from '../dailySeed'

describe('getUTC3Date', () => {
  it('returns date in YYYY-MM-DD format for UTC-3', () => {
    const date = new Date('2026-05-05T10:00:00Z')
    const result = getUTC3Date(date)
    expect(result).toBe('2026-05-05')
  })

  it('handles day boundary correctly', () => {
    const date = new Date('2026-05-06T02:00:00Z')
    const result = getUTC3Date(date)
    expect(result).toBe('2026-05-05')
  })
})

describe('mulberry32', () => {
  it('produces deterministic output', () => {
    const rng1 = mulberry32(12345)
    const rng2 = mulberry32(12345)
    expect(rng1()).toBe(rng2())
  })

  it('produces values between 0 and 1', () => {
    const rng = mulberry32(999)
    for (let i = 0; i < 100; i++) {
      const val = rng()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })
})

describe('getDailySeed', () => {
  it('returns consistent seed for same date', () => {
    const seed1 = getDailySeed(new Date('2026-05-05T12:00:00Z'))
    const seed2 = getDailySeed(new Date('2026-05-05T18:00:00Z'))
    expect(seed1).toBe(seed2)
  })

  it('returns different seed for different dates', () => {
    const seed1 = getDailySeed(new Date('2026-05-05T12:00:00Z'))
    const seed2 = getDailySeed(new Date('2026-05-06T12:00:00Z'))
    expect(seed1).not.toBe(seed2)
  })

  it('respects test seed override', () => {
    vi.stubEnv('VITE_TEST_SEED', '42')
    const seed = getDailySeed(new Date('2026-05-05T12:00:00Z'))
    expect(seed).toBe(42)
    vi.unstubAllEnvs()
  })
})

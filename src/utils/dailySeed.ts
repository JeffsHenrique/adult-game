function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getUTC3Date(date: Date = new Date()): string {
  const utc3OffsetHours = -3
  const utc3Time = date.getTime() + utc3OffsetHours * 3600000
  const utc3Date = new Date(utc3Time)
  return utc3Date.toISOString().split('T')[0]
}

export function mulberry32(seed: number): () => number {
  let s = seed
  return () => {
    s |= 0
    s = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ s >>> 15, 1 | s)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

export function getDailySeed(date: Date = new Date()): number {
  const testSeed = import.meta.env.VITE_TEST_SEED
  if (testSeed) {
    return parseInt(testSeed, 10)
  }
  const dateKey = getUTC3Date(date)
  return hashString(dateKey)
}

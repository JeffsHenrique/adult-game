# Adult Game Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a daily browser-based game where players receive a random salary and must choose which bills to pay, with one correct answer per day and play restricted to once daily.

**Architecture:** React 18 + TypeScript + Vite SPA with Tailwind CSS v4, i18next for EN/PT-BR, Zustand for state, Supabase for daily play tracking, Playwright for E2E tests. Deployed on Vercel.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS v4, i18next, react-i18next, i18next-browser-languagedetector, Zustand, @supabase/supabase-js, Playwright, Vercel

---

## Chunk 1: Project Setup & Infrastructure

### Task 1: Scaffold Vite + React + TypeScript project

**Files:**
- Create: project root files (package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx)

- [ ] **Step 1: Create Vite project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

This scaffolds a Vite + React + TypeScript project in the current directory.

- [ ] **Step 2: Install core dependencies**

Run:
```bash
npm install zustand @supabase/supabase-js i18next react-i18next i18next-browser-languagedetector react-router-dom
```

- [ ] **Step 3: Install dev dependencies**

Run:
```bash
npm install -D tailwindcss @tailwindcss/vite @playwright/test @types/node
```

- [ ] **Step 4: Configure Tailwind CSS v4**

Edit `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

Add to `src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 5: Configure tsconfig.json**

Ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Verify build**

Run:
```bash
npm run build
```
Expected: BUILD SUCCESS

### Task 2: Set up environment variables and Supabase client

**Files:**
- Create: `.env.example`, `src/lib/supabase.ts`, `src/vite-env.d.ts`

- [ ] **Step 1: Create `.env.example`**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TEST_SEED=
```

- [ ] **Step 2: Create `src/vite-env.d.ts`**

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_TEST_SEED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

- [ ] **Step 3: Create `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors

---

## Chunk 2: Core Utilities & Data Layer

### Task 3: Implement daily seed generation (mulberry32 PRNG)

**Files:**
- Create: `src/utils/dailySeed.ts`
- Test: `src/utils/__tests__/dailySeed.test.ts`

- [ ] **Step 1: Write tests**

Create `src/utils/__tests__/dailySeed.test.ts`:
```typescript
import { getDailySeed, mulberry32, getUTC3Date } from '../dailySeed'

describe('getUTC3Date', () => {
  it('returns date in YYYY-MM-DD format for UTC-3', () => {
    const date = new Date('2026-05-05T10:00:00Z') // UTC 10:00 = UTC-3 07:00
    const result = getUTC3Date(date)
    expect(result).toBe('2026-05-05')
  })

  it('handles day boundary correctly', () => {
    const date = new Date('2026-05-06T02:00:00Z') // UTC 02:00 = UTC-3 23:00 previous day
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npx vitest run src/utils/__tests__/dailySeed.test.ts
```
Expected: FAIL (module not found)

- [ ] **Step 3: Install Vitest for unit tests**

Run:
```bash
npm install -D vitest
```

- [ ] **Step 4: Implement `src/utils/dailySeed.ts`**

```typescript
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
  const utc3Offset = -3
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000
  const utc3Time = utcTime + utc3Offset * 3600000
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
npx vitest run src/utils/__tests__/dailySeed.test.ts
```
Expected: ALL PASS

### Task 4: Implement currency utilities

**Files:**
- Create: `src/utils/currency.ts`
- Test: `src/utils/__tests__/currency.test.ts`

- [ ] **Step 1: Write tests**

Create `src/utils/__tests__/currency.test.ts`:
```typescript
import { formatCurrency, brlToUsd } from '../currency'

describe('brlToUsd', () => {
  it('converts BRL to USD using fixed rate', () => {
    expect(brlToUsd(1000)).toBe(200)
  })

  it('handles zero', () => {
    expect(brlToUsd(0)).toBe(0)
  })
})

describe('formatCurrency', () => {
  it('formats BRL correctly', () => {
    expect(formatCurrency(2714.85, 'pt-BR')).toBe('R$ 2.714,85')
  })

  it('formats USD correctly', () => {
    expect(formatCurrency(542.97, 'en')).toBe('$542.97')
  })

  it('formats zero BRL', () => {
    expect(formatCurrency(0, 'pt-BR')).toBe('R$ 0,00')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement `src/utils/currency.ts`**

```typescript
const BRL_TO_USD_RATE = 5.00

export function brlToUsd(brl: number): number {
  return brl / BRL_TO_USD_RATE
}

export function formatCurrency(amount: number, language: string): string {
  if (language === 'pt-BR' || language.startsWith('pt')) {
    return amount.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }
  const usd = brlToUsd(amount)
  return usd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

### Task 5: Implement fingerprint generation

**Files:**
- Create: `src/utils/fingerprint.ts`
- Test: `src/utils/__tests__/fingerprint.test.ts`

- [ ] **Step 1: Write tests**

Create `src/utils/__tests__/fingerprint.test.ts`:
```typescript
import { generateFingerprint } from '../fingerprint'

describe('generateFingerprint', () => {
  it('returns a 32-character hex string', async () => {
    const fp = await generateFingerprint()
    expect(fp).toMatch(/^[a-f0-9]{32}$/)
  })

  it('returns same fingerprint for same inputs', async () => {
    const fp1 = await generateFingerprint()
    const fp2 = await generateFingerprint()
    expect(fp1).toBe(fp2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement `src/utils/fingerprint.ts`**

```typescript
export async function generateFingerprint(): Promise<string> {
  const input = [
    navigator.userAgent,
    screen.width,
    screen.height,
    new Date().toDateString(),
  ].join('|')

  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex.slice(0, 32)
}
```

- [ ] **Step 4: Run tests to verify they pass**

### Task 6: Implement extensible bill pool

**Files:**
- Create: `src/data/bills.ts`

- [ ] **Step 1: Create `src/data/bills.ts`**

```typescript
export interface Bill {
  id: string
  nameKey: string
  type: 'essential' | 'discretionary'
  priceRange: { min: number; max: number }
}

export const BILLS: Bill[] = [
  // Essential bills
  { id: 'rent', nameKey: 'bills.rent', type: 'essential', priceRange: { min: 500, max: 8000 } },
  { id: 'electricity', nameKey: 'bills.electricity', type: 'essential', priceRange: { min: 80, max: 350 } },
  { id: 'water', nameKey: 'bills.water', type: 'essential', priceRange: { min: 50, max: 200 } },
  { id: 'gas', nameKey: 'bills.gas', type: 'essential', priceRange: { min: 60, max: 180 } },
  { id: 'internet', nameKey: 'bills.internet', type: 'essential', priceRange: { min: 79, max: 200 } },
  { id: 'phone', nameKey: 'bills.phone', type: 'essential', priceRange: { min: 30, max: 150 } },
  { id: 'groceries', nameKey: 'bills.groceries', type: 'essential', priceRange: { min: 400, max: 2000 } },
  { id: 'transport', nameKey: 'bills.transport', type: 'essential', priceRange: { min: 200, max: 800 } },

  // Discretionary bills
  { id: 'netflix', nameKey: 'bills.netflix', type: 'discretionary', priceRange: { min: 20.90, max: 67.90 } },
  { id: 'spotify', nameKey: 'bills.spotify', type: 'discretionary', priceRange: { min: 21.90, max: 34.90 } },
  { id: 'uber', nameKey: 'bills.uber', type: 'discretionary', priceRange: { min: 100, max: 500 } },
  { id: 'ifood', nameKey: 'bills.ifood', type: 'discretionary', priceRange: { min: 150, max: 600 } },
  { id: 'gym', nameKey: 'bills.gym', type: 'discretionary', priceRange: { min: 69.90, max: 299.90 } },
  { id: 'amazon', nameKey: 'bills.amazon', type: 'discretionary', priceRange: { min: 50, max: 400 } },
  { id: 'youtube_premium', nameKey: 'bills.youtube_premium', type: 'discretionary', priceRange: { min: 21.90, max: 34.90 } },
  { id: 'disney_plus', nameKey: 'bills.disney_plus', type: 'discretionary', priceRange: { min: 27.90, max: 55.90 } },
  { id: 'hbo_max', nameKey: 'bills.hbo_max', type: 'discretionary', priceRange: { min: 29.90, max: 55.90 } },
  { id: 'shein', nameKey: 'bills.shein', type: 'discretionary', priceRange: { min: 80, max: 500 } },
]
```

- [ ] **Step 2: Add bill translations**

Create `src/i18n/locales/en/game.json`:
```json
{
  "bills": {
    "rent": "Rent",
    "electricity": "Electricity",
    "water": "Water",
    "gas": "Gas",
    "internet": "Internet",
    "phone": "Phone Plan",
    "groceries": "Groceries",
    "transport": "Transportation",
    "netflix": "Netflix",
    "spotify": "Spotify",
    "uber": "Uber",
    "ifood": "iFood",
    "gym": "Gym",
    "amazon": "Amazon",
    "youtube_premium": "YouTube Premium",
    "disney_plus": "Disney+",
    "hbo_max": "HBO Max",
    "shein": "Shein"
  }
}
```

Create `src/i18n/locales/pt-BR/game.json`:
```json
{
  "bills": {
    "rent": "Aluguel",
    "electricity": "Luz",
    "water": "Água",
    "gas": "Gás",
    "internet": "Internet",
    "phone": "Plano de Celular",
    "groceries": "Mercado",
    "transport": "Transporte",
    "netflix": "Netflix",
    "spotify": "Spotify",
    "uber": "Uber",
    "ifood": "iFood",
    "gym": "Academia",
    "amazon": "Amazon",
    "youtube_premium": "YouTube Premium",
    "disney_plus": "Disney+",
    "hbo_max": "HBO Max",
    "shein": "Shein"
  }
}
```

### Task 7: Implement bill generator

**Files:**
- Create: `src/utils/billGenerator.ts`
- Test: `src/utils/__tests__/billGenerator.test.ts`

- [ ] **Step 1: Write tests**

Create `src/utils/__tests__/billGenerator.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

- [ ] **Step 3: Implement `src/utils/billGenerator.ts`**

```typescript
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

const TIERS = [
  { min: 800, max: 2500, billCount: [5, 6] },
  { min: 2500, max: 5000, billCount: [6, 7] },
  { min: 5000, max: 15000, billCount: [7, 8] },
  { min: 15000, max: 25000, billCount: [7, 8] },
]

function pickTier(rng: () => number) {
  return TIERS[Math.floor(rng() * TIERS.length)]
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
  const tier = pickTier(rng)
  const salary = randomInRange(rng, tier.min, tier.max)

  const billCount = randomInRange(rng, tier.billCount[0], tier.billCount[1])
  const count = Math.round(billCount)

  const essentials = shuffle(rng, BILLS.filter(b => b.type === 'essential'))
  const discretionary = shuffle(rng, BILLS.filter(b => b.type === 'discretionary'))

  const essentialCount = Math.min(Math.max(3, Math.floor(count * 0.6)), essentials.length)
  const discCount = count - essentialCount

  const selectedBills = [
    ...essentials.slice(0, essentialCount),
    ...discretionary.slice(0, discCount),
  ]

  const billsWithPrices: BillWithPrice[] = selectedBills.map(bill => ({
    ...bill,
    price: randomInRange(rng, bill.priceRange.min, bill.priceRange.max),
  }))

  // Generate correct answer: start with essential bills that fit
  let correctAnswer: string[] = []
  let correctTotal = 0

  // First, add essential bills that fit within 70% of salary
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
```

- [ ] **Step 4: Run tests to verify they pass**

---

## Chunk 3: i18n & State Management

### Task 8: Set up i18next with EN/PT-BR

**Files:**
- Create: `src/i18n/i18n.ts`, `src/i18n/locales/en/common.json`, `src/i18n/locales/pt-BR/common.json`

- [ ] **Step 1: Create common translations**

Create `src/i18n/locales/en/common.json`:
```json
{
  "title": "Adult Game",
  "loading": "Loading...",
  "comeBackTomorrow": "Come back tomorrow!",
  "nextGameIn": "Next game in",
  "payBills": "Pay Bills",
  "totalSelected": "Total selected",
  "youEarn": "You earn",
  "congratulations": "Congratulations! You know how to live an adult life",
  "irresponsible": "No... You're irresponsible",
  "rightAnswer": "The right answer was",
  "essential": "Essential",
  "discretionary": "Discretionary",
  "warning": "Could not sync with server"
}
```

Create `src/i18n/locales/pt-BR/common.json`:
```json
{
  "title": "Jogo Adulto",
  "loading": "Carregando...",
  "comeBackTomorrow": "Volte amanhã!",
  "nextGameIn": "Próximo jogo em",
  "payBills": "Pagar Contas",
  "totalSelected": "Total selecionado",
  "youEarn": "Você ganha",
  "congratulations": "Parabéns! Você sabe viver como um adulto",
  "irresponsible": "Não... Você é irresponsável",
  "rightAnswer": "A resposta certa era",
  "essential": "Essencial",
  "discretionary": "Supérfluo",
  "warning": "Não foi possível sincronizar com o servidor"
}
```

- [ ] **Step 2: Create `src/i18n/i18n.ts`**

```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import ptBrCommon from './locales/pt-BR/common.json'
import enGame from './locales/en/game.json'
import ptBrGame from './locales/pt-BR/game.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, game: enGame },
      'pt-BR': { common: ptBrCommon, game: ptBrGame },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt-BR'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n
```

- [ ] **Step 3: Verify i18n compiles**

### Task 9: Implement Zustand store

**Files:**
- Create: `src/store/useGameStore.ts`

- [ ] **Step 1: Create `src/store/useGameStore.ts`**

```typescript
import { create } from 'zustand'
import { BillWithPrice } from '../utils/billGenerator'
import { supabase } from '../lib/supabase'
import { generateFingerprint } from '../utils/fingerprint'
import { getUTC3Date } from '../utils/dailySeed'

interface GameState {
  salary: number
  bills: BillWithPrice[]
  correctAnswer: string[]
  selectedBills: string[]
  hasPlayedToday: boolean
  playChecked: boolean
  gameResult: 'win' | 'lose' | null
  serverError: boolean

  setDailyGame: (data: { salary: number; bills: BillWithPrice[]; correctAnswer: string[] }) => void
  toggleBill: (billId: string) => void
  setPlayStatus: (hasPlayed: boolean) => void
  setPlayChecked: (checked: boolean) => void
  submitSelection: () => void
  setServerError: (error: boolean) => void
  reset: () => void
}

export const useGameStore = create<GameState>()((set, get) => ({
  salary: 0,
  bills: [],
  correctAnswer: [],
  selectedBills: [],
  hasPlayedToday: false,
  playChecked: false,
  gameResult: null,
  serverError: false,

  setDailyGame: (data) => set(data),
  toggleBill: (billId) =>
    set((state) => {
      const selected = state.selectedBills.includes(billId)
        ? state.selectedBills.filter((id) => id !== billId)
        : [...state.selectedBills, billId]
      return { selectedBills: selected }
    }),
  setPlayStatus: (hasPlayed) => set({ hasPlayed }),
  setPlayChecked: (checked) => set({ playChecked: checked }),
  setServerError: (error) => set({ serverError: error }),

  submitSelection: async () => {
    const { selectedBills, correctAnswer } = get()
    const isWin =
      selectedBills.length === correctAnswer.length &&
      selectedBills.every((id) => correctAnswer.includes(id))

    set({ gameResult: isWin ? 'win' : 'lose' })

    const dateKey = getUTC3Date()
    const fingerprint = await generateFingerprint()

    try {
      await supabase.from('daily_plays').insert({
        fingerprint,
        date_key: dateKey,
      })
    } catch {
      localStorage.setItem(`daily_play_${dateKey}`, 'true')
    }
  },

  reset: () =>
    set({
      salary: 0,
      bills: [],
      correctAnswer: [],
      selectedBills: [],
      hasPlayedToday: false,
      playChecked: false,
      gameResult: null,
      serverError: false,
    }),
}))
```

---

## Chunk 4: UI Components

### Task 10: Implement LanguageSwitcher component

**Files:**
- Create: `src/components/LanguageSwitcher.tsx`

- [ ] **Step 1: Create `src/components/LanguageSwitcher.tsx`**

```typescript
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div className="flex gap-2">
      <button
        onClick={() => i18n.changeLanguage('pt-BR')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          i18n.language === 'pt-BR'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        PT
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          i18n.language === 'en' || i18n.language === 'en-US'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        EN
      </button>
    </div>
  )
}
```

### Task 11: Implement SalaryCard component

**Files:**
- Create: `src/components/SalaryCard.tsx`

- [ ] **Step 1: Create `src/components/SalaryCard.tsx`**

```typescript
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/currency'

interface SalaryCardProps {
  salary: number
}

export function SalaryCard({ salary }: SalaryCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
      <p className="text-sm opacity-80">{t('youEarn', { ns: 'common' })}</p>
      <p className="text-3xl font-bold mt-1">{formatCurrency(salary, i18n.language)}</p>
    </div>
  )
}
```

### Task 12: Implement BillCard component

**Files:**
- Create: `src/components/BillCard.tsx`

- [ ] **Step 1: Create `src/components/BillCard.tsx`**

```typescript
import { useTranslation } from 'react-i18next'
import { BillWithPrice } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'

interface BillCardProps {
  bill: BillWithPrice
  selected: boolean
  onToggle: () => void
}

export function BillCard({ bill, selected, onToggle }: BillCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 ${
        selected
          ? 'border-blue-500 bg-blue-500/10 shadow-md'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className="font-semibold text-white">{t(bill.nameKey, { ns: 'game' })}</p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
              bill.type === 'essential'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {t(bill.type === 'essential' ? 'essential' : 'discretionary', { ns: 'common' })}
          </span>
        </div>
        <p className="text-lg font-bold text-white whitespace-nowrap">
          {formatCurrency(bill.price, i18n.language)}
        </p>
      </div>
    </button>
  )
}
```

### Task 13: Implement RunningTotal component

**Files:**
- Create: `src/components/RunningTotal.tsx`

- [ ] **Step 1: Create `src/components/RunningTotal.tsx`**

```typescript
import { useTranslation } from 'react-i18next'
import { BillWithPrice } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'

interface RunningTotalProps {
  bills: BillWithPrice[]
  selectedIds: string[]
  salary: number
}

export function RunningTotal({ bills, selectedIds, salary }: RunningTotalProps) {
  const { t, i18n } = useTranslation()
  const total = bills
    .filter((b) => selectedIds.includes(b.id))
    .reduce((sum, b) => sum + b.price, 0)

  const overBudget = total > salary

  return (
    <div className={`text-lg font-medium ${overBudget ? 'text-red-400' : 'text-green-400'}`}>
      {t('totalSelected', { ns: 'common' })}:{' '}
      <span className="font-bold">{formatCurrency(total, i18n.language)}</span>
      {' / '}
      <span className="text-gray-400">{formatCurrency(salary, i18n.language)}</span>
    </div>
  )
}
```

### Task 14: Implement CountdownTimer component

**Files:**
- Create: `src/components/CountdownTimer.tsx`

- [ ] **Step 1: Create `src/components/CountdownTimer.tsx`**

```typescript
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

function getTimeUntilMidnightUTC3(): number {
  const now = new Date()
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000
  const utc3Time = utcTime - 3 * 3600000
  const utc3Date = new Date(utc3Time)

  const nextMidnight = new Date(utc3Date)
  nextMidnight.setHours(24, 0, 0, 0)

  return nextMidnight.getTime() - utc3Time
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`
}

export function CountdownTimer() {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnightUTC3())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnightUTC3())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="text-center">
      <p className="text-xl font-medium text-gray-300">
        {t('nextGameIn', { ns: 'common' })}: {formatTime(timeLeft)}
      </p>
    </div>
  )
}
```

### Task 15: Implement ResultScreen component

**Files:**
- Create: `src/components/ResultScreen.tsx`

- [ ] **Step 1: Create `src/components/ResultScreen.tsx`**

```typescript
import { useTranslation } from 'react-i18next'
import { BillWithPrice } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'

interface ResultScreenProps {
  result: 'win' | 'lose'
  bills: BillWithPrice[]
  correctAnswer: string[]
}

export function ResultScreen({ result, bills, correctAnswer }: ResultScreenProps) {
  const { t, i18n } = useTranslation()

  const correctBills = bills.filter((b) => correctAnswer.includes(b.id))
  const correctTotal = correctBills.reduce((sum, b) => sum + b.price, 0)

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        className={`rounded-xl p-8 mb-6 ${
          result === 'win'
            ? 'bg-gradient-to-r from-green-600 to-emerald-700'
            : 'bg-gradient-to-r from-red-600 to-red-800'
        }`}
      >
        <p className="text-2xl font-bold text-white">
          {t(result === 'win' ? 'congratulations' : 'irresponsible', { ns: 'common' })}
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <p className="text-lg font-medium text-gray-300 mb-4">
          {t('rightAnswer', { ns: 'common' })}:
        </p>
        <div className="space-y-2">
          {correctBills.map((bill) => (
            <div
              key={bill.id}
              className="flex justify-between items-center bg-gray-700/50 rounded-lg p-3"
            >
              <span className="text-white font-medium">
                {t(bill.nameKey, { ns: 'game' })}
              </span>
              <span className="text-white font-bold">
                {formatCurrency(bill.price, i18n.language)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between">
          <span className="text-gray-400 font-medium">Total</span>
          <span className="text-white font-bold text-lg">
            {formatCurrency(correctTotal, i18n.language)}
          </span>
        </div>
      </div>

      <p className="mt-6 text-gray-500 text-sm">{t('comeBackTomorrow', { ns: 'common' })}</p>
    </div>
  )
}
```

---

## Chunk 5: Pages & App Assembly

### Task 16: Implement AlreadyPlayed page

**Files:**
- Create: `src/pages/AlreadyPlayed.tsx`

- [ ] **Step 1: Create `src/pages/AlreadyPlayed.tsx`**

```typescript
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { CountdownTimer } from '../components/CountdownTimer'

export function AlreadyPlayed() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold">{t('title', { ns: 'common' })}</h1>
        <LanguageSwitcher />
      </header>

      <main className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t('comeBackTomorrow', { ns: 'common' })}</h2>
          <CountdownTimer />
        </div>
      </main>
    </div>
  )
}
```

### Task 17: Implement Game page

**Files:**
- Create: `src/pages/Game.tsx`

- [ ] **Step 1: Create `src/pages/Game.tsx`**

```typescript
import { useTranslation } from 'react-i18next'
import { useGameStore } from '../store/useGameStore'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { SalaryCard } from '../components/SalaryCard'
import { BillCard } from '../components/BillCard'
import { RunningTotal } from '../components/RunningTotal'
import { ResultScreen } from '../components/ResultScreen'

export function Game() {
  const { t } = useTranslation()
  const {
    salary,
    bills,
    correctAnswer,
    selectedBills,
    gameResult,
    toggleBill,
    submitSelection,
    serverError,
  } = useGameStore()

  const total = bills
    .filter((b) => selectedBills.includes(b.id))
    .reduce((sum, b) => sum + b.price, 0)

  const canSubmit = total > 0 && total <= salary && gameResult === null

  if (gameResult) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="flex justify-between items-center p-4 max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">{t('title', { ns: 'common' })}</h1>
          <LanguageSwitcher />
        </header>
        <main className="p-4 max-w-4xl mx-auto">
          <ResultScreen result={gameResult} bills={bills} correctAnswer={correctAnswer} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold">{t('title', { ns: 'common' })}</h1>
        <LanguageSwitcher />
      </header>

      {serverError && (
        <div className="bg-amber-900/50 text-amber-200 text-center py-2 text-sm">
          {t('warning', { ns: 'common' })}
        </div>
      )}

      <main className="p-4 max-w-4xl mx-auto space-y-6">
        <SalaryCard salary={salary} />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              selected={selectedBills.includes(bill.id)}
              onToggle={() => toggleBill(bill.id)}
            />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-700">
          <RunningTotal bills={bills} selectedIds={selectedBills} salary={salary} />
          <button
            onClick={submitSelection}
            disabled={!canSubmit}
            className={`px-8 py-3 rounded-lg font-bold text-lg transition-all ${
              canSubmit
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('payBills', { ns: 'common' })}
          </button>
        </div>
      </main>
    </div>
  )
}
```

### Task 18: Implement App.tsx with play status check

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Update `src/App.tsx`**

```typescript
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n/i18n'
import { useGameStore } from './store/useGameStore'
import { supabase } from './lib/supabase'
import { generateFingerprint } from './utils/fingerprint'
import { getDailySeed, getUTC3Date } from './utils/dailySeed'
import { generateDailyGame } from './utils/billGenerator'
import { AlreadyPlayed } from './pages/AlreadyPlayed'
import { Game } from './pages/Game'

export default function App() {
  const { t } = useTranslation()
  const {
    hasPlayedToday,
    playChecked,
    setPlayStatus,
    setPlayChecked,
    setDailyGame,
    setServerError,
  } = useGameStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkDailyPlay() {
      try {
        const fingerprint = await generateFingerprint()
        const dateKey = getUTC3Date()

        const { data, error } = await supabase
          .from('daily_plays')
          .select('id')
          .eq('fingerprint', fingerprint)
          .eq('date_key', dateKey)
          .maybeSingle()

        if (error) {
          setServerError(true)
          const localPlay = localStorage.getItem(`daily_play_${dateKey}`)
          setPlayStatus(localPlay === 'true')
        } else {
          setPlayStatus(!!data)
        }
      } catch {
        setServerError(true)
        const dateKey = getUTC3Date()
        const localPlay = localStorage.getItem(`daily_play_${dateKey}`)
        setPlayStatus(localPlay === 'true')
      }

      setPlayChecked(true)
      setLoading(false)
    }

    checkDailyPlay()
  }, [])

  useEffect(() => {
    if (playChecked && !hasPlayedToday) {
      const seed = getDailySeed()
      const game = generateDailyGame(seed)
      setDailyGame(game)
    }
  }, [playChecked, hasPlayedToday])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-xl">
        {t('loading', { ns: 'common' })}
      </div>
    )
  }

  if (hasPlayedToday) {
    return <AlreadyPlayed />
  }

  return <Game />
}
```

### Task 19: Update main.tsx to import styles

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Update `src/index.css`**

```css
@import "tailwindcss";

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## Chunk 6: Testing & Verification

### Task 20: Set up Playwright E2E tests

**Files:**
- Create: `playwright.config.ts`, `e2e/game.spec.ts`

- [ ] **Step 1: Initialize Playwright**

Run:
```bash
npx playwright install --with-deps
```

- [ ] **Step 2: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

- [ ] **Step 3: Create `e2e/game.spec.ts`**

```typescript
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('game loads with bills and salary', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(/You earn|Você ganha/)).toBeVisible()
  await expect(page.locator('button').filter({ hasText: /Netflix|Aluguel|Rent/ })).toBeVisible()
})

test('bill selection updates running total', async ({ page }) => {
  const firstBill = page.locator('[class*="BillCard"]').first()
  await firstBill.click()
  await expect(page.getByText(/Total selected|Total selecionado/)).toBeVisible()
})

test('submit disabled when no bills selected', async ({ page }) => {
  const submitBtn = page.getByRole('button', { name: /Pay Bills|Pagar Contas/ })
  await expect(submitBtn).toBeDisabled()
})

test('language switching works', async ({ page }) => {
  const enBtn = page.getByRole('button', { name: 'EN' })
  await enBtn.click()
  await expect(page.getByText(/You earn/)).toBeVisible()

  const ptBtn = page.getByRole('button', { name: 'PT' })
  await ptBtn.click()
  await expect(page.getByText(/Você ganha/)).toBeVisible()
})
```

### Task 21: Build verification and linting

- [ ] **Step 1: Run full build**

Run:
```bash
npm run build
```
Expected: BUILD SUCCESS, no errors

- [ ] **Step 2: Run TypeScript check**

Run:
```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Run unit tests**

Run:
```bash
npx vitest run
```
Expected: ALL PASS

---

## Chunk 7: Supabase Setup Instructions

### Task 22: Document Supabase setup

**Files:**
- Create: `docs/supabase-setup.md`

- [ ] **Step 1: Create setup documentation**

Create `docs/supabase-setup.md`:
```markdown
# Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor and run:

```sql
CREATE TABLE daily_plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT now(),
  date_key TEXT NOT NULL
);

-- Create index for faster lookups
CREATE INDEX idx_daily_plays_fingerprint_date ON daily_plays(fingerprint, date_key);

-- Enable RLS
ALTER TABLE daily_plays ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON daily_plays
  FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (only for checking own plays)
CREATE POLICY "Allow anonymous selects" ON daily_plays
  FOR SELECT USING (true);
```

3. Go to Project Settings > API
4. Copy the Project URL and anon/public key
5. Add to `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Chunk 8: Final Touches

### Task 23: Update index.html and add favicon placeholder

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Update `index.html` title**

Update the title in `index.html` to "Adult Game".

### Task 24: Create .env.example and .gitignore

**Files:**
- Create: `.env.example`, update `.gitignore`

- [ ] **Step 1: Ensure `.gitignore` includes**

```
node_modules
dist
.env
.env.local
.DS_Store
playwright-report
test-results
```

- [ ] **Step 2: Verify everything works**

Run:
```bash
npm run dev
```
Open browser at http://localhost:5173 and verify:
- Game loads with salary and bills
- Bill selection works
- Language switching works
- Countdown timer is visible on re-visit


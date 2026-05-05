# Adult Game - Design Specification

**Date:** 2026-05-05  
**Status:** Approved  

## Overview

A daily browser-based game where players receive a random salary and a set of bills (5-8 from an extensible pool). Players must choose which bills to pay, staying within budget. Each day has ONE randomly generated "correct answer" - a valid combination of bills that fits the budget. The twist: there is no real right answer in adult life, but the game presents one. Players can only play once per day (resets at midnight Brasília time, UTC-3).

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite (latest)
- **Styling:** Tailwind CSS v4 with @tailwindcss/vite plugin
- **i18n:** i18next + react-i18next + i18next-browser-languagedetector
- **State Management:** Zustand
- **Backend:** Supabase (daily play tracking, fingerprint-based)
- **Testing:** Playwright E2E
- **Deployment:** Vercel
- **Routing:** React Router v6 (or conditional rendering in App.tsx if only 2-3 pages)

## Architecture

```
src/
├── i18n/
│   ├── i18n.ts
│   ├── locales/en/
│   │   ├── common.json
│   │   └── game.json
│   └── locales/pt-BR/
│       ├── common.json
│       └── game.json
├── lib/
│   └── supabase.ts
├── store/
│   └── useGameStore.ts
├── utils/
│   ├── dailySeed.ts
│   ├── billGenerator.ts
│   ├── currency.ts
│   └── fingerprint.ts
├── data/
│   ├── bills.ts
│   └── billNames.ts
├── components/
│   ├── LanguageSwitcher.tsx
│   ├── BillCard.tsx
│   ├── SalaryCard.tsx
│   ├── RunningTotal.tsx
│   ├── CountdownTimer.tsx
│   └── ResultScreen.tsx
├── pages/
│   ├── Game.tsx
│   └── AlreadyPlayed.tsx
├── App.tsx
└── main.tsx
```

## Zustand Store Shape (`useGameStore.ts`)

```typescript
interface GameState {
  // Daily game data
  salary: number
  bills: BillWithPrice[]
  correctAnswer: string[]  // array of bill IDs
  selectedBills: string[]  // array of selected bill IDs

  // Play status
  hasPlayedToday: boolean
  playChecked: boolean     // whether Supabase check completed
  gameResult: 'win' | 'lose' | null

  // Actions
  setDailyGame: (data: { salary: number; bills: BillWithPrice[]; correctAnswer: string[] }) => void
  toggleBill: (billId: string) => void
  setPlayStatus: (hasPlayed: boolean) => void
  submitSelection: () => void
  reset: () => void
}
```

## Routing Strategy

- React Router v6 with 2 routes:
  - `/` → `App.tsx` checks play status, renders appropriate screen
  - Conditional rendering based on `hasPlayedToday` and `gameResult`
  - No deep linking needed - single-page flow

## Loading & Error States

- While Supabase is checking daily play status:
  - Show loading spinner with centered text: "Loading..." / "Carregando..."
- If Supabase is unreachable or fails:
  - Fallback to localStorage check with warning banner: "Could not sync with server"
  - Allow gameplay to proceed (graceful degradation)
- If network fails during play submission:
  - Retry once, then save to localStorage for later sync

## Data Flow

1. **App initialization:**
   - i18n auto-detects browser language (EN or PT-BR), manual override available
   - Generate user fingerprint: SHA-256 hash of `navigator.userAgent + screen.width + screen.height + new Date().toDateString()` truncated to first 32 chars
   - Show loading state while checking Supabase
   - Check Supabase `daily_plays` table for today's date_key matching fingerprint

2. **If already played today:**
   - Show `AlreadyPlayed.tsx` with live countdown to midnight UTC-3
   - Show today's salary as teaser from localStorage cache (if available)
   - If user is mid-game at midnight rollover: their session remains valid until they leave/refresh; new visits after midnight show countdown

3. **If not played today:**
   - `billGenerator.ts` uses daily seed (YYYY-MM-DD in UTC-3) with mulberry32 PRNG to:
     - Pick salary tier randomly (Tier 1-4)
     - Generate salary amount within tier range
     - Select N bills from extensible pool (based on tier)
     - Generate realistic prices within each bill's range
     - **Constraint: ensure at least one valid subset exists** where total ≤ salary (algorithm generates essential bills first, then adds discretionary bills until total exceeds salary by 30-60%)
     - Pick ONE valid combination (total ≤ salary) as "correct answer" using seeded selection
   - Render `Game.tsx` with salary card + bill cards

4. **Gameplay:**
   - User clicks bill cards to select/deselect
   - Running total updates in real-time
   - Submit button:
     - Disabled when total > salary
     - Disabled when no bills selected (total == 0)
     - Enabled when 0 < total ≤ salary
   - On submit: compare selection (exact match of selected bill IDs) against correct answer
   - Save play record to Supabase with fingerprint + timestamp + date_key
   - If Supabase fails, save to localStorage with key `daily_play_{date_key}`

5. **Result screen:**
   - Win: "Congratulations! You know how to live an adult life" + correct answer
   - Lose: "No... You're irresponsible" + correct answer
   - Correct answer displayed as card-based list showing bill names and prices
   - No explanations, just the answer
   - Prompt to return tomorrow

## Supabase Schema

**Table: `daily_plays`**
| Column      | Type          | Constraints                        |
|-------------|---------------|------------------------------------|
| id          | uuid          | PK, default gen_random_uuid        |
| fingerprint | text          | NOT NULL                           |
| played_at   | timestamptz   | default now()                      |
| date_key    | text          | NOT NULL, format YYYY-MM-DD (UTC-3) |

**RLS Policies:**
- INSERT: anonymous (public)
- SELECT: anonymous (public), only for own fingerprint check

## Currency & Language

- **PT-BR:** BRL (R$), format: `R$ 2.714,85`
- **EN:** USD ($), format: `$2,714.85`
- Currency switches based on active language
- BRL to USD conversion uses **fixed rate of 5.00** (simplified, seeded-reproducible). This means $1 USD = R$ 5.00 BRL always. Rate can be updated in `currency.ts` if needed.
- Bill prices generated in BRL, converted to USD using fixed rate when English is active

## Salary Tiers

| Tier | Range (BRL)       | Bill Count |
|------|-------------------|------------|
| 1    | R$ 800 - R$ 2.500     | 5-6        |
| 2    | R$ 2.500 - R$ 5.000   | 6-7        |
| 3    | R$ 5.000 - R$ 15.000  | 7-8        |
| 4    | R$ 15.000 - R$ 25.000 | 7-8        |

- Tier selected randomly each day via seeded PRNG (mulberry32)
- Bill prices scale proportionally to tier
- Total bills always exceed salary by 30-60%
- Algorithm guarantees at least one valid subset (total ≤ salary) exists

## Extensible Bill Pool

**Structure (`src/data/bills.ts`):**
```typescript
interface Bill {
  id: string
  nameKey: string
  type: 'essential' | 'discretionary'
  priceRange: { min: number, max: number }
}
```

**Adding new bills requires:**
1. Append entry to `bills.ts` array
2. Add translations in `locales/en/game.json` and `locales/pt-BR/game.json`
3. No other code changes needed

**Initial pool (~15-20 bills):**
Essential: Rent, Electricity/Light, Water, Gas, Internet, Phone, Groceries, Transportation
Discretionary: Netflix, Spotify, Uber, iFood, Gym, Amazon, YouTube Premium, Disney+, HBO Max, Shein

**Type field purpose:** Used for visual badge color (green for essential, orange for discretionary) and for the bill generation algorithm to prioritize essentials in the correct answer subset.

## Daily Seed Generation

- Base: current date string in UTC-3 (`YYYY-MM-DD`)
- Used for: salary tier, salary amount, bill selection, bill prices, correct answer
- Ensures same game for all players on same day
- PRNG: **mulberry32** (chosen for reproducibility and simplicity)

## Fingerprint Generation

- Input: `navigator.userAgent + screen.width + screen.height + new Date().toDateString()`
- Hash: SHA-256 (via Web Crypto API `crypto.subtle.digest`)
- Output: first 32 hex characters of hash
- Combined with date_key in Supabase check: `WHERE fingerprint = ? AND date_key = ?`

## UI Screens

### Screen 1: Already Played
- Centered layout
- Title: localized "Come back tomorrow!"
- Live countdown timer to midnight UTC-3 (HH:MM:SS)
- Salary teaser from today's game (if cached in localStorage)

### Screen 2: Game
- Header: "Adult Game" title + Language switcher (EN/PT-BR)
- SalaryCard: prominent display, e.g., "You earn: R$ 2.714,85"
- BillCard grid: responsive (2 cols mobile, 3-4 cols desktop)
  - Each card: bill name, price, type badge
  - Clickable toggle with selected visual state
- RunningTotal: "Total selected: R$ 1.892,33 / R$ 2.714,85"
  - Color changes: green when within budget, red when over
- Submit button: "Pay Bills" / "Pagar Contas"
  - Disabled when total > salary
  - Disabled when total == 0
  - Enabled when 0 < total ≤ salary

### Screen 3: Result
- Win: celebratory styling + "Congratulations! You know how to live an adult life"
- Lose: subdued styling + "No... You're irresponsible"
- Both: "The right answer was:" followed by card-based list of correct bills with prices
- No explanation for why
- "Come back tomorrow" footer

## Styling

- Tailwind CSS v4
- Modern, clean, slightly playful adult theme
- Color palette: deep blues/grays with accent colors
  - Essential bills: green badge
  - Discretionary bills: orange/amber badge
- Smooth transitions on card selection (150ms ease-in-out)
- Responsive design (mobile-first)

## Countdown Timer Logic

- Target: midnight Brasília time (UTC-3)
- Calculate: `next midnight UTC-3 - current time`
- Update every second via `setInterval`
- Format: `HH:MM:SS`
- Display text: "Next game in: 05h 32m 18s" (EN) / "Próximo jogo em: 05h 32m 18s" (PT-BR)
- Cleanup interval on component unmount

## Testing (Playwright)

- E2E tests for:
  1. Game loads with daily bills
  2. Bill selection updates running total
  3. Submit disabled when over budget
  4. Submit disabled when no bills selected
  5. Result screen shows correct/incorrect message
  6. Language switching works
  7. Already-played screen shows countdown
- **Test seed override:** Use `VITE_TEST_SEED` environment variable to override daily seed during testing, ensuring deterministic bill generation for reproducible test runs

## Environment Variables

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<sb_publishable_... key>
VITE_TEST_SEED=<optional override for testing>
```

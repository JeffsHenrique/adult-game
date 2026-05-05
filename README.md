# Adult Game (Jogo Adulto)

A daily browser-based game where you receive a random salary and must decide which bills to pay. There's only one correct answer per day — but is there really a right answer in adult life?

## How It Works

- Each day you get a random salary (from R$800 to R$25,000)
- A set of 5-8 bills is generated from an extensible pool (essential + discretionary)
- The total of all bills always exceeds your salary — you can't pay everything
- Choose which bills to pay and submit your selection
- After playing, you can compare your answer with the "correct" one
- One play per day — resets at midnight Brasília time (UTC-3)

## Tech Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** for styling
- **i18next** for EN/PT-BR localization
- **Zustand** for state management
- **Supabase** for daily play tracking
- **Vitest** for unit tests
- **Playwright** for E2E tests

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_TEST_SEED=
```

See `docs/supabase-setup.md` for database setup instructions.

### Running Locally

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npx playwright test
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── BillCard.tsx
│   ├── CountdownTimer.tsx
│   ├── Footer.tsx
│   ├── LanguageSwitcher.tsx
│   ├── ResultScreen.tsx
│   ├── RunningTotal.tsx
│   └── SalaryCard.tsx
├── data/
│   └── bills.ts       # Extensible bill pool — add new bills here
├── i18n/
│   ├── i18n.ts
│   └── locales/       # EN and PT-BR translations
├── lib/
│   └── supabase.ts
├── pages/
│   ├── AlreadyPlayed.tsx
│   └── Game.tsx
├── store/
│   └── useGameStore.ts
├── utils/
│   ├── billGenerator.ts
│   ├── currency.ts
│   ├── dailySeed.ts
│   └── fingerprint.ts
├── App.tsx
└── main.tsx
```

## Adding New Bills

To add a new bill, you only need to:

1. Add an entry in `src/data/bills.ts`:
```typescript
{ id: 'mybill', nameKey: 'bills.mybill', type: 'discretionary', priceRange: { min: 50, max: 200 } }
```

2. Add translations in `src/i18n/locales/en/game.json` and `src/i18n/locales/pt-BR/game.json`:
```json
"mybill": "My Bill"
```

That's it. The bill will automatically be included in daily game generation.

## Deployment

This project is configured for deployment on **Vercel**.

1. Push to your GitHub repository
2. Connect the repo on Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## Version Control

This project follows a simple workflow for iterative improvements based on user feedback:

```
main (production)
├── feature/new-bill-type
├── feature/ui-improvements
├── fix/countdown-bug
└── ...
```

### Making Changes After Deploy

1. Create a feature branch: `git checkout -b feature/description`
2. Make your changes
3. Test: `npm run build && npm run test`
4. Commit and push
5. Merge to `main` — Vercel auto-deploys

### Common Changes

| Change | Files to Modify |
|--------|----------------|
| Add new bill | `src/data/bills.ts`, locale files |
| Change text | `src/i18n/locales/*/common.json` or `game.json` |
| Change bill prices | `src/data/bills.ts` (priceRange) |
| Add salary tier | `src/utils/billGenerator.ts` (TIERS array) |
| Change UI style | Component files (Tailwind classes) |

## License

MIT

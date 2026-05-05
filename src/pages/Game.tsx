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
          <h1 className="text-xl font-bold">{t('title')}</h1>
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
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <LanguageSwitcher />
      </header>

      {serverError && (
        <div className="bg-amber-900/50 text-amber-200 text-center py-2 text-sm">
          {t('warning')}
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
            {t('payBills')}
          </button>
        </div>
      </main>
    </div>
  )
}

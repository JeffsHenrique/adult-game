import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CountdownTimer } from '../components/CountdownTimer'
import { Footer } from '../components/Footer'
import { GuideModal } from '../components/GuideModel'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { BillWithPrice, generateDailyGame } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'
import { getDailySeed, getUTC3Date } from '../utils/dailySeed'

interface CachedGameData {
  salary: number
  correctAnswer: string[]
  userSelection: string[]
  result: 'win' | 'lose'
}

export function AlreadyPlayed() {
  const { t, i18n } = useTranslation()
  const [gameData, setGameData] = useState<CachedGameData | null>(null)
  const [bills, setBills] = useState<BillWithPrice[]>([])
  const [guideOpen, setGuideOpen] = useState(false)
  const reloadTriggered = useRef(false)

  useEffect(() => {
    const dateKey = getUTC3Date()
    const cached = localStorage.getItem(`daily_game_${dateKey}`)
    if (cached) {
      const data: CachedGameData = JSON.parse(cached)
      setGameData(data)

      const seed = getDailySeed()
      const game = generateDailyGame(seed)
      setBills(game.bills)
    }
  }, [])

  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const newDateKey = getUTC3Date()
      const cachedKey = localStorage.getItem('last_date_key')
      if (cachedKey && cachedKey !== newDateKey && !reloadTriggered.current) {
        reloadTriggered.current = true
        window.location.reload()
      }
    }, 1000)
    return () => clearInterval(checkMidnight)
  }, [])

  useEffect(() => {
    localStorage.setItem('last_date_key', getUTC3Date())
  }, [])

  const correctBills = bills.filter((b) => gameData?.correctAnswer.includes(b.id))
  const userBills = bills.filter((b) => gameData?.userSelection.includes(b.id))

  const correctTotal = correctBills.reduce((sum, b) => sum + b.price, 0)
  const userTotal = userBills.reduce((sum, b) => sum + b.price, 0)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className="w-8 h-8">
            <rect x="4" y="2" width="24" height="28" rx="2" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5"/>
            <path d="M4 6 L8 4 L12 6 L16 4 L20 6 L24 4 L28 6" stroke="#3b82f6" strokeWidth="1.5" fill="none"/>
            <line x1="9" y1="12" x2="23" y2="12" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="9" y1="16" x2="20" y2="16" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="16" cy="23" r="6" fill="#ef4444" stroke="#dc2626" strokeWidth="1"/>
            <text x="16" y="25" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="system-ui, sans-serif">+18</text>
          </svg>
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
        <LanguageSwitcher />
        <button
          onClick={() => setGuideOpen(true)}
          className="ml-2 px-3 py-1 rounded text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          aria-label={t('help')}
        >
          ?
        </button>
        <GuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      </header>

      <main className="p-4 max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">{t('comeBackTomorrow')}</h2>
          <CountdownTimer />
        </div>

        {gameData && bills.length > 0 && (
          <>
            {/* Result banner */}
            <div
              className={`rounded-xl p-6 text-center ${
                gameData.result === 'win'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-700'
                  : 'bg-gradient-to-r from-red-600 to-red-800'
              }`}
            >
              <p className="text-2xl font-bold">
                {t(gameData.result === 'win' ? 'playedCongratulations' : 'playedIrresponsible')}
              </p>
            </div>

            {/* Today's Bills */}
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-lg font-medium text-gray-300 mb-4">{t('todaysBills')}:</p>
              <div className="space-y-2">
                {bills.map((bill) => {
                  const wasCorrect = gameData.correctAnswer.includes(bill.id)
                  return (
                    <div
                      key={bill.id}
                      className={`flex justify-between items-center rounded-lg p-3 ${
                        wasCorrect
                          ? 'bg-green-900/30 border border-green-700/50'
                          : 'bg-gray-700/30 border border-gray-700/30'
                      }`}
                    >
                      <span className="text-white font-medium">
                        {t(bill.nameKey, { ns: 'game' })}
                      </span>
                      <span className="text-white font-bold">
                        {formatCurrency(bill.price, i18n.language)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* User's Selection */}
            <div className="bg-gray-800 rounded-xl p-6">
              <p className="text-lg font-medium text-gray-300 mb-4">{t('userAnswer')}:</p>
              {userBills.length === 0 ? (
                <p className="text-gray-500 italic">No bills selected</p>
              ) : (
                <div className="space-y-2">
                  {userBills.map((bill) => {
                    const wasCorrect = gameData.correctAnswer.includes(bill.id)
                    return (
                      <div
                        key={bill.id}
                        className={`flex justify-between items-center rounded-lg p-3 ${
                          wasCorrect
                            ? 'bg-green-900/20 border border-green-700/30'
                            : 'bg-red-900/20 border border-red-700/30'
                        }`}
                      >
                        <span className="text-white font-medium">
                          {t(bill.nameKey, { ns: 'game' })}
                        </span>
                        <span className="text-white font-bold">
                          {formatCurrency(bill.price, i18n.language)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-white font-bold text-lg">
                  {formatCurrency(userTotal, i18n.language)}
                </span>
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

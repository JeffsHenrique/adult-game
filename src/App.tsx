import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './i18n/i18n'
import { supabase } from './lib/supabase'
import { AlreadyPlayed } from './pages/AlreadyPlayed'
import { Game } from './pages/Game'
import { useGameStore } from './store/useGameStore'
import { generateDailyGame } from './utils/billGenerator'
import { getDailySeed, getUTC3Date } from './utils/dailySeed'
import { generateFingerprint } from './utils/fingerprint'

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
        {t('loading')}
      </div>
    )
  }

  if (hasPlayedToday) {
    return <AlreadyPlayed />
  }

  return <Game />
}

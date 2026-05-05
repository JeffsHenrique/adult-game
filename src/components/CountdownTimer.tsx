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
        {t('nextGameIn')}: {formatTime(timeLeft)}
      </p>
    </div>
  )
}
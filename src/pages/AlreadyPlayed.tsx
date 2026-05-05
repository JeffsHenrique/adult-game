import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { CountdownTimer } from '../components/CountdownTimer'

export function AlreadyPlayed() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <LanguageSwitcher />
      </header>

      <main className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">{t('comeBackTomorrow')}</h2>
          <CountdownTimer />
        </div>
      </main>
    </div>
  )
}

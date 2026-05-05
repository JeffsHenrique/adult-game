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

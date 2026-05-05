import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import enGame from './locales/en/game.json'
import ptBrCommon from './locales/pt-BR/common.json'
import ptBrGame from './locales/pt-BR/game.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, game: enGame },
      'pt-BR': { common: ptBrCommon, game: ptBrGame },
    },
    fallbackLng: 'pt-BR',
    supportedLngs: ['en', 'pt-BR'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })

export default i18n

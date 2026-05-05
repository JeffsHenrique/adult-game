import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="text-center py-6 text-gray-600 text-sm">
      {t('footer')}
    </footer>
  )
}

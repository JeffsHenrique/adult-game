import { useTranslation } from 'react-i18next'
import { formatCurrency } from '../utils/currency'

interface SalaryCardProps {
  salary: number
}

export function SalaryCard({ salary }: SalaryCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg">
      <p className="text-sm opacity-80">{t('youEarn')}</p>
      <p className="text-3xl font-bold mt-1">{formatCurrency(salary, i18n.language)}</p>
    </div>
  )
}

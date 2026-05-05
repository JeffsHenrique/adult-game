import { useTranslation } from 'react-i18next'
import { BillWithPrice } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'

interface RunningTotalProps {
  bills: BillWithPrice[]
  selectedIds: string[]
  salary: number
}

export function RunningTotal({ bills, selectedIds, salary }: RunningTotalProps) {
  const { t, i18n } = useTranslation()
  const total = bills
    .filter((b) => selectedIds.includes(b.id))
    .reduce((sum, b) => sum + b.price, 0)

  const overBudget = total > salary

  return (
    <div className={`text-lg font-medium ${overBudget ? 'text-red-400' : 'text-green-400'}`}>
      {t('totalSelected')}:{' '}
      <span className="font-bold">{formatCurrency(total, i18n.language)}</span>
      {' / '}
      <span className="text-gray-400">{formatCurrency(salary, i18n.language)}</span>
    </div>
  )
}
import { useTranslation } from 'react-i18next'
import { BillWithPrice } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'

interface BillCardProps {
  bill: BillWithPrice
  selected: boolean
  onToggle: () => void
}

export function BillCard({ bill, selected, onToggle }: BillCardProps) {
  const { t, i18n } = useTranslation()

  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-150 ${
        selected
          ? 'border-blue-500 bg-blue-500/10 shadow-md'
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500'
      }`}
    >
      <div className="flex flex-col justify-between items-center gap-2">
        <div className="flex-1 text-center">
          <p className="text-xl font-semibold text-white">{t(bill.nameKey, { ns: 'game' })}</p>
          <p className="text-lg underline underline-offset-4 font-bold text-white whitespace-nowrap">
            {formatCurrency(bill.price, i18n.language)}
          </p>
        </div>
        <span
          className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
            bill.type === 'essential'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          {t(bill.type === 'essential' ? 'essential' : 'discretionary')}
        </span>
      </div>
    </button>
  )
}

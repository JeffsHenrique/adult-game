import { useTranslation } from 'react-i18next'
import { BillWithPrice } from '../utils/billGenerator'
import { formatCurrency } from '../utils/currency'

interface ResultScreenProps {
  result: 'win' | 'lose'
  bills: BillWithPrice[]
  correctAnswer: string[]
}

export function ResultScreen({ result, bills, correctAnswer }: ResultScreenProps) {
  const { t, i18n } = useTranslation()

  const correctBills = bills.filter((b) => correctAnswer.includes(b.id))
  const correctTotal = correctBills.reduce((sum, b) => sum + b.price, 0)

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        className={`rounded-xl p-8 mb-6 ${
          result === 'win'
            ? 'bg-gradient-to-r from-green-600 to-emerald-700'
            : 'bg-gradient-to-r from-red-600 to-red-800'
        }`}
      >
        <p className="text-2xl font-bold text-white">
          {t(result === 'win' ? 'congratulations' : 'irresponsible')}
        </p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <p className="text-lg font-medium text-gray-300 mb-4">
          {t('rightAnswer')}:
        </p>
        <div className="space-y-2">
          {correctBills.map((bill) => (
            <div
              key={bill.id}
              className="flex justify-between items-center bg-gray-700/50 rounded-lg p-3"
            >
              <span className="text-white font-medium">
                {t(bill.nameKey, { ns: 'game' })}
              </span>
              <span className="text-white font-bold">
                {formatCurrency(bill.price, i18n.language)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-600 flex justify-between">
          <span className="text-gray-400 font-medium">Total</span>
          <span className="text-white font-bold text-lg">
            {formatCurrency(correctTotal, i18n.language)}
          </span>
        </div>
      </div>

      <p className="mt-6 text-gray-500 text-sm">{t('comeBackTomorrow')}</p>
    </div>
  )
}
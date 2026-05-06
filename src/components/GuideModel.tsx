import { useTranslation } from 'react-i18next'
interface GuideModalProps {
    open: boolean
    onClose: () => void
}
export function GuideModal({ open, onClose }: GuideModalProps) {
    const { t } = useTranslation()
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl relative">
            <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
            >
            ×
            </button>
            <h2 className="text-2xl font-bold text-white mb-4">{t('guideTitle')}</h2>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {t('guideRules')}
            </p>
            <button
            onClick={onClose}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
            >
            {t('guideClose')}
            </button>
        </div>
        </div>
    )
}
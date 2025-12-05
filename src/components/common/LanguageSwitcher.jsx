import { Globe } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export const LanguageSwitcher = () => {
    const { language, toggleLanguage } = useLanguage()

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 hover:bg-white border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Switch Language"
        >
            <Globe className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-gray-700 uppercase">
                {language}
            </span>
        </button>
    )
}

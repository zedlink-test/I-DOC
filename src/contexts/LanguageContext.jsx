import { createContext, useContext, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext({})

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider')
    }
    return context
}

export const LanguageProvider = ({ children }) => {
    const { i18n } = useTranslation()
    const [language, setLanguage] = useState(i18n.language)

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng)
        setLanguage(lng)
        localStorage.setItem('language', lng)
    }

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'fr' : 'en'
        changeLanguage(newLang)
    }

    const value = {
        language,
        changeLanguage,
        toggleLanguage,
    }

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

import { useTranslation } from 'react-i18next'

export const Button = ({
    children,
    variant = 'primary',
    type = 'button',
    onClick,
    disabled = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'px-6 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-md hover:shadow-lg focus:ring-primary-500',
        secondary: 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg focus:ring-red-500',
        success: 'bg-medical-green-600 text-white hover:bg-medical-green-700 active:bg-medical-green-800 shadow-md hover:shadow-lg focus:ring-medical-green-500',
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

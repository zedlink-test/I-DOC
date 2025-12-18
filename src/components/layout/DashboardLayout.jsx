import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import {
    LayoutDashboard,
    Users,
    Calendar,
    UserCircle,
    LogOut,
    Menu,
    X,
    Stethoscope,
    ClipboardList
} from 'lucide-react'

export const DashboardLayout = ({ children }) => {
    const { t } = useTranslation()
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const handleLogout = async () => {
        try {
            await signOut()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const getNavItems = () => {
        const role = profile?.role

        const navItems = {
            admin: [
                { path: '/admin', icon: LayoutDashboard, label: t('dashboard') },
                { path: '/admin/users', icon: Users, label: t('users') },
                { path: '/admin/patients', icon: UserCircle, label: t('patients') },
                { path: '/admin/schedules', icon: Calendar, label: t('schedules') },
            ],
            secretary: [
                { path: '/secretary', icon: LayoutDashboard, label: t('dashboard') },
                { path: '/secretary/patients', icon: UserCircle, label: t('patients') },
                { path: '/secretary/schedules', icon: Calendar, label: t('schedules') },
            ],
            doctor: [
                { path: '/doctor', icon: LayoutDashboard, label: t('dashboard') },
                { path: '/doctor/patients', icon: UserCircle, label: t('myPatients') },
                { path: '/doctor/schedules', icon: Calendar, label: t('schedules') },
                { path: '/doctor/prescriptions', icon: ClipboardList, label: t('prescriptions') },
            ],
        }

        return navItems[role] || []
    }

    const navItems = getNavItems()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } w-64 bg-white shadow-xl`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-medical-teal-500 rounded-lg">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-gradient">I-DOC</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-primary-500 to-medical-teal-500 text-white shadow-medical'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {profile?.full_name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{t(profile?.role)}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
                {/* Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6 text-gray-700" />
                        </button>

                        <LanguageSwitcher />
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}

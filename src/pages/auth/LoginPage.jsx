import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { LanguageSwitcher } from '../../components/common/LanguageSwitcher'
import { Stethoscope, Mail, Lock, AlertCircle } from 'lucide-react'

export const LoginPage = () => {
    const { t } = useTranslation()
    const { signIn } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { user } = await signIn(email, password)

            // Fetch user profile to get role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            // Redirect based on role
            const roleRoutes = {
                admin: '/admin',
                doctor: '/doctor',
                secretary: '/secretary',
            }

            navigate(roleRoutes[profile.role] || '/')
        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500 via-medical-teal-500 to-medical-green-500 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-10">
                <LanguageSwitcher />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-slide-up">
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-medical-teal-500 rounded-2xl mb-4 shadow-medical">
                            <Stethoscope className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gradient mb-2">I-DOC</h1>
                        <p className="text-gray-600">{t('welcome')}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-3 top-[38px] w-5 h-5 text-gray-400" />
                            <Input
                                label={t('email')}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="doctor@example.com"
                                required
                                className="pl-10"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-[38px] w-5 h-5 text-gray-400" />
                            <Input
                                label={t('password')}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="pl-10"
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full mt-6"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{t('loading')}</span>
                                </div>
                            ) : (
                                t('login')
                            )}
                        </Button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 text-center">
                            🔒 Secure medical office management system
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

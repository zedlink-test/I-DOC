import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { Button } from '../../components/common/Button'
import { Lock, CheckCircle } from 'lucide-react'

export const SetupAccount = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError(t('passwordsDoNotMatch') || 'Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError(t('passwordTooShort') || 'Password must be at least 6 characters')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            alert('Password set successfully! Redirecting to dashboard...')
            navigate('/')
        } catch (error) {
            console.error('Error setting password:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Setup Your Account</h1>
                    <p className="text-gray-600">Please set a secure password to continue</p>
                </div>

                <Card className="shadow-xl border-t-4 border-primary-500">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <Input
                            label={t('newPassword') || 'New Password'}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter new password"
                            icon={Lock}
                        />

                        <Input
                            label={t('confirmPassword') || 'Confirm Password'}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm new password"
                            icon={CheckCircle}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3 text-lg font-semibold shadow-lg shadow-primary-500/20"
                            disabled={loading}
                        >
                            {loading ? 'Setting Password...' : 'Save & Continue'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

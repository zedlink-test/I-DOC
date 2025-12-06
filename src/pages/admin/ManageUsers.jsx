import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { Input } from '../../components/common/Input'
import { supabase } from '../../lib/supabase'
import { UserPlus, Trash2, Shield } from 'lucide-react'

export const ManageUsers = () => {
    const { t } = useTranslation()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'doctor',
    })

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setFormData({
            email: '',
            full_name: '',
            role: 'doctor',
        })
        setError('')
        setShowModal(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Send invitation email using Supabase Admin API
            const { data, error } = await supabase.auth.admin.inviteUserByEmail(formData.email, {
                data: {
                    role: formData.role,
                    full_name: formData.full_name,
                },
                redirectTo: `${window.location.origin}/setup-account`
            })

            if (error) throw error

            // Create the profile immediately
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    role: formData.role,
                    full_name: formData.full_name,
                }])

            if (profileError) {
                console.error('Profile creation error:', profileError)
            }

            alert(`✅ Invitation sent to ${formData.email}!\n\nThe user will receive an email with a link to set their password.`)
            setShowModal(false)
            setFormData({
                email: '',
                full_name: '',
                role: 'doctor',
            })
            fetchUsers()
        } catch (error) {
            console.error('Error inviting user:', error)
            setError(error.message || t('error'))
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (userId) => {
        if (!confirm(t('confirmDelete'))) return

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId)

            if (error) throw error
            fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
            alert(t('error'))
        }
    }

    const getRoleColor = (role) => {
        const colors = {
            admin: 'from-purple-500 to-purple-600',
            doctor: 'from-primary-500 to-primary-600',
            secretary: 'from-medical-teal-500 to-medical-teal-600',
        }
        return colors[role] || 'from-gray-500 to-gray-600'
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">{t('users')}</h1>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        {t('addUser')}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : users.length === 0 ? (
                    <Card>
                        <p className="text-center text-gray-500 py-8">{t('noData')}</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <Card key={user.id}>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 bg-gradient-to-br ${getRoleColor(user.role)} rounded-lg`}>
                                                <Shield className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{user.full_name}</h3>
                                                <p className="text-sm text-gray-500 capitalize">{t(user.role)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <p>📅 {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(user.id)}
                                            className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                            disabled={user.role === 'admin'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {t('delete')}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false)
                    setError('')
                }}
                title={t('inviteUser')}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                        📧 An invitation email will be sent to the user. They will set their own password.
                    </div>

                    <Input
                        label={t('email')}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="user@example.com"
                    />

                    <Input
                        label={t('fullName')}
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                        placeholder="Dr. John Smith"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('role')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="doctor">{t('doctor')}</option>
                            <option value="secretary">{t('secretary')}</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setShowModal(false)
                                setError('')
                            }}
                            disabled={loading}
                        >
                            {t('cancel')}
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? t('sending') : t('sendInvitation')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    )
}

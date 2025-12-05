import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Users, Calendar, Activity, Stethoscope } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const AdminDashboard = () => {
    const { t } = useTranslation()
    const [stats, setStats] = useState({
        totalPatients: 0,
        totalDoctors: 0,
        totalSecretaries: 0,
        upcomingAppointments: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [patientsRes, doctorsRes, secretariesRes, appointmentsRes] = await Promise.all([
                supabase.from('patients').select('*', { count: 'exact', head: true }),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'doctor'),
                supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'secretary'),
                supabase
                    .from('schedules')
                    .select('*', { count: 'exact', head: true })
                    .gte('appointment_date', new Date().toISOString())
                    .eq('status', 'scheduled'),
            ])

            setStats({
                totalPatients: patientsRes.count || 0,
                totalDoctors: doctorsRes.count || 0,
                totalSecretaries: secretariesRes.count || 0,
                upcomingAppointments: appointmentsRes.count || 0,
            })
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: t('totalPatients'),
            value: stats.totalPatients,
            icon: Users,
            color: 'from-primary-500 to-primary-600',
        },
        {
            title: t('totalDoctors'),
            value: stats.totalDoctors,
            icon: Stethoscope,
            color: 'from-medical-teal-500 to-medical-teal-600',
        },
        {
            title: t('totalSecretaries'),
            value: stats.totalSecretaries,
            icon: Activity,
            color: 'from-medical-green-500 to-medical-green-600',
        },
        {
            title: t('upcomingAppointments'),
            value: stats.upcomingAppointments,
            icon: Calendar,
            color: 'from-purple-500 to-purple-600',
        },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h1>
                    <p className="text-gray-600 mt-1">Admin Overview - Manage your medical office</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <Card key={index} className="relative overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                                            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                                        </div>
                                        <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

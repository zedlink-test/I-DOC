import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const SecretaryDashboard = () => {
    const { t } = useTranslation()
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        upcomingAppointments: 0,
    })
    const [recentPatients, setRecentPatients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            // Fetch total patients
            const { count: patientsCount } = await supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })

            // Fetch today's appointments
            const today = new Date().toISOString().split('T')[0]
            const { count: todayCount } = await supabase
                .from('schedules')
                .select('*', { count: 'exact', head: true })
                .gte('appointment_date', `${today}T00:00:00`)
                .lte('appointment_date', `${today}T23:59:59`)
                .eq('status', 'scheduled')

            // Fetch upcoming appointments
            const { count: upcomingCount } = await supabase
                .from('schedules')
                .select('*', { count: 'exact', head: true })
                .gte('appointment_date', new Date().toISOString())
                .eq('status', 'scheduled')

            // Fetch recent patients
            const { data: patients } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            setStats({
                totalPatients: patientsCount || 0,
                todayAppointments: todayCount || 0,
                upcomingAppointments: upcomingCount || 0,
            })
            setRecentPatients(patients || [])
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
            title: t('todayAppointments'),
            value: stats.todayAppointments,
            icon: Calendar,
            color: 'from-medical-teal-500 to-medical-teal-600',
        },
        {
            title: t('upcomingAppointments'),
            value: stats.upcomingAppointments,
            icon: TrendingUp,
            color: 'from-medical-green-500 to-medical-green-600',
        },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h1>
                    <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                        {/* Recent Patients */}
                        <Card title="Recent Patients">
                            {recentPatients.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t('noData')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentPatients.map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold">
                                                    {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {patient.first_name} {patient.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{patient.phone_number}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">
                                                    {new Date(patient.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

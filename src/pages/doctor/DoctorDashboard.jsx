import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Users, Calendar } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export const DoctorDashboard = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [stats, setStats] = useState({
        myPatients: 0,
        upcomingAppointments: 0,
    })
    const [recentAppointments, setRecentAppointments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchDashboardData()
        }
    }, [user])

    const fetchDashboardData = async () => {
        try {
            const [patientsRes, appointmentsRes, recentRes] = await Promise.all([
                supabase
                    .from('patients')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_doctor_id', user.id),
                supabase
                    .from('schedules')
                    .select('*', { count: 'exact', head: true })
                    .eq('doctor_id', user.id)
                    .gte('appointment_date', new Date().toISOString())
                    .eq('status', 'scheduled'),
                supabase
                    .from('schedules')
                    .select(`
            *,
            patient:patients(first_name, last_name)
          `)
                    .eq('doctor_id', user.id)
                    .gte('appointment_date', new Date().toISOString())
                    .eq('status', 'scheduled')
                    .order('appointment_date', { ascending: true })
                    .limit(5),
            ])

            setStats({
                myPatients: patientsRes.count || 0,
                upcomingAppointments: appointmentsRes.count || 0,
            })
            setRecentAppointments(recentRes.data || [])
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        {
            title: t('myPatients'),
            value: stats.myPatients,
            icon: Users,
            color: 'from-primary-500 to-primary-600',
        },
        {
            title: t('upcomingAppointments'),
            value: stats.upcomingAppointments,
            icon: Calendar,
            color: 'from-medical-teal-500 to-medical-teal-600',
        },
    ]

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h1>
                    <p className="text-gray-600 mt-1">Your patient overview</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                        <Card title="Upcoming Appointments">
                            {recentAppointments.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">{t('noData')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentAppointments.map((appointment) => (
                                        <div
                                            key={appointment.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold">
                                                    {appointment.patient?.first_name?.charAt(0)}
                                                    {appointment.patient?.last_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {appointment.patient?.first_name} {appointment.patient?.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(appointment.appointment_date).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                {appointment.duration_minutes} min
                                            </span>
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

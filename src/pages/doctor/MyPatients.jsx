import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { UserCircle, Phone, Calendar, FileText } from 'lucide-react'

export const MyPatients = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchPatients()
        }
    }, [user])

    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('assigned_doctor_id', user.id)
                .order('first_name')

            if (error) throw error
            setPatients(data || [])
        } catch (error) {
            console.error('Error fetching patients:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateAge = (dob) => {
        if (!dob) return 'N/A'
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">{t('myPatients')}</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : patients.length === 0 ? (
                    <Card>
                        <p className="text-center text-gray-500 py-8">{t('noData')}</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => (
                            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {patient.first_name} {patient.last_name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {t('age')}: {calculateAge(patient.date_of_birth)} years
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                                            {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span>{patient.phone_number}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                                        </div>
                                        {patient.condition && (
                                            <div className="mt-2">
                                                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                    {patient.condition}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}

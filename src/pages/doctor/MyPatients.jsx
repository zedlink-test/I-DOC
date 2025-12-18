import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Modal } from '../../components/common/Modal'
import { Button } from '../../components/common/Button'
import { NotesList } from '../../components/features/NotesList'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { UserCircle, Phone, Calendar, FileText, DollarSign, CreditCard, CheckCircle, AlertCircle, XCircle, Eye, ClipboardList, Pill, FlaskConical } from 'lucide-react'

export const MyPatients = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [showNotesModal, setShowNotesModal] = useState(false)

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

    const getPaymentStatus = (patient) => {
        const total = parseFloat(patient.total_amount) || 0
        const paid = parseFloat(patient.paid_amount) || 0
        if (total === 0) return null
        if (paid >= total) return 'paid'
        if (paid > 0) return 'partial'
        return 'unpaid'
    }

    const getRestToPay = (patient) => {
        const total = parseFloat(patient.total_amount) || 0
        const paid = parseFloat(patient.paid_amount) || 0
        return Math.max(0, total - paid)
    }

    const PaymentStatusBadge = ({ status }) => {
        if (!status) return null

        const config = {
            paid: { icon: CheckCircle, className: 'badge-paid', label: t('paid') },
            partial: { icon: AlertCircle, className: 'badge-partial', label: t('partial') },
            unpaid: { icon: XCircle, className: 'badge-unpaid', label: t('unpaid') },
        }

        const { icon: Icon, className, label } = config[status]

        return (
            <span className={className}>
                <Icon className="w-3 h-3" />
                {label}
            </span>
        )
    }

    const handleViewNotes = (patient) => {
        setSelectedPatient(patient)
        setShowNotesModal(true)
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{t('myPatients')}</h1>
                        <p className="text-gray-500 mt-1">View and manage your assigned patients</p>
                    </div>
                    <Button
                        onClick={() => navigate('/doctor/prescriptions')}
                        className="flex items-center gap-2"
                    >
                        <Pill className="w-5 h-5" />
                        {t('prescriptions')}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UserCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Patients</p>
                                <p className="text-2xl font-bold text-gray-800">{patients.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Fully Paid</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {patients.filter(p => getPaymentStatus(p) === 'paid').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Partial Payment</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {patients.filter(p => getPaymentStatus(p) === 'partial').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Unpaid</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {patients.filter(p => getPaymentStatus(p) === 'unpaid').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : patients.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <UserCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">{t('noData')}</p>
                            <p className="text-sm text-gray-400 mt-2">No patients have been assigned to you yet</p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {patients.map((patient) => {
                            const paymentStatus = getPaymentStatus(patient)
                            const restToPay = getRestToPay(patient)

                            return (
                                <div key={patient.id} className="card-professional animate-fade-in">
                                    {/* Card Header */}
                                    <div className="card-header">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
                                                    {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-800">
                                                        {patient.first_name} {patient.last_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {t('age')}: {calculateAge(patient.date_of_birth)} years
                                                    </p>
                                                </div>
                                            </div>
                                            <PaymentStatusBadge status={paymentStatus} />
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="card-body space-y-4">
                                        {/* Contact Info */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{patient.phone_number}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{new Date(patient.date_of_birth).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Condition */}
                                        {patient.condition && (
                                            <div>
                                                <span className="category-badge category-badge-blue">
                                                    {patient.condition}
                                                </span>
                                            </div>
                                        )}

                                        {/* Payment Details */}
                                        {(patient.total_amount > 0 || patient.paid_amount > 0) && (
                                            <div className="pt-3 border-t border-gray-100 space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <DollarSign className="w-3 h-3" /> {t('totalAmount')}
                                                    </span>
                                                    <span className="font-semibold text-gray-800">
                                                        {parseFloat(patient.total_amount || 0).toFixed(2)} {t('currency')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" /> {t('versement')}
                                                    </span>
                                                    <span className="font-semibold text-green-600">
                                                        {parseFloat(patient.paid_amount || 0).toFixed(2)} {t('currency')}
                                                    </span>
                                                </div>
                                                {restToPay > 0 && (
                                                    <div className="flex items-center justify-between text-sm bg-yellow-50 rounded-lg p-2 -mx-2">
                                                        <span className="text-yellow-700 font-medium">
                                                            {t('restToPay')}
                                                        </span>
                                                        <span className="font-bold text-yellow-700">
                                                            {restToPay.toFixed(2)} {t('currency')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleViewNotes(patient)}
                                                className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                                Notes
                                            </Button>
                                            <Button
                                                variant="primary"
                                                onClick={() => navigate('/doctor/prescriptions')}
                                                className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                            >
                                                <Pill className="w-4 h-4" />
                                                Prescribe
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Notes Modal */}
            <Modal
                isOpen={showNotesModal}
                onClose={() => {
                    setShowNotesModal(false)
                    setSelectedPatient(null)
                }}
                title={selectedPatient ? `${t('notes')} - ${selectedPatient.first_name} ${selectedPatient.last_name}` : t('notes')}
            >
                {selectedPatient && (
                    <NotesList
                        patientId={selectedPatient.id}
                        doctorId={user?.id}
                    />
                )}
            </Modal>
        </DashboardLayout>
    )
}

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { PatientForm } from '../../components/features/PatientForm'
import { NotesList } from '../../components/features/NotesList'
import { supabase } from '../../lib/supabase'
import { UserPlus, Search, Edit, Trash2, Phone, Calendar, DollarSign, CreditCard, CheckCircle, AlertCircle, XCircle, ClipboardList } from 'lucide-react'

export const PatientManagement = () => {
    const { t } = useTranslation()
    const [patients, setPatients] = useState([])
    const [filteredPatients, setFilteredPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [showNotesModal, setShowNotesModal] = useState(false)
    const [notesPatient, setNotesPatient] = useState(null)

    useEffect(() => {
        fetchPatients()
    }, [])

    useEffect(() => {
        filterPatients()
    }, [searchTerm, patients])

    const fetchPatients = async () => {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select(`
          *,
          assigned_doctor:profiles!assigned_doctor_id(full_name)
        `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPatients(data || [])
        } catch (error) {
            console.error('Error fetching patients:', error)
        } finally {
            setLoading(false)
        }
    }

    const filterPatients = () => {
        if (!searchTerm) {
            setFilteredPatients(patients)
            return
        }

        const filtered = patients.filter(patient =>
            patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone_number.includes(searchTerm)
        )
        setFilteredPatients(filtered)
    }

    const handleAddPatient = () => {
        setSelectedPatient(null)
        setShowModal(true)
    }

    const handleEditPatient = (patient) => {
        setSelectedPatient(patient)
        setShowModal(true)
    }

    const handleDeletePatient = async (patientId) => {
        if (!confirm(t('confirmDelete'))) return

        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', patientId)

            if (error) throw error
            fetchPatients()
        } catch (error) {
            console.error('Error deleting patient:', error)
            alert(t('error'))
        }
    }

    const handleSavePatient = () => {
        setShowModal(false)
        fetchPatients()
    }

    const handleViewNotes = (patient) => {
        setNotesPatient(patient)
        setShowNotesModal(true)
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{t('patients')}</h1>
                        <p className="text-gray-500 mt-1">Manage patient records and payment status</p>
                    </div>
                    <Button onClick={handleAddPatient} className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        {t('addPatient')}
                    </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="stat-card">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UserPlus className="w-5 h-5 text-blue-600" />
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
                                <p className="text-sm text-gray-500">Pending Payments</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {patients.filter(p => ['partial', 'unpaid'].includes(getPaymentStatus(p))).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <Card>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('search')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                </Card>

                {/* Patients List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : filteredPatients.length === 0 ? (
                    <Card>
                        <p className="text-center text-gray-500 py-8">{t('noData')}</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => {
                            const paymentStatus = getPaymentStatus(patient)
                            const restToPay = getRestToPay(patient)

                            return (
                                <div key={patient.id} className="card-professional animate-fade-in">
                                    {/* Card Header with Avatar */}
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

                                        {/* Doctor */}
                                        {patient.assigned_doctor && (
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-medical-teal-500"></span>
                                                Dr. {patient.assigned_doctor.full_name}
                                            </p>
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
                                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleViewNotes(patient)}
                                                className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                                {t('notes')}
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleEditPatient(patient)}
                                                className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                {t('edit')}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDeletePatient(patient.id)}
                                                className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {t('delete')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Patient Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedPatient ? t('editPatient') : t('addPatient')}
            >
                <PatientForm
                    patient={selectedPatient}
                    onSave={handleSavePatient}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Notes Modal */}
            <Modal
                isOpen={showNotesModal}
                onClose={() => {
                    setShowNotesModal(false)
                    setNotesPatient(null)
                }}
                title={notesPatient ? `${t('notes')} - ${notesPatient.first_name} ${notesPatient.last_name}` : t('notes')}
            >
                {notesPatient && (
                    <NotesList
                        patientId={notesPatient.id}
                        userRole="secretary"
                    />
                )}
            </Modal>
        </DashboardLayout>
    )
}

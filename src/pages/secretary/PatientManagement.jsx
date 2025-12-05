import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { PatientForm } from '../../components/features/PatientForm'
import { supabase } from '../../lib/supabase'
import { UserPlus, Search, Edit, Trash2, Phone, Calendar } from 'lucide-react'

export const PatientManagement = () => {
    const { t } = useTranslation()
    const [patients, setPatients] = useState([])
    const [filteredPatients, setFilteredPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)

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
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">{t('patients')}</h1>
                    <Button onClick={handleAddPatient} className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        {t('addPatient')}
                    </Button>
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
                        {filteredPatients.map((patient) => (
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
                                        {patient.assigned_doctor && (
                                            <p className="text-xs text-gray-500 mt-2">
                                                Dr. {patient.assigned_doctor.full_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-200">
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
                            </Card>
                        ))}
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
        </DashboardLayout>
    )
}

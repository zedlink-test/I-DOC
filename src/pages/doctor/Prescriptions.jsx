import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { PrescriptionForm } from '../../components/features/PrescriptionForm'
import { LabTestPrescription } from '../../components/features/LabTestPrescription'
import { supabase } from '../../lib/supabase'
import { generatePrescriptionPDF, downloadPDF, printPDF } from '../../lib/pdfUtils'
import { FileText, Plus, Trash2, User, Printer, Download, Pill, FlaskConical, Droplets, Clock, Calendar } from 'lucide-react'

export const Prescriptions = () => {
    const { t } = useTranslation()
    const [prescriptions, setPrescriptions] = useState([])
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showLabModal, setShowLabModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all') // all, medication, lab_test

    useEffect(() => {
        fetchPrescriptions()
        fetchMyPatients()
    }, [])

    const fetchMyPatients = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .eq('assigned_doctor_id', user.id)
                .order('last_name')

            if (error) throw error
            setPatients(data || [])
        } catch (error) {
            console.error('Error fetching patients:', error)
        }
    }

    const fetchPrescriptions = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { data, error } = await supabase
                .from('prescriptions')
                .select(`
          *,
          patients (
            id,
            first_name,
            last_name,
            date_of_birth
          )
        `)
                .eq('doctor_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPrescriptions(data || [])
        } catch (error) {
            console.error('Error fetching prescriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDelete'))) return

        try {
            console.log('Deleting prescription:', id)
            const { error } = await supabase
                .from('prescriptions')
                .delete()
                .eq('id', id)

            if (error) {
                console.error('Delete error:', error)
                throw error
            }

            console.log('Prescription deleted successfully')
            alert('✅ Prescription deleted successfully!')
            fetchPrescriptions()
        } catch (error) {
            console.error('Error deleting prescription:', error)
            alert(`❌ Error deleting prescription: ${error.message}`)
        }
    }

    const handleAddPrescription = (patient) => {
        setSelectedPatient(patient)
        setShowModal(true)
    }

    const handleAddLabTest = (patient) => {
        setSelectedPatient(patient)
        setShowLabModal(true)
    }

    const handleSave = () => {
        setShowModal(false)
        setShowLabModal(false)
        setSelectedPatient(null)
        fetchPrescriptions()
    }

    const handlePrint = async (prescription) => {
        try {
            console.log('Starting print process...')
            const { data: { user } } = await supabase.auth.getUser()
            console.log('User:', user)

            const { data: doctorProfile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('Profile error:', profileError)
                throw new Error('Could not fetch doctor profile')
            }

            console.log('Doctor profile:', doctorProfile)
            console.log('Generating PDF...')

            const pdfBytes = await generatePrescriptionPDF(
                prescription,
                prescription.patients,
                doctorProfile
            )

            console.log('PDF generated, printing...')
            printPDF(pdfBytes)
        } catch (error) {
            console.error('Error printing prescription:', error)
            alert(`Error printing prescription: ${error.message}`)
        }
    }

    const handleDownload = async (prescription) => {
        try {
            console.log('Starting download process...')
            const { data: { user } } = await supabase.auth.getUser()

            const { data: doctorProfile, error: profileError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('Profile error:', profileError)
                throw new Error('Could not fetch doctor profile')
            }

            console.log('Generating PDF...')
            const pdfBytes = await generatePrescriptionPDF(
                prescription,
                prescription.patients,
                doctorProfile
            )

            const filename = `Prescription_${prescription.patients.first_name}_${prescription.patients.last_name}_${new Date(prescription.created_at).toLocaleDateString().replace(/\//g, '-')}.pdf`
            console.log('Downloading:', filename)
            downloadPDF(pdfBytes, filename)
        } catch (error) {
            console.error('Error downloading prescription:', error)
            alert(`Error downloading prescription: ${error.message}`)
        }
    }

    const filteredPrescriptions = prescriptions.filter(prescription => {
        const matchesSearch = prescription.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = filterType === 'all' ||
            (filterType === 'medication' && prescription.prescription_type !== 'lab_test') ||
            (filterType === 'lab_test' && prescription.prescription_type === 'lab_test')

        return matchesSearch && matchesType
    })

    const PrescriptionTypeIcon = ({ type }) => {
        if (type === 'lab_test') {
            return (
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex-shrink-0">
                    <FlaskConical className="w-6 h-6 text-white" />
                </div>
            )
        }
        return (
            <div className="p-3 bg-gradient-to-br from-medical-green-500 to-medical-teal-500 rounded-lg flex-shrink-0">
                <Pill className="w-6 h-6 text-white" />
            </div>
        )
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{t('prescriptions')}</h1>
                        <p className="text-gray-500 mt-1">Manage medications and lab test prescriptions</p>
                    </div>
                </div>

                {/* Quick Add from My Patients */}
                <Card>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Quick Actions - Select a Patient
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {patients.slice(0, 6).map((patient) => (
                            <div
                                key={patient.id}
                                className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all bg-white"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold">
                                        {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">
                                            {patient.first_name} {patient.last_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddPrescription(patient)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                    >
                                        <Pill className="w-4 h-4" />
                                        Medication
                                    </button>
                                    <button
                                        onClick={() => handleAddLabTest(patient)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
                                    >
                                        <FlaskConical className="w-4 h-4" />
                                        Lab Tests
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder={t('search') + '...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field flex-1"
                    />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="input-field w-full sm:w-48"
                    >
                        <option value="all">All Prescriptions</option>
                        <option value="medication">💊 Medications Only</option>
                        <option value="lab_test">🧪 Lab Tests Only</option>
                    </select>
                </div>

                {/* Prescriptions List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : filteredPrescriptions.length === 0 ? (
                    <Card>
                        <p className="text-center text-gray-500 py-8">
                            {searchTerm ? t('noResults') : t('noPrescriptions')}
                        </p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredPrescriptions.map((prescription) => (
                            <div key={prescription.id} className="card-professional animate-fade-in">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 p-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <PrescriptionTypeIcon type={prescription.prescription_type} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {prescription.patients?.first_name} {prescription.patients?.last_name}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${prescription.prescription_type === 'lab_test'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : 'bg-green-100 text-green-700'
                                                    }`}>
                                                    {prescription.prescription_type === 'lab_test' ? '🧪 Lab Test' : '💊 Medication'}
                                                </span>
                                            </div>

                                            {/* Medications List (Todo Style) */}
                                            {prescription.medications && Array.isArray(prescription.medications) ? (
                                                <div className="space-y-2 mb-3">
                                                    {prescription.medications.map((med, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 p-2 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                <Pill className="w-4 h-4 text-green-600" />
                                                                <span className="font-medium text-gray-800">{med.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {med.dosagePerDay}x/day
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {med.durationDays} days
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="space-y-1 mb-3">
                                                    <p className="text-sm break-words">
                                                        <span className="font-medium text-gray-700">{prescription.prescription_type === 'lab_test' ? 'Tests:' : 'Medication:'}</span>{' '}
                                                        <span className="text-gray-900 font-semibold whitespace-pre-wrap">{prescription.medication}</span>
                                                    </p>
                                                    {prescription.dosage && (
                                                        <p className="text-sm break-words">
                                                            <span className="font-medium text-gray-700">Dosage:</span>{' '}
                                                            <span className="text-gray-600">{prescription.dosage}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Lab Tests Display */}
                                            {prescription.blood_tests && prescription.blood_tests.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-xs font-medium text-red-600 mb-1 flex items-center gap-1">
                                                        <FlaskConical className="w-3 h-3" /> Blood Tests ({prescription.blood_tests.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prescription.blood_tests.slice(0, 5).map((test, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs">
                                                                {test}
                                                            </span>
                                                        ))}
                                                        {prescription.blood_tests.length > 5 && (
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                                                +{prescription.blood_tests.length - 5} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {prescription.urine_tests && prescription.urine_tests.length > 0 && (
                                                <div className="mb-2">
                                                    <p className="text-xs font-medium text-yellow-600 mb-1 flex items-center gap-1">
                                                        <Droplets className="w-3 h-3" /> Urine Tests ({prescription.urine_tests.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {prescription.urine_tests.slice(0, 5).map((test, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">
                                                                {test}
                                                            </span>
                                                        ))}
                                                        {prescription.urine_tests.length > 5 && (
                                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                                                +{prescription.urine_tests.length - 5} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {prescription.instructions && (
                                                <p className="text-sm break-words text-gray-600 italic">
                                                    📝 {prescription.instructions}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                📅 {new Date(prescription.created_at).toLocaleDateString()} at{' '}
                                                {new Date(prescription.created_at).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={() => handlePrint(prescription)}
                                            className="flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span className="hidden sm:inline">{t('print')}</span>
                                            <span className="sm:hidden">🖨️</span>
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleDownload(prescription)}
                                            className="flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span className="hidden sm:inline">{t('download')}</span>
                                            <span className="sm:hidden">⬇️</span>
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(prescription.id)}
                                            className="flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">{t('delete')}</span>
                                            <span className="sm:hidden">🗑️</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Medication Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false)
                    setSelectedPatient(null)
                }}
                title={`${t('addPrescription')} - Medication`}
            >
                {selectedPatient && (
                    <PrescriptionForm
                        patient={selectedPatient}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowModal(false)
                            setSelectedPatient(null)
                        }}
                    />
                )}
            </Modal>

            {/* Lab Test Modal */}
            <Modal
                isOpen={showLabModal}
                onClose={() => {
                    setShowLabModal(false)
                    setSelectedPatient(null)
                }}
                title={`${t('addLabTest')}`}
            >
                {selectedPatient && (
                    <LabTestPrescription
                        patient={selectedPatient}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowLabModal(false)
                            setSelectedPatient(null)
                        }}
                    />
                )}
            </Modal>
        </DashboardLayout>
    )
}

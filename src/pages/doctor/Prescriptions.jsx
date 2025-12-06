import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { PrescriptionForm } from '../../components/features/PrescriptionForm'
import { supabase } from '../../lib/supabase'
import { generatePrescriptionPDF, downloadPDF, printPDF } from '../../lib/pdfUtils'
import { FileText, Plus, Trash2, User, Printer, Download } from 'lucide-react'

export const Prescriptions = () => {
    const { t } = useTranslation()
    const [prescriptions, setPrescriptions] = useState([])
    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

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

    const handleSave = () => {
        setShowModal(false)
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

    const filteredPrescriptions = prescriptions.filter(prescription =>
        prescription.patients?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.patients?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">{t('prescriptions')}</h1>
                </div>

                {/* Quick Add from My Patients */}
                <Card>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {t('addPrescription')}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {patients.slice(0, 6).map((patient) => (
                            <button
                                key={patient.id}
                                onClick={() => handleAddPrescription(patient)}
                                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold">
                                    {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-medium text-gray-800">
                                        {patient.first_name} {patient.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">Click to add prescription</p>
                                </div>
                                <Plus className="w-5 h-5 text-primary-600" />
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Search */}
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder={t('search') + '...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field flex-1"
                    />
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
                            <Card key={prescription.id}>
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 bg-gradient-to-br from-medical-green-500 to-medical-teal-500 rounded-lg flex-shrink-0">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <h3 className="font-semibold text-gray-800 truncate">
                                                    {prescription.patients?.first_name} {prescription.patients?.last_name}
                                                </h3>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm break-words">
                                                    <span className="font-medium text-gray-700">Medication:</span>{' '}
                                                    <span className="text-gray-900 font-semibold">{prescription.medication}</span>
                                                </p>
                                                <p className="text-sm break-words">
                                                    <span className="font-medium text-gray-700">Dosage:</span>{' '}
                                                    <span className="text-gray-600">{prescription.dosage}</span>
                                                </p>
                                                {prescription.instructions && (
                                                    <p className="text-sm break-words">
                                                        <span className="font-medium text-gray-700">Instructions:</span>{' '}
                                                        <span className="text-gray-600">{prescription.instructions}</span>
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-2">
                                                    📅 {new Date(prescription.created_at).toLocaleDateString()} at{' '}
                                                    {new Date(prescription.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
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
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false)
                    setSelectedPatient(null)
                }}
                title={t('addPrescription')}
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
        </DashboardLayout>
    )
}

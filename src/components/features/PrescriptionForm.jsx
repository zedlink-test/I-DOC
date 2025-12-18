import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Pill, Clock, Calendar, Check } from 'lucide-react'

export const PrescriptionForm = ({ patient, onSave, onCancel }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [medications, setMedications] = useState([
        { name: '', dosagePerDay: '', durationDays: '', ifNeeded: false }
    ])
    const [instructions, setInstructions] = useState('')

    const addMedication = () => {
        setMedications([...medications, { name: '', dosagePerDay: '', durationDays: '', ifNeeded: false }])
    }

    const removeMedication = (index) => {
        if (medications.length === 1) return
        setMedications(medications.filter((_, i) => i !== index))
    }

    const updateMedication = (index, field, value) => {
        const updated = [...medications]
        updated[index][field] = value
        setMedications(updated)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Filter out empty medications
        const validMedications = medications.filter(m => m.name.trim() !== '')

        if (validMedications.length === 0) {
            alert('Please add at least one medication')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('You must be logged in to create a prescription')
                setLoading(false)
                return
            }

            // Create a formatted medication string
            const medicationList = validMedications.map(m => {
                let line = `${m.name}`
                if (m.dosagePerDay) line += ` - ${m.dosagePerDay}x/day`
                if (m.durationDays) line += ` for ${m.durationDays} days`
                if (m.ifNeeded) line += ' (Si besoin / If needed)'
                return line
            }).join('\n')

            const prescriptionData = {
                medication: medicationList,
                dosage: validMedications.map(m => m.dosagePerDay ? `${m.dosagePerDay}x/day` : 'As needed').join(', '),
                instructions: instructions,
                medications: validMedications,
                patient_id: patient.id,
                doctor_id: user.id,
                prescription_type: 'medication'
            }

            console.log('Creating prescription:', prescriptionData)

            const { data, error } = await supabase
                .from('prescriptions')
                .insert([prescriptionData])
                .select()

            if (error) {
                console.error('Prescription error:', error)
                throw error
            }

            console.log('Prescription created:', data)
            alert('✅ Prescription created successfully!')
            onSave()
        } catch (error) {
            console.error('Error saving prescription:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Info */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-primary-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal-500 flex items-center justify-center text-white font-semibold">
                        {patient.first_name?.charAt(0)}{patient.last_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{t('patient')}</p>
                        <p className="font-semibold text-gray-800">{patient.first_name} {patient.last_name}</p>
                    </div>
                </div>
            </div>

            {/* Medications List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="section-header mb-0 pb-0 border-0">
                        <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <Pill className="w-4 h-4 text-green-600" />
                        </span>
                        {t('medication')} List
                    </h3>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addMedication}
                        className="flex items-center gap-2 text-sm py-2 px-3"
                    >
                        <Plus className="w-4 h-4" />
                        {t('addMedication')}
                    </Button>
                </div>

                {/* Medication Rows */}
                <div className="space-y-3">
                    {medications.map((med, index) => (
                        <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 animate-fade-in"
                        >
                            {/* Medicine Name */}
                            <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {t('medicineName')} *
                                </label>
                                <div className="relative">
                                    <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={med.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        className="input-field pl-10"
                                        placeholder="e.g., Amoxicillin 500mg"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dosage, Duration, If Needed */}
                            <div className="flex flex-wrap items-end gap-3">
                                {/* Dosage Per Day */}
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        {t('dosagePerDay')}
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={med.dosagePerDay}
                                            onChange={(e) => updateMedication(index, 'dosagePerDay', e.target.value)}
                                            className="input-field pl-10 text-center"
                                            placeholder="3"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 text-center mt-1">times/day</p>
                                </div>

                                {/* Duration (Optional) */}
                                <div className="flex-1 min-w-[120px]">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        {t('durationDays')} <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            value={med.durationDays}
                                            onChange={(e) => updateMedication(index, 'durationDays', e.target.value)}
                                            className="input-field pl-10 text-center"
                                            placeholder="-"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 text-center mt-1">days</p>
                                </div>

                                {/* If Needed Toggle */}
                                <div className="flex-shrink-0">
                                    <label className="block text-xs font-medium text-gray-500 mb-1 text-center">
                                        Si besoin
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => updateMedication(index, 'ifNeeded', !med.ifNeeded)}
                                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${med.ifNeeded
                                                ? 'bg-green-100 border-green-500 text-green-700'
                                                : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-gray-400'
                                            }`}
                                    >
                                        {med.ifNeeded && <Check className="w-4 h-4" />}
                                        <span className="text-sm font-medium">
                                            {med.ifNeeded ? 'Oui' : 'Non'}
                                        </span>
                                    </button>
                                </div>

                                {/* Remove Button */}
                                <button
                                    type="button"
                                    onClick={() => removeMedication(index)}
                                    disabled={medications.length === 1}
                                    className={`p-2.5 rounded-lg transition-all ${medications.length === 1
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                                        }`}
                                    title={t('removeMedication')}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    {t('instructions')}
                </label>
                <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="Additional instructions for the patient..."
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    {t('cancel')}
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? t('loading') : t('save')}
                </Button>
            </div>
        </form>
    )
}

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { supabase } from '../../lib/supabase'

export const PatientForm = ({ patient, onSave, onCancel }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [doctors, setDoctors] = useState([])
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        phone_number: '',
        condition: '',
        assigned_doctor_id: '',
    })

    useEffect(() => {
        fetchDoctors()
        if (patient) {
            setFormData({
                first_name: patient.first_name || '',
                last_name: patient.last_name || '',
                date_of_birth: patient.date_of_birth || '',
                phone_number: patient.phone_number || '',
                condition: patient.condition || '',
                assigned_doctor_id: patient.assigned_doctor_id || '',
            })
        }
    }, [patient])

    const fetchDoctors = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name')
                .eq('role', 'doctor')
                .order('full_name')

            if (error) throw error
            setDoctors(data || [])
        } catch (error) {
            console.error('Error fetching doctors:', error)
        }
    }

    const calculateAge = (dob) => {
        if (!dob) return ''
        const birthDate = new Date(dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Convert names to uppercase
            const dataToSave = {
                ...formData,
                first_name: formData.first_name.toUpperCase(),
                last_name: formData.last_name.toUpperCase(),
            }

            if (patient) {
                // Update existing patient
                const { error } = await supabase
                    .from('patients')
                    .update({
                        ...dataToSave,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', patient.id)

                if (error) throw error
            } else {
                // Create new patient
                const { error } = await supabase
                    .from('patients')
                    .insert([dataToSave])

                if (error) throw error
            }

            onSave()
        } catch (error) {
            console.error('Error saving patient:', error)
            alert(t('error'))
        } finally {
            setLoading(false)
        }
    }

    const age = calculateAge(formData.date_of_birth)

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label={t('firstName')}
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    required
                />
                <Input
                    label={t('lastName')}
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Input
                        label={t('dateOfBirth')}
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                        required
                    />
                    {age && (
                        <p className="mt-2 text-sm text-primary-600 font-medium">
                            {t('age')}: {age} {age === 1 ? 'year' : 'years'}
                        </p>
                    )}
                </div>
                <Input
                    label={t('phoneNumber')}
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleChange('phone_number', e.target.value)}
                    required
                />
            </div>

            <Input
                label={t('condition')}
                value={formData.condition}
                onChange={(e) => handleChange('condition', e.target.value)}
                placeholder="e.g., Diabetes, Hypertension"
            />

            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                        {t('assignedDoctor')}
                    </label>
                    <button
                        type="button"
                        onClick={fetchDoctors}
                        className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        title="Refresh doctors list"
                    >
                        🔄 Refresh
                    </button>
                </div>
                <select
                    value={formData.assigned_doctor_id}
                    onChange={(e) => handleChange('assigned_doctor_id', e.target.value)}
                    className="input-field"
                >
                    <option value="">Select a doctor</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.full_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
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

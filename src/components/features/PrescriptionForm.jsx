import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { supabase } from '../../lib/supabase'

export const PrescriptionForm = ({ patient, onSave, onCancel }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        medication: '',
        dosage: '',
        instructions: '',
    })

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('prescriptions')
                .insert([{
                    ...formData,
                    patient_id: patient.id,
                    doctor_id: user.id,
                }])

            if (error) throw error

            onSave()
        } catch (error) {
            console.error('Error saving prescription:', error)
            alert(t('error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900">
                    {t('patient')}: <span className="font-bold">{patient.first_name} {patient.last_name}</span>
                </p>
            </div>

            <Input
                label={t('medication')}
                value={formData.medication}
                onChange={(e) => handleChange('medication', e.target.value)}
                required
                placeholder="e.g., Amoxicillin"
            />

            <Input
                label={t('dosage')}
                value={formData.dosage}
                onChange={(e) => handleChange('dosage', e.target.value)}
                required
                placeholder="e.g., 500mg, 3 times daily"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('instructions')}
                </label>
                <textarea
                    value={formData.instructions}
                    onChange={(e) => handleChange('instructions', e.target.value)}
                    className="input-field min-h-[100px]"
                    placeholder="Additional instructions for the patient..."
                />
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

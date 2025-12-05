import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Card } from '../../components/common/Card'
import { Button } from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { Input } from '../../components/common/Input'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react'

export const ScheduleManagement = () => {
    const { t } = useTranslation()
    const [schedules, setSchedules] = useState([])
    const [patients, setPatients] = useState([])
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState(null)
    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: '',
        duration_minutes: 30,
        status: 'scheduled',
        notes: '',
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [schedulesRes, patientsRes, doctorsRes] = await Promise.all([
                supabase
                    .from('schedules')
                    .select(`
            *,
            patient:patients(first_name, last_name),
            doctor:profiles!doctor_id(full_name)
          `)
                    .order('appointment_date', { ascending: true }),
                supabase.from('patients').select('id, first_name, last_name').order('first_name'),
                supabase.from('profiles').select('id, full_name').eq('role', 'doctor').order('full_name'),
            ])

            setSchedules(schedulesRes.data || [])
            setPatients(patientsRes.data || [])
            setDoctors(doctorsRes.data || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = () => {
        setSelectedSchedule(null)
        setFormData({
            patient_id: '',
            doctor_id: '',
            appointment_date: '',
            duration_minutes: 30,
            status: 'scheduled',
            notes: '',
        })
        setShowModal(true)
    }

    const handleEdit = (schedule) => {
        setSelectedSchedule(schedule)
        setFormData({
            patient_id: schedule.patient_id,
            doctor_id: schedule.doctor_id,
            appointment_date: schedule.appointment_date.slice(0, 16),
            duration_minutes: schedule.duration_minutes,
            status: schedule.status,
            notes: schedule.notes || '',
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!confirm(t('confirmDelete'))) return

        try {
            const { error } = await supabase.from('schedules').delete().eq('id', id)
            if (error) throw error
            fetchData()
        } catch (error) {
            console.error('Error deleting schedule:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (selectedSchedule) {
                const { error } = await supabase
                    .from('schedules')
                    .update({ ...formData, updated_at: new Date().toISOString() })
                    .eq('id', selectedSchedule.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('schedules').insert([formData])
                if (error) throw error
            }

            setShowModal(false)
            fetchData()
        } catch (error) {
            console.error('Error saving schedule:', error)
            alert(t('error'))
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">{t('schedules')}</h1>
                    <Button onClick={handleAdd} className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        {t('addSchedule')}
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="loading-spinner"></div>
                    </div>
                ) : schedules.length === 0 ? (
                    <Card>
                        <p className="text-center text-gray-500 py-8">{t('noData')}</p>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {schedules.map((schedule) => (
                            <Card key={schedule.id}>
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-gradient-to-br from-primary-500 to-medical-teal-500 rounded-lg">
                                                <CalendarIcon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {schedule.patient?.first_name} {schedule.patient?.last_name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Dr. {schedule.doctor?.full_name}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${schedule.status === 'scheduled'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : schedule.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}
                                        >
                                            {t(schedule.status)}
                                        </span>
                                    </div>

                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p>📅 {new Date(schedule.appointment_date).toLocaleString()}</p>
                                        <p>⏱️ {schedule.duration_minutes} minutes</p>
                                        {schedule.notes && <p className="text-xs italic">"{schedule.notes}"</p>}
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleEdit(schedule)}
                                            className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            {t('edit')}
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleDelete(schedule.id)}
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

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedSchedule ? t('editSchedule') : t('addSchedule')}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('patients')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.patient_id}
                            onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="">Select patient</option>
                            {patients.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.first_name} {p.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('doctor')} <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.doctor_id}
                            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                            className="input-field"
                            required
                        >
                            <option value="">Select doctor</option>
                            {doctors.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label={t('appointmentDate')}
                        type="datetime-local"
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        required
                    />

                    <Input
                        label={t('duration')}
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                        min="15"
                        step="15"
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {t('status')}
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="input-field"
                        >
                            <option value="scheduled">{t('scheduled')}</option>
                            <option value="completed">{t('completed')}</option>
                            <option value="cancelled">{t('cancelled')}</option>
                        </select>
                    </div>

                    <Input
                        label={t('notes')}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    )
}

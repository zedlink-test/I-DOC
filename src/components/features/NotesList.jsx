import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../common/Button'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Calendar, Save, X, ClipboardList } from 'lucide-react'

export const NotesList = ({ patientId, doctorId, userRole }) => {
    const { t } = useTranslation()
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [newNote, setNewNote] = useState('')
    const [currentUserRole, setCurrentUserRole] = useState(userRole || null)

    useEffect(() => {
        if (patientId) {
            fetchNotes()
            if (!userRole) {
                fetchUserRole()
            }
        }
    }, [patientId])

    const fetchUserRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setCurrentUserRole(profile.role)
                }
            }
        } catch (error) {
            console.error('Error fetching user role:', error)
        }
    }

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('visit_notes')
                .select('*')
                .eq('patient_id', patientId)
                .order('created_at', { ascending: false })

            if (error) throw error
            setNotes(data || [])
        } catch (error) {
            console.error('Error fetching notes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim()) return

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('visit_notes')
                .insert([{
                    patient_id: patientId,
                    doctor_id: user.id,
                    notes: newNote.trim(),
                }])

            if (error) throw error

            setNewNote('')
            setShowAddForm(false)
            fetchNotes()
        } catch (error) {
            console.error('Error adding note:', error)
            alert(t('error'))
        }
    }

    const handleUpdateNote = async (noteId, updatedContent) => {
        if (!updatedContent.trim()) return

        try {
            const { error } = await supabase
                .from('visit_notes')
                .update({ notes: updatedContent.trim() })
                .eq('id', noteId)

            if (error) throw error

            setEditingNote(null)
            fetchNotes()
        } catch (error) {
            console.error('Error updating note:', error)
            alert(t('error'))
        }
    }

    const handleDeleteNote = async (noteId) => {
        if (!confirm(t('confirmDelete'))) return

        try {
            const { error } = await supabase
                .from('visit_notes')
                .delete()
                .eq('id', noteId)

            if (error) throw error
            fetchNotes()
        } catch (error) {
            console.error('Error deleting note:', error)
            alert(t('error'))
        }
    }

    // Check if user can edit/delete notes (admin or doctor)
    const canEdit = currentUserRole === 'admin' || currentUserRole === 'doctor'
    // Check if user can add notes (admin or doctor)  
    const canAdd = currentUserRole === 'admin' || currentUserRole === 'doctor'

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center py-6">
                <div className="loading-spinner"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="section-header mb-0 pb-0 border-0">
                    <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-blue-600" />
                    </span>
                    {t('appointmentPlan')}
                </h3>
                {canAdd && !showAddForm && (
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 text-sm py-2 px-3"
                    >
                        <Plus className="w-4 h-4" />
                        {t('addNote')}
                    </Button>
                )}
            </div>

            {/* Add Note Form */}
            {showAddForm && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3 animate-fade-in">
                    <label className="block text-sm font-medium text-blue-800">
                        {t('whatToDo')}
                    </label>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="input-field min-h-[100px]"
                        placeholder="Describe what needs to be done at this appointment..."
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddForm(false)
                                setNewNote('')
                            }}
                            className="flex items-center gap-1 text-sm py-2 px-3"
                        >
                            <X className="w-4 h-4" />
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleAddNote}
                            className="flex items-center gap-1 text-sm py-2 px-3"
                        >
                            <Save className="w-4 h-4" />
                            {t('save')}
                        </Button>
                    </div>
                </div>
            )}

            {/* Secretary/Read-only notice */}
            {!canAdd && (
                <div className="text-sm text-gray-500 italic flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    <span>Viewing appointment notes (read-only)</span>
                </div>
            )}

            {/* Notes List */}
            {notes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No appointment notes yet</p>
                    <p className="text-sm">Add notes to track what needs to be done for each visit</p>
                </div>
            ) : (
                <div className="todo-list">
                    {notes.map((note) => (
                        <div key={note.id} className="todo-item animate-fade-in group">
                            {/* Checkbox indicator */}
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-5 h-5 rounded-full border-2 border-primary-400 bg-primary-50 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                                </div>
                            </div>

                            {/* Note Content */}
                            <div className="todo-item-content flex-1">
                                {editingNote === note.id ? (
                                    <div className="space-y-2">
                                        <textarea
                                            defaultValue={note.notes}
                                            className="input-field min-h-[80px] text-sm"
                                            id={`edit-note-${note.id}`}
                                            autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setEditingNote(null)}
                                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                                            >
                                                {t('cancel')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const textarea = document.getElementById(`edit-note-${note.id}`)
                                                    handleUpdateNote(note.id, textarea.value)
                                                }}
                                                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1"
                                            >
                                                <Save className="w-3 h-3" />
                                                {t('update')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-800 whitespace-pre-wrap">{note.notes}</p>
                                        <div className="todo-item-date">
                                            <Calendar className="w-3 h-3" />
                                            {formatDate(note.created_at)}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            {canEdit && editingNote !== note.id && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingNote(note.id)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title={t('edit')}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title={t('delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

import { createClient } from '@supabase/supabase-js'

export const handler = async (event, context) => {
    // Only allow POST or DELETE requests
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const { userId } = JSON.parse(event.body)
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Missing Supabase credentials' }),
        }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        // 1. Unassign patients from this doctor
        try {
            await supabase
                .from('patients')
                .update({ assigned_doctor_id: null })
                .eq('assigned_doctor_id', userId)
        } catch (e) {
            console.error('Error unassigning patients:', e)
            // Continue intentionally or throw? 
            // If we can't unassign, we probably can't delete user.
            throw new Error(`Failed to unassign patients: ${e.message}`)
        }

        // 2. Delete prescriptions created by this doctor
        try {
            const { error } = await supabase
                .from('prescriptions')
                .delete()
                .eq('doctor_id', userId)
            if (error) throw error
        } catch (e) {
            throw new Error(`Failed to delete prescriptions: ${e.message}`)
        }

        // 3. Delete schedules/appointments for this doctor
        try {
            const { error } = await supabase
                .from('schedules')
                .delete()
                .eq('doctor_id', userId)
            if (error) throw error
        } catch (e) {
            throw new Error(`Failed to delete schedules: ${e.message}`)
        }

        // 4. Delete user from Auth (this cascades to public.profiles)
        const { error } = await supabase.auth.admin.deleteUser(userId)

        if (error) throw error

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User deleted successfully' }),
        }
    } catch (error) {
        console.error('Error deleting user:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        }
    }
}

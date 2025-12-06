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
        // Delete user from Auth (this usually cascades to public.profiles if set up correctly)
        // If not, we can manually delete from profiles too, but let's start with Auth which is the permission blocker.
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

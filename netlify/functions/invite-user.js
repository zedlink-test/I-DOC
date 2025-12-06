import { createClient } from '@supabase/supabase-js'

export const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const { email, full_name, role, redirectTo } = JSON.parse(event.body)
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // ... (validation checks) ...

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    try {
        // Invite user by email
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                role,
                full_name,
            },
            redirectTo: redirectTo || process.env.URL || 'https://i-doc.netlify.app'
        })

        if (error) throw error

        // Create the profile immediately
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: data.user.id,
                role: role,
                full_name: full_name,
            }])

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Continue anyway, it might have been created by trigger if one exists
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Invitation sent successfully', user: data.user }),
        }
    } catch (error) {
        console.error('Error inviting user:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        }
    }
}

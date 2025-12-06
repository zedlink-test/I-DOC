import { createClient } from '@supabase/supabase-js'

export const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    const { email, password, full_name, role } = JSON.parse(event.body)
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
        // Create user with password directly
        // We use admin.createUser which allows setting password and auto-confirming email
        const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email so they can login immediately
            user_metadata: {
                role,
                full_name,
            }
        })

        if (createError) throw createError

        // Create profile entry
        // Note: triggers might handle this, but explicit insert ensures it exists with correct role
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
                {
                    id: user.id,
                    role,
                    full_name,
                },
            ])

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // We don't rollback user creation to avoid complexity, but we report it.
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User created successfully', user }),
        }
    } catch (error) {
        console.error('Error creating user:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        }
    }
}

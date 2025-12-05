# Deploying the User Creation Edge Function

This Edge Function allows admins to create new users (doctors and secretaries) from the admin dashboard.

## Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref phcvfdbrixsbtbkmvvsz
```

## Deploy the Function

From the I-DOC project root directory, run:

```bash
supabase functions deploy create-user
```

## Set Environment Variables

After deploying, you need to set the service role key:

1. Go to your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Run this command (replace YOUR_SERVICE_ROLE_KEY):

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

## Testing

The function will be available at:
```
https://phcvfdbrixsbtbkmvvsz.supabase.co/functions/v1/create-user
```

The admin dashboard will automatically use this endpoint when creating users.

## Alternative: Manual User Creation

If you prefer not to deploy the Edge Function, you can continue creating users manually through the Supabase Dashboard as you did for the admin user.

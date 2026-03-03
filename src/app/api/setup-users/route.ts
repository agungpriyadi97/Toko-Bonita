import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const results: { user: string; status: string; error?: string }[] = []

  // Get existing auth users
  const { data: { users: existingUsers } } = await supabase.auth.admin.listUsers()
  
  const adminEmail = 'admin@tokobonita.com'
  const cashierEmail = 'kasir1@tokobonita.com'

  // Find or create Admin User
  let adminUser = existingUsers?.find(u => u.email === adminEmail)
  
  if (!adminUser) {
    const { data: newAdmin, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'toko123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrator',
        role: 'admin'
      }
    })

    if (adminError) {
      results.push({ user: adminEmail, status: 'error', error: adminError.message })
    } else {
      adminUser = newAdmin.user
      results.push({ user: adminEmail, status: 'created in auth' })
    }
  } else {
    results.push({ user: adminEmail, status: 'already exists in auth' })
  }

  // Create profile for admin
  if (adminUser) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUser.id,
        full_name: 'Administrator',
        role: 'admin'
      }, { onConflict: 'id' })

    if (profileError) {
      results.push({ user: adminEmail, status: 'profile error', error: profileError.message })
    } else {
      results.push({ user: adminEmail, status: 'profile created/updated' })
    }
  }

  // Find or create Cashier User
  let cashierUser = existingUsers?.find(u => u.email === cashierEmail)
  
  if (!cashierUser) {
    const { data: newCashier, error: cashierError } = await supabase.auth.admin.createUser({
      email: cashierEmail,
      password: 'toko123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Siti Rahayu',
        role: 'cashier'
      }
    })

    if (cashierError) {
      results.push({ user: cashierEmail, status: 'error', error: cashierError.message })
    } else {
      cashierUser = newCashier.user
      results.push({ user: cashierEmail, status: 'created in auth' })
    }
  } else {
    results.push({ user: cashierEmail, status: 'already exists in auth' })
  }

  // Create profile for cashier
  if (cashierUser) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: cashierUser.id,
        full_name: 'Siti Rahayu',
        role: 'cashier'
      }, { onConflict: 'id' })

    if (profileError) {
      results.push({ user: cashierEmail, status: 'profile error', error: profileError.message })
    } else {
      results.push({ user: cashierEmail, status: 'profile created/updated' })
    }
  }

  // Final check - list all profiles
  const { data: profiles } = await supabase.from('profiles').select('*')

  return NextResponse.json({ 
    results,
    profiles: profiles,
    loginInfo: {
      admin: { email: adminEmail, password: 'toko123' },
      cashier: { email: cashierEmail, password: 'toko123' }
    }
  })
}

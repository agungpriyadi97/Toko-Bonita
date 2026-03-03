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

  const results: { action: string; status: string; error?: string }[] = []

  // Get all existing users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  // Find admin user
  const adminUser = users?.find(u => u.email === 'admin@tokobonita.com')
  const cashierUser = users?.find(u => u.email === 'kasir1@tokobonita.com')

  // Update admin password
  if (adminUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { 
        password: 'toko123',
        email_confirm: true 
      }
    )
    
    if (updateError) {
      results.push({ action: 'update admin password', status: 'error', error: updateError.message })
    } else {
      results.push({ action: 'update admin password', status: 'success' })
    }

    // Ensure profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: adminUser.id,
        full_name: 'Administrator',
        role: 'admin'
      }, { onConflict: 'id' })

    results.push({ 
      action: 'create/update admin profile', 
      status: profileError ? 'error' : 'success',
      error: profileError?.message
    })
  } else {
    results.push({ action: 'find admin user', status: 'not found' })
  }

  // Update cashier password
  if (cashierUser) {
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      cashierUser.id,
      { 
        password: 'toko123',
        email_confirm: true 
      }
    )
    
    if (updateError) {
      results.push({ action: 'update cashier password', status: 'error', error: updateError.message })
    } else {
      results.push({ action: 'update cashier password', status: 'success' })
    }

    // Ensure profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: cashierUser.id,
        full_name: 'Siti Rahayu',
        role: 'cashier'
      }, { onConflict: 'id' })

    results.push({ 
      action: 'create/update cashier profile', 
      status: profileError ? 'error' : 'success',
      error: profileError?.message
    })
  } else {
    results.push({ action: 'find cashier user', status: 'not found' })
  }

  return NextResponse.json({ 
    results,
    credentials: {
      admin: { email: 'admin@tokobonita.com', password: 'toko123' },
      cashier: { email: 'kasir1@tokobonita.com', password: 'toko123' }
    }
  })
}

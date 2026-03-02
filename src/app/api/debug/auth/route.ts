import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
  }

  // Use anon key for login test (same as client)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient(supabaseUrl, anonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ 
        success: false,
        error: error.message,
        email 
      }, { status: 400 })
    }

    // Get profile
    const adminClient = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    
    const { data: profile } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      profile,
      session: data.session ? 'created' : 'null'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Request failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

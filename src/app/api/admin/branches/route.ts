import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List branches
export async function GET() {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// POST - Create new branch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, address, phone } = body

    if (!name) {
      return NextResponse.json({ error: 'Nama cabang wajib diisi' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('branches')
      .insert({ name, address, phone })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// PUT - Update branch
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, address, phone } = body

    if (!id || !name) {
      return NextResponse.json({ error: 'ID dan nama wajib diisi' }, { status: 400 })
    }

    const { error } = await supabase
      .from('branches')
      .update({ name, address, phone })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating branch:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

// DELETE - Delete branch
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })
    }

    const { error } = await supabase
      .from('branches')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting branch:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}

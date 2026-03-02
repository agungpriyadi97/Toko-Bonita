import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    let userId = null
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ).auth.getUser(token)
      userId = user?.id
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      // If table doesn't exist or other common errors, return empty array
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return NextResponse.json({ notifications: [], unreadCount: 0 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get unread count
    let countQuery = supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('is_read', false)

    if (userId) {
      countQuery = countQuery.eq('user_id', userId)
    }

    const { count } = await countQuery

    return NextResponse.json({ 
      notifications: data || [], 
      unreadCount: count || 0 
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, message, data, user_id, branch_id } = body

    if (!type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        type,
        title,
        message,
        data: data || {},
        user_id,
        branch_id,
        is_read: false
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return success anyway (graceful degradation)
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        console.log('Notifications table does not exist, skipping notification')
        return NextResponse.json({ success: true, notification: null })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Mark notifications as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, markAllRead } = body

    if (markAllRead) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 })
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', ids)

    if (error) {
      if (error.code === '42P01' || error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Clear all notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clearAll = searchParams.get('all') === 'true'
    const ids = searchParams.get('ids')?.split(',')

    if (clearAll) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (error) {
        if (error.code === '42P01') {
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (ids && ids.length > 0) {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids)

      if (error) {
        if (error.code === '42P01') {
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

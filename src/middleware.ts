import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && key && url.startsWith('http') && key.length > 10
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // If Supabase is not configured, skip auth checks for public pages
  if (!isSupabaseConfigured()) {
    const { pathname } = request.nextUrl
    
    // Allow public pages
    const publicPaths = ['/', '/products', '/about', '/contact', '/auth/login']
    const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/products/'))
    
    // Redirect dashboard to login if not configured
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('error', 'supabase_not_configured')
      return NextResponse.redirect(url)
    }
    
    if (isPublicPath) {
      return supabaseResponse
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ['/', '/products', '/about', '/contact', '/auth/login']
  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith('/products/'))

  // If no user and trying to access protected route
  if (!user && !isPublicPath && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login page
  if (user && pathname === '/auth/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (profile?.role === 'admin') {
      url.pathname = '/dashboard/admin'
    } else {
      url.pathname = '/dashboard/cashier'
    }
    return NextResponse.redirect(url)
  }

  // Redirect /dashboard to role-specific dashboard
  if (user && pathname === '/dashboard') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    if (profile?.role === 'admin') {
      url.pathname = '/dashboard/admin'
    } else {
      url.pathname = '/dashboard/cashier'
    }
    return NextResponse.redirect(url)
  }

  // Role-based access control for dashboard routes
  if (user && pathname.startsWith('/dashboard/')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const isAdminRoute = pathname.startsWith('/dashboard/admin')

    // Cashier trying to access admin routes
    if (!isAdmin && isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/cashier'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

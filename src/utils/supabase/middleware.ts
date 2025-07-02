import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = 'https://swnwsxfqndhcezshrivv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bndzeGZxbmRoY2V6c2hyaXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNjE0NjcsImV4cCI6MjA2NjYzNzQ2N30.k8NB4DFSDYpLtSFFR21C0wZLtEICCBxmqRiGdVAVoCg'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  let user = null
  let authError = null
  
  try {
    const {
      data: { user: authUser },
      error
    } = await supabase.auth.getUser()
    
    user = authUser
    authError = error
    
    // Log auth errors for debugging
    if (error) {
      console.warn('Auth error in middleware:', error.message)
    }
  } catch (error: any) {
    console.error('Critical auth error in middleware:', error.message)
    authError = error
  }

  // If there's an auth error related to refresh tokens, clear cookies and redirect
  if (authError && (
    authError.message?.includes('refresh_token_not_found') ||
    authError.message?.includes('Invalid Refresh Token') ||
    authError.message?.includes('JWT')
  )) {
    console.log('Invalid token detected in middleware, clearing session...')
    
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    
    const response = NextResponse.redirect(url)
    
    // Clear all auth-related cookies
    const cookiesToClear = ['sb-access-token', 'sb-refresh-token']
    cookiesToClear.forEach(cookieName => {
      response.cookies.delete(cookieName)
    })
    
    return response
  }

  // If no user is found and the request is not for login/auth pages, redirect to login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  return supabaseResponse
} 
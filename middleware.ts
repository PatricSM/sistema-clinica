import { NextResponse, type NextRequest } from 'next/server'
import { validateAuthToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  try {
    // Obter o token do cookie
    const token = request.cookies.get('auth-token')?.value

    // URLs públicas que não precisam de autenticação
    const publicPaths = ['/login', '/auth/confirm', '/auth/auth-code-error']
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

    // APIs que não precisam de middleware de autenticação
    const publicApiPaths = ['/api/auth/']
    const isPublicApi = publicApiPaths.some(path => request.nextUrl.pathname.startsWith(path))

    if (isPublicApi) {
      return NextResponse.next()
    }

    // Se não há token e não é uma página pública, redirecionar para login
    if (!token && !isPublicPath) {
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Se há token, validar
    if (token) {
      const user = await validateAuthToken(token)
      
      if (!user) {
        // Token inválido - limpar cookie e redirecionar para login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('auth-token')
        return response
      }

      // Se está na página inicial, redirecionar baseado no role
      if (request.nextUrl.pathname === '/') {
        const roleRedirects = {
          admin: '/admin',
          professional: '/medico',
          secretary: '/secretaria',
          patient: '/paciente'
        }
        
        const redirectUrl = new URL(roleRedirects[user.role as keyof typeof roleRedirects] || '/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Se já está logado e tenta acessar login, redirecionar para dashboard
      if (request.nextUrl.pathname === '/login') {
        const dashboardUrl = new URL('/', request.url)
        return NextResponse.redirect(dashboardUrl)
      }

      // Verificar permissões de acesso por role
      const protectedRoutes = {
        '/admin': ['admin'],
        '/medico': ['admin', 'professional'],
        '/secretaria': ['admin', 'secretary'],
        '/paciente': ['admin', 'patient']
      }

      for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
        if (request.nextUrl.pathname.startsWith(route) && !allowedRoles.includes(user.role)) {
          // Usuário não tem permissão - redirecionar para página apropriada
          const roleRedirects = {
            admin: '/admin',
            professional: '/medico',
            secretary: '/secretaria',
            patient: '/paciente'
          }
          
          const redirectUrl = new URL(roleRedirects[user.role as keyof typeof roleRedirects] || '/login', request.url)
          return NextResponse.redirect(redirectUrl)
        }
      }

      // Adicionar headers com informações do usuário para as APIs
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', user.id.toString())
      requestHeaders.set('x-user-role', user.role)
      requestHeaders.set('x-user-email', user.email)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }

    return NextResponse.next()

  } catch (error: any) {
    console.error('❌ Middleware error:', error.message)
    
    // Em caso de erro, redirecionar para login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 
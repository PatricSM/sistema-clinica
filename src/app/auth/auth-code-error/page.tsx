import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Erro na Autenticação
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Houve um problema ao confirmar sua autenticação. O link pode ter expirado ou ser inválido.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar ao Login
          </Link>
        </div>
      </div>
    </div>
  )
} 
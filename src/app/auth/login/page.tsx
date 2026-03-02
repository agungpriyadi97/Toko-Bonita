import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Masuk ke Akun
            </h1>
            <p className="text-gray-600">
              Masuk untuk mengakses dashboard
            </p>
          </div>
          
          <LoginForm />
        </div>
      </main>

      <Footer />
    </div>
  )
}

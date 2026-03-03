import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Heart, Users, Clock, Baby, Sparkles } from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Kualitas Terjamin',
    description: 'Kami hanya menyediakan produk original dengan kualitas terbaik untuk pelanggan kami. Setiap produk dipilih dengan teliti untuk memastikan keamanan dan kepuasan Anda.',
  },
  {
    icon: Users,
    title: 'Pelayanan Prima',
    description: 'Tim kami siap membantu Anda dengan sepenuh hati dan memberikan rekomendasi produk terbaik sesuai kebutuhan Anda dan keluarga.',
  },
  {
    icon: Award,
    title: 'Harga Bersaing',
    description: 'Kami menawarkan harga yang kompetitif tanpa mengorbankan kualitas produk. Nikmati berbagai promo dan diskon menarik setiap saat.',
  },
  {
    icon: Clock,
    title: 'Buka Setiap Hari',
    description: 'Buka setiap hari untuk melayani kebutuhan belanja Anda dan keluarga. Kami siap membantu dari pagi hingga malam.',
  },
]

const milestones = [
  { year: '2023', event: 'Toko Bonita didirikan di Jl Keramat Raya Bencongan Indah, Kelapa Dua, Tangerang' },
  { year: '2023', event: 'Menambah kategori produk bayi dan perlengkapan' },
  { year: '2024', event: 'Melayani lebih dari 1.000 pelanggan setia' },
  { year: '2025', event: 'Meluncurkan sistem kasir digital modern' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tentang <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Toko Bonita</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Toko Bonita adalah toko retail yang menyediakan produk kecantikan berkualitas dan 
                perlengkapan bayi lengkap. Didirikan pada tahun 2023, kami berkomitmen untuk 
                memberikan produk terbaik dengan harga terjangkau bagi keluarga Indonesia.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section with Image */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Cerita Kami
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Toko Bonita bermula dari sebuah impian sederhana: menyediakan produk kecantikan 
                    dan perlengkapan bayi berkualitas dengan harga yang terjangkau oleh semua kalangan. 
                    Berawal dari sebuah toko di Jl Keramat Raya Bencongan Indah, Kelapa Dua, Tangerang, 
                    kami membangun kepercayaan pelanggan melalui pelayanan yang tulus dan produk yang original.
                  </p>
                  <p>
                    Nama "Bonita" berasal dari bahasa Spanyol yang berarti "cantik", mencerminkan 
                    komitmen kami untuk membantu setiap pelanggan tampil cantik dan percaya diri. 
                    Seiring berjalannya waktu, kami juga menyadari pentingnya kebutuhan bayi dan 
                    anak-anak, sehingga kami memperluas koleksi kami dengan produk perlengkapan bayi.
                  </p>
                  <p>
                    Kini, Toko Bonita terus berkembang dan melayani pelanggan dengan sistem kasir 
                    modern. Namun satu hal yang tidak pernah berubah: komitmen kami untuk 
                    memberikan yang terbaik.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src="/images/store-interior.png" 
                    alt="Interior Toko Bonita"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-pink-200 rounded-full opacity-50 blur-2xl" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-purple-200 rounded-full opacity-50 blur-2xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Nilai-Nilai Kami
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nilai-nilai yang kami pegang teguh dalam melayani setiap pelanggan
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Perjalanan Kami
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Milestone penting dalam sejarah Toko Bonita
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {milestone.year.slice(-2)}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-16 bg-pink-200" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="font-bold text-pink-600">{milestone.year}</p>
                    <p className="text-gray-600">{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

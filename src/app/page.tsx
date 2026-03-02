import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ImageCarousel } from '@/components/home/image-carousel'
import Link from 'next/link'
import { ArrowRight, Baby, Sparkles, Heart, Truck, Shield, Clock } from 'lucide-react'

const categories = [
  {
    name: 'Kosmetik',
    description: 'Produk kecantikan berkualitas',
    icon: Sparkles,
    href: '/products?category=kosmetik',
    image: '/images/category-kosmetik.png',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Skincare',
    description: 'Perawatan kulit wajah',
    icon: Heart,
    href: '/products?category=skincare',
    image: '/images/category-skincare.png',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Susu Bayi',
    description: 'Susu formula terbaik',
    icon: Baby,
    href: '/products?category=susu-bayi',
    image: '/images/category-susu-bayi.png',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Diapers',
    description: 'Popok nyaman untuk si kecil',
    icon: Baby,
    href: '/products?category=diapers',
    image: '/images/category-diapers.png',
    color: 'from-green-500 to-emerald-500',
  },
]

const features = [
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    description: 'Layanan pengiriman ke seluruh Indonesia',
  },
  {
    icon: Shield,
    title: 'Produk Original',
    description: 'Jaminan keaslian semua produk',
  },
  {
    icon: Clock,
    title: 'Buka Setiap Hari',
    description: 'Senin - Minggu, 08:00 - 21:00',
  },
]

const heroImages = [
  {
    src: '/images/hero-products.png',
    alt: 'Produk Toko Bonita',
    title: 'Produk Berkualitas',
    description: 'Kosmetik & Perlengkapan Bayi Terlengkap'
  },
  {
    src: '/images/store-interior.png',
    alt: 'Interior Toko Bonita',
    title: 'Toko Nyaman',
    description: 'Pengalaman Belanja yang Menyenangkan'
  },
  {
    src: '/images/happy-customer.png',
    alt: 'Pelanggan Puas',
    title: 'Pelanggan Bahagia',
    description: 'Ribuan Pelanggan Terlayani dengan Baik'
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Image Carousel */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div className="max-w-xl order-2 md:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                Kecantikan & Perlengkapan Bayi{' '}
                <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Terlengkap
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8">
                Temukan produk kecantikan berkualitas dan perlengkapan bayi lengkap dengan harga terjangkau. 
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 w-full sm:w-auto">
                  <Link href="/products">
                    Lihat Produk
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/contact">Hubungi Kami</Link>
                </Button>
              </div>
            </div>
            <div className="relative order-1 md:order-2">
              <ImageCarousel images={heroImages} />
            </div>
          </div>
        </div>
        
        {/* Decorative elements - hidden on mobile */}
        <div className="hidden md:block absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-50 blur-3xl" />
        <div className="hidden md:block absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-50 blur-3xl" />
      </section>

      {/* Categories Section */}
      <section className="py-10 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
              Kategori Produk
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Pilih kategori produk yang Anda butuhkan
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="aspect-square relative overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 text-white">
                        <div className="flex items-center gap-1 md:gap-2 mb-1">
                          <div className={`w-7 h-7 md:w-10 md:h-10 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                            <category.icon className="h-3 w-3 md:h-5 md:w-5 text-white" />
                          </div>
                          <h3 className="text-sm md:text-xl font-semibold">
                            {category.name}
                          </h3>
                        </div>
                        <p className="text-white/80 text-xs md:text-sm hidden sm:block">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-2 md:mb-4">
                  <feature.icon className="h-5 w-5 md:h-8 md:w-8 text-white" />
                </div>
                <h3 className="text-xs sm:text-sm md:text-xl font-semibold text-gray-900 mb-1 md:mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-xs md:text-base hidden sm:block">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-16 bg-gradient-to-r from-pink-500 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-xl md:text-4xl font-bold text-white mb-2 md:mb-4">
            Kunjungi Toko Kami Sekarang
          </h2>
          <p className="text-white/90 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
            Temukan berbagai produk kecantikan dan perlengkapan bayi dengan harga terbaik
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-pink-600 hover:bg-gray-100 text-sm md:text-base">
            <Link href="/contact">
              Lihat Lokasi Toko
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingBag, 
  Baby, 
  Sparkles, 
  Truck, 
  Shield, 
  Headphones,
  ArrowRight,
  Star
} from 'lucide-react'

const categories = [
  {
    name: 'Kosmetik',
    slug: 'kosmetik',
    description: 'Produk kecantikan wajah',
    image: '/images/category-kosmetik.jpg',
    color: 'from-pink-500 to-rose-500'
  },
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Perawatan kulit wajah',
    image: '/images/category-skincare.jpg',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Susu Bayi',
    slug: 'susu-bayi',
    description: 'Susu formula bayi & anak',
    image: '/images/category-susu.jpg',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Diapers',
    slug: 'diapers',
    description: 'Popok bayi berkualitas',
    image: '/images/category-diapers.jpg',
    color: 'from-green-500 to-teal-500'
  },
  {
    name: 'Perlengkapan Bayi',
    slug: 'perlengkapan-bayi',
    description: 'Kebutuhan bayi lengkap',
    image: '/images/category-baby.jpg',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    name: 'Sabun & Shampo',
    slug: 'sabun-shampo',
    description: 'Produk mandi keluarga',
    image: '/images/category-soap.jpg',
    color: 'from-cyan-500 to-blue-500'
  }
]

const features = [
  {
    icon: Truck,
    title: 'Pengiriman Cepat',
    description: 'Pengiriman ke seluruh wilayah Tangerang dan sekitarnya'
  },
  {
    icon: Shield,
    title: 'Produk Original',
    description: 'Semua produk dijamin keasliannya 100%'
  },
  {
    icon: Headphones,
    title: 'Layanan Pelanggan',
    description: 'Tim kami siap membantu Anda setiap hari'
  }
]

const testimonials = [
  {
    name: 'Ibu Sari',
    role: 'Pelanggan Setia',
    content: 'Pelayanan sangat ramah, produk lengkap dan harga bersaing. Sudah jadi langganan sejak 2020!',
    rating: 5
  },
  {
    name: 'Ibu Dewi',
    role: 'Pelanggan Baru',
    content: 'Cari susu dan diapers untuk bayi selalu di sini. Praktis dan terpercaya.',
    rating: 5
  },
  {
    name: 'Mbak Rina',
    role: 'Pelanggan',
    content: 'Kosmetik original dengan harga terjangkau. Recommended banget!',
    rating: 5
  }
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Diskon hingga 20%
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Kecantikan & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  Perlengkapan Bayi
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Toko Bonita menyediakan produk kecantikan berkualitas dan perlengkapan bayi lengkap dengan harga terjangkau.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Lihat Produk
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    Tentang Kami
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full opacity-20 blur-3xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                      <Baby className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">Toko Bonita</p>
                    <p className="text-gray-500">Kecantikan & Perlengkapan Bayi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="p-3 bg-rose-100 rounded-xl">
                  <feature.icon className="h-6 w-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Produk</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai produk kebutuhan kecantikan dan perlengkapan bayi dengan kualitas terbaik
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`aspect-square bg-gradient-to-br ${category.color} p-6 flex flex-col items-center justify-center text-white`}>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <span className="text-2xl">
                          {category.slug === 'kosmetik' && '💄'}
                          {category.slug === 'skincare' && '✨'}
                          {category.slug === 'susu-bayi' && '🍼'}
                          {category.slug === 'diapers' && '👶'}
                          {category.slug === 'perlengkapan-bayi' && '🧸'}
                          {category.slug === 'sabun-shampo' && '🧴'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-center text-sm">{category.name}</h3>
                      <p className="text-xs text-white/80 text-center mt-1">{category.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Pelanggan Kami</h2>
            <p className="text-gray-600">Testimoni dari pelanggan setia Toko Bonita</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Kunjungi Toko Bonita Sekarang!
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Dapatkan produk kecantikan dan perlengkapan bayi berkualitas dengan harga terbaik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Lihat Semua Produk
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-rose-600">
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

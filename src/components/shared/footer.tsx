import Link from 'next/link'
import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-3 md:mb-4">
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Toko Bonita
              </span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md text-sm md:text-base">
              Toko Bonita menyediakan produk kecantikan berkualitas dan perlengkapan bayi lengkap 
              dengan harga terjangkau. Melayani dengan sepenuh hati sejak 2023.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Tautan Cepat</h3>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base">
                  Produk
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-pink-400 transition-colors text-sm md:text-base">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Hubungi Kami</h3>
            <ul className="space-y-2 md:space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm md:text-base">
                  Jl Keramat Raya Bencongan Indah, Kec Kelapa Dua, Kab Tangerang
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-pink-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm md:text-base">021-1234567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 md:h-5 md:w-5 text-pink-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm md:text-base">info@tokobonita.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} Toko Bonita. Semua hak dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}

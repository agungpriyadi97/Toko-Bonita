import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, MapPin, Phone, Clock, MessageCircle } from 'lucide-react'

const contactInfo = [
  {
    icon: MapPin,
    title: 'Alamat',
    content: 'Jl Keramat Raya Bencongan Indah, Kec Kelapa Dua, Kab Tangerang',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: Phone,
    title: 'Telepon',
    content: '021-1234567',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@tokobonita.com',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Clock,
    title: 'Jam Operasional',
    content: 'Senin - Minggu: 08:00 - 21:00',
    color: 'bg-green-100 text-green-600',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Hubungi <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">Kami</span>
              </h1>
              <p className="text-lg text-gray-600">
                Ada pertanyaan? Jangan ragu untuk menghubungi kami. Tim kami siap membantu Anda.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Kirim Pesan</h2>
                      <p className="text-sm text-gray-500">Isi form di bawah untuk menghubungi kami</p>
                    </div>
                  </div>
                  
                  <form className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <Input id="name" placeholder="Masukkan nama Anda" />
                      </div>
                      <div>
                        <Label htmlFor="phone">No. Telepon</Label>
                        <Input id="phone" placeholder="Masukkan no. telepon" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Masukkan email Anda" />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subjek</Label>
                      <Input id="subject" placeholder="Subjek pesan" />
                    </div>
                    <div>
                      <Label htmlFor="message">Pesan</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Tulis pesan Anda di sini..."
                        rows={5}
                      />
                    </div>
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                      Kirim Pesan
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Contact Info Cards */}
                <div className="grid grid-cols-2 gap-4">
                  {contactInfo.map((info) => (
                    <Card key={info.title} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center flex-shrink-0`}>
                          <info.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{info.title}</p>
                          <p className="text-xs text-gray-600">{info.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* WhatsApp Quick Contact */}
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg">Chat via WhatsApp</p>
                        <p className="text-white/80 text-sm">Respon cepat dalam hitungan menit</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 bg-white text-green-600 hover:bg-gray-100">
                      Chat Sekarang
                    </Button>
                  </CardContent>
                </Card>

                {/* Map */}
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-900">Lokasi Toko</h3>
                      <p className="text-sm text-gray-500">Kunjungi toko kami langsung</p>
                    </div>
                    <div className="aspect-video">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.321155361472!2d106.60621382153548!3d-6.221314752501655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69ff1d0c2a71c5%3A0x157ded8ec5c8f1e4!2sBonitas%20kosmetik%2C%20susu%20dan%20diapers!5e0!3m2!1sid!2sid!4v1772093986593!5m2!1sid!2sid" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full min-h-[250px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonial */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-pink-50 to-purple-50 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-4">
                      <span className="text-pink-500 text-4xl">"</span>
                    </div>
                    <p className="text-lg text-gray-700 mb-6 italic">
                      Belanja di Toko Bonita sangat menyenangkan! Pelayanannya ramah, produknya lengkap, 
                      dan harganya terjangkau. Saya selalu beli perlengkapan bayi dan kosmetik di sini. 
                      Pokoknya the best deh!
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">Ibu Siti Rahayu</p>
                      <p className="text-sm text-gray-500">Pelanggan Setia sejak 2018</p>
                    </div>
                  </div>
                  <div className="relative h-64 md:h-auto">
                    <img 
                      src="/images/happy-customer.png" 
                      alt="Pelanggan Bahagia"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-50/80 to-transparent md:block hidden" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

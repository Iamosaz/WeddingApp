import { FiCalendar, FiClock, FiMapPin, FiHeart, FiNavigation } from 'react-icons/fi';

export default function WeddingDetails() {
  const venueAddress = "Molete town, Ibeju-Lekki, Lagos, Nigeria";
  // Direct Google Maps search URL for navigation
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;
  // Embed URL for the iframe map preview
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(venueAddress)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const details = [
    {
      icon: <FiCalendar className="w-8 h-8 text-[#D4AF37]" />,
      title: 'The Date',
      line1: 'Saturday, 31st October 2026',
      line2: 'Kindly be seated 15 mins before start',
      image: '/PnB.png',
    },
    {
      icon: <FiClock className="w-8 h-8 text-[#D4AF37]" />,
      title: 'The Time',
      line1: 'Solemnization: 10:00 AM prompt',
      line2: 'Traditional Ceremony to follow',
      image: '/PnB1.png',
    },
    {
      icon: <FiMapPin className="w-8 h-8 text-[#D4AF37]" />,
      title: 'The Venue',
      line1: 'The Family Compound of Mr and Mrs Adeleke',
      line2: 'Molete Town, Ibeju Lekki, Lagos, Nigeria',
      image: '/PnB3.png',
    },
    {
      icon: <FiHeart className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Color of the Day',
      line1: 'Rich Wine & Earthy Brown',
      line2: 'Traditional Aso Ebi / Formal Elegance',
      hasColorPreview: true,
      image: '/PnB2.png',
    },
  ];

  return (
    <section id="details" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1A080C]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#F3E5AB] font-semibold mb-2">
            Important Information
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            Wedding Details
          </h2>
          <div className="flex items-center justify-center space-x-3 my-4">
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-lg">❦</span>
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
          </div>
          <p className="text-sm sm:text-base text-white/80">
            We are honored to have you celebrate this milestone with us. Here is everything you need to know for the day.
          </p>
        </div>

        {/* 4 Details Cards with Pristine Images and Crisp Glass Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {details.map((item, index) => (
            <div
              key={index}
              className="group relative min-h-[380px] rounded-2xl overflow-hidden shadow-xl border border-white/15 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/50 flex flex-col justify-end"
            >
              {/* Background Image: Crisp and bright */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Natural subtle photo gradient: Keeps the image pristine and original */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

              {/* Float Glass Panel Wrapper */}
              <div className="relative z-10 m-3 p-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center text-center transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
                
                {/* Floating Glass Icon Circle */}
                <div className="w-14 h-14 bg-white/10 border border-white/25 rounded-full flex items-center justify-center mb-3 shadow-md">
                  {item.icon}
                </div>

                <h3 className="text-lg font-serif font-bold text-white mb-1.5 drop-shadow">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-[#F3E5AB] mb-1 drop-shadow-sm">
                  {item.line1}
                </p>
                <p className="text-[11px] text-white/85">
                  {item.line2}
                </p>

                {/* Color Swatches */}
                {item.hasColorPreview && (
                  <div className="flex items-center justify-center space-x-3 mt-3">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[#722F37] shadow-md border border-white/50"></div>
                      <span className="text-[9px] font-medium text-white/90 mt-0.5">Wine</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-[#5C2C16] shadow-md border border-white/50"></div>
                      <span className="text-[9px] font-medium text-white/90 mt-0.5">Brown</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Location Card & Working Interactive Google Map */}
        <div className="bg-white/5 rounded-3xl overflow-hidden shadow-2xl border border-white/15 flex flex-col lg:flex-row">
          
          {/* Address Details with Couple Image Underneath */}
          <div className="relative lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-end min-h-[520px] text-white overflow-hidden">
            
            {/* Background Image */}
            <img
              src="/PnB.png"
              alt="Bride and Groom"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Sharp Natural vignette to preserve image quality while text stays readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

            {/* Clear Transparent Floating Glass Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
              <span className="text-xs uppercase tracking-widest text-[#F3E5AB] font-bold mb-2 block">
                Venue Location
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold mb-3 text-white drop-shadow">
                The Family Compound of Mr and Mrs Adeleke
              </h3>
              <p className="text-white/90 text-xs sm:text-sm leading-relaxed mb-6">
                Join us for a heartfelt and joyful celebration. Secure parking and security will be available on-site for all registered guests.
              </p>
              <div className="space-y-3 text-xs sm:text-sm text-[#F3E5AB]">
                <p className="flex items-start gap-2">
                  <span className="shrink-0">📍</span>
                  <span>Molete Town, Ibeju-Lekki, Lagos, Nigeria</span>
                </p>
                <p className="flex items-start gap-2 text-white/90">
                  <span className="shrink-0">🔒</span>
                  <span>Strictly by invitation • Entrance requires your unique code</span>
                </p>
              </div>

              <div className="mt-6">
                <a
                  href={mapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-6 py-3.5 rounded-full font-bold text-xs uppercase tracking-widest shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  <FiNavigation className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Real Live Google Map Embed */}
          <div className="lg:w-1/2 min-h-[380px] lg:min-h-full bg-[#1A080C]">
            <iframe
              title="Wedding Venue Location Map"
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '100%' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

        </div>

      </div>
    </section>
  );
}
import { FiCalendar, FiClock, FiMapPin, FiHeart, FiNavigation } from 'react-icons/fi';

export default function WeddingDetails() {
  const venueAddress = "No. 17 Imam Salaudeen Street, Ibeju-Lekki, Lagos, Nigeria";
  // Direct Google Maps search URL for navigation
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueAddress)}`;
  // Embed URL for the iframe map preview
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(venueAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const details = [
    {
      icon: <FiCalendar className="w-8 h-8 text-[#D4AF37]" />,
      title: 'The Date',
      line1: 'Saturday, 15th October 2026',
      line2: 'Kindly be seated 15 mins before start',
    },
    {
      icon: <FiClock className="w-8 h-8 text-[#D4AF37]" />,
      title: 'The Time',
      line1: 'Solemnization: 10:00 AM prompt',
      line2: 'Reception: 1:00 PM',
    },
    {
      icon: <FiMapPin className="w-8 h-8 text-[#D4AF37]" />,
      title: 'The Venue',
      line1: 'The Family House of Mr and Mrs Eze',
      line2: 'Ibeju-Lekki, Lagos, Nigeria',
    },
    {
      icon: <FiHeart className="w-8 h-8 text-[#D4AF37]" />,
      title: 'Color of the Day',
      line1: 'Rich Wine & Earthy Brown',
      line2: 'Traditional Aso-Ebi / Formal Elegance',
      hasColorPreview: true,
    },
  ];

  return (
    <section id="details" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
      <div className="max-w-6xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#722F37] font-semibold mb-2">
            Important Information
          </p>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A151D]">
            Wedding Details
          </h2>
          <div className="flex items-center justify-center space-x-3 my-4">
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-lg">❦</span>
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            We are honored to have you celebrate this milestone with us. Here is everything you need to know for the day.
          </p>
        </div>

        {/* 4 Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {details.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-[#D4AF37]/20 flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-[#4A151D]/5 rounded-full flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-[#4A151D] mb-2">
                {item.title}
              </h3>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                {item.line1}
              </p>
              <p className="text-xs text-gray-500">
                {item.line2}
              </p>

              {/* Color Swatches */}
              {item.hasColorPreview && (
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#722F37] shadow-md border-2 border-white"></div>
                    <span className="text-[10px] font-medium text-gray-600 mt-1">Wine</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-[#5C2C16] shadow-md border-2 border-white"></div>
                    <span className="text-[10px] font-medium text-gray-600 mt-1">Brown</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Location Card & Working Interactive Google Map */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-[#D4AF37]/30 flex flex-col lg:flex-row">
          
          {/* Address Details */}
          <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center bg-gradient-to-br from-[#4A151D] to-[#3B1B0D] text-white">
            <span className="text-xs uppercase tracking-widest text-[#F3E5AB] font-semibold mb-2">
              Venue Location
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold mb-4 text-[#FDFBF7]">
              The Family House of Mr and Mrs Eze
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              Join us for a heartfelt and joyful celebration. Secure parking and security will be available on-site for all registered guests.
            </p>
            <div className="space-y-3 text-xs sm:text-sm text-[#F3E5AB]">
              <p className="flex items-start gap-2">
                <span>📍</span>
                <span>No. 17 Imam Salaudeen Street, Ibeju-Lekki, Lagos Nigeria</span>
              </p>
              <p className="flex items-start gap-2 text-white/90">
                <span>🔒</span>
                <span>Strictly by invitation • Entrance requires your unique code</span>
              </p>
            </div>

            <div className="mt-8">
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

          {/* Real Live Google Map Embed */}
          <div className="lg:w-1/2 h-72 sm:h-96 lg:h-auto min-h-[320px] bg-gray-100">
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
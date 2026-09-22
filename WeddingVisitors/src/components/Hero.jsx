import { Link } from 'react-router-dom';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi';

export default function Hero() {
  return (
    <section className="relative w-full h-[92vh] sm:h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* 1. Looping Engagement Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center opacity-70 filter brightness-90"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 2. Wine & Brown Gradient Overlay for high readability and warm theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4A151D]/60 via-[#5C2C16]/50 to-[#3B1B0D]/80 mix-blend-multiply" />

      {/* 3. Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white flex flex-col items-center justify-center">
        
        {/* Wedding Logo Monogram with soft gold glow */}
        <div className="mb-6 animate-fade-in">
          <img
            src="/logo.png"
            alt="Couple Logo"
            className="h-28 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.4)]"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#F3E5AB] font-medium mb-3">
          Together with their families
        </p>

        {/* Couple Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-md">
          Precious <span className="text-[#D4AF37] font-normal">&</span> Bright
        </h1>

        {/* Decorative divider */}
        <div className="flex items-center justify-center space-x-4 my-4 w-full">
          <div className="h-[1px] w-16 sm:w-28 bg-[#D4AF37]/60"></div>
          <span className="text-[#D4AF37] text-lg sm:text-xl">❦</span>
          <div className="h-[1px] w-16 sm:w-28 bg-[#D4AF37]/60"></div>
        </div>

        {/* Date & Location preview */}
        <p className="text-base sm:text-xl md:text-2xl text-white/95 font-light tracking-wide mb-2">
          Saturday, 15th October 2026
        </p>
        <p className="text-xs sm:text-sm md:text-base text-[#F3E5AB]/90 tracking-wider uppercase mb-8">
          No. 17 Imam Salaudeen Street • Ibeju-Lekki, Lagos Nigeria
        </p>

        {/* Action Buttons (Optimized for touch on mobile) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link
            to="/rsvp"
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-8 py-3.5 rounded-full font-bold text-base tracking-widest uppercase shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-center"
          >
            💌 Confirm Attendance (RSVP)
          </Link>
          <Link
            to="/gallery"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-[#D4AF37]/50 backdrop-blur-md px-8 py-3.5 rounded-full font-semibold text-base tracking-wider uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 text-center"
          >
            📸 Live Gallery
          </Link>
        </div>

        <p className="mt-6 text-[11px] sm:text-xs text-white/70 tracking-widest uppercase">
          Strictly by invitation • Maximum 150 guests
        </p>
      </div>

      {/* Down arrow indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#D4AF37]/80 animate-bounce">
        <HiOutlineChevronDoubleDown className="w-6 h-6" />
      </div>
    </section>
  );
}
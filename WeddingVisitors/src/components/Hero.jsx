import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi';

export default function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Autoplay prevented by browser:', err);
        });
      }
    }
  }, []);

  return (
    <section className="relative w-full h-[90vh] sm:h-screen flex items-center justify-center overflow-hidden bg-black">
      
      {/* 1. Looping Engagement Video (Direct src + z-0) */}
      <video
        ref={videoRef}
        src="/hero-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. Clean Overlay (Gives clear wine tint while keeping video bright and visible) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4A151D]/60 via-black/30 to-[#3B1B0D]/75 z-[1]" />

      {/* 3. Hero Content (z-10 on top of video) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white flex flex-col items-center justify-center">
        
        {/* Couple Logo */}
        <div className="mb-4 sm:mb-6 animate-fade-in">
          <img
            src="/logo.png"
            alt="Precious & Bright Logo"
            className="h-24 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.6)]"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#F3E5AB] font-medium mb-2 sm:mb-3">
          Together with their families
        </p>

        {/* Couple Names */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-lg">
          Precious <span className="text-[#D4AF37] font-normal">&</span> Bright
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center space-x-4 my-3 sm:my-4 w-full">
          <div className="h-[1px] w-16 sm:w-28 bg-[#D4AF37]/80"></div>
          <span className="text-[#D4AF37] text-lg sm:text-xl">❦</span>
          <div className="h-[1px] w-16 sm:w-28 bg-[#D4AF37]/80"></div>
        </div>

        {/* Date & Location preview */}
        <p className="text-base sm:text-xl md:text-2xl text-white font-medium tracking-wide mb-1 drop-shadow-md">
          Saturday, 15th October 2026
        </p>
        <p className="text-xs sm:text-sm text-[#F3E5AB] tracking-wider uppercase mb-6 sm:mb-8 drop-shadow-md">
          The Family House of Mr and Mrs Eze • Ibeju-Lekki, Lagos
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
          <Link
            to="/rsvp"
            className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-8 py-3.5 rounded-full font-bold text-sm sm:text-base tracking-widest uppercase shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-center"
          >
            💌 Confirm Attendance (RSVP)
          </Link>
          <Link
            to="/gallery"
            className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-[#D4AF37]/70 backdrop-blur-md px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 text-center"
          >
            📸 Live Gallery
          </Link>
        </div>

        <p className="mt-5 text-[11px] sm:text-xs text-white/80 tracking-widest uppercase font-medium">
          Strictly by invitation • Maximum 150 guests
        </p>
      </div>

      {/* Down arrow indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#D4AF37] z-10 animate-bounce">
        <HiOutlineChevronDoubleDown className="w-6 h-6" />
      </div>
    </section>
  );
}
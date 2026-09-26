import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineChevronDoubleDown } from 'react-icons/hi';

export default function Hero() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Force native HTML attributes strictly required by iOS & Android
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('loop', '');

    // 2. Attempt immediate hardware-accelerated autoplay
    const attemptPlay = () => {
      if (video.paused) {
        video.play().catch((err) => {
          console.log('Autoplay deferred until user interaction (Low Power Mode active):', err);
        });
      }
    };

    attemptPlay();

    // 3. Lifecycle listeners
    video.addEventListener('loadeddata', attemptPlay);
    video.addEventListener('canplay', attemptPlay);
    video.addEventListener('canplaythrough', attemptPlay);

    // 4. Low-Power Mode / Strict Browser Policy bypass on first touch/scroll
    const handleUserInteraction = () => {
      attemptPlay();
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };

    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('click', handleUserInteraction, { passive: true });
    window.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
      video.removeEventListener('canplaythrough', attemptPlay);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  return (
    <section 
      className="relative w-full overflow-hidden flex items-center justify-center bg-[#1A080C]"
      style={{
        minHeight: '100dvh', // Dynamic viewport height for modern mobile browsers
        height: '100vh'
      }}
    >
      {/* 1. BACKGROUND VIDEO (Layer 0) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none'
        }}
      >
        <source src="/hero-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 2. GRADIENT TINT OVERLAY (Layer 1) */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(74, 21, 29, 0.45) 0%, rgba(0, 0, 0, 0.25) 40%, rgba(59, 27, 13, 0.7) 100%)'
        }}
      />

      {/* 3. HERO CONTENT CONTAINER (Layer 2) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white flex flex-col items-center justify-center py-12">
        
        {/* Couple Logo */}
        <div className="mb-4 sm:mb-6 animate-fade-in">
          <img
            src="/logo.png"
            alt="Precious & Bright Wedding Logo"
            className="h-24 sm:h-36 md:h-44 w-auto object-contain drop-shadow-[0_4px_16px_rgba(212,175,55,0.6)]"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#F3E5AB] font-medium mb-2 sm:mb-3 drop-shadow">
          Together with their families
        </p>

        {/* Couple Names */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-wide leading-tight drop-shadow-lg">
          Precious <span className="text-[#D4AF37] font-normal">&</span> Bright
        </h1>

        {/* Ornamental Divider */}
        <div className="flex items-center justify-center space-x-4 my-3 sm:my-4 w-full">
          <div className="h-[1px] w-16 sm:w-28 bg-[#D4AF37]/80"></div>
          <span className="text-[#D4AF37] text-lg sm:text-xl">❦</span>
          <div className="h-[1px] w-16 sm:w-28 bg-[#D4AF37]/80"></div>
        </div>

        {/* Date & Location */}
        <p className="text-base sm:text-xl md:text-2xl text-white font-medium tracking-wide mb-1 drop-shadow-md">
          Saturday, 15th October 2026
        </p>
        <p className="text-xs sm:text-sm text-[#F3E5AB] tracking-wider uppercase mb-6 sm:mb-8 drop-shadow-md">
          The Family House of Mr and Mrs Adeleke • Ibeju-Lekki, Lagos
        </p>

        {/* Touch-Friendly Action Buttons */}
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
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-[#D4AF37] z-10 animate-bounce pointer-events-none">
        <HiOutlineChevronDoubleDown className="w-6 h-6" />
      </div>
    </section>
  );
}
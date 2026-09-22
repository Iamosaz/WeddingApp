import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Clicking Logo refreshes the browser and resets to home
  const handleLogoClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    window.location.href = '/';
  };

  // Smooth scroll back to top for Home link
  const handleScrollToTop = (e) => {
    e.preventDefault();
    setIsOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Smooth scroll down to Wedding Details
  const handleScrollToDetails = (e) => {
    e.preventDefault();
    setIsOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const section = document.getElementById('details');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const section = document.getElementById('details');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#4A151D]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Couple Logo Only (Clicking reloads the website) */}
          <a
            href="/"
            onClick={handleLogoClick}
            title="Refresh Home"
            className="flex items-center cursor-pointer group py-2"
          >
            <img
              src="/logo1.png"
              alt="Precious & Bright Wedding Logo"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_rgba(212,175,55,0.4) rounded-4xl]"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              onClick={handleScrollToTop}
              className={`text-sm uppercase tracking-widest font-medium transition-colors duration-200 py-1 cursor-pointer ${
                isActive('/') ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/90 hover:text-[#D4AF37]'
              }`}
            >
              Home
            </a>

            <a
              href="#details"
              onClick={handleScrollToDetails}
              className="text-sm uppercase tracking-widest font-medium text-white/90 hover:text-[#D4AF37] transition-colors py-1 cursor-pointer"
            >
              Wedding Details
            </a>

            <Link
              to="/gallery"
              className={`text-sm uppercase tracking-widest font-medium transition-colors duration-200 py-1 ${
                isActive('/gallery') ? 'text-[#D4AF37] border-b-2 border-[#D4AF37]' : 'text-white/90 hover:text-[#D4AF37]'
              }`}
            >
              Live Gallery 📸
            </Link>

            {/* RSVP CTA Button */}
            <Link
              to="/rsvp"
              className="bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-5 py-2.5 rounded-full text-sm font-bold tracking-wider uppercase shadow-md transition-all duration-300 transform hover:scale-105"
            >
              RSVP Now
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="text-[#F3E5AB] hover:text-[#D4AF37] p-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX className="h-8 w-8" /> : <HiMenuAlt3 className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-[#3B1B0D] border-b border-[#D4AF37]/30 px-4 pt-2 pb-6 space-y-3">
          <a
            href="/"
            onClick={handleScrollToTop}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium cursor-pointer ${
              isActive('/') ? 'bg-[#722F37] text-[#D4AF37]' : 'text-white/90 hover:bg-[#722F37]/50'
            }`}
          >
            Home
          </a>

          <a
            href="#details"
            onClick={handleScrollToDetails}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-white/90 hover:bg-[#722F37]/50 cursor-pointer"
          >
            Wedding Details
          </a>

          <Link
            to="/gallery"
            onClick={() => setIsOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-base font-medium ${
              isActive('/gallery') ? 'bg-[#722F37] text-[#D4AF37]' : 'text-white/90 hover:bg-[#722F37]/50'
            }`}
          >
            Live Gallery 📸
          </Link>

          <Link
            to="/rsvp"
            onClick={() => setIsOpen(false)}
            className="block text-center w-full mt-4 bg-[#D4AF37] text-[#4A151D] py-3 rounded-xl font-bold tracking-wider uppercase shadow-md"
          >
            RSVP (Confirm Attendance)
          </Link>
        </div>
      )}
    </header>
  );
}
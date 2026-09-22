import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#3B1B0D] border-t border-[#D4AF37]/30 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
        
        {/* Logo Monogram */}
        <img
          src="/logo.png"
          alt="Wedding Logo"
          className="h-16 w-auto object-contain mb-4"
          onError={(e) => (e.target.style.display = 'none')}
        />

        <h3 className="text-2xl font-serif text-[#F3E5AB] font-bold tracking-wide">
          Precious & Bright
        </h3>
        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mt-1 mb-6">
          Forever & Always
        </p>

        <p className="text-sm text-white/70 max-w-md mb-8">
          Thank you for being part of our special journey. Your presence and prayers mean the world to us.
        </p>

        <div className="w-full border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50">
          <p>© 2026 Precious & Bright Wedding. Strictly By Invitation.</p>
          
          {/* Subtle Admin Entrance */}
          {/* <Link
            to="/admin"
            className="mt-4 sm:mt-0 hover:text-[#D4AF37] transition-colors"
          >
            Admin Portal 🔐
          </Link> */}
        </div>
      </div>
    </footer>
  );
}
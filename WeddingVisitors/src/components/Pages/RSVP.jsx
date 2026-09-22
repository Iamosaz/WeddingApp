import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';
import { FiCheckCircle, FiCopy, FiInfo, FiLock, FiUsers } from 'react-icons/fi';

export default function RSVP() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' });
  const [guestResult, setGuestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [slotsLeft, setSlotsLeft] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchSlots = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/guests/all`);
      setSlotsLeft(data.maxLimit - data.total);
    } catch (e) {
      setSlotsLeft(150);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/guests/register`, form);
      const guest = response.data.guest;

      setGuestResult(guest);
      toast.success('Registration Confirmed! 🎉');
      fetchSlots();

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#722F37', '#D4AF37', '#8B4513', '#F3E5AB'],
      });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.unique_code) {
        setGuestResult(errorData.guest || { unique_code: errorData.unique_code, full_name: form.full_name });
        toast.info('You are already registered! Here is your code.');
      } else {
        toast.error(errorData?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (guestResult?.unique_code) {
      navigator.clipboard.writeText(guestResult.unique_code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <section className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FDFBF7] via-[#FFF9F2] to-[#FDFBF7]">
      <div className="max-w-xl mx-auto">
        
        <div className="text-center mb-10">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#722F37] font-semibold mb-2">
            Attendance Confirmation
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A151D]">
            Wedding RSVP
          </h1>
          <div className="flex items-center justify-center space-x-3 my-4">
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-lg">❦</span>
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
          </div>

          {slotsLeft !== null && (
            <div className="inline-flex items-center gap-2 bg-[#722F37]/10 border border-[#722F37]/30 text-[#722F37] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <FiUsers className="text-sm" />
              <span>{slotsLeft} of 150 Seats Remaining</span>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Strictly by invitation • Limited to <strong>150 Guests</strong>
          </p>
        </div>

        {!guestResult ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-[#D4AF37]/30">
            
            <div className="flex items-center gap-3 bg-[#4A151D]/5 p-4 rounded-2xl mb-8 border border-[#722F37]/10">
              <FiInfo className="text-[#722F37] text-2xl flex-shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">
                Please provide your full legal name and phone number. A <strong>unique entrance code</strong> will be generated for you to gain access on the wedding day.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#4A151D] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Dr. Samuel Adeyemi"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#722F37] focus:outline-none transition-colors text-gray-800 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#4A151D] mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g., 0801 234 5678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#722F37] focus:outline-none transition-colors text-gray-800 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#4A151D] mb-2">
                  Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g., samuel@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 focus:border-[#722F37] focus:outline-none transition-colors text-gray-800 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={loading || slotsLeft === 0}
                className="w-full bg-gradient-to-r from-[#722F37] to-[#4A151D] hover:from-[#5A252C] hover:to-[#3B1B0D] text-white py-4 rounded-xl font-bold tracking-widest uppercase shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 text-sm sm:text-base flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Confirming...' : slotsLeft === 0 ? '⛔ Capacity Reached' : '💌 Confirm My Attendance'}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                <FiLock />
                <span>Your information is private & secure</span>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-2 border-[#D4AF37] text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              <FiCheckCircle />
            </div>

            <span className="text-xs uppercase tracking-[0.3em] text-[#722F37] font-bold">
              Attendance Verified
            </span>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A151D] mt-2 mb-2">
              Welcome, {guestResult.full_name}!
            </h2>

            <p className="text-sm text-gray-600 mb-8 max-w-sm mx-auto">
              You are officially registered for the wedding celebration. Here is your personal entrance access code:
            </p>

            <div className="bg-gradient-to-br from-[#4A151D] via-[#722F37] to-[#5C2C16] text-[#F3E5AB] rounded-3xl p-6 sm:p-8 shadow-xl border border-[#D4AF37]/50 max-w-sm mx-auto mb-6">
              <p className="text-xs uppercase tracking-widest text-white/70 mb-2 font-medium">
                Unique Entrance Pass
              </p>
              <div className="text-4xl sm:text-5xl font-mono font-bold tracking-[0.2em] text-[#F3E5AB] my-2 drop-shadow-md">
                {guestResult.unique_code}
              </div>
              <p className="text-[11px] text-white/80 mt-2">
                Show this code at the security checkpoint at the entrance
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-2 bg-[#F3E5AB] hover:bg-[#e6d695] text-[#4A151D] px-6 py-3 rounded-full text-xs uppercase tracking-widest font-bold shadow-md transition-all active:scale-95 mb-8 cursor-pointer"
            >
              <FiCopy className="w-4 h-4" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Entrance Code'}</span>
            </button>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <span>📸</span> Please Take a Screenshot of this screen!
              </p>
              <p className="text-amber-800/90 leading-relaxed">
                Save this code on your phone. You will present this code to the security usher at <strong>No. 17 Imam Salaudeen Street, Ibeju-Lekki</strong> on the wedding day.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-center gap-4 text-xs">
              <button
                onClick={() => setGuestResult(null)}
                className="text-[#722F37] underline font-semibold hover:text-[#4A151D] cursor-pointer"
              >
                Register another family member
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
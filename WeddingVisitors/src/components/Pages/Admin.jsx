import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiDownload, 
  FiTrash2, 
  FiCheckCircle, 
  FiUsers, 
  FiSearch, 
  FiLock, 
  FiPlus, 
  FiX, 
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiCamera,
  FiUploadCloud,
  FiImage,
  FiKey,
  FiLogOut,
  FiShield
} from 'react-icons/fi';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState('usher'); // 'admin' or 'usher'
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('guests'); // 'guests' or 'photos'
  
  // Password Management States (For Master Admin only)
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [targetRoleToChange, setTargetRoleToChange] = useState('admin'); // 'admin' or 'usher'
  const [passForm, setPassForm] = useState({ currentAdminPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPass, setChangingPass] = useState(false);

  // Guest states
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, maxLimit: 150 });
  const [checkInCode, setCheckInCode] = useState('');
  const [search, setSearch] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual Add Guest States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({ full_name: '', phone: '', email: '' });
  const [addingGuest, setAddingGuest] = useState(false);

  // Photo Management States
  const [photos, setPhotos] = useState([]);
  const [adminPhotos, setAdminPhotos] = useState([]);
  const [adminUploaderName, setAdminUploaderName] = useState('Admin (Official)');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // 1. AUTO-ROLE LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);

    try {
      const response = await axios.post('/api/admin/login', { password });
      setAuthenticated(true);
      setRole(response.data.role); // 'admin' or 'usher'
      fetchGuestData();
      fetchPhotosData();
      toast.success(response.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Incorrect password!');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setRole('usher');
    setPassword('');
    toast.info('Logged out.');
  };

  // 2. CHANGE PASSWORD (MASTER ADMIN ONLY)
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    setChangingPass(true);
    try {
      const response = await axios.post('/api/admin/change-password', {
        currentAdminPassword: passForm.currentAdminPassword,
        targetRole: targetRoleToChange,
        newPassword: passForm.newPassword
      });
      toast.success(response.data.message);
      setPassForm({ currentAdminPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const fetchGuestData = async (silent = false) => {
    try {
      if (!silent) setIsRefreshing(true);
      const response = await axios.get('/api/guests/all');
      setGuests(response.data.guests);
      setStats({
        total: response.data.total,
        checkedIn: response.data.checkedIn,
        maxLimit: response.data.maxLimit,
      });
    } catch (err) {
      if (!silent) toast.error('Failed to fetch guest list');
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  };

  const fetchPhotosData = async () => {
    try {
      const response = await axios.get('/api/photos/all');
      setPhotos(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      fetchGuestData(true);
      fetchPhotosData();
    }, 5000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // GATE CHECK-IN LOGIC
  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInCode) return;

    setCheckingIn(true);
    try {
      const response = await axios.post('/api/guests/checkin', {
        unique_code: checkInCode.toUpperCase().trim()
      });
      toast.success(response.data.message);
      setCheckInCode('');
      fetchGuestData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  // MANUAL ADD GUEST LOGIC
  const handleAddGuestSubmit = async (e) => {
    e.preventDefault();
    setAddingGuest(true);

    try {
      const response = await axios.post('/api/guests/register', newGuest);
      toast.success(`Guest added! Code: ${response.data.guest.unique_code} 🎉`);
      setNewGuest({ full_name: '', phone: '', email: '' });
      setShowAddForm(false);
      fetchGuestData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add guest');
    } finally {
      setAddingGuest(false);
    }
  };

  // DELETE GUEST LOGIC (ADMIN ONLY)
  const handleDeleteGuest = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the list?`)) return;

    try {
      await axios.delete(`/api/guests/${id}`);
      toast.success('Guest removed.');
      fetchGuestData();
    } catch (err) {
      toast.error('Failed to delete guest');
    }
  };

  // PHOTO UPLOAD
  const handleAdminPhotoUpload = async (e) => {
    e.preventDefault();
    if (adminPhotos.length === 0) {
      toast.warn('Please select photos.');
      return;
    }

    setUploadingPhotos(true);
    const formData = new FormData();
    adminPhotos.forEach(file => formData.append('photos', file));
    formData.append('uploaded_by', adminUploaderName.trim() || 'Admin');

    try {
      const response = await axios.post('/api/photos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message || 'Photos uploaded! 📸');
      setAdminPhotos([]);
      const inputEl = document.getElementById('admin-photo-input');
      if (inputEl) inputEl.value = '';
      fetchPhotosData();
    } catch (err) {
      toast.error('Upload failed.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  // DELETE PHOTO (ADMIN ONLY)
  const handleDeletePhoto = async (id, uploader) => {
    if (!window.confirm(`Permanently delete photo by "${uploader}"?`)) return;

    try {
      await axios.delete(`/api/photos/${id}`);
      toast.success('Photo deleted.');
      fetchPhotosData();
    } catch (err) {
      toast.error('Failed to delete photo');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/guests/export', '_blank');
  };

  const filteredGuests = guests.filter(g =>
    g.full_name.toLowerCase().includes(search.toLowerCase()) ||
    g.unique_code.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search)
  );

  const checkedInPercent = stats.total > 0 ? Math.round((stats.checkedIn / stats.total) * 100) : 0;
  const capacityPercent = Math.round((stats.total / stats.maxLimit) * 100);

  // 1. LOGIN VIEW
  if (!authenticated) {
    return (
      <section className="min-h-[85vh] flex items-center justify-center px-4 bg-[#FDFBF7]">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 w-full max-w-md border border-[#D4AF37]/30 text-center animate-fade-in"
        >
          <div className="w-16 h-16 bg-[#4A151D]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#722F37]">
            <FiLock className="text-3xl" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A151D] mb-2">
            Portal Access
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            Enter <strong>Master Admin</strong> or <strong>Usher Gate</strong> password
          </p>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#722F37] focus:outline-none mb-5 text-center text-lg tracking-wider"
          />
          <button 
            type="submit"
            disabled={loggingIn}
            className="w-full bg-gradient-to-r from-[#722F37] to-[#4A151D] hover:from-[#5A252C] hover:to-[#3B1B0D] text-white py-3.5 rounded-xl font-bold tracking-widest uppercase transition-all shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loggingIn ? 'Authenticating...' : 'Enter Portal'}
          </button>
        </form>
      </section>
    );
  }

  // 2. MAIN DASHBOARD VIEW
  return (
    <section className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A151D]">
                Wedding Control Center
              </h1>
              
              {/* Role Indicator Badge */}
              {role === 'admin' ? (
                <span className="inline-flex items-center gap-1 bg-[#722F37] text-[#F3E5AB] text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  <span>👑 Master Admin</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
                  <FiShield />
                  <span>Gate Usher Mode</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live updates active • Auto-syncing every 5 seconds
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => { fetchGuestData(); fetchPhotosData(); }}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all cursor-pointer"
              title="Refresh Data"
            >
              <FiRefreshCw className={`text-lg ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* 👑 PASSWORD MANAGEMENT (ONLY VISIBLE TO MASTER ADMIN) */}
            {role === 'admin' && (
              <button
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border border-gray-200"
                title="Manage Passwords"
              >
                <FiKey className="text-base text-[#722F37]" />
                <span>Manage Passwords</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all cursor-pointer"
              title="Logout"
            >
              <FiLogOut className="text-lg" />
            </button>

            {activeTab === 'guests' && (
              <>
                {/* 👑 MANUALLY ADD GUEST (ADMIN ONLY) */}
                {role === 'admin' && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="inline-flex items-center gap-2 bg-[#722F37] hover:bg-[#4A151D] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    <FiPlus className="text-base" />
                    <span>Add Guest</span>
                  </button>
                )}

                {/* 👑 EXCEL EXPORT (ADMIN ONLY) */}
                {role === 'admin' && (
                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                  >
                    <FiDownload className="text-base" />
                    <span>Excel Export</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 🔐 PASSWORD MANAGEMENT MODAL (ADMIN ONLY) */}
        {showPasswordModal && role === 'admin' && (
          <div 
            onClick={() => setShowPasswordModal(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          >
            <div 
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-200 relative"
            >
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center justify-center text-xl">
                  <FiKey />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#4A151D]">Manage Passwords</h3>
                  <p className="text-xs text-gray-400">Update Admin or Usher access codes</p>
                </div>
              </div>

              {/* Choose Which Password to Change */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTargetRoleToChange('admin')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    targetRoleToChange === 'admin' ? 'bg-white shadow text-[#4A151D]' : 'text-gray-500'
                  }`}
                >
                  👑 Admin Password
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRoleToChange('usher')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    targetRoleToChange === 'usher' ? 'bg-white shadow text-[#4A151D]' : 'text-gray-500'
                  }`}
                >
                  🛡️ Usher Password
                </button>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Your Current Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Verify your admin identity..."
                    value={passForm.currentAdminPassword}
                    onChange={e => setPassForm({ ...passForm, currentAdminPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    New {targetRoleToChange === 'admin' ? 'Admin' : 'Usher'} Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="At least 4 characters..."
                    value={passForm.newPassword}
                    onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    placeholder="Re-type new password..."
                    value={passForm.confirmPassword}
                    onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none text-sm"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPass}
                    className="w-full bg-[#722F37] hover:bg-[#4A151D] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {changingPass ? 'Updating...' : `Save New ${targetRoleToChange.toUpperCase()} Password`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB SWITCHER */}
        <div className="flex space-x-2 bg-gray-200/70 p-1.5 rounded-2xl max-w-md">
          <button
            onClick={() => setActiveTab('guests')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'guests'
                ? 'bg-white text-[#4A151D] shadow-md'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <FiUsers className="text-base" />
            <span>Guests & Attendance ({stats.total})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-white text-[#4A151D] shadow-md'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            <FiImage className="text-base" />
            <span>Photo Manager ({photos.length})</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: GUESTS & ATTENDANCE MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === 'guests' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* LIVE COUNTER CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Checked In */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-emerald-200 font-bold">Checked In</span>
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
                    <FiUserCheck />
                  </div>
                </div>
                <div className="my-4">
                  <div className="text-4xl sm:text-5xl font-extrabold tracking-tight">{stats.checkedIn}</div>
                  <p className="text-xs text-emerald-100 mt-1">{checkedInPercent}% present</p>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-2 rounded-full transition-all duration-500" style={{ width: `${checkedInPercent}%` }}></div>
                </div>
              </div>

              {/* Total Registered */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Registered</span>
                  <div className="w-10 h-10 bg-[#722F37]/10 text-[#722F37] rounded-2xl flex items-center justify-center text-xl">
                    <FiUsers />
                  </div>
                </div>
                <div className="my-4">
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#4A151D] tracking-tight">
                    {stats.total} <span className="text-lg text-gray-400 font-normal">/ {stats.maxLimit}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{capacityPercent}% full</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#722F37] h-2 rounded-full transition-all duration-500" style={{ width: `${capacityPercent}%` }}></div>
                </div>
              </div>

              {/* Expected / Pending */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Pending Arrival</span>
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl">
                    <FiUserX />
                  </div>
                </div>
                <div className="my-4">
                  <div className="text-4xl sm:text-5xl font-extrabold text-amber-600 tracking-tight">
                    {stats.total - stats.checkedIn}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Guests yet to arrive</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full transition-all duration-500" style={{ width: `${100 - checkedInPercent}%` }}></div>
                </div>
              </div>

              {/* Slots left */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Remaining Slots</span>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xl">
                    <FiCheckCircle />
                  </div>
                </div>
                <div className="my-4">
                  <div className="text-4xl sm:text-5xl font-extrabold text-[#5C2C16] tracking-tight">
                    {stats.maxLimit - stats.total}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Available of {stats.maxLimit}</p>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#5C2C16] h-2 rounded-full transition-all duration-500" style={{ width: `${((stats.maxLimit - stats.total) / stats.maxLimit) * 100}%` }}></div>
                </div>
              </div>

            </div>

            {/* EXPANDABLE ADD GUEST FORM (ADMIN ONLY) */}
            {showAddForm && role === 'admin' && (
              <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border-2 border-[#D4AF37]/50 max-w-2xl mx-auto relative animate-fade-in">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2 cursor-pointer"
                >
                  <FiX className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-serif font-bold text-[#4A151D] mb-4">✍️ Add Guest Manually</h3>
                <form onSubmit={handleAddGuestSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Emeka Okonkwo"
                      value={newGuest.full_name}
                      onChange={e => setNewGuest({ ...newGuest, full_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0803 123 4567"
                      value={newGuest.phone}
                      onChange={e => setNewGuest({ ...newGuest, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. emeka@vip.com"
                      value={newGuest.email}
                      onChange={e => setNewGuest({ ...newGuest, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 mt-2">
                    <button
                      type="submit"
                      disabled={addingGuest}
                      className="w-full bg-[#722F37] hover:bg-[#4A151D] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer"
                    >
                      {addingGuest ? 'Adding...' : 'Generate Code & Add Guest'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* GATE CHECK-IN & SEARCH FILTER (ACCESSIBLE TO BOTH USHERS & ADMIN) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* GATE CHECK-IN */}
              <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🚪</span>
                    <h3 className="text-lg font-bold text-[#4A151D]">Entrance Gate Check-In</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Type visitor's 6-character code below to verify attendance.
                  </p>
                </div>

                <form onSubmit={handleCheckIn} className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={checkInCode}
                    onChange={e => setCheckInCode(e.target.value)}
                    placeholder="e.g. 7K4P9N"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-[#722F37] focus:outline-none uppercase font-mono text-center tracking-[0.2em] font-extrabold text-xl text-[#4A151D]"
                  />
                  <button
                    type="submit"
                    disabled={checkingIn}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl transition-all tracking-wider text-xs uppercase cursor-pointer"
                  >
                    {checkingIn ? 'Checking...' : 'Check-In'}
                  </button>
                </form>
              </div>

              {/* SEARCH */}
              <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🔍</span>
                    <h3 className="text-lg font-bold text-[#4A151D]">Search Attendance Roster</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Find any attendee quickly by name, phone number, or code.
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name, phone, or code..."
                    className="w-full px-11 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-[#722F37] focus:outline-none text-gray-800 text-sm"
                  />
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                </div>
              </div>

            </div>

            {/* ATTENDANCE TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-[#4A151D]/5 flex items-center justify-between">
                <h3 className="font-bold text-[#4A151D]">Attendee Roster ({filteredGuests.length} Guests)</h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  {stats.checkedIn} Checked In
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-[#4A151D] font-bold uppercase text-[11px] tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 text-center">S/N</th>
                      <th className="px-6 py-4">Full Name</th>
                      <th className="px-6 py-4">Phone Number</th>
                      <th className="px-6 py-4 text-center">Unique Code</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      {role === 'admin' && <th className="px-6 py-4 text-center">Remove</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredGuests.map((g, index) => (
                      <tr
                        key={g.id}
                        className={`hover:bg-gray-50/80 transition-colors ${
                          g.checked_in ? 'bg-emerald-50/30' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-center font-mono text-gray-400">{index + 1}</td>
                        <td className="px-6 py-4 font-bold text-[#4a151d]">{g.full_name}</td>
                        <td className="px-6 py-4 font-mono text-gray-600">{g.phone}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-[#722F37] text-[#F3E5AB] px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider shadow-sm">
                            {g.unique_code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {g.checked_in ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                              <FiUserCheck className="text-sm" />
                              <span>Checked In</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                              <FiUserX className="text-sm" />
                              <span>Not Present</span>
                            </span>
                          )}
                        </td>
                        {role === 'admin' && (
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteGuest(g.id, g.full_name)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-colors cursor-pointer"
                              title="Remove guest"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: LIVE PHOTO GALLERY MANAGER */}
        {/* ============================================================ */}
        {activeTab === 'photos' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* DIRECT PERMANENT UPLOAD CARD */}
            <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-gray-100 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center justify-center text-xl">
                  <FiCamera />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#4A151D]">
                    Add New Photos to Live Gallery
                  </h3>
                  <p className="text-xs text-gray-400">
                    Upload official wedding photos directly to the gallery
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminPhotoUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Uploaded As
                  </label>
                  <input
                    type="text"
                    value={adminUploaderName}
                    onChange={e => setAdminUploaderName(e.target.value)}
                    placeholder="e.g. Official Photographer / Bride & Groom"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none text-sm text-gray-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-photo-input"
                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl cursor-pointer hover:bg-[#FDFBF7] transition-colors text-center"
                  >
                    <FiUploadCloud className="text-3xl text-[#722F37] mb-2" />
                    <span className="text-xs sm:text-sm font-bold text-[#4A151D]">
                      {adminPhotos.length > 0 ? `${adminPhotos.length} photo(s) selected` : 'Click to Select Photos'}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">Supports high-res PNG, JPG, WEBP</span>
                    <input
                      id="admin-photo-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={e => setAdminPhotos(Array.from(e.target.files))}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploadingPhotos || adminPhotos.length === 0}
                  className="w-full bg-[#722F37] hover:bg-[#4A151D] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {uploadingPhotos ? 'Uploading...' : 'Publish to Live Gallery 📸'}
                </button>
              </form>
            </div>

            {/* PHOTO MODERATION GRID */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-[#4A151D] text-lg">
                    Current Gallery Photos ({photos.length})
                  </h3>
                  <p className="text-xs text-gray-500">
                    {role === 'admin' 
                      ? 'Click the red delete icon on any photo to remove it permanently.' 
                      : 'Live gallery stream for visitors.'}
                  </p>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FiCamera className="text-4xl mx-auto mb-2 text-gray-300" />
                  <p>No photos uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {photos.map(photo => (
                    <div
                      key={photo.id}
                      className="group relative bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-square flex flex-col justify-between"
                    >
                      <img
                        src={`/uploads/${photo.filename}`}
                        alt={photo.original_name}
                        className="w-full h-full object-cover"
                      />

                      {/* Delete button (ADMIN ONLY) */}
                      {role === 'admin' && (
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            onClick={() => handleDeletePhoto(photo.id, photo.uploaded_by)}
                            className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform transform active:scale-95 cursor-pointer"
                            title="Delete photo permanently"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Bottom Caption */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 p-2 text-white">
                        <p className="text-[11px] font-bold truncate">
                          {photo.uploaded_by}
                        </p>
                        <p className="text-[9px] text-white/70">
                          {new Date(photo.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
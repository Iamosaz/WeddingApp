import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  FiCamera, 
  FiUploadCloud, 
  FiUser, 
  FiX, 
  FiMaximize2, 
  FiRefreshCw, 
  FiHeart,
  FiPrinter,
  FiDownload,
  FiCloud
} from 'react-icons/fi';
import { HiOutlineQrcode } from 'react-icons/hi';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Backend URL
  const API_URL = import.meta.env.VITE_API_URL || '';

  // ✅ FIX: Use production URL for QR code (NOT localhost)
  // Priority: VITE_SITE_URL env variable > window.location.origin > fallback
  const SITE_URL = import.meta.env.VITE_SITE_URL || 
    (typeof window !== 'undefined' && !window.location.origin.includes('localhost') 
      ? window.location.origin 
      : 'https://preciousandbright.com');
  const galleryUrl = `${SITE_URL}/gallery`;

  // High-res QR code with wedding wine color
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(galleryUrl)}&color=4A151D&bgcolor=FFFFFF&margin=10`;

  // Fetch all photos from database (with Cloudinary auto-recovery)
  const fetchPhotos = async (silent = false) => {
    try {
      if (!silent) setLoadingPhotos(true);
      const { data } = await axios.get(`${API_URL}/api/photos/all`);
      setPhotos(data);

      // ✅ AUTO-RECOVERY: If MongoDB is empty, auto-restore from Cloudinary
      if (data.length === 0 && !silent) {
        try {
          const syncResponse = await axios.get(`${API_URL}/api/photos/sync`);
          if (syncResponse.data.restored > 0) {
            const { data: restoredData } = await axios.get(`${API_URL}/api/photos/all`);
            setPhotos(restoredData);
            toast.success(`✨ ${syncResponse.data.restored} photos restored from Cloudinary!`);
          }
        } catch (syncErr) {
          console.log('Auto-sync skipped:', syncErr.message);
        }
      }
    } catch (err) {
      if (!silent) toast.error('Failed to load gallery photos');
    } finally {
      if (!silent) setLoadingPhotos(false);
    }
  };

  // ✅ Manual Cloudinary Sync (safety net button for owner)
  const handleCloudinarySync = async () => {
    try {
      setSyncing(true);
      const { data } = await axios.get(`${API_URL}/api/photos/sync`);
      toast.success(data.message || `${data.restored} photos restored!`);
      await fetchPhotos(true);
    } catch (err) {
      toast.error('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.warn('You can upload up to 10 photos at a time.');
      setSelectedFiles(files.slice(0, 10));
    } else {
      setSelectedFiles(files);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.warn('Please select at least one photo.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('photos', file);
    });
    formData.append('uploaded_by', uploaderName.trim() || 'A Loved Guest');

    try {
      const response = await axios.post(`${API_URL}/api/photos/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(response.data.message || 'Photos uploaded successfully! 🎉');
      setSelectedFiles([]);
      setUploaderName('');
      
      const inputEl = document.getElementById('photo-input');
      if (inputEl) inputEl.value = '';
      
      fetchPhotos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FDFBF7] via-[#FFF9F2] to-[#FDFBF7]">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-[#722F37] font-semibold">
            Captured Moments
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#4A151D] mt-1">
            Live Wedding Gallery
          </h1>
          <div className="flex items-center justify-center space-x-3 my-3">
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
            <span className="text-[#D4AF37] text-lg">❦</span>
            <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Snap, upload, and share your favorite moments with Precious & Bright. Every guest can view your photos live!
          </p>

          {/* QR Code Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HiOutlineQrcode className="w-5 h-5 text-[#4A151D]" />
            <span>Generate & Print Table QR Code</span>
          </button>
        </div>

        {/* 📸 GUEST UPLOAD SECTION CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-12 border border-[#D4AF37]/30 max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#722F37]/10 text-[#722F37] rounded-full flex items-center justify-center text-xl">
              <FiCamera />
            </div>
            <div>
              <h3 className="font-bold text-[#4A151D] text-base sm:text-lg">
                Share Your Photos
              </h3>
              <p className="text-xs text-gray-400">
                Upload up to 10 photos directly from your phone camera or gallery
              </p>
            </div>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            
            {/* Uploader Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Your Name <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Uncle David, The Martins"
                  value={uploaderName}
                  onChange={(e) => setUploaderName(e.target.value)}
                  className="w-full px-10 py-3 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none text-sm text-gray-800"
                />
                <FiUser className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* File Selector Box */}
            <div>
              <label
                htmlFor="photo-input"
                className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl cursor-pointer hover:bg-[#FDFBF7] transition-colors text-center group"
              >
                <FiUploadCloud className="text-3xl text-[#722F37] group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs sm:text-sm font-bold text-[#4A151D]">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} photo(s) selected`
                    : 'Tap here to Choose or Take Photos'}
                </span>
                <span className="text-[11px] text-gray-400 mt-1">
                  High-res phone photos supported (up to 25MB each)
                </span>
                <input
                  id="photo-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Selected files indicator */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 px-4 py-2 rounded-xl border border-amber-200">
                <span>{selectedFiles.length} file(s) ready to upload</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-red-500 font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Submit Upload Button */}
            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="w-full bg-gradient-to-r from-[#722F37] to-[#4A151D] hover:from-[#5A252C] hover:to-[#3B1B0D] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {uploading ? 'Uploading to Gallery...' : 'Post Photos to Live Gallery 💖'}
            </button>
          </form>
        </div>

        {/* 🖼️ GALLERY GRID HEADER */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-[#4A151D]">
              All Moments ({photos.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* ✅ Cloudinary Sync Safety Button */}
            <button
              onClick={handleCloudinarySync}
              disabled={syncing}
              title="Restore all photos from Cloudinary backup"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:bg-[#4A151D] bg-[#722F37] px-4 py-2 rounded-full border border-[#4A151D] shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <FiCloud className={syncing ? 'animate-pulse' : ''} />
              <span>{syncing ? 'Restoring...' : 'Restore from Cloud'}</span>
            </button>

            <button
              onClick={() => fetchPhotos()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#722F37] hover:text-[#4A151D] bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-all cursor-pointer"
            >
              <FiRefreshCw className={loadingPhotos ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 📸 GALLERY GRID */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-[#722F37]/5 text-[#722F37] rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              <FiCamera />
            </div>
            <h3 className="text-lg font-bold text-[#4A151D] mb-1">
              No Photos Uploaded Yet
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Be the first guest to snap a photo and post it to the gallery!
            </p>
            <p className="text-[10px] text-gray-400">
              If photos existed before, click "Restore from Cloud" above to recover them.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {photos.map((photo) => (
              <div
                key={photo._id || photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-square cursor-pointer border border-[#D4AF37]/20"
              >
                <img
                  src={photo.url || (photo.filename ? `${API_URL}/uploads/${photo.filename}` : '')}
                  alt={photo.original_name || 'Wedding Photo'}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A151D]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                  <p className="text-xs font-bold truncate flex items-center gap-1">
                    <FiHeart className="text-[#D4AF37]" />
                    <span>{photo.uploaded_by}</span>
                  </p>
                  <p className="text-[10px] text-white/70">
                    {new Date(photo.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Lightbox Expand Icon */}
                <div className="absolute top-2 right-2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiMaximize2 />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔍 FULL-SCREEN LIGHTBOX MODAL */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 text-white hover:text-[#D4AF37] p-3 rounded-full bg-white/10 transition-colors z-10 cursor-pointer"
            >
              <FiX className="text-2xl" />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[90vh] flex flex-col items-center"
            >
              <img
                src={activePhoto.url || (activePhoto.filename ? `${API_URL}/uploads/${activePhoto.filename}` : '')}
                alt="Enlarged wedding moment"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />
              <div className="mt-4 text-center text-white">
                <p className="text-sm font-bold text-[#F3E5AB]">
                  Shared by {activePhoto.uploaded_by}
                </p>
                <p className="text-xs text-white/50">
                  {new Date(activePhoto.uploaded_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 📱 PRINTABLE TABLE QR CODE MODAL */}
        {showQrModal && (
          <div
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#D4AF37] text-center relative animate-fade-in"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-[#4A151D] hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-xl" />
              </button>

              {/* Table Card Design Header */}
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#722F37] font-semibold mb-1">
                Precious &amp; Bright
              </p>
              <h3 className="text-2xl font-serif font-bold text-[#4A151D] mb-2">
                Share Your Photos
              </h3>
              
              <div className="flex items-center justify-center space-x-2 my-2">
                <div className="h-[1px] w-8 bg-[#D4AF37]"></div>
                <span className="text-[#D4AF37] text-sm">❦</span>
                <div className="h-[1px] w-8 bg-[#D4AF37]"></div>
              </div>

              <p className="text-xs text-gray-600 mb-5">
                Scan with your phone camera to capture and upload your memories to our live gallery!
              </p>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl shadow-inner border border-[#D4AF37]/30 inline-block mb-4">
                <img
                  src={qrCodeImageUrl}
                  alt="Wedding Gallery QR Code"
                  className="w-52 h-52 mx-auto rounded-lg object-contain"
                />
              </div>

              {/* ✅ Shows exact URL so you can verify it's production, NOT localhost */}
              <p className="text-[11px] text-gray-500 font-mono mb-5 truncate px-2">
                {galleryUrl}
              </p>

              {/* Warning if localhost */}
              {galleryUrl.includes('localhost') && (
                <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg mb-3 border border-red-200">
                  ⚠️ Set VITE_SITE_URL in .env to use your production URL!
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#4A151D] hover:bg-[#3B1B0D] text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all"
                >
                  <FiPrinter className="w-4 h-4" />
                  <span>Print Card</span>
                </button>
                <a
                  href={qrCodeImageUrl}
                  download="Wedding-Gallery-QRCode.png"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all"
                >
                  <FiDownload className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
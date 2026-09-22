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
  FiHeart 
} from 'react-icons/fi';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null); // Lightbox modal state

  // Backend URL helper (works locally and on live production)
  const API_URL = import.meta.env.VITE_API_URL || '';

  // Fetch all photos from the database
  const fetchPhotos = async () => {
    try {
      setLoadingPhotos(true);
      const { data } = await axios.get(`${API_URL}/api/photos/all`);
      setPhotos(data);
    } catch (err) {
      toast.error('Failed to load gallery photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Handle file selection from phone or computer
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.warn('You can upload up to 10 photos at a time.');
      setSelectedFiles(files.slice(0, 10));
    } else {
      setSelectedFiles(files);
    }
  };

  // Submit and upload photos
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

  return (
    <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FDFBF7] via-[#FFF9F2] to-[#FDFBF7]">
      <div className="max-w-6xl mx-auto">
        
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
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
          <p className="text-sm text-gray-600">
            Snap, upload, and share your favorite moments with Precious & Bright. Every guest can view your photos live!
          </p>
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-serif font-bold text-[#4A151D]">
              All Moments ({photos.length})
            </h2>
          </div>

          <button
            onClick={fetchPhotos}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#722F37] hover:text-[#4A151D] bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-all cursor-pointer"
          >
            <FiRefreshCw className={loadingPhotos ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
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
            <p className="text-xs text-gray-500">
              Be the first guest to snap a photo and post it to the gallery!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setActivePhoto(photo)}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 aspect-square cursor-pointer border border-[#D4AF37]/20"
              >
                <img
                  src={`${API_URL}/uploads/${photo.filename}`}
                  alt={photo.original_name}
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
                src={`${API_URL}/uploads/${activePhoto.filename}`}
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

      </div>
    </section>
  );
}
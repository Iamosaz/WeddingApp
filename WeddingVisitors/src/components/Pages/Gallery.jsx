
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
  FiDownload
} from 'react-icons/fi';
import { HiOutlineQrcode } from 'react-icons/hi';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);

  // Same-domain API (Vercel serverless)
  const API_URL = '';

  // Live site URL for QR code
  const SITE_URL =
    typeof window !== 'undefined' &&
    !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://preciousandbright.com';

  const galleryUrl = `${SITE_URL}/gallery`;

  const qrCodeImageUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(galleryUrl)}&color=4A151D&bgcolor=FFFFFF&margin=10`;

  // --------------------------------------------------
  // FETCH PHOTOS
  // --------------------------------------------------

  const fetchPhotos = async (silent = false) => {
    try {
      if (!silent) setLoadingPhotos(true);

      const { data } = await axios.get(
        `${API_URL}/api/photos/all`,
        { timeout: 30000 }
      );

      setPhotos(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('API Request Failed:', err);

      if (!silent) {
        toast.error(
          err.response?.data?.error ||
          'Could not connect to gallery. Please refresh.'
        );
      }
    } finally {
      if (!silent) setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // --------------------------------------------------
  // SELECT PHOTOS
  // --------------------------------------------------

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 10) {
      toast.warning('You can upload a maximum of 10 photos at a time.');
    }

    const validFiles = files
      .slice(0, 10)
      .filter((file) => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image.`);
          return false;
        }

        if (file.size > 20 * 1024 * 1024) {
          toast.error(
            `${file.name} is too large. Maximum original size is 20MB.`
          );
          return false;
        }

        return true;
      });

    setSelectedFiles(validFiles);
  };

  // --------------------------------------------------
  // COMPRESS AND CONVERT PHOTOS TO BASE64
  // --------------------------------------------------

  const filesToBase64 = async (files) => {
    const MAX_COMPRESSED_SIZE = 230 * 1024;
    const photosData = [];

    for (const file of files) {
      let bitmap;

      try {
        // Decode the original image
        bitmap = await createImageBitmap(file);

        if (!bitmap.width || !bitmap.height) {
          throw new Error('Invalid image dimensions.');
        }

        let maxDimension = 1600;
        let quality = 0.78;
        let compressedBlob = null;

        // Reduce image dimensions and quality until the image
        // is small enough for a reliable serverless upload.
        for (let attempt = 0; attempt < 8; attempt++) {
          const scale = Math.min(
            1,
            maxDimension / Math.max(bitmap.width, bitmap.height)
          );

          const width = Math.max(
            1,
            Math.round(bitmap.width * scale)
          );

          const height = Math.max(
            1,
            Math.round(bitmap.height * scale)
          );

          const canvas = document.createElement('canvas');

          canvas.width = width;
          canvas.height = height;

          const context = canvas.getContext('2d');

          if (!context) {
            throw new Error('Your browser could not process this photo.');
          }

          // JPEG has no transparency, so use a white background.
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, width, height);

          context.drawImage(bitmap, 0, 0, width, height);

          compressedBlob = await new Promise((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(new Error('Photo compression failed.'));
                }
              },
              'image/jpeg',
              quality
            );
          });

          if (compressedBlob.size <= MAX_COMPRESSED_SIZE) {
            break;
          }

          maxDimension = Math.max(
            600,
            Math.round(maxDimension * 0.85)
          );

          quality = Math.max(0.45, quality - 0.05);
        }

        if (
          !compressedBlob ||
          compressedBlob.size > MAX_COMPRESSED_SIZE
        ) {
          throw new Error(
            `${file.name} could not be compressed sufficiently. Please choose a smaller photo.`
          );
        }

        // Convert the compressed image to Base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => resolve(reader.result);

          reader.onerror = () => {
            reject(new Error(`Could not read ${file.name}.`));
          };

          reader.readAsDataURL(compressedBlob);
        });

        photosData.push({
          data: base64,
          name: file.name
        });

      } catch (err) {
        console.error('IMAGE PROCESSING ERROR:', file.name, err);

        throw new Error(
          err.message ||
          `Could not process ${file.name}. Please try another image.`
        );

      } finally {
        if (bitmap) {
          bitmap.close();
        }
      }
    }

    // Check the total request payload against the backend limit.
    const totalSize = photosData.reduce(
      (total, photo) => total + photo.data.length,
      0
    );

    if (totalSize > 3500000) {
      throw new Error(
        'The selected photos are too large together. Please upload fewer photos at a time.'
      );
    }

    return photosData;
  };

  // --------------------------------------------------
  // GUEST PHOTO UPLOAD
  // --------------------------------------------------

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (uploading) return;

    if (selectedFiles.length === 0) {
      toast.warning('Please select at least one photo.');
      return;
    }

    setUploading(true);

    try {
      toast.info('Preparing your photos for upload...');

      // Compress photos before sending them to Vercel
      const photosData = await filesToBase64(selectedFiles);

      // Upload to existing backend
      const response = await axios.post(
        `${API_URL}/api/photos/upload`,
        {
          photos: photosData,
          uploaded_by: uploaderName.trim() || 'A Loved Guest'
        },
        {
          timeout: 120000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.error || 'Photo upload was not completed.'
        );
      }

      toast.success(
        response.data.message || 'Photos uploaded successfully! 🎉'
      );

      // Clear the form
      setSelectedFiles([]);
      setUploaderName('');

      const inputEl = document.getElementById('photo-input');

      if (inputEl) {
        inputEl.value = '';
      }

      // Immediately refresh the gallery
      await fetchPhotos(true);

    } catch (err) {
      console.error('GUEST PHOTO UPLOAD ERROR:', err);

      let errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Photo upload failed. Please try again.';

      if (err.code === 'ECONNABORTED') {
        errorMessage =
          'Upload timed out. Please try uploading fewer photos.';
      }

      toast.error(errorMessage);

    } finally {
      setUploading(false);
    }
  };

  // --------------------------------------------------
  // PRINT GALLERY QR CODE
  // --------------------------------------------------

  const handlePrint = () => {
    window.print();
  };

  // --------------------------------------------------
  // RENDER GALLERY
  // --------------------------------------------------

  return (
    <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FDFBF7] via-[#FFF9F2] to-[#FDFBF7]">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

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

          <button
            onClick={() => setShowQrModal(true)}
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#c49f2e] text-[#4A151D] px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HiOutlineQrcode className="w-5 h-5 text-[#4A151D]" />
            <span>Generate & Print Table QR Code</span>
          </button>

        </div>

        {/* GUEST UPLOAD FORM */}

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

            {/* GUEST NAME */}

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
                  disabled={uploading}
                  maxLength={100}
                  className="w-full px-10 py-3 rounded-xl border border-gray-200 focus:border-[#722F37] focus:outline-none text-sm text-gray-800 disabled:opacity-60"
                />

                <FiUser className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400" />

              </div>

            </div>

            {/* PHOTO SELECTION */}

            <div>

              <label
                htmlFor="photo-input"
                className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D4AF37]/60 rounded-2xl text-center group transition-colors ${
                  uploading
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-[#FDFBF7]'
                }`}
              >

                <FiUploadCloud className="text-3xl text-[#722F37] group-hover:scale-110 transition-transform mb-2" />

                <span className="text-xs sm:text-sm font-bold text-[#4A151D]">

                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} photo(s) selected`
                    : 'Tap here to Choose or Take Photos'}

                </span>

                <span className="text-[11px] text-gray-400 mt-1">
                  High-resolution phone photos supported. Images are automatically compressed.
                </span>

                <input
                  id="photo-input"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />

              </label>

            </div>

            {/* SELECTED PHOTO INFORMATION */}

            {selectedFiles.length > 0 && (

              <div className="flex items-center justify-between text-xs bg-amber-50 text-amber-900 px-4 py-2 rounded-xl border border-amber-200">

                <span>
                  {selectedFiles.length} file(s) ready to upload
                </span>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setSelectedFiles([]);

                    const inputEl = document.getElementById('photo-input');

                    if (inputEl) inputEl.value = '';
                  }}
                  className="text-red-500 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  Clear
                </button>

              </div>

            )}

            {/* UPLOAD BUTTON */}

            <button
              type="submit"
              disabled={uploading || selectedFiles.length === 0}
              className="w-full bg-gradient-to-r from-[#722F37] to-[#4A151D] hover:from-[#5A252C] hover:to-[#3B1B0D] text-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >

              {uploading
                ? 'Preparing / Uploading Photos...'
                : 'Post Photos to Live Gallery 💖'}

            </button>

          </form>

        </div>

        {/* GALLERY HEADER */}

        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">

          <h2 className="text-xl font-serif font-bold text-[#4A151D]">
            All Moments ({photos.length})
          </h2>

          <button
            onClick={() => fetchPhotos()}
            disabled={loadingPhotos}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#722F37] hover:text-[#4A151D] bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw className={loadingPhotos ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

        </div>

        {/* PHOTO GRID */}

        {loadingPhotos && photos.length === 0 ? (

          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm border border-gray-100">
            <FiRefreshCw className="animate-spin text-3xl text-[#722F37] mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              Loading wedding photos...
            </p>
          </div>

        ) : photos.length === 0 ? (

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
                  src={photo.url}
                  alt={photo.original_name || 'Wedding Photo'}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#4A151D]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">

                  <p className="text-xs font-bold truncate flex items-center gap-1">
                    <FiHeart className="text-[#D4AF37]" />
                    <span>{photo.uploaded_by || 'A Loved Guest'}</span>
                  </p>

                  <p className="text-[10px] text-white/70">
                    {photo.uploaded_at
                      ? new Date(photo.uploaded_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : ''}
                  </p>

                </div>

                <div className="absolute top-2 right-2 w-7 h-7 bg-black/40 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiMaximize2 />
                </div>

              </div>

            ))}

          </div>

        )}

        {/* FULLSCREEN PHOTO VIEWER */}

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
                src={activePhoto.url}
                alt="Enlarged wedding moment"
                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/10"
              />

              <div className="mt-4 text-center text-white">

                <p className="text-sm font-bold text-[#F3E5AB]">
                  Shared by {activePhoto.uploaded_by || 'A Loved Guest'}
                </p>

                <p className="text-xs text-white/50">
                  {activePhoto.uploaded_at
                    ? new Date(activePhoto.uploaded_at).toLocaleString()
                    : ''}
                </p>

              </div>

            </div>

          </div>

        )}

        {/* QR CODE MODAL */}

        {showQrModal && (

          <div
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >

            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDFBF7] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-[#D4AF37] text-center relative animate-fade-in"
            >

              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-[#4A151D] hover:bg-gray-100 transition-colors"
              >
                <FiX className="text-xl" />
              </button>

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

              <div className="bg-white p-4 rounded-2xl shadow-inner border border-[#D4AF37]/30 inline-block mb-4">

                <img
                  src={qrCodeImageUrl}
                  alt="Wedding Gallery QR Code"
                  className="w-52 h-52 mx-auto rounded-lg object-contain"
                />

              </div>

              <p className="text-[11px] text-gray-500 font-mono mb-5 truncate px-2">
                {galleryUrl}
              </p>

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

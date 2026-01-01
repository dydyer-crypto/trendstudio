import { supabase } from '@/db/supabase';

const BUCKET_NAME = 'app-8l72dx9ovd34_trendstudio_images';
const MAX_FILE_SIZE = 1048576; // 1MB
const MAX_RESOLUTION = 1080;
const COMPRESSION_QUALITY = 0.8;

/**
 * Compress image to meet size requirements
 */
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if larger than max resolution
        if (width > MAX_RESOLUTION || height > MAX_RESOLUTION) {
          if (width > height) {
            height = (height / width) * MAX_RESOLUTION;
            width = MAX_RESOLUTION;
          } else {
            width = (width / height) * MAX_RESOLUTION;
            height = MAX_RESOLUTION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Try different quality levels to get under 1MB
        let quality = COMPRESSION_QUALITY;
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              if (blob.size <= MAX_FILE_SIZE || quality <= 0.1) {
                const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                  type: 'image/webp',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                tryCompress();
              }
            },
            'image/webp',
            quality
          );
        };

        tryCompress();
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Validate and sanitize filename
 */
const sanitizeFilename = (filename: string): string => {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '');
  // Keep only alphanumeric characters and underscores
  const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9_]/g, '_');
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `${sanitized}_${timestamp}.webp`;
};

/**
 * Upload image to Supabase storage
 * Automatically compresses if file is too large
 */
export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; compressed: boolean; finalSize: number }> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, WEBP, or AVIF images.');
  }

  let fileToUpload = file;
  let compressed = false;

  // Check if compression is needed
  if (file.size > MAX_FILE_SIZE) {
    onProgress?.(10);
    try {
      fileToUpload = await compressImage(file);
      compressed = true;
      onProgress?.(50);
    } catch (error) {
      throw new Error('Failed to compress image. Please try a smaller file.');
    }
  } else {
    onProgress?.(30);
  }

  // Sanitize filename
  const filename = sanitizeFilename(file.name);

  // Upload to Supabase
  onProgress?.(60);
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  onProgress?.(90);

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  onProgress?.(100);

  return {
    url: urlData.publicUrl,
    compressed,
    finalSize: fileToUpload.size,
  };
};

/**
 * Delete image from Supabase storage
 */
export const deleteImage = async (url: string): Promise<void> => {
  // Extract filename from URL
  const filename = url.split('/').pop();
  if (!filename) {
    throw new Error('Invalid image URL');
  }

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filename]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
};

/**
 * Convert file to base64 (without data URI prefix)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URI prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
};

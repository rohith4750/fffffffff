import { CloudinaryConfig } from '../types';

const CLOUDINARY_STORAGE_KEY = 'finflow_cloudinary_config';

export function getCloudinaryConfig(): CloudinaryConfig {
  const saved = localStorage.getItem(CLOUDINARY_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    cloudName: 'demo-finance-hub',
    uploadPreset: 'finance_docs',
    isConfigured: false,
  };
}

export function saveCloudinaryConfig(config: CloudinaryConfig): void {
  localStorage.setItem(CLOUDINARY_STORAGE_KEY, JSON.stringify(config));
}

/**
 * Upload an image file to Cloudinary with automatic fallback
 */
export async function uploadToCloudinary(
  file: File | Blob,
  config: CloudinaryConfig = getCloudinaryConfig()
): Promise<{ url: string; publicId?: string; isLocalFallback: boolean }> {
  // If user configured Cloudinary, attempt real upload
  if (config.isConfigured && config.cloudName && config.uploadPreset) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', config.uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        return {
          url: data.secure_url || data.url,
          publicId: data.public_id,
          isLocalFallback: false,
        };
      }
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local object storage', err);
    }
  }

  // Fallback: Read file to base64 Data URL
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result as string,
        publicId: `local_${Date.now()}`,
        isLocalFallback: true,
      });
    };
    reader.readAsDataURL(file);
  });
}

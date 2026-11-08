const STICKER_STAGE_COLORS: Record<string, string> = {
  '/assets/sticker-coding.webp': '#FDD2D0',
  '/assets/sticker-coding.jpg': '#FDD2D0',
  '/assets/sticker-robotics.webp': '#E2E9FB',
  '/assets/sticker-robotics.jpg': '#E2E9FB',
  '/assets/sticker-data.webp': '#FEE3A6',
  '/assets/sticker-data.jpg': '#FEE3A6',
  '/assets/sticker-security.webp': '#C0F5D8',
  '/assets/sticker-security.jpg': '#C0F5D8',
  '/assets/sticker-oop.webp': '#CAF9FD',
  '/assets/sticker-oop.jpg': '#CAF9FD',
  '/assets/sticker-design.webp': '#FFD5DA',
  '/assets/sticker-design.jpg': '#FFD5DA',
  '/assets/sticker-ai.webp': '#E9D7FD',
  '/assets/sticker-ai.jpg': '#E9D7FD',
};

export function toWebpAssetPath(assetUrl: string): string {
  if (!assetUrl) return '/assets/sticker-coding.webp';
  if (assetUrl.startsWith('/assets/') && assetUrl.endsWith('.jpg')) {
    return assetUrl.replace(/\.jpg$/, '.webp');
  }
  return assetUrl;
}

export function getStickerStageBackground(assetUrl: string, fallbackColor: string): string {
  const normalized = toWebpAssetPath(assetUrl);
  return STICKER_STAGE_COLORS[normalized] || STICKER_STAGE_COLORS[assetUrl] || `${fallbackColor}24`;
}

export function convertImageFileToWebpDataUrl(
  file: File,
  maxDimension = 1024,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result) {
        reject(new Error('Data gambar kosong'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let targetWidth = img.naturalWidth || img.width || 512;
          let targetHeight = img.naturalHeight || img.height || 512;

          if (targetWidth > maxDimension || targetHeight > maxDimension) {
            if (targetWidth >= targetHeight) {
              targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
              targetWidth = maxDimension;
            } else {
              targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
              targetHeight = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl.startsWith('data:image/webp')) {
            resolve(webpUrl);
          } else {
            resolve(canvas.toDataURL('image/png'));
          }
        } catch {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

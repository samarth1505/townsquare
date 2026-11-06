// Builds image URLs the way an image CDN expects them: same original, different transform parameters.
// Real CDNs (Cloudflare Images, Cloudinary, imgix, the Next.js optimiser) all work like this:
//   <origin url>?w=<width>&q=<quality>&format=auto   ->   resized, recompressed, cached at the edge.
export const IMAGE_WIDTHS = [320, 640, 960] as const; // the sizes we offer the browser
const IMAGE_QUALITY = 75;

export function cdnUrl(src: string, width: number): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(IMAGE_QUALITY));
  url.searchParams.set("format", "auto"); // the CDN picks AVIF/WebP/JPEG from the browser's Accept header
  return url.toString();
}

// "…?w=320… 320w, …?w=640… 640w, …"  (the `w` descriptor tells the browser each file's real width)
export function buildSrcSet(src: string): string {
  return IMAGE_WIDTHS.map((width) => `${cdnUrl(src, width)} ${width}w`).join(", ");
}

import type { ComponentProps } from "react";
import { buildSrcSet, cdnUrl, IMAGE_WIDTHS } from "@/shared/lib/imageCdn";

type ImageProps = Omit<
  ComponentProps<"img">,
  "src" | "srcSet" | "loading" | "fetchPriority" | "width" | "height"
> & {
  src: string; // the ORIGINAL url (the CDN variants are derived from it)
  alt: string; // required: use "" only for purely decorative images
  width: number; // intrinsic size: reserves the box before the file arrives (no layout shift)
  height: number;
  sizes: string; // tells the browser how wide the image will be on screen, so it picks the right file
  priority?: boolean; // true for above-the-fold / LCP images: load immediately and first
};

// The one image component the whole app uses, so every image gets the same performance defaults.
export default function Image({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  ...rest
}: ImageProps) {
  return (
    <img
      src={cdnUrl(src, IMAGE_WIDTHS[1])} // fallback for browsers without srcset
      srcSet={buildSrcSet(src)} // several widths: the browser downloads the smallest that is sharp enough
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      {...rest}
    />
  );
}

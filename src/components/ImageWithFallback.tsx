import { useState } from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function ImageWithFallback({
  src,
  alt,
  fallback = "/image-fallback.png",
  ...props
}: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallback) setImgSrc(fallback); // ⛔ sekali doang fallback
      }}
      {...props}
    />
  );
}

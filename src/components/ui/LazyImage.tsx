import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = "", 
  placeholderColor = "bg-white/5" 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver is not available, just load the image
    if (!window.IntersectionObserver) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]); // Re-observe if src changes

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className} ${!isLoaded && !hasError ? placeholderColor : ''}`}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-all duration-700 ${isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'}`}
          referrerPolicy="no-referrer"
        />
      )}
      
      {(!isLoaded && !hasError) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500/10 border-t-indigo-500/80 animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/5 p-4 text-center">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-600 text-xs font-bold">404</span>
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{alt}</p>
        </div>
      )}
    </div>
  );
};

export default LazyImage;

"use client";

import React, { useState, useEffect, useRef, TouchEvent, MouseEvent } from "react";

interface GalleryImage {
  id: number;
  image_url: string;
  caption: string | null;
}

interface ProductGalleryProps {
  gallery: GalleryImage[];
  businessName: string;
}

export default function ProductGallery({ gallery, businessName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Lightbox Zoom/Pan State
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);

  // Dragging & Gestures states
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const pinchStartDist = useRef(0);
  const startScale = useRef(1);
  const startTx = useRef(0);
  const startTy = useRef(0);
  const isPinching = useRef(false);
  const isPanning = useRef(false);
  const lastTap = useRef<number>(0);

  // Auto transition for primary carousel
  useEffect(() => {
    if (gallery.length <= 1 || lightboxOpen) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [gallery.length, lightboxOpen]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        nextLightbox();
      } else if (e.key === "ArrowLeft") {
        prevLightbox();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, gallery.length]);

  // Disable page scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    resetZoom();
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    resetZoom();
  };

  const resetZoom = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % gallery.length);
    resetZoom();
  };

  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    resetZoom();
  };

  // Safe boundary constraints calculator
  const applyBoundaries = (newTx: number, newTy: number, currentScale: number) => {
    if (currentScale <= 1) {
      return { x: 0, y: 0 };
    }
    const limitX = (window.innerWidth / 2) * (currentScale - 1);
    const limitY = (window.innerHeight / 2) * (currentScale - 1);
    return {
      x: Math.max(-limitX, Math.min(limitX, newTx)),
      y: Math.max(-limitY, Math.min(limitY, newTy)),
    };
  };

  // Coordinate-based double-click zoom for desktop
  const handleDoubleClick = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    if (scale > 1) {
      resetZoom();
    } else {
      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const midX = rect.width / 2;
      const midY = rect.height / 2;

      const targetScale = 2.5;

      const newTx = (midX - clickX) * (targetScale - 1);
      const newTy = (midY - clickY) * (targetScale - 1);

      const bounded = applyBoundaries(newTx, newTy, targetScale);
      setScale(targetScale);
      setTx(bounded.x);
      setTy(bounded.y);
    }
  };

  // Desktop Mouse Drag to Pan
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - tx, y: e.clientY - ty };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const newTx = e.clientX - dragStart.current.x;
    const newTy = e.clientY - dragStart.current.y;

    const bounded = applyBoundaries(newTx, newTy, scale);
    setTx(bounded.x);
    setTy(bounded.y);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Pinch/Zoom Gesture Helpers
  const getPinchDist = (e: TouchEvent) => {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Coordinate-based double-tap and drag touch controls
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (e.touches.length === 2) {
      isPinching.current = true;
      pinchStartDist.current = getPinchDist(e);
      startScale.current = scale;
    } else if (e.touches.length === 1) {
      // Check for double tap zoom
      if (now - lastTap.current < DOUBLE_TAP_DELAY) {
        if (scale > 1) {
          resetZoom();
        } else {
          const rect = e.currentTarget.getBoundingClientRect();
          const touch = e.touches[0];
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;

          const midX = rect.width / 2;
          const midY = rect.height / 2;

          const targetScale = 2.5;
          const newTx = (midX - touchX) * (targetScale - 1);
          const newTy = (midY - touchY) * (targetScale - 1);

          const bounded = applyBoundaries(newTx, newTy, targetScale);
          setScale(targetScale);
          setTx(bounded.x);
          setTy(bounded.y);
        }
        e.preventDefault();
        return;
      }

      lastTap.current = now;
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      if (scale > 1.05) {
        isPanning.current = true;
        startTx.current = tx;
        startTy.current = ty;
      }
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isPinching.current && e.touches.length === 2) {
      const newDist = getPinchDist(e);
      const newScale = Math.min(5, Math.max(1, startScale.current * (newDist / pinchStartDist.current)));
      setScale(newScale);
    } else if (isPanning.current && e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      
      const bounded = applyBoundaries(startTx.current + dx, startTy.current + dy, scale);
      setTx(bounded.x);
      setTy(bounded.y);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      if (isPinching.current || isPanning.current) {
        if (scale <= 1.05) {
          resetZoom();
        }
      } else {
        // Swipe triggers for navigation
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        if (Math.abs(dx) > 60 && scale <= 1.05) {
          if (dx < 0) {
            nextLightbox();
          } else {
            prevLightbox();
          }
        }
      }
      isPinching.current = false;
      isPanning.current = false;
    }
  };

  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="p-[1.15rem_1.2rem] bg-[#f4f7fa] border border-[#d8e4ee] rounded-[14px]">
      <p className="text-[0.7rem] font-bold tracking-[0.12em] uppercase text-rexon-blue mb-[0.85rem] flex items-center gap-1.5">
        <i className="fa-regular fa-images text-sm"></i>Our Products
      </p>

      {/* Main Carousel Wrapper */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-inner aspect-[16/10]">
        {gallery.map((img, idx) => (
          <div
            key={img.id}
            onClick={() => openLightbox(idx)}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out cursor-pointer flex flex-col justify-end ${
              idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <img
              src={img.image_url}
              alt={img.caption || businessName}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/70 to-transparent text-white text-[0.78rem] p-4 text-center font-medium">
                {img.caption.trim()}
              </div>
            )}
          </div>
        ))}

        {/* Carousel controls */}
        {gallery.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length)}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center hover:bg-slate-900/60 hover:scale-105 active:scale-95 transition-all outline-none border-none cursor-pointer"
              aria-label="Previous image"
            >
              <i className="fa-solid fa-chevron-left text-sm"></i>
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % gallery.length)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/40 text-white flex items-center justify-center hover:bg-slate-900/60 hover:scale-105 active:scale-95 transition-all outline-none border-none cursor-pointer"
              aria-label="Next image"
            >
              <i className="fa-solid fa-chevron-right text-sm"></i>
            </button>

            {/* Indicator dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {gallery.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all border-none outline-none cursor-pointer ${
                    idx === activeIndex ? "bg-rexon-blue scale-110" : "bg-slate-400/75"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Overlay */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
          {/* Blur backdrop */}
          <div
            onClick={closeLightbox}
            className="absolute inset-0 bg-[#081020]/95 backdrop-blur-[10px] animate-fade-in"
          />

          {/* Close button (top right of screen, below the 68px navbar) */}
          <button
            onClick={closeLightbox}
            className="fixed top-24 right-6 z-[10000] w-11 h-11 flex items-center justify-center rounded-full text-white bg-slate-900/60 border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md hover:bg-slate-900/80 active:scale-95 transition-all outline-none cursor-pointer select-none"
            aria-label="Close image viewer"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>

          {/* Lightbox Slider container */}
          <div className="relative w-full max-w-4xl px-4 flex items-center justify-center">
            {/* Arrows */}
            {gallery.length > 1 && (
              <>
                <button
                  onClick={prevLightbox}
                  className="absolute left-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none border-none cursor-pointer hidden md:flex"
                  aria-label="Previous"
                >
                  <i className="fa-solid fa-chevron-left text-lg"></i>
                </button>
                <button
                  onClick={nextLightbox}
                  className="absolute right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none border-none cursor-pointer hidden md:flex"
                  aria-label="Next"
                >
                  <i className="fa-solid fa-chevron-right text-lg"></i>
                </button>
              </>
            )}

            {/* Active image wrap with integrated gestures */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="flex flex-col items-center justify-center h-[80vh] w-full select-none"
            >
              <div className="relative overflow-hidden flex items-center justify-center w-full h-full touch-none">
                <img
                  src={gallery[lightboxIndex].image_url}
                  alt={gallery[lightboxIndex].caption || businessName}
                  style={{
                    transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                    cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                  }}
                  onDoubleClick={handleDoubleClick}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl transition-transform duration-100 ease-out select-none pointer-events-auto"
                />
              </div>

              {/* Caption */}
              {gallery[lightboxIndex].caption && (
                <div className="text-white/90 text-sm mt-3 text-center px-6 max-w-2xl font-light">
                  {gallery[lightboxIndex].caption.trim()}
                </div>
              )}

              {/* Slider count */}
              <div className="text-white/60 text-xs mt-2 select-none tracking-wider uppercase font-semibold">
                {lightboxIndex + 1} / {gallery.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

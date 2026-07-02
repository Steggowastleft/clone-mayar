import React, { useState, useEffect, useRef } from "react";
import { ZoomIn, ZoomOut, Maximize2, Minimize2 } from "lucide-react";

type Props = {
  fileUrls: string[];
  title: string;
};

export default function ComicViewer({ fileUrls = [], title }: Props) {
  const [zoomLevel, setZoomLevel] = useState<number>(2); // 1 to 4
  const [currentPage, setCurrentPage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track current page on scroll using IntersectionObserver
  useEffect(() => {
    const observers = pageRefs.current.map((ref, index) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setCurrentPage(index + 1);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((obs) => obs?.disconnect());
    };
  }, [fileUrls]);

  // Width class based on zoom level
  const getZoomWidthClass = () => {
    switch (zoomLevel) {
      case 1: return "max-w-md";
      case 2: return "max-w-2xl";
      case 3: return "max-w-4xl";
      case 4: return "max-w-6xl";
      default: return "max-w-2xl";
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 1));
  };

  if (fileUrls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl text-slate-400">
        <p className="text-sm font-semibold">Komik tidak memiliki halaman gambar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Comic Toolbar */}
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm sticky top-16 z-10">
        <div className="flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-800 line-clamp-1">{title}</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mode Membaca Vertikal (Scroll)</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Zoom controls */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel === 1}
              className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition hover:bg-white rounded-lg"
              title="Perkecil Gambar"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[10px] font-bold text-slate-500 w-12 text-center select-none">
              Zoom: {zoomLevel * 50 + 50}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel === 4}
              className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 transition hover:bg-white rounded-lg"
              title="Perbesar Gambar"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Page indicator */}
          <div className="bg-blue-50 border border-blue-100 text-blue-700 text-xs font-black px-3.5 py-2 rounded-xl select-none shrink-0 shadow-xs">
            Halaman {currentPage} / {fileUrls.length}
          </div>
        </div>
      </div>

      {/* Pages Container */}
      <div ref={containerRef} className="w-full space-y-4 flex flex-col items-center">
        {fileUrls.map((url, index) => (
          <div
            key={index}
            ref={(el) => { pageRefs.current[index] = el; }}
            className={`w-full transition-all duration-300 ${getZoomWidthClass()} bg-white border border-slate-150 p-2 rounded-2xl shadow-sm`}
          >
            <img
              src={url}
              alt={`Halaman ${index + 1}`}
              loading="lazy"
              className="w-full h-auto object-contain rounded-xl select-none"
            />
          </div>
        ))}
      </div>

      {/* Page indicator overlay at bottom */}
      <div className="fixed bottom-6 bg-slate-900/90 backdrop-blur text-white text-[10px] font-black px-4 py-2 rounded-full border border-slate-800 shadow-lg select-none z-20">
        HALAMAN {currentPage} DARI {fileUrls.length}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Play, PlayCircle, Minimize, Maximize, RotateCcw, Volume2 } from "lucide-react";

type Props = {
  url: string;
  title: string;
  productId: number;
};

export default function VideoViewer({ url, title, productId }: Props) {
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [playbackTimeLoaded, setPlaybackTimeLoaded] = useState<boolean>(false);
  const [savedTimeText, setSavedTimeText] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const storageKey = `video_playback_position_${productId}`;

  // Restore playback position on mount
  useEffect(() => {
    const savedTime = localStorage.getItem(storageKey);
    if (savedTime && videoRef.current) {
      const time = parseFloat(savedTime);
      if (time > 2) { // Only prompt if progressed more than 2 seconds
        videoRef.current.currentTime = time;
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        setSavedTimeText(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      }
    }
    setPlaybackTimeLoaded(true);
  }, [productId, url]);

  // Periodically save playback position
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      // Save every 3 seconds or when playing
      if (video.currentTime > 0 && !video.ended) {
        localStorage.setItem(storageKey, String(video.currentTime));
      }
    };

    const handleEnded = () => {
      // Clear storage on video end
      localStorage.removeItem(storageKey);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [productId, url]);

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      localStorage.removeItem(storageKey);
      setSavedTimeText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Container & Header */}
      <div className={`transition-all duration-300 ${theaterMode ? "max-w-none w-full" : "max-w-4xl mx-auto"}`}>
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm space-y-4 p-4">
          <div className="flex justify-between items-center px-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-800 line-clamp-1">{title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Pemutar Video Premium</p>
            </div>
            
            <button
              onClick={() => setTheaterMode(!theaterMode)}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              {theaterMode ? <Minimize size={14} /> : <Maximize size={14} />}
              {theaterMode ? "Tampilan Normal" : "Mode Bioskop"}
            </button>
          </div>

          {/* HTML5 Video Player */}
          <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden relative shadow-inner group">
            <video
              ref={videoRef}
              src={url}
              controls
              className="w-full h-full object-contain"
              preload="metadata"
            />
          </div>

          {/* Controls Footer */}
          {savedTimeText && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="text-blue-800 font-medium flex items-center gap-2">
                <PlayCircle size={16} className="text-blue-500 shrink-0" />
                <span>Melanjutkan pemutaran terakhir dari menit <strong className="font-extrabold">{savedTimeText}</strong></span>
              </div>
              <button
                onClick={handleRestart}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg flex items-center gap-1 w-fit transition shrink-0"
              >
                <RotateCcw size={12} /> Ulang dari Awal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

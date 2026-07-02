import React, { useState } from "react";
import { BookOpen, Type, AlignLeft } from "lucide-react";

type Props = {
  title: string;
  content: string;
  createdAt?: string;
  author?: string;
};

type Theme = "light" | "sepia" | "dark";
type FontSize = "sm" | "base" | "lg" | "xl" | "2xl";

export default function TextViewer({ title, content, createdAt, author = "Administrator" }: Props) {
  const [theme, setTheme] = useState<Theme>("sepia");
  const [fontSize, setFontSize] = useState<FontSize>("lg");

  // Font size configuration mapping
  const fontSizeClasses: Record<FontSize, string> = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg md:text-xl leading-loose",
    xl: "text-xl md:text-2xl leading-loose",
    "2xl": "text-2xl md:text-3xl leading-loose",
  };

  // Theme configuration color styles mapping
  const themeClasses: Record<Theme, string> = {
    light: "bg-slate-50 text-slate-800 border-slate-200/60",
    sepia: "bg-[#F9F6EE] text-[#433422] border-[#E8DFC8]",
    dark: "bg-zinc-900 text-zinc-100 border-zinc-800",
  };

  const getThemeBg = () => {
    if (theme === "sepia") return "bg-[#FCFBF7]";
    if (theme === "dark") return "bg-zinc-950";
    return "bg-white";
  };

  // Reading duration helper
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  return (
    <div className={`space-y-6 max-w-4xl mx-auto rounded-3xl p-1 transition-all ${getThemeBg()}`}>
      {/* Settings bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <BookOpen className="text-blue-500" size={20} />
          <div>
            <h2 className="text-xs font-black text-slate-800 line-clamp-1">{title}</h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {wordCount} Kata · {readingTime} Menit Baca
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme selectors */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
            {(["light", "sepia", "dark"] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                  theme === t
                    ? "bg-white text-slate-800 shadow-xs border border-slate-200/20"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Font size selectors */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
            <button
              onClick={() => setFontSize(fontSize === "2xl" ? "xl" : fontSize === "xl" ? "lg" : fontSize === "lg" ? "base" : "sm")}
              disabled={fontSize === "sm"}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition font-bold"
              title="Perkecil Font"
            >
              A-
            </button>
            <span className="w-0.5 h-4 bg-slate-250 inline-block" />
            <button
              onClick={() => setFontSize(fontSize === "sm" ? "base" : fontSize === "base" ? "lg" : fontSize === "lg" ? "xl" : "2xl")}
              disabled={fontSize === "2xl"}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 disabled:opacity-30 transition font-bold"
              title="Perbesar Font"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Reader area */}
      <div className={`rounded-3xl p-6 sm:p-12 md:p-16 border shadow-sm transition-all duration-300 ${themeClasses[theme]}`}>
        <article className="max-w-2xl mx-auto space-y-8 font-lora">
          {/* Article Header */}
          <div className="text-center space-y-3 font-sans-custom pb-6 border-b border-dashed border-slate-350/20">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-xs font-semibold opacity-70">
              <span>Oleh: {author}</span>
              {createdAt && (
                <>
                  <span>·</span>
                  <span>{createdAt}</span>
                </>
              )}
            </div>
          </div>

          {/* Main content body */}
          <div
            className={`${fontSizeClasses[fontSize]} whitespace-pre-wrap font-medium prose max-w-none prose-slate`}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* End of module marker */}
          <div className="pt-10 flex flex-col items-center justify-center text-center opacity-60 border-t border-dashed border-slate-350/20 font-sans-custom space-y-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-[10px] font-bold tracking-widest uppercase mt-1">Selesai Membaca</p>
            <p className="text-[9px]">Materi ini tersimpan aman di dashboard Produk Saya Anda.</p>
          </div>
        </article>
      </div>
    </div>
  );
}

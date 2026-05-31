import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link, RefreshCw,
  Minus, Quote, Code,
  AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd,
  Trash2, SeparatorHorizontal, Subscript, Superscript,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  themeClass?: string;
}

// ─── Heading options ──────────────────────────────────────────────────────────
const HEADING_OPTIONS = [
  { label: "Paragraph", tag: "p",  fontSize: "14px", fontWeight: "400" },
  { label: "Headline 1",  tag: "h1", fontSize: "28px", fontWeight: "700" },
  { label: "Headline 2",  tag: "h2", fontSize: "22px", fontWeight: "700" },
  { label: "Headline 3",  tag: "h3", fontSize: "18px", fontWeight: "600" },
  { label: "Headline 4",  tag: "h4", fontSize: "15px", fontWeight: "600" },
  { label: "Headline 5",  tag: "h5", fontSize: "13px", fontWeight: "600" },
];

const FONT_FAMILIES = [
  { label: "Font (Default)", value: "inherit" },
  { label: "Arial", value: "Arial" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier New", value: "Courier New" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Verdana", value: "Verdana" },
  { label: "Comic Sans MS", value: "Comic Sans MS" }
];

const FONT_SIZES = ["10", "12", "14", "16", "18", "20", "24", "28", "32", "36", "48", "64"];

const TEXT_COLORS = [
  "#000000","#374151","#6B7280","#EF4444","#F97316","#EAB308",
  "#22C55E","#3B82F6","#8B5CF6","#EC4899","#14B8A6","#F59E0B",
];

const HIGHLIGHT_COLORS = [
  "#FEF08A","#BBF7D0","#BFDBFE","#FCA5A5","#F9A8D4","#DDD6FE",
  "#FED7AA","#99F6E4","#E0E7FF","#ffffff","transparent","",
];

// ─── Toolbar button helper ────────────────────────────────────────────────────
function ToolBtn({
  onClick, title, active = false, disabled = false, children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded transition-all text-gray-700 disabled:opacity-40 hover:bg-gray-200 ${
        active ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300" : ""
      }`}
    >
      {children}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Div() {
  return <div className="h-5 w-px bg-gray-300 mx-0.5 self-center" />;
}

// ─── Image settings popup ─────────────────────────────────────────────────────
interface ImageSettingsProps {
  img: HTMLImageElement;
  onClose: () => void;
  onUpdate: () => void;
}
function ImageSettings({ img, onClose, onUpdate }: ImageSettingsProps) {
  const [width, setWidth] = useState(img.style.width || img.getAttribute("width") || "");
  const [align, setAlign] = useState<string>(img.style.float || img.parentElement?.style.textAlign || "");

  const applyWidth = (w: string) => {
    img.style.width = w ? w + "px" : "";
    img.style.height = "auto";
    setWidth(w);
    onUpdate();
  };

  const applyAlign = (a: string) => {
    // Reset all alignment styles first
    img.style.float = "";
    img.style.display = "block";
    img.style.margin = "";
    if (a === "left") {
      img.style.float = "left";
      img.style.marginRight = "12px";
      img.style.marginBottom = "8px";
    } else if (a === "center") {
      img.style.display = "block";
      img.style.margin = "8px auto";
    } else if (a === "right") {
      img.style.float = "right";
      img.style.marginLeft = "12px";
      img.style.marginBottom = "8px";
    } else {
      img.style.display = "inline-block";
    }
    setAlign(a);
    onUpdate();
  };

  const removeImage = () => {
    img.remove();
    onUpdate();
    onClose();
  };

  return (
    <div
      className="absolute z-50 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-64"
      style={{ top: img.offsetTop + img.offsetHeight + 6, left: img.offsetLeft }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Pengaturan Gambar</p>

      {/* Alignment */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Perataan</p>
        <div className="flex gap-1">
          {[
            { a: "left",   icon: <AlignHorizontalJustifyStart className="h-4 w-4" />, title: "Kiri"   },
            { a: "center", icon: <AlignHorizontalJustifyCenter className="h-4 w-4" />, title: "Tengah" },
            { a: "right",  icon: <AlignHorizontalJustifyEnd className="h-4 w-4" />,  title: "Kanan"  },
            { a: "",       icon: <AlignJustify className="h-4 w-4" />,               title: "Inline" },
          ].map(({ a, icon, title }) => (
            <button
              key={a}
              type="button"
              title={title}
              onClick={() => applyAlign(a)}
              className={`flex-1 flex items-center justify-center p-1.5 rounded border transition ${
                align === a ? "bg-blue-100 border-blue-400 text-blue-700" : "border-gray-200 hover:bg-gray-100"
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Width */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-1">Lebar (px)</p>
        <div className="flex gap-1">
          {["25%","50%","75%","100%"].map(pct => (
            <button
              key={pct}
              type="button"
              onClick={() => {
                const parent = img.parentElement;
                const parentW = parent?.clientWidth || 600;
                const px = Math.round(parentW * parseInt(pct) / 100);
                applyWidth(String(px));
              }}
              className="flex-1 text-xs border border-gray-200 rounded py-1 hover:bg-blue-50 hover:border-blue-300 transition"
            >
              {pct}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Kustom px"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onBlur={(e) => applyWidth(e.target.value)}
          className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={removeImage}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 border border-red-200 rounded py-1.5 hover:bg-red-50 transition"
      >
        <Trash2 className="h-3.5 w-3.5" /> Hapus Gambar
      </button>
    </div>
  );
}

// ─── Main RichTextEditor ──────────────────────────────────────────────────────
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis deskripsi...",
}: RichTextEditorProps) {
  const editorRef    = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [selectedImg, setSelectedImg]   = useState<HTMLImageElement | null>(null);
  const [showHeading, setShowHeading]   = useState(false);
  const [showTextColor, setShowTextColor]   = useState(false);
  const [showHighlight, setShowHighlight]   = useState(false);
  const [showFontSize, setShowFontSize]     = useState(false);
  const [showFontFamily, setShowFontFamily] = useState(false);
  const [currentHeading, setCurrentHeading] = useState("Paragraph");
  const [currentFontFamily, setCurrentFontFamily] = useState("Font (Default)");
  const [currentFontSize, setCurrentFontSize] = useState("14");
  const [currentTextColor, setCurrentTextColor] = useState("#000000");

  // Sync value → DOM (only when value changes externally)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = (cmd: string, val = "") => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    handleInput();
  };

  // ── Heading ────────────────────────────────────────────────────────────────
  const applyHeading = (opt: typeof HEADING_OPTIONS[0]) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, opt.tag);
    setCurrentHeading(opt.label);
    setShowHeading(false);
    handleInput();
  };

  // ── Font Family ────────────────────────────────────────────────────────────
  const applyFontFamily = (font: string, label: string) => {
    exec("fontName", font);
    setCurrentFontFamily(label);
    setShowFontFamily(false);
  };

  // ── Font size ──────────────────────────────────────────────────────────────
  const applyFontSize = (size: string) => {
    // execCommand fontSize uses 1-7; wrap in span instead for px accuracy
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const span = document.createElement("span");
    span.style.fontSize = size + "px";
    range.surroundContents(span);
    sel.removeAllRanges();
    setCurrentFontSize(size);
    setShowFontSize(false);
    handleInput();
  };

  // ── Text/Highlight color ───────────────────────────────────────────────────
  const applyTextColor = (color: string) => {
    exec("foreColor", color);
    setCurrentTextColor(color);
    setShowTextColor(false);
  };
  const applyHighlight = (color: string) => {
    if (!color || color === "transparent") {
      exec("hiliteColor", "transparent");
    } else {
      exec("hiliteColor", color);
    }
    setShowHighlight(false);
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("File harus berupa gambar!"); return; }

    setIsUploading(true);
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await axios.post("/produk-digital/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url;
      editorRef.current?.focus();
      document.execCommand("insertHTML", false,
        `<img src="${url}" style="max-width:100%;display:block;margin:8px auto;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.12);" />`
      );
      handleInput();
      toast.success("Gambar berhasil diupload!");
    } catch {
      toast.error("Gagal mengupload gambar!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Image click → show settings ───────────────────────────────────────────
  const handleEditorClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      setSelectedImg(target as HTMLImageElement);
    } else {
      setSelectedImg(null);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => {
      setShowHeading(false);
      setShowTextColor(false);
      setShowHighlight(false);
      setShowFontSize(false);
      setShowFontFamily(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div
      className="border border-gray-200 rounded-lg overflow-visible bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all"
      style={{ position: "relative" }}
    >
      {/* ── TOOLBAR ──────────────────────────────────────────────────────── */}
      <div
        className="bg-gray-50 border-b border-gray-200 p-2 space-y-2 select-none"
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Row 1: Formatting options and Colors */}
        <div className="flex flex-wrap items-center gap-1">
          {/* Text Styles */}
          <div className="flex items-center bg-white rounded border border-gray-200 p-0.5 shadow-sm">
            <ToolBtn onClick={() => exec("bold")}          title="Tebal (Ctrl+B)"><Bold          className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("italic")}        title="Miring (Ctrl+I)"><Italic        className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("underline")}     title="Garis Bawah (Ctrl+U)"><Underline     className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("strikeThrough")} title="Coret"><Strikethrough  className="h-4 w-4" /></ToolBtn>
          </div>

          {/* Text Color */}
          <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowTextColor(v => !v); setShowHeading(false); setShowFontSize(false); setShowFontFamily(false); setShowHighlight(false); }}
              className="flex flex-col items-center gap-0 p-1 bg-white rounded border border-gray-200 shadow-sm hover:bg-gray-100 transition min-w-[32px] h-[32px] justify-center"
              title="Warna Teks"
            >
              <span className="text-sm font-bold text-gray-800 leading-none" style={{ color: currentTextColor }}>A</span>
              <span className="w-5.5 h-1 rounded-full mt-0.5" style={{ background: currentTextColor, width: '16px' }} />
            </button>
            {showTextColor && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 grid grid-cols-6 gap-1 w-36">
                {TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyTextColor(c); }}
                    className="w-5 h-5 rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowHighlight(v => !v); setShowHeading(false); setShowFontSize(false); setShowFontFamily(false); setShowTextColor(false); }}
              className="flex flex-col items-center gap-0 p-1 bg-white rounded border border-gray-200 shadow-sm hover:bg-gray-100 transition min-w-[32px] h-[32px] justify-center"
              title="Sorot Teks"
            >
              <span className="text-sm font-bold text-gray-800 leading-none px-0.5 bg-yellow-200">A</span>
              <span className="text-[8px] text-gray-500 leading-none mt-0.5">Highlight</span>
            </button>
            {showHighlight && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-40">
                <p className="text-[10px] text-gray-400 mb-1.5 font-medium">Warna Sorotan</p>
                <div className="grid grid-cols-6 gap-1">
                  {HIGHLIGHT_COLORS.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); applyHighlight(c); }}
                      className="w-5 h-5 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ background: c || "#fff" }}
                      title={c || "Hapus"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Alignment */}
          <div className="flex items-center bg-white rounded border border-gray-200 p-0.5 shadow-sm">
            <ToolBtn onClick={() => exec("justifyLeft")}    title="Rata Kiri"><AlignLeft    className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("justifyCenter")}  title="Rata Tengah"><AlignCenter  className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("justifyRight")}   title="Rata Kanan"><AlignRight   className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("justifyFull")}    title="Rata Penuh"><AlignJustify className="h-4 w-4" /></ToolBtn>
          </div>

          {/* Lists */}
          <div className="flex items-center bg-white rounded border border-gray-200 p-0.5 shadow-sm">
            <ToolBtn onClick={() => exec("insertUnorderedList")} title="Daftar Bullet"><List         className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("insertOrderedList")}   title="Daftar Angka"><ListOrdered  className="h-4 w-4" /></ToolBtn>
          </div>

          {/* Sub / Superscript */}
          <div className="flex items-center bg-white rounded border border-gray-200 p-0.5 shadow-sm">
            <ToolBtn onClick={() => exec("subscript")}   title="Subscript"><Subscript   className="h-4 w-4" /></ToolBtn>
            <ToolBtn onClick={() => exec("superscript")} title="Superscript"><Superscript className="h-4 w-4" /></ToolBtn>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center bg-white rounded border border-gray-200 p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => exec("undo")}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded transition text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={() => exec("redo")}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded transition text-gray-700 hover:bg-gray-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-7l-6 6m6-6l-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* Row 2: Selectors & Insertions */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Heading dropdown */}
          <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowHeading(v => !v); setShowFontSize(false); setShowFontFamily(false); setShowTextColor(false); setShowHighlight(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700 min-w-[120px] shadow-sm justify-between"
            >
              <span className="truncate">{currentHeading}</span>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </button>
            {showHeading && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-44">
                {HEADING_OPTIONS.map(opt => (
                  <button
                    key={opt.tag}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyHeading(opt); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition text-gray-800 text-xs border-b last:border-0 border-gray-100"
                    style={{ fontWeight: opt.fontWeight }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font Family Dropdown */}
          <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowFontFamily(v => !v); setShowHeading(false); setShowFontSize(false); setShowTextColor(false); setShowHighlight(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700 min-w-[120px] shadow-sm justify-between"
            >
              <span className="truncate">{currentFontFamily}</span>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </button>
            {showFontFamily && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-44">
                {FONT_FAMILIES.map(font => (
                  <button
                    key={font.value}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFontFamily(font.value, font.label); }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 transition text-gray-800 text-xs border-b last:border-0 border-gray-100"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Font size dropdown */}
          <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); setShowFontSize(v => !v); setShowHeading(false); setShowFontFamily(false); setShowTextColor(false); setShowHighlight(false); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border border-gray-200 bg-white hover:bg-gray-50 transition text-gray-700 w-20 shadow-sm justify-between"
            >
              <span>{currentFontSize}px</span>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </button>
            {showFontSize && (
              <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-y-auto max-h-48 w-24">
                {FONT_SIZES.map(sz => (
                  <button
                    key={sz}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); applyFontSize(sz); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition ${currentFontSize === sz ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-800"} border-b last:border-0 border-gray-100`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => exec("removeFormat")}
            title="Hapus Format Teks"
            className="p-1.5 bg-white rounded border border-gray-200 hover:bg-gray-100 transition shadow-sm text-gray-600 h-[32px] flex items-center justify-center"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>

          {/* Insertions (Link, Image, Code, Quote, Line) */}
          <div className="flex items-center bg-white rounded border border-gray-200 p-0.5 shadow-sm ml-auto">
            {/* Link */}
            <ToolBtn
              onClick={() => {
                const url = prompt("Masukkan URL Link:");
                if (url) exec("createLink", url);
              }}
              title="Tambah Link"
            >
              <Link className="h-4 w-4" />
            </ToolBtn>

            {/* Blockquote */}
            <ToolBtn onClick={() => exec("formatBlock", "blockquote")} title="Kutipan"><Quote className="h-4 w-4" /></ToolBtn>

            {/* Code block */}
            <ToolBtn
              onClick={() => {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) return;
                const range = sel.getRangeAt(0);
                const text = range.toString();
                const code = document.createElement("code");
                code.style.cssText = "background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;";
                code.textContent = text;
                range.deleteContents();
                range.insertNode(code);
                handleInput();
              }}
              title="Kode Inline"
            >
              <Code className="h-4 w-4" />
            </ToolBtn>

            {/* Horizontal rule */}
            <ToolBtn
              onClick={() => { exec("insertHorizontalRule"); }}
              title="Garis Pemisah"
            >
              <SeparatorHorizontal className="h-4 w-4" />
            </ToolBtn>

            {/* Image Upload */}
            <ToolBtn
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="Upload Gambar"
            >
              {isUploading
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <ImageIcon className="h-4 w-4" />}
            </ToolBtn>
          </div>

          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>
      </div>

      {/* ── EDITABLE AREA ────────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onClick={handleEditorClick}
          data-placeholder={placeholder}
          className="min-h-[220px] p-4 focus:outline-none text-sm text-gray-800 rte-content"
          style={{ wordBreak: "break-word" }}
        />
        {/* Image settings popup */}
        {selectedImg && (
          <ImageSettings
            img={selectedImg}
            onClose={() => setSelectedImg(null)}
            onUpdate={handleInput}
          />
        )}
      </div>

      {/* ── STYLES ───────────────────────────────────────────────────────── */}
      <style>{`
        .rte-content:empty::before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          pointer-events: none;
        }
        .rte-content h1 { font-size: 28px; font-weight: 700; margin: 12px 0 6px; line-height: 1.2; }
        .rte-content h2 { font-size: 22px; font-weight: 700; margin: 10px 0 5px; line-height: 1.25; }
        .rte-content h3 { font-size: 18px; font-weight: 600; margin: 8px 0 4px; }
        .rte-content h4 { font-size: 15px; font-weight: 600; margin: 6px 0 4px; }
        .rte-content h5 { font-size: 13px; font-weight: 600; margin: 6px 0 4px; }
        .rte-content p  { margin: 4px 0; line-height: 1.6; }
        .rte-content ul { list-style-type: disc;    padding-left: 24px; margin: 4px 0; }
        .rte-content ol { list-style-type: decimal; padding-left: 24px; margin: 4px 0; }
        .rte-content li { margin: 2px 0; }
        .rte-content blockquote {
          border-left: 4px solid #3B82F6;
          padding: 6px 14px;
          margin: 8px 0;
          color: #4B5563;
          background: #EFF6FF;
          border-radius: 0 6px 6px 0;
        }
        .rte-content a { color: #3B82F6; text-decoration: underline; }
        .rte-content hr { border: none; border-top: 2px solid #E5E7EB; margin: 12px 0; }
        .rte-content img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          cursor: pointer;
          transition: outline 0.15s;
        }
        .rte-content img:hover { outline: 2px solid #3B82F6; }
        .rte-content img.selected { outline: 2px solid #3B82F6; }
      `}</style>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Plus, Video, MapPin, Search, Loader2, X,
  Clock, User, Pencil, Trash2, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "./components/DatePickers";

// Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type GeoResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export type Sesi = {
  id: number;
  judul: string;
  deskripsi?: string;
  is_online: boolean;
  link_sesi?: string;
  lokasi?: string;
  lat?: number;
  lng?: number;
  nama_pemateri?: string;
  profil_pemateri?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
};

// ─────────────────────────────────────────────
// FlyTo helper
// ─────────────────────────────────────────────
function FlyTo({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.flyTo(position, 16, { duration: 1.2 }); }, [position]);
  return null;
}

function MapClickMarker({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  const map = useMap() as any;
  useEffect(() => {
    const handler = (e: L.LeafletMouseEvent) => onSelect(e.latlng.lat, e.latlng.lng);
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [map, onSelect]);
  return null;
}

// ─────────────────────────────────────────────
// Form kosong default
// ─────────────────────────────────────────────
const emptyForm = {
  judul: "", deskripsi: "", linkSesi: "",
  lokasi: "", namaPemateri: "", profilPemateri: "",
};
const emptyWaktu = { date: undefined as Date | undefined, time: "" };

// ─────────────────────────────────────────────
// Sesi Card
// ─────────────────────────────────────────────
function SesiCard({
  sesi,
  bootcampId,
  onEdit,
}: {
  sesi: Sesi;
  bootcampId: number;
  onEdit: (sesi: Sesi) => void;
}) {
  const [hapusOpen, setHapusOpen] = useState(false);

  const handleHapus = () => {
    router.delete(`/bootcamps/${bootcampId}/sesi/${sesi.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Sesi berhasil dihapus.");
        router.reload({ only: ["sesiList"] });
      },
      onError: () => toast.error("Gagal menghapus sesi."),
    });
  };

  return (
    <>
      <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Judul + badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-800 text-sm">{sesi.judul}</h4>
              <Badge className={cn(
                "text-xs text-white",
                sesi.is_online ? "bg-blue-500" : "bg-emerald-500"
              )}>
                {sesi.is_online ? "Online" : "Offline"}
              </Badge>
            </div>

            {/* Waktu */}
            {sesi.waktu_mulai && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" />
                {sesi.waktu_mulai}
                {sesi.waktu_selesai && ` – ${sesi.waktu_selesai}`}
              </p>
            )}

            {/* Lokasi / Link */}
            {sesi.is_online ? (
              sesi.link_sesi && (
                <a
                  href={sesi.link_sesi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate"
                >
                  <Globe className="h-3 w-3 shrink-0" />
                  {sesi.link_sesi}
                </a>
              )
            ) : (
              sesi.lokasi && (
                <p className="text-xs text-gray-500 flex items-start gap-1 mt-1">
                  <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{sesi.lokasi}</span>
                </p>
              )
            )}

            {/* Pemateri */}
            {sesi.nama_pemateri && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                <User className="h-3 w-3" /> {sesi.nama_pemateri}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(sesi)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setHapusOpen(true)}
              className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirm hapus */}
      <Dialog open={hapusOpen} onOpenChange={setHapusOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus Sesi?</DialogTitle>
            <DialogDescription>Sesi <strong>{sesi.judul}</strong> akan dihapus permanen.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setHapusOpen(false)}>Batal</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => { handleHapus(); setHapusOpen(false); }}>
              Ya, Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─────────────────────────────────────────────
// Main Tab
// ─────────────────────────────────────────────
export default function TabSesiMeeting({
  bootcampId,
  initialSesiList = [],
}: {
  bootcampId: number;
  initialSesiList?: Sesi[];
}) {
  const [createOpen,  setCreateOpen]  = useState(false);
  const [isOnline,    setIsOnline]    = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSesi,  setEditingSesi]  = useState<Sesi | null>(null);
  const [sesiList,     setSesiList]     = useState<Sesi[]>(initialSesiList);
  const [errors,       setErrors]       = useState<Record<string, string>>({});

  const [sesiForm,     setSesiForm]  = useState(emptyForm);
  const [waktuMulai,   setWaktuMulai]   = useState(emptyWaktu);
  const [waktuSelesai, setWaktuSelesai] = useState(emptyWaktu);

  // Peta & geocoding
  const [markerPos,    setMarkerPos]    = useState<[number, number] | null>(null);
  const [flyTarget,    setFlyTarget]    = useState<[number, number] | null>(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [suggestions,  setSuggestions]  = useState<GeoResult[]>([]);
  const [isSearching,  setIsSearching]  = useState(false);
  const [searchError,  setSearchError]  = useState("");
  const [foundAddress, setFoundAddress] = useState("");
  const [savedLat,     setSavedLat]     = useState<number | null>(null);
  const [savedLng,     setSavedLng]     = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync sesiList dari props jika reload ──
  const page = usePage<{ sesiList?: Sesi[] }>();
  useEffect(() => {
    if (page.props.sesiList) setSesiList(page.props.sesiList);
  }, [page.props.sesiList]);

  // ── Buka form edit ──
  const handleOpenEdit = (sesi: Sesi) => {
    setEditingSesi(sesi);
    setIsOnline(sesi.is_online);
    setSesiForm({
      judul:         sesi.judul           || "",
      deskripsi:     sesi.deskripsi       || "",
      linkSesi:      sesi.link_sesi       || "",
      lokasi:        sesi.lokasi          || "",
      namaPemateri:  sesi.nama_pemateri   || "",
      profilPemateri:sesi.profil_pemateri || "",
    });
    if (sesi.lat && sesi.lng) {
      const pos: [number, number] = [sesi.lat, sesi.lng];
      setMarkerPos(pos);
      setFlyTarget(pos);
      setSavedLat(sesi.lat);
      setSavedLng(sesi.lng);
      setFoundAddress(sesi.lokasi || "");
      setSearchQuery(sesi.lokasi || "");
    }
    setCreateOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateOpen(false);
    setEditingSesi(null);
    setSesiForm(emptyForm);
    setWaktuMulai(emptyWaktu);
    setWaktuSelesai(emptyWaktu);
    setMarkerPos(null);
    setFlyTarget(null);
    setSearchQuery("");
    setSuggestions([]);
    setFoundAddress("");
    setSearchError("");
    setSavedLat(null);
    setSavedLng(null);
    setErrors({});
    setIsOnline(false);
  };

  // ── Validasi ──
  const validate = () => {
    const e: Record<string, string> = {};
    if (!sesiForm.judul.trim())        e.judul = "Judul sesi wajib diisi.";
    if (!waktuMulai.date)              e.waktuMulai = "Waktu mulai wajib diisi.";
    if (isOnline && !sesiForm.linkSesi.trim()) e.linkSesi = "Link sesi wajib diisi untuk sesi online.";
    if (!isOnline && !sesiForm.lokasi.trim())  e.lokasi   = "Lokasi wajib diisi untuk sesi offline.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit (create / update) ──
  const handleSubmit = () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const formatDT = (w: typeof waktuMulai) => {
      if (!w.date) return "";
      return `${format(w.date, "yyyy-MM-dd")} ${w.time || "00:00"}`;
    };

    const payload = {
      judul:           sesiForm.judul,
      deskripsi:       sesiForm.deskripsi,
      is_online:       isOnline ? 1 : 0,
      link_sesi:       isOnline ? sesiForm.linkSesi : "",
      lokasi:          !isOnline ? sesiForm.lokasi : "",
      lat:             !isOnline && savedLat ? savedLat : "",
      lng:             !isOnline && savedLng ? savedLng : "",
      nama_pemateri:   sesiForm.namaPemateri,
      profil_pemateri: sesiForm.profilPemateri,
      waktu_mulai:     formatDT(waktuMulai),
      waktu_selesai:   formatDT(waktuSelesai),
    };

    const isEdit = !!editingSesi;
    const url = isEdit
      ? `/bootcamps/${bootcampId}/sesi/${editingSesi!.id}`
      : `/bootcamps/${bootcampId}/sesi`;

    const routerOptions = {
      preserveScroll: true as const,
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success(isEdit ? "Sesi berhasil diperbarui!" : "Sesi berhasil dibuat!");
        handleCloseDialog();
        router.reload({ only: ["sesiList"] });
      },
      onError: (e: Record<string, string>) => {
        setIsSubmitting(false);
        toast.error("Gagal menyimpan sesi. Periksa kembali data Anda.");
        const serverErrors: Record<string, string> = {};
        Object.keys(e).forEach((key) => { serverErrors[key] = e[key]; });
        setErrors(serverErrors);
      },
    };

    if (isEdit) {
      router.put(url, payload, routerOptions);
    } else {
      router.post(url, payload, routerOptions);
    }
  };

  // ── Geocoding ──
  useEffect(() => {
    if (searchQuery.trim().length < 3) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(searchQuery), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const fetchSuggestions = async (q: string) => {
    setIsSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=id`,
        { headers: { "Accept-Language": "id" } }
      );
      const data: GeoResult[] = await res.json();
      setSuggestions(data);
      if (data.length === 0) setSearchError("Alamat tidak ditemukan.");
    } catch { setSearchError("Gagal mencari alamat."); }
    finally { setIsSearching(false); }
  };

  const handleSelectSuggestion = (result: GeoResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const pos: [number, number] = [lat, lng];
    setMarkerPos(pos);
    setFlyTarget(pos);
    setSavedLat(lat);
    setSavedLng(lng);
    setFoundAddress(result.display_name);
    setSesiForm((p) => ({ ...p, lokasi: result.display_name }));
    setSearchQuery(result.display_name);
    setSuggestions([]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    const pos: [number, number] = [lat, lng];
    setMarkerPos(pos);
    setFlyTarget(null);
    setSavedLat(lat);
    setSavedLng(lng);
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "id" } }
      );
      const data = await res.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setFoundAddress(address);
      setSesiForm((p) => ({ ...p, lokasi: address }));
      setSearchQuery(address);
    } catch {
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setFoundAddress(coords);
      setSesiForm((p) => ({ ...p, lokasi: coords }));
    }
  };

  const handleClearSearch = () => {
    setSearchQuery(""); setSuggestions([]); setMarkerPos(null);
    setFoundAddress(""); setSearchError(""); setSavedLat(null); setSavedLng(null);
    setSesiForm((p) => ({ ...p, lokasi: "" }));
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Sesi Meeting</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kelola sesi pertemuan untuk bootcamp ini</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Buat Sesi
        </Button>
      </div>

      {/* List Sesi */}
      <div className="p-5">
        {sesiList.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Belum ada sesi meeting</p>
        ) : (
          <div className="space-y-3">
            {sesiList.map((sesi) => (
              <SesiCard
                key={sesi.id}
                sesi={sesi}
                bootcampId={bootcampId}
                onEdit={handleOpenEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Dialog Form ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { if (!v) handleCloseDialog(); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSesi ? "Edit Sesi Meeting" : "Buat Sesi Meeting"}</DialogTitle>
            <DialogDescription>Isi detail untuk sesi pertemuan.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Judul */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">
                Judul Sesi <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Contoh: Sesi 1 - Pengenalan Laravel"
                value={sesiForm.judul}
                onChange={(e) => setSesiForm({ ...sesiForm, judul: e.target.value })}
                className={errors.judul ? "border-red-400" : ""}
              />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul}</p>}
            </div>

            {/* Deskripsi */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
              <Textarea
                placeholder="Deskripsi sesi..."
                rows={3}
                value={sesiForm.deskripsi}
                onChange={(e) => setSesiForm({ ...sesiForm, deskripsi: e.target.value })}
              />
            </div>

            {/* Toggle Online/Offline */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                {isOnline
                  ? <Video className="h-4 w-4 text-blue-600" />
                  : <MapPin className="h-4 w-4 text-gray-500" />
                }
                <Label className="text-sm font-medium text-gray-700">
                  {isOnline ? "Sesi Online" : "Sesi Offline"}
                </Label>
              </div>
              <Switch checked={isOnline} onCheckedChange={setIsOnline} />
            </div>

            {/* Online */}
            {isOnline ? (
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-700">
                  Link Sesi <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="https://zoom.us/j/... atau Google Meet link"
                  value={sesiForm.linkSesi}
                  onChange={(e) => setSesiForm({ ...sesiForm, linkSesi: e.target.value })}
                  className={errors.linkSesi ? "border-red-400" : ""}
                />
                {errors.linkSesi && <p className="text-xs text-red-500">{errors.linkSesi}</p>}
                <p className="text-xs text-gray-400">Zoom / Google Meet / Youtube Live, dll</p>
              </div>
            ) : (
              /* Offline */
              <div className="space-y-3">
                {/* Search geocoding */}
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">
                    Cari Alamat / Nama Tempat <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      className={cn("pl-9 pr-8", errors.lokasi ? "border-red-400" : "")}
                      placeholder="Contoh: Universitas Brawijaya Malang..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 animate-spin" />}
                    {!isSearching && searchQuery && (
                      <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600" onClick={handleClearSearch}>
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[500] max-h-52 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            className="w-full text-left px-3 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-50 last:border-0 flex items-start gap-2"
                            onClick={() => handleSelectSuggestion(s)}
                          >
                            <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-gray-400" />
                            <span className="line-clamp-2">{s.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.lokasi  && <p className="text-xs text-red-500">{errors.lokasi}</p>}
                  {searchError    && <p className="text-xs text-red-500">{searchError}</p>}
                  <p className="text-xs text-gray-400">Ketik alamat → pilih saran → pin muncul di peta. Atau klik langsung di peta.</p>
                </div>

                {/* Peta */}
                <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: 240 }}>
                  <MapContainer
                    center={markerPos ?? [-7.9666, 112.6326]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickMarker onSelect={handleMapClick} />
                    {flyTarget && <FlyTo position={flyTarget} />}
                    {markerPos && (
                      <Marker position={markerPos}>
                        <Popup className="text-xs">{foundAddress || "Lokasi dipilih"}</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>

                {markerPos ? (
                  <div className="flex items-start justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-green-700 leading-relaxed">{foundAddress}</p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 ml-2 shrink-0" onClick={handleClearSearch}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center">Belum ada pin. Cari alamat atau klik peta.</p>
                )}
              </div>
            )}

            {/* Waktu */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <DateTimePicker label="Waktu Mulai *" value={waktuMulai} onChange={setWaktuMulai} />
                {errors.waktuMulai && <p className="text-xs text-red-500 mt-1">{errors.waktuMulai}</p>}
              </div>
              <DateTimePicker label="Waktu Selesai" value={waktuSelesai} onChange={setWaktuSelesai} />
            </div>

            {/* Pemateri */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Nama Pemateri</Label>
              <Input
                placeholder="Nama instruktur / pemateri"
                value={sesiForm.namaPemateri}
                onChange={(e) => setSesiForm({ ...sesiForm, namaPemateri: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Profil Pemateri</Label>
              <Textarea
                placeholder="Bio singkat pemateri..."
                rows={2}
                value={sesiForm.profilPemateri}
                onChange={(e) => setSesiForm({ ...sesiForm, profilPemateri: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleCloseDialog} disabled={isSubmitting}>
                Batal
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
                  : editingSesi ? "Simpan Perubahan" : "Buat Sesi"
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
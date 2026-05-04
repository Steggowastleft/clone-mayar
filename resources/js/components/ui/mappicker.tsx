import { useState, useEffect } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { MapPin, ExternalLink, Search, AlertCircle } from "lucide-react";

interface MapPickerProps {
  address: string;
  mapUrl: string;
  onAddressChange: (address: string) => void;
  onMapUrlChange: (url: string) => void;
  label?: string;
}

// Check if URL is a short URL that can't be embedded
const isShortUrl = (url: string) => {
  return url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps");
};

// Generate embed URL - only works reliably with address query
const getEmbedUrl = (address: string, mapUrl: string) => {
  // If we have a valid Google Maps URL that's not a short URL, 
  // we try to extract coordinates or use the address instead
  if (mapUrl && !isShortUrl(mapUrl)) {
    // Try to extract coordinates from URL patterns like:
    // https://www.google.com/maps/place/.../@lat,lng,zoom
    const coordMatch = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const [, lat, lng] = coordMatch;
      return `https://maps.google.com/maps?q=${lat},${lng}&output=embed`;
    }
    
    // Try to extract place query from URL
    const placeMatch = mapUrl.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch) {
      const place = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
    }
  }
  
  // Fallback to address-based embed (most reliable)
  if (address) {
    const query = encodeURIComponent(address);
    return `https://maps.google.com/maps?q=${query}&output=embed`;
  }
  
  return "";
};

// Extract place name from Google Maps URL
const extractPlaceName = (url: string): string | null => {
  if (!url || isShortUrl(url)) return null;
  
  // Pattern: /maps/place/Place+Name/... or /maps/place/Place%20Name/...
  const placeMatch = url.match(/\/maps\/place\/([^/@]+)/);
  if (placeMatch) {
    return decodeURIComponent(placeMatch[1].replace(/\+/g, " ").replace(/_/g, " "));
  }
  
  // Pattern: /maps/search/Place+Name/... 
  const searchMatch = url.match(/\/maps\/search\/([^/@]+)/);
  if (searchMatch) {
    return decodeURIComponent(searchMatch[1].replace(/\+/g, " ").replace(/_/g, " "));
  }
  
  // Pattern: ?q=Place+Name or &q=Place+Name
  const queryMatch = url.match(/[?&]q=([^&]+)/);
  if (queryMatch) {
    return decodeURIComponent(queryMatch[1].replace(/\+/g, " "));
  }
  
  // Pattern: maps.google.com/?q=Place+Name
  const mapsQueryMatch = url.match(/maps\.google\.com\/.*\?q=([^&]+)/);
  if (mapsQueryMatch) {
    return decodeURIComponent(mapsQueryMatch[1].replace(/\+/g, " "));
  }
  
  return null;
};

export function MapPicker({
  address,
  mapUrl,
  onAddressChange,
  onMapUrlChange,
  label = "Lokasi",
}: MapPickerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>("");
  const [autoFilled, setAutoFilled] = useState<boolean>(false);

  useEffect(() => {
    const url = getEmbedUrl(address, mapUrl);
    setEmbedUrl(url);
  }, [address, mapUrl]);

  // Auto-fill address when mapUrl changes and address is empty
  useEffect(() => {
    if (mapUrl && !address && !autoFilled) {
      const placeName = extractPlaceName(mapUrl);
      if (placeName) {
        onAddressChange(placeName);
        setAutoFilled(true);
      }
    }
  }, [mapUrl, address, autoFilled, onAddressChange]);

  // Reset autoFilled when mapUrl is cleared
  useEffect(() => {
    if (!mapUrl) {
      setAutoFilled(false);
    }
  }, [mapUrl]);

  const handleMapUrlChange = (url: string) => {
    onMapUrlChange(url);
    // Try to extract and auto-fill address if empty
    if (url && !address) {
      const placeName = extractPlaceName(url);
      if (placeName) {
        onAddressChange(placeName);
        setAutoFilled(true);
      }
    }
  };

  const handleSearchMap = () => {
    if (!address) return;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handleOpenPicker = () => {
    if (address) {
      const query = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    } else {
      window.open("https://www.google.com/maps", "_blank");
    }
  };

  const showShortUrlWarning = mapUrl && isShortUrl(mapUrl);
  const showExtractedHint = mapUrl && autoFilled && address;
  const canPreview = embedUrl || address;

  return (
    <div className="space-y-3">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}

      {/* Address Input */}
      <div className="space-y-1">
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Masukkan alamat lengkap..."
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSearchMap}
          disabled={!address}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 disabled:bg-gray-100 disabled:text-gray-400 text-blue-600 text-sm font-medium rounded-md transition"
        >
          <Search className="h-4 w-4" />
          Cari di Maps
        </button>
        <button
          type="button"
          onClick={handleOpenPicker}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-md transition"
        >
          <MapPin className="h-4 w-4" />
          Pilih dari Peta
        </button>
      </div>

      {/* Map Share URL Input */}
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">Link Google Maps (hasil share)</Label>
        <div className="relative">
          <ExternalLink className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            className="pl-9 text-sm"
            placeholder="Paste link share dari Google Maps..."
            value={mapUrl}
            onChange={(e) => handleMapUrlChange(e.target.value)}
          />
        </div>
        {showShortUrlWarning && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            Link pendek tidak bisa dipreview. Peta akan ditampilkan berdasarkan alamat.
          </div>
        )}
        {showExtractedHint && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <MapPin className="h-3 w-3" />
            Alamat otomatis terisi dari link
          </div>
        )}
        <p className="text-xs text-gray-400">
          Tips: Buka Google Maps → Cari lokasi → Share → Copy link → Paste di sini
        </p>
      </div>

      {/* Map Preview */}
      {canPreview && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-gray-500">Preview Peta</Label>
            <a
              href={mapUrl || `https://www.google.com/maps/search/${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Buka di Maps <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="w-full h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Masukkan alamat untuk melihat preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { loadGooglePlaces } from "@/lib/google-places-loader";

interface PlaceResult {
  address: string;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
}

interface Props {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onPlaceSelected?: (place: PlaceResult) => void;
}

// Google'ın yeni PlaceAutocompleteElement bileşenini kullanır (Autocomplete
// eski sınıfı Mart 2025'ten sonra yeni hesaplara kapatıldı).
export function PlaceAutocompleteInput({ name, defaultValue, placeholder, onPlaceSelected }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState(defaultValue ?? "");
  const [placeId, setPlaceId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    let element: any;
    let cancelled = false;

    loadGooglePlaces()
      .then(async () => {
        if (cancelled || !containerRef.current) return;
        const google = (window as any).google;
        const { PlaceAutocompleteElement } = await google.maps.importLibrary("places");

        element = new PlaceAutocompleteElement();
        element.style.width = "100%";
        if (placeholder) element.setAttribute("placeholder", placeholder);
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(element);

        element.addEventListener("gmp-select", async (event: any) => {
          const place = event.placePrediction.toPlace();
          await place.fetchFields({ fields: ["formattedAddress", "location", "id"] });
          const json = place.toJSON();
          const newAddress = json.formattedAddress ?? "";
          const newLat = json.location?.lat ?? null;
          const newLng = json.location?.lng ?? null;

          setAddress(newAddress);
          setPlaceId(json.id ?? "");
          setLat(newLat?.toString() ?? "");
          setLng(newLng?.toString() ?? "");
          onPlaceSelected?.({ address: newAddress, placeId: json.id ?? null, lat: newLat, lng: newLng });
        });
      })
      .catch(() => {
        // Script yüklenemezse aşağıdaki fallback metin girişi devrede kalır.
      });

    return () => {
      cancelled = true;
      element?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-1.5">
      <div ref={containerRef} className="[&_gmp-place-autocomplete]:w-full" />
      {address && (
        <div className="text-xs text-black/40 mt-1.5 px-0.5">
          Seçili konum: <span className="text-black/60">{address}</span>
        </div>
      )}
      <input type="hidden" name={name} value={address} readOnly />
      <input type="hidden" name={`${name}_place_id`} value={placeId} readOnly />
      <input type="hidden" name={`${name}_lat`} value={lat} readOnly />
      <input type="hidden" name={`${name}_lng`} value={lng} readOnly />
    </div>
  );
}

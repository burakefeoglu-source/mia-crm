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

// Adres yazarken Google'dan öneri getirir, seçilince place_id + koordinat da yakalanır.
// Hâlâ normal bir <input>, elle yazmak da her zaman mümkün.
export function PlaceAutocompleteInput({ name, defaultValue, placeholder, onPlaceSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [placeId, setPlaceId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  useEffect(() => {
    let autocomplete: any;

    loadGooglePlaces()
      .then(() => {
        if (!inputRef.current) return;
        const google = (window as any).google;
        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["place_id", "formatted_address", "geometry", "name"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const address = place.formatted_address ?? place.name ?? inputRef.current?.value ?? "";
          const id = place.place_id ?? "";
          const latitude = place.geometry?.location?.lat() ?? null;
          const longitude = place.geometry?.location?.lng() ?? null;

          if (inputRef.current) inputRef.current.value = address;
          setPlaceId(id);
          setLat(latitude?.toString() ?? "");
          setLng(longitude?.toString() ?? "");
          onPlaceSelected?.({ address, placeId: id || null, lat: latitude, lng: longitude });
        });
      })
      .catch(() => {
        // Script yüklenemezse input yine normal metin girişi olarak çalışmaya devam eder.
      });

    return () => {
      if (autocomplete) (window as any).google?.maps?.event?.clearInstanceListeners(autocomplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1.5 w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-mia"
      />
      <input type="hidden" name={`${name}_place_id`} value={placeId} />
      <input type="hidden" name={`${name}_lat`} value={lat} />
      <input type="hidden" name={`${name}_lng`} value={lng} />
    </>
  );
}

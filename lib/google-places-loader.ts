// Google Maps JS API'yi (Places kütüphanesiyle) tembel yükler.
let loadPromise: Promise<void> | null = null;

export function loadGooglePlaces(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps?.places) {
      resolve();
      return;
    }
    const existing = document.querySelector('script[data-google-places="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googlePlaces = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps script yüklenemedi"));
    document.body.appendChild(script);
  });

  return loadPromise;
}

// Google Identity Services (OAuth) + Picker API script'lerini tembel yükler.
// İkisi de global window nesnesine eklenir, npm paketi gerektirmez.

let loadPromise: Promise<void> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script yüklenemedi: ${src}`));
    document.body.appendChild(script);
  });
}

export function loadGoogleDrivePicker(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    await Promise.all([
      loadScript("https://accounts.google.com/gsi/client"),
      loadScript("https://apis.google.com/js/api.js"),
    ]);

    await new Promise<void>((resolve) => {
      window.gapi.load("picker", () => resolve());
    });
  })();

  return loadPromise;
}

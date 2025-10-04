// mapSingleton.ts
export let mapInstance: any = null;
export let markerInstance: any = null;

export function initMap(container: HTMLDivElement, lat: number, lon: number) {
  if (mapInstance) return mapInstance; // si ya existe, no lo re-crea

  const L = (window as any).L;

  mapInstance = L.map(container, {
    center: [lat, lon],
    zoom: 15,
    zoomControl: false,
    attributionControl: false,
  });

  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    { maxZoom: 19, subdomains: "abcd" }
  ).addTo(mapInstance);

  const customIcon = L.divIcon({
    className: "custom-leaflet-marker",
    html: `<div class="marker-pin"><div class="marker-pulse"></div><div class="marker-dot"></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });

  markerInstance = L.marker([lat, lon], { icon: customIcon }).addTo(
    mapInstance
  );

  return mapInstance;
}

export function updateMap(lat: number, lon: number) {
  if (mapInstance && markerInstance) {
    mapInstance.flyTo([lat, lon], 15, {
      duration: 2,
      easeLinearity: 0.25,
    });
    markerInstance.setLatLng([lat, lon]);
  }
}

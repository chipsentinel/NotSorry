"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  center: [number, number];
}

// Componente para actualizar la vista del mapa sin recrearlo
function ChangeMapView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.flyTo(center, zoom, {
        duration: 2,
      });
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapComponent({ center }: MapComponentProps) {
  const customIcon = L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="marker-container">
        <div class="marker-pulse"></div>
        <div class="marker-pin">
          <div class="marker-inner"></div>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const MAP_STYLE = {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  };

  return (
    <MapContainer
      // @ts-ignore - react-leaflet types issue
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer url={MAP_STYLE.url} />
      {/* @ts-ignore - react-leaflet types issue */}
      <Marker position={center} icon={customIcon} />
      <ChangeMapView center={center} zoom={13} />
    </MapContainer>
  );
}

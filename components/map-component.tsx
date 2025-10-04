"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  center: [number, number];
}

// Importación dinámica para evitar problemas de SSR y tipos
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const useMap = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMap),
  { ssr: false }
) as any;

// Componente para actualizar la vista del mapa
function ChangeMapView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const { useMap } = require("react-leaflet");
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
  // Icono personalizado para el marcador
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
    name: "Voyager",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  };

  const MapContent = () => {
    const { MapContainer, TileLayer, Marker } = require("react-leaflet");

    return (
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url={MAP_STYLE.url} />
        <Marker position={center} icon={customIcon} />
        <ChangeMapView center={center} zoom={13} />
      </MapContainer>
    );
  };

  return <MapContent />;
}

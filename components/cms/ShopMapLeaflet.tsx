"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import shops from "@/data/shops.json";

const CENTER: [number, number] = [3.8481, 11.5023]; // Avenue Kennedy

function createIcon(type: string) {
  const bg = type === "flagship" ? "#ffffff" : type === "store" ? "#0b0b0b" : "#1a1a1a";
  const border = type === "flagship" ? "#0b0b0b" : "#fff";
  return new L.DivIcon({
    className: "",
    html: `<div style="width:28px;height:28px;display:grid;place-items:center;background:${bg};border:2px solid ${border};border-radius:50%;box-shadow:0 4px 12px rgba(0,0,0,0.4);font-size:10px;font-weight:800;color:${type === "flagship" ? "#0b0b0b" : "#fff"};transform:translateY(0);">●</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function AutoFit() {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(shops.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
  }, [map]);
  return null;
}

export default function ShopMapLeaflet() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return null;

  return (
    <MapContainer center={CENTER} zoom={12} style={{ height: 360, width: "100%", background: "#111" }} scrollWheelZoom={false} zoomControl={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors — YOLO Avenue Kennedy' />
      <AutoFit />
      {shops.map((s) => (
        <Marker key={s.id} position={[s.lat, s.lng]} icon={createIcon(s.type)}>
          <Popup>
            <div style={{ minWidth: 160, fontFamily: "Josefin Sans, sans-serif" }}>
              <div style={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>{s.name}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", marginTop: 4 }}>{s.address}</div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`} target="_blank" style={{ fontSize: "0.7rem", color: "#0b0b0b", fontWeight: 700 }}>Itinéraire →</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

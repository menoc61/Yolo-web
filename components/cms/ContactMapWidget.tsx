"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

const Leaflet = dynamic(() => import("./ShopMapLeaflet"), {
  ssr: false,
  loading: () => <Skeleton style={{ height: 280, width: "100%", borderRadius: 0 }} />,
});

export function ContactMapWidget() {
  return (
    <div style={{ height: 280, width: "100%", background: "#111", position: "relative" }}>
      <Leaflet />
      {/* In-app SEO hint — hidden but crawlable */}
      <div style={{ position: "absolute", bottom: 6, left: 8, background: "rgba(0,0,0,0.7)", color: "#aaa", fontSize: "0.55rem", padding: "3px 6px", letterSpacing: "0.06em", border: "1px solid #222" }}>
        YOLO Avenue Kennedy, Yaoundé — OSM
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { ContactForm } from "@/components/cms/ContactForm";
import { ContactMapWidget } from "@/components/cms/ContactMapWidget";

export const metadata: Metadata = {
  title: "Contact — YOLO Avenue Kennedy",
  description: "Contact YOLO Cameroun — Avenue Kennedy, Yaoundé. WhatsApp +237 699 00 00 00, hello@yolo.co, yolo.co. Prix FCFA.",
};

export default function ContactPage() {
  return (
    <div className="page-content">
      <div className="container">
        <div style={{ maxWidth: 720 }}>
          <div style={{ fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>Contact · Avenue Kennedy</div>
          <h1 className="page-title" style={{ marginBottom: 16 }}>Parlons<br />shop.</h1>
          <p style={{ color: "#777", lineHeight: 1.7, fontSize: "0.95rem" }}>YOLO — Avenue Kennedy, Yaoundé, Cameroun. Ouvert lun–sam 09:00–19:00. Réponse sous 2h sur WhatsApp.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <a href="https://wa.me/237699000000" target="_blank" style={{ background: "#25D366", color: "#0b0b0b", padding: "10px 16px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" }}>WhatsApp</a>
            <a href="mailto:hello@yolo.co" style={{ border: "1px solid #222", color: "#fff", padding: "10px 16px", fontSize: "0.7rem", letterSpacing: "0.08em", textDecoration: "none" }}>hello@yolo.co</a>
          </div>
        </div>
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 40 }}>
          <ContactForm />
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#aaa", fontWeight: 600 }}>YOLO — Avenue Kennedy · OSM</div>
              <a href="https://www.openstreetmap.org/?mlat=3.8481&mlon=11.5023#map=16/3.8481/11.5023" target="_blank" rel="noopener" style={{ fontSize: "0.6rem", color: "#25D366", textDecoration: "none", letterSpacing: "0.08em" }}>Ouvrir OSM →</a>
            </div>
            <ContactMapWidget />
            <div style={{ padding: "12px 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="https://www.google.com/maps/search/?api=1&query=3.8481,11.5023" target="_blank" rel="noopener" style={{ background: "#fff", color: "#0b0b0b", padding: "8px 12px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" }}>Itinéraire → Avenue Kennedy</a>
              <a href="https://wa.me/237699000000" target="_blank" style={{ background: "#25D366", color: "#0b0b0b", padding: "8px 12px", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textDecoration: "none" }}>WhatsApp</a>
              <span style={{ fontSize: "0.6rem", color: "#555", alignSelf: "center" }}>Tiles © OpenStreetMap contributors</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

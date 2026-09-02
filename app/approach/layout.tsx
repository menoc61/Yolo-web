import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre approche — YOLO Avenue Kennedy",
  description: "Comment YOLO sélectionne, conçoit et livre — matériaux, makers, éthique et durabilité. Notre approche make, not buy. Avenue Kennedy Yaoundé. yolo.co",
};

export default function ApproachLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

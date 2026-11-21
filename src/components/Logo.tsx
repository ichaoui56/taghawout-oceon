import Link from "next/link";

export default function Logo({ className = "", href = "/#top", compact = false, tone = "blue" }: { className?: string; href?: string; compact?: boolean; tone?: "blue" | "white" }) {
  const src = tone === "white" ? "/tagawout-oceon-white.png" : "/taghazout-oceon.png";

  return (
    <Link href={href} aria-label="Taghazout Ocean" className={`inline-flex shrink-0 items-center ${className}`}>
      <img src={src} alt="Taghazout Ocean" className={`block h-auto ${compact ? "w-32 md:w-40" : "w-36 md:w-48"}`} />
    </Link>
  );
}

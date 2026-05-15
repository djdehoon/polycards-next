import Image from "next/image";

const OG_IMAGE_SRC = "/og-image.png";

export function OgImageBanner() {
  return (
    <section
      className="mx-auto mt-10 max-w-3xl px-0 sm:px-4"
      aria-label="PolyCards preview"
    >
      <Image
        src={OG_IMAGE_SRC}
        alt="PolyCards - Spaced repetition for real life"
        width={1200}
        height={630}
        sizes="(max-width: 768px) 100vw, 768px"
        priority
        className="h-auto w-full rounded-2xl border border-white/10 shadow-xl shadow-black/40"
      />
    </section>
  );
}

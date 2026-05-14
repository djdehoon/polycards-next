"use client";

import { useEffect } from "react";

type Props = {
  slug: string | null;
};

export function ScrollToDeck({ slug }: Props) {
  useEffect(() => {
    if (!slug) return;
    const el = document.getElementById(`deck-${slug}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [slug]);

  return null;
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";

const navigation = [
  ["Who we help", "/#who-we-help"],
  ["Testimonials", "/#testimonials"],
  ["Services", "/#services"],
  ["Free resources", "/resources"],
  ["Sign in", "/login"],
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) close();
    };
    const desktop = window.matchMedia("(min-width: 901px)");
    desktop.addEventListener("change", close);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      desktop.removeEventListener("change", close);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header className="header" ref={headerRef}>
      <div className="container nav-wrap">
        <Brand />
        <button
          type="button"
          className="menu-toggle"
          ref={buttonRef}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="navigation"
          onClick={() => setMenuOpen((open) => !open)}
        ><span /><span /></button>
        <nav id="navigation" className={menuOpen ? "open" : undefined} aria-label="Main navigation">
          {navigation.map(([label, href]) => (
            <Link href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</Link>
          ))}
          <Link href="/eligibility" className="button button-dark nav-cta" onClick={() => setMenuOpen(false)}>
            Check eligibility <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

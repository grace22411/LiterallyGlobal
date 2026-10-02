import Image from "next/image";
import Link from "next/link";

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" className={`brand${footer ? " footer-brand" : ""}`} aria-label="LiterallyGlobal home">
      <Image src="/assets/logo-black.png" alt="LiterallyGlobal" width={2172} height={724} sizes="250px" />
    </Link>
  );
}

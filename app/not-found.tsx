import Link from "next/link";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="container section" id="main">
      <Brand />
      <div className="section">
        <p className="eyebrow">404 / PAGE NOT FOUND</p>
        <h1>Let’s get you<br />back on track.</h1>
        <p>We couldn’t find that page. Explore your next step with LiterallyGlobal.</p>
        <Link href="/" className="button button-dark">Back to home <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}

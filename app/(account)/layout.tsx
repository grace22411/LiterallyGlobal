import { UiIcon } from "@/components/ui-icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <><header className="container account-header"><Brand /><Link href="/"><UiIcon name="arrow-left" /> Back to website</Link></header><main className="container" id="main">{children}</main></>;
}

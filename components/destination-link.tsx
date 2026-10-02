import type { ComponentProps } from "react";
import { destinationHref, type Destination } from "@/lib/site";

type DestinationLinkProps = Omit<ComponentProps<"a">, "href"> & {
  destination: Destination;
  subject: string;
};

export function DestinationLink({ destination, subject, ...props }: DestinationLinkProps) {
  return <a {...props} href={destinationHref(destination, subject)} />;
}

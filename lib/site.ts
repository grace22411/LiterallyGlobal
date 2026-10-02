export const contactEmail = "graceolayinka22@gmail.com";

export const socialLinks = {
  instagram: "https://www.instagram.com/literallyglobal_/",
  linkedin: "https://www.linkedin.com/in/iamgraceajagbe/",
} as const;

// Replace individual values with confirmed HTTPS booking, product or resource URLs.
// Enquiries use the published contact address until those destinations are supplied.
export const destinationLinks = {
  consultation: "https://nestuge.com/8xxydaxvz",
  review: "/services/document-review",
  discovery: "/services/full-support",
  ultimate: "",
  techGuide: "https://nestuge.com/44qzquuqp",
  artsGuide: "",
  checklist: "/resources#checklist",
  statement: "/resources#statement",
  workbook: "/resources#workbook",
  community: "https://chat.whatsapp.com/EnUYwQx4UtI6ZqKFsvxC2l?mode=gi_t",
} as const;

export type Destination = keyof typeof destinationLinks;

export function destinationHref(destination: Destination, subject: string): string {
  const url: string = destinationLinks[destination];
  return url.startsWith("https://") || (url.startsWith("/") && !url.startsWith("//"))
    ? url
    : `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;
}

export const resourceIds = ["checklist", "statement", "workbook"] as const;
export type ResourceId = typeof resourceIds[number];
export const freeResources = [
  { id: "checklist", name: "Document Checklist", label: "GET ORGANISED", description: "Know what to gather and keep your digital technology application documents in order.", format: "PDF", action: "Download checklist" },
  { id: "statement", name: "Personal Statement Template Guide", label: "FIND YOUR WORDS", description: "Give your personal statement a clear structure and tell the story behind your work in technology.", format: "PDF", action: "Download statement guide" },
  { id: "workbook", name: "Application Planning Workbook", label: "MAKE A PLAN", description: "Organise your evidence, plan your next steps and keep your technology application preparation on track.", format: "Google Docs", action: "Open workbook" },
] as const;
export function isResourceId(value: string): value is ResourceId {
  return resourceIds.some((id) => id === value);
}

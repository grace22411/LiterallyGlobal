import type { Destination } from "@/lib/site";

export type Service = {
  id: string;
  eyebrow: string;
  meta: string;
  name: string;
  headline: readonly string[];
  description: string;
  features: readonly string[];
  bestFor: string;
  price: string;
  priceUnit: string;
  paymentNote: string;
  tone: "default" | "dark" | "gold";
  destination: Destination;
  subject: string;
  cta: string;
};

export const services = [
  {
    "id": "consultation",
    "eyebrow": "01 / FIND CLARITY",
    "meta": "60 MINUTES",
    "name": "Consultation",
    "headline": [
      "Stop wondering.",
      "Know your next move."
    ],
    "description": "One hour focused on your experience, your evidence, and your next steps. We’ll explore where you stand and what needs work.",
    "features": [
      "Understand the process and requirements for your route.",
      "Explore how your experience fits the relevant criteria.",
      "Identify your strengths and evidence gaps.",
      "Leave with a practical action plan."
    ],
    "bestFor": "For applicants who want clarity before committing to an application.",
    "price": "£199.99",
    "priceUnit": "/ session",
    "paymentNote": "",
    "tone": "default",
    "destination": "consultation",
    "subject": "LiterallyGlobal consultation enquiry",
    "cta": "Book my consultation"
  },
  {
    "id": "document-review",
    "eyebrow": "02 / REFINE YOUR CASE",
    "meta": "EXPERT FEEDBACK",
    "name": "Document review",
    "headline": [
      "Before you hit submit,",
      "make every document count."
    ],
    "description": "You’ve written the application. Get a thorough review of how clearly it presents your case.",
    "features": [
      "Review the supporting documents required for your route.",
      "Flag gaps, weak points, and unclear claims.",
      "Get specific feedback on structure and wording.",
      "Understand what still needs attention before submission."
    ],
    "bestFor": "For applicants with a draft who want detailed feedback before submitting.",
    "price": "£1,000",
    "priceUnit": "",
    "paymentNote": "Instalment payments available: 2 × £500.",
    "tone": "default",
    "destination": "review",
    "subject": "LiterallyGlobal document review enquiry",
    "cta": "Review my documents"
  },
  {
    "id": "done-with-you",
    "eyebrow": "03 / BUILD YOUR APPLICATION",
    "meta": "HANDS-ON SUPPORT",
    "name": "Full support",
    "headline": [
      "Your achievements.",
      "Let’s build the case together."
    ],
    "description": "Bring your experience, evidence, and ambition. Get hands-on support to turn them into a coherent application.",
    "features": [
      "Identify your strongest evidence.",
      "Map your documents to the requirements for your route.",
      "Write and refine your evidence summaries together.",
      "Connect your achievements to demonstrable impact.",
      "Work through your document pack, step by step."
    ],
    "bestFor": "For applicants with achievements to demonstrate who want support shaping and writing their application.",
    "price": "£2,500",
    "priceUnit": "",
    "paymentNote": "Instalment payments available.",
    "tone": "dark",
    "destination": "discovery",
    "subject": "LiterallyGlobal discovery call — Full support",
    "cta": "Apply for full support"
  },
  {
    "id": "ultimate",
    "eyebrow": "04 / GROW YOUR EVIDENCE",
    "meta": "LONGER-TERM GUIDANCE",
    "name": "Ultimate package",
    "headline": [
      "Build the track record.",
      "Then build the application."
    ],
    "description": "Need stronger evidence before you apply? We help you identify what’s missing, build on your experience, and document your impact as you go.",
    "features": [
      "Assess your current profile and evidence gaps.",
      "Create a tailored development roadmap.",
      "Identify relevant opportunities to build your track record.",
      "Capture achievements, results, and recognition.",
      "Review your progress and refine your evidence.",
      "Prepare your documents when you’re ready."
    ],
    "bestFor": "For professionals who need to strengthen their profile before preparing an application.",
    "price": "£4,950",
    "priceUnit": "",
    "paymentNote": "Instalment payments available.",
    "tone": "gold",
    "destination": "ultimate",
    "subject": "LiterallyGlobal Ultimate package enquiry",
    "cta": "Contact us about Ultimate"
  }
] as const satisfies readonly Service[];

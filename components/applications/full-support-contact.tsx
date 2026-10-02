export function FullSupportContact() {
  const number = process.env.SUPPORT_WHATSAPP_NUMBER?.trim() ?? "";
  const digits = number.replace(/[\s()+-]/g, "");
  // Only show the chat option when a real business number is configured.
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  const message = "Hi LiterallyGlobal, I’m interested in Full Support for my Global Talent endorsement. I’d like to discuss whether it’s right for me.";

  return <section className="support-contact-choice" aria-label="Full support on WhatsApp">
    <h2>Prefer to chat first?</h2>
    <p>Complete the application form or talk to us on WhatsApp about full support. You can start a conversation without completing the form.</p>
    <a className="button" href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">Chat on WhatsApp <span aria-hidden="true">↗</span></a>
    <small>WhatsApp: {number.startsWith("+") ? number : `+${digits}`}</small>
  </section>;
}

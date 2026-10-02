import { Brand } from "@/components/brand";
import { contactEmail, destinationLinks, socialLinks } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div><Brand footer /><p>Your talent. A bigger world.</p></div>
          <div className="footer-navigation">
            <div className="footer-links">
              <a href="/#services">Services</a>
              <a href="/resources">Free resources</a>
              <a href="/#about">Meet Grace</a>
              <a href="/privacy">Privacy</a>
              <a href={`mailto:${contactEmail}`}>Get in touch <span aria-hidden="true">↗</span></a>
            </div>
            <div className="footer-links footer-social" role="group" aria-label="Social media and community">
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
              <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <span aria-hidden="true">↗</span></a>
              <a href={destinationLinks.community} target="_blank" rel="noopener noreferrer">WhatsApp community <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LiterallyGlobal. All rights reserved.</span>
          <span>UK Global Talent endorsement support</span>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { MessageSquareHeart, Lightbulb, Bug, Sparkles, Phone } from 'lucide-react';

// UAE country code assumed from the app's existing AED currency/locale usage.
// Update WHATSAPP_NUMBER if the developer's number should use a different
// country code.
const DISPLAY_NUMBER = '0501905138';
const WHATSAPP_NUMBER = '971' + DISPLAY_NUMBER.replace(/^0/, '');
const PREFILLED_MESSAGE = 'Hi Jim, I have feedback about the Alpha Delta Kennel webapp:';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16.004 3C9.377 3 4 8.377 4 15.004c0 2.386.699 4.61 1.902 6.478L4 29l7.694-1.87a11.94 11.94 0 0 0 4.31.79h.005c6.627 0 12.004-5.377 12.004-12.005C27.996 8.377 22.627 3 16.004 3zm7.06 17.04c-.298.84-1.474 1.55-2.42 1.752-.643.135-1.483.243-4.31-.926-3.616-1.498-5.94-5.166-6.122-5.407-.176-.242-1.463-1.949-1.463-3.717 0-1.767.9-2.634 1.223-2.997.322-.363.703-.454.937-.454.234 0 .47.002.674.012.216.01.507-.082.793.605.298.71.958 2.478 1.043 2.658.088.18.146.39.03.632-.117.242-.176.393-.35.605-.176.212-.37.474-.528.636-.176.18-.36.375-.156.735.205.36.913 1.508 1.96 2.442 1.348 1.203 2.483 1.575 2.844 1.75.36.174.57.146.78-.088.21-.234.898-1.047 1.138-1.406.24-.36.478-.297.803-.18.327.117 2.078.982 2.434 1.16.356.18.593.267.68.417.088.15.088.87-.21 1.71z"/>
    </svg>
  );
}

export default function ContactDev() {
  return (
    <main className="main fade-in-up">
      <div className="page-header">
        <h2 className="page-title">
          <div className="page-title-icon">
            <MessageSquareHeart />
          </div>
          <div>
            <div>Contact WebApp Developer</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
              Send suggestions, improvements, or bug reports directly
            </div>
          </div>
        </h2>
      </div>

      <div className="contact-dev-wrap">
        <div className="contact-dev-card">
          <div className="contact-dev-card-glow" />

          <div className="contact-dev-header">
            <div className="contact-dev-avatar">JP</div>
            <div>
              <div className="contact-dev-name">Jim Justin M. Poso</div>
              <div className="contact-dev-role">WebApp Developer</div>
            </div>
          </div>

          <p className="contact-dev-blurb">
            Found a bug, have an idea to make Alpha Delta Kennel better, or want to request
            a new feature? Message me directly on WhatsApp — I read every message.
          </p>

          <div className="contact-dev-tags">
            <span className="contact-dev-tag">
              <Lightbulb style={{ width: 14, height: 14 }} /> Suggestions
            </span>
            <span className="contact-dev-tag">
              <Sparkles style={{ width: 14, height: 14 }} /> Improvements
            </span>
            <span className="contact-dev-tag">
              <Bug style={{ width: 14, height: 14 }} /> Bug Reports
            </span>
          </div>

          <a
            className="whatsapp-btn"
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon style={{ width: 22, height: 22 }} />
            <span>Message on WhatsApp</span>
          </a>

          <div className="contact-dev-number">
            <Phone style={{ width: 14, height: 14 }} />
            <span>{DISPLAY_NUMBER}</span>
          </div>
        </div>
      </div>
    </main>
  );
}

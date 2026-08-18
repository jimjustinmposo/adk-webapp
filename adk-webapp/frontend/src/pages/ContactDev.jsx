import React, { useState } from 'react';
import { Code2, Send } from 'lucide-react';

const DISPLAY_NUMBER = '0501905318';
const WHATSAPP_NUMBER = '971' + DISPLAY_NUMBER.replace(/^0/, '');

const MESSAGE_TYPES = [
  { value: 'Bug Report', label: 'Bug' },
  { value: 'Suggestion', label: 'Suggestion' },
  { value: 'Improvement', label: 'Improvement' },
  { value: 'General', label: 'Other' }
];

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" {...props}>
      <path d="M16.004 3C9.377 3 4 8.377 4 15.004c0 2.386.699 4.61 1.902 6.478L4 29l7.694-1.87a11.94 11.94 0 0 0 4.31.79h.005c6.627 0 12.004-5.377 12.004-12.005C27.996 8.377 22.627 3 16.004 3zm7.06 17.04c-.298.84-1.474 1.55-2.42 1.752-.643.135-1.483.243-4.31-.926-3.616-1.498-5.94-5.166-6.122-5.407-.176-.242-1.463-1.949-1.463-3.717 0-1.767.9-2.634 1.223-2.997.322-.363.703-.454.937-.454.234 0 .47.002.674.012.216.01.507-.082.793.605.298.71.958 2.478 1.043 2.658.088.18.146.39.03.632-.117.242-.176.393-.35.605-.176.212-.37.474-.528.636-.176.18-.36.375-.156.735.205.36.913 1.508 1.96 2.442 1.348 1.203 2.483 1.575 2.844 1.75.36.174.57.146.78-.088.21-.234.898-1.047 1.138-1.406.24-.36.478-.297.803-.18.327.117 2.078.982 2.434 1.16.356.18.593.267.68.417.088.15.088.87-.21 1.71z"/>
    </svg>
  );
}

export default function ContactDev() {
  const [name, setName] = useState('');
  const [type, setType] = useState('Bug Report');
  const [message, setMessage] = useState('');

  const canSend = message.trim().length > 0;

  const handleSend = (e) => {
    e.preventDefault();
    if (!canSend) return;

    const lines = [
      `Hi Jim, I have a ${type.toLowerCase()} about the Alpha Delta Kennel webapp.`,
      '',
      message.trim()
    ];
    if (name.trim()) lines.push('', `— ${name.trim()}`);

    const text = encodeURIComponent(lines.join('\n'));
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="main fade-in-up">
      <div className="page-header">
        <h2 className="page-title">
          <div className="page-title-icon">
            <Code2 />
          </div>
          <div>
            <div>Contact WebApp Developer</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
              Send suggestions, improvements, or bug reports directly
            </div>
          </div>
        </h2>
      </div>

      <div className="contact-card">
        <div className="contact-card-header">
          <div className="contact-avatar-sm">
            <Code2 style={{ width: 20, height: 20 }} />
          </div>
          <div className="contact-header-meta">
            <div className="contact-header-name">Jim Justin M. Poso</div>
            <div className="contact-header-role">WebApp Developer</div>
          </div>
          <div className="contact-status-chip">
            <span className="contact-status-dot" />
            Usually replies within a few hours
          </div>
        </div>

        <div className="contact-divider" />

        <form className="contact-dev-form" onSubmit={handleSend}>
          <div className="field">
            <label htmlFor="contactType">What's this about?</label>
            <div className="segmented-control" role="radiogroup" aria-label="Message type">
              {MESSAGE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={type === t.value}
                  className={type === t.value ? 'active' : ''}
                  onClick={() => setType(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="contactMessage">Your Message</label>
            <textarea
              id="contactMessage"
              rows={5}
              required
              placeholder="Describe the bug, suggestion, or improvement idea in as much detail as you can..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="contactName">Your Name <span className="field-optional">(optional)</span></label>
            <input
              id="contactName"
              type="text"
              placeholder="e.g. Sarah"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button type="submit" className="whatsapp-btn" disabled={!canSend}>
            <WhatsAppIcon style={{ width: 19, height: 19 }} />
            <span>Send via WhatsApp</span>
            <Send style={{ width: 14, height: 14, opacity: 0.85 }} />
          </button>
        </form>

        <div className="contact-card-footer">
          Prefer to message directly? &nbsp;
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            {DISPLAY_NUMBER}
          </a>
        </div>
      </div>
    </main>
  );
}

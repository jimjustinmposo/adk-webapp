```jsx
import React from "react";
import "./style.css";

const ContactDev = () => {
  const WHATSAPP_NUMBER = "971501905318";

  const message = encodeURIComponent(
    "Hi Jim Justin, I would like to contact you regarding the webapp."
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <main className="contact-dev-page">
      <section className="contact-dev-container">

        {/* Header */}
        <div className="contact-dev-header">
          <span className="contact-dev-eyebrow">
            DEVELOPER CONTACT
          </span>

          <h1>
            Contact the
            <span> Developer</span>
          </h1>

          <p>
            Have a question about the webapp, need assistance, or want to
            report an issue? Get in touch directly with the developer.
          </p>
        </div>

        {/* Developer Card */}
        <div className="contact-dev-card">

          {/* Developer Identity */}
          <div className="contact-dev-profile">
            <div className="contact-dev-avatar">
              J
            </div>

            <div className="contact-dev-identity">
              <span className="contact-dev-label">
                WEBAPP DEVELOPER
              </span>

              <h2>
                Jim Justin M. Poso
              </h2>

              <p>
                Webapp Developer
              </p>
            </div>
          </div>

          <div className="contact-dev-divider" />

          {/* Contact Content */}
          <div className="contact-dev-contact-section">
            <div className="contact-dev-whatsapp-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.5 8.5 0 0 1-4.1-1.05L3 20l1.3-4.7A8.3 8.3 0 0 1 3.5 11.2 8.5 8.5 0 1 1 21 11.5Z" />
                <path d="M8.5 9.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.1-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.6-.4c.2-.1.4-.1.6 0l1.4.6c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.7-.3.2-.7.3-1.1.3-.7 0-1.7-.3-2.8-1.1-1.1-.8-2-1.7-2.8-2.8-.8-1.1-1.1-2.1-1.1-2.8 0-.4.1-.8.3-1.1Z" />
              </svg>
            </div>

            <div className="contact-dev-contact-content">
              <span className="contact-dev-contact-label">
                NEED HELP?
              </span>

              <h3>
                Let’s talk on WhatsApp
              </h3>

              <p>
                For questions, technical support, feedback, or anything
                related to the webapp, you can contact me directly through
                WhatsApp.
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-dev-whatsapp-button"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.5 8.5 0 0 1-4.1-1.05L3 20l1.3-4.7A8.3 8.3 0 0 1 3.5 11.2 8.5 8.5 0 1 1 21 11.5Z" />
                  <path d="M8.5 9.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.1-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.6-.4c.2-.1.4-.1.6 0l1.4.6c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.7-.3.2-.7.3-1.1.3-.7 0-1.7-.3-2.8-1.1-1.1-.8-2-1.7-2.8-2.8-.8-1.1-1.1-2.1-1.1-2.8 0-.4.1-.8.3-1.1Z" />
                </svg>

                <span>
                  Contact Jim on WhatsApp
                </span>

                <svg
                  className="contact-dev-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </a>

              <p className="contact-dev-note">
                WhatsApp will open in a new window.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom information */}
        <div className="contact-dev-footer">
          <div className="contact-dev-footer-item">
            <span className="contact-dev-footer-dot" />
            <span>Direct developer support</span>
          </div>

          <div className="contact-dev-footer-item">
            <span className="contact-dev-footer-dot" />
            <span>Questions &amp; technical assistance</span>
          </div>

          <div className="contact-dev-footer-item">
            <span className="contact-dev-footer-dot" />
            <span>Feedback &amp; suggestions</span>
          </div>
        </div>

      </section>
    </main>
  );
};

export default ContactDev;
```

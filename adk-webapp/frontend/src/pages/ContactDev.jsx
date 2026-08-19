```jsx id="u7zq1k"
import React from "react";

export default function ContactDev() {
  const whatsappMessage = encodeURIComponent(
    "Hi Jim Justin, I would like to get in touch regarding the ADK webapp."
  );

  const whatsappUrl =
    "https://wa.me/971501905318?text=" + whatsappMessage;

  return (
    <main className="contact-dev-page">
      <div className="contact-dev-wrapper">

        <div className="contact-dev-top-label">
          <span className="contact-dev-status-dot"></span>
          Developer Support
        </div>

        <header className="contact-dev-heading">
          <h1>
            Contact the
            <br />
            <span>Developer.</span>
          </h1>

          <p>
            Have a question, need technical assistance, or have feedback
            about the webapp? Get in touch directly with the developer.
          </p>
        </header>

        <section className="contact-dev-main-card">

          <div className="contact-dev-profile">
            <div className="contact-dev-avatar">
              J
            </div>

            <div className="contact-dev-profile-info">
              <span>WEBAPP DEVELOPER</span>

              <h2>Jim Justin M. Poso</h2>

              <p>Webapp Developer</p>
            </div>
          </div>

          <div className="contact-dev-line"></div>

          <div className="contact-dev-contact">

            <div className="contact-dev-whatsapp-symbol">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-9 8.3 8.5 8.5 0 0 1-4.1-1.05L3 20l1.3-4.7A8.3 8.3 0 0 1 3.5 11.2 8.5 8.5 0 1 1 21 11.5Z" />
                <path d="M8.5 9.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.6-.4c.2-.1.4-.1.6 0l1.4.6c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.7-.3.2-.7.3-1.1.3-.7 0-1.7-.3-2.8-1.1-1.1-.8-2-1.7-2.8-2.8-.8-1.1-1.1-2.1-1.1-2.8 0-.4.1-.8.3-1.1Z" />
              </svg>
            </div>

            <div className="contact-dev-contact-content">

              <span className="contact-dev-contact-label">
                GET IN TOUCH
              </span>

              <h3>Let's talk about the webapp.</h3>

              <p>
                For technical support, questions, feedback, or suggestions,
                WhatsApp is the fastest way to reach me.
              </p>

              <a
                className="contact-dev-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
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
                  <path d="M8.5 9.5h.5c.2 0 .4.1.5.4l.6 1.4c.1.2.1.4 0 .6l-.4.6c-.1.2-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.6-.4c.2-.1.4-.1.6 0l1.4.6c.2.1.3.3.3.5v.5c0 .3-.1.5-.4.7-.3.2-.7.3-1.1.3-.7 0-1.7-.3-2.8-1.1-1.1-.8-2-1.7-2.8-2.8-.8-1.1-1.1-2.1-1.1-2.8 0-.4.1-.8.3-1.1Z" />
                </svg>

                <span>Chat with Jim on WhatsApp</span>

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

              <small>
                WhatsApp will open in a new window.
              </small>

            </div>
          </div>

        </section>

        <div className="contact-dev-support">

          <div>
            <strong>Technical Support</strong>
            <span>Issues &amp; assistance</span>
          </div>

          <div>
            <strong>Feedback</strong>
            <span>Ideas &amp; suggestions</span>
          </div>

          <div>
            <strong>Direct Contact</strong>
            <span>WhatsApp conversation</span>
          </div>

        </div>

        <p className="contact-dev-footer">
          Jim Justin M. Poso · Webapp Developer
        </p>

      </div>
    </main>
  );
}
```

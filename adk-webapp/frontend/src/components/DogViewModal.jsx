import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CameraOff, X } from 'lucide-react';

function formatAed(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount)) return '';
  return `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} AED`;
}

export default function DogViewModal({ dog, isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (modalRef.current) modalRef.current.scrollTop = 0;
      }, 10);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !dog) return null;

  const rows = [
    ['DogID', `#${dog.dogid}`],
    ['Breed', dog.breed],
    ['Dog Name', dog.dogname],
    ['Nick Name', dog.nickname],
    ['Gender', dog.gender],
    ['Date of Birth', dog.dob ? new Date(dog.dob).toLocaleDateString() : ''],
    ['Microchip Number', dog.microchip],
    ['Father', dog.father],
    ['Mother', dog.mother],
    ['Status', dog.status]
  ];

  if (dog.status === 'sold' || dog.status === 'adopted') {
    const person = dog.status === 'sold' ? 'Buyer' : 'Adopter';
    rows.push(
      [dog.status === 'sold' ? 'Date Sold' : 'Date Adopted', dog.disposition_date ? new Date(dog.disposition_date).toLocaleDateString() : '']
    );
    if (dog.status === 'sold') {
      rows.push(['Unit Price', formatAed(dog.sale_amount)]);
    }
    rows.push(
      [`${person}'s Name`, dog.disposition_contact_name],
      [`${person}'s Address`, dog.disposition_contact_address],
      [`${person}'s Contact Details`, dog.disposition_contact_details]
    );
  }

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-view-wrap" ref={modalRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>Canine Registry Profile</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="modal-view-row">
          <div className="view-photo-col">
            {dog.photo ? (
              <img src={dog.photo} alt={dog.dogname || 'Dog photo'} />
            ) : (
              <div className="photo-placeholder">
                <CameraOff style={{ width: 36, height: 36, color: '#ffffff', opacity: 0.6 }} />
              </div>
            )}
          </div>

          <div className="view-fields-col">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {rows.map(([label, value]) => (
                <div className="field" key={label} style={{ marginBottom: 0 }}>
                  <label style={{ color: '#bfdbfe', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {label}
                  </label>
                  <div className="view-field-box">
                    {value || value === 0 ? value : <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="field" style={{ marginTop: '16px', marginBottom: 0 }}>
              <label style={{ color: '#bfdbfe', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Comments & Medical / History Notes
              </label>
              <div className="view-field-box" style={{ whiteSpace: 'pre-wrap', maxHeight: '160px', overflowY: 'auto' }}>
                {dog.comment ? dog.comment : <span style={{ opacity: 0.4 }}>No comments recorded</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ flex: 'none', width: '100%' }}
          >
            <X />
            <span>Close Details</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

import React from 'react';
import { CameraOff, X } from 'lucide-react';

function formatAed(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount)) return '';
  return `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} AED`;
}

export default function DogViewModal({ dog, isOpen, onClose }) {
  if (!isOpen || !dog) return null;

  const rows = [
    ['DogID', dog.dogid],
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

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-view-wrap">
        <div className="modal-view-row">
          <div className="view-photo-col">
            {dog.photo ? (
              <img src={dog.photo} alt={dog.dogname || 'Dog photo'} />
            ) : (
              <div className="photo-placeholder">
                <CameraOff style={{ width: 32, height: 32, color: '#fff', opacity: 0.7 }} />
              </div>
            )}
          </div>

          <div className="view-fields-col">
            {rows.map(([label, value]) => (
              <div className="field" key={label}>
                <label>{label}</label>
                <div style={{
                  background: 'rgba(255,255,255,0.92)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: 'var(--text)',
                  minHeight: '20px'
                }}>
                  {value || value === 0 ? value : <span style={{ opacity: 0.5 }}>—</span>}
                </div>
              </div>
            ))}

            <div className="field">
              <label>Comments</label>
              <div style={{
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                color: 'var(--text)',
                whiteSpace: 'pre-wrap',
                maxHeight: '220px',
                overflowY: 'auto',
                minHeight: '20px'
              }}>
                {dog.comment ? dog.comment : <span style={{ opacity: 0.5 }}>No comments</span>}
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
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Save, X } from 'lucide-react';
import DateInput from './DateInput';
import { apiRequest } from '../api/client';

function formatAed(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount === 0) return '';
  return `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} AED`;
}

function dogLabel(dog) {
  return `${dog.dogname || 'Unnamed'}${dog.nickname ? ` "${dog.nickname}"` : ''}${dog.breed ? ` — ${dog.breed}` : ''}`;
}

export default function SoldModal({ isOpen, onClose, editingDog, availableDogs, onSaved }) {
  const [selectedDogId, setSelectedDogId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dispositionDate, setDispositionDate] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (editingDog) {
      setSelectedDogId(String(editingDog.dogid));
      setSearchTerm('');
      setDispositionDate((editingDog.disposition_date || '').substring(0, 10));
      setSaleAmount(formatAed(editingDog.sale_amount));
      setBuyerName(editingDog.disposition_contact_name || '');
      setBuyerAddress(editingDog.disposition_contact_address || '');
      setBuyerContact(editingDog.disposition_contact_details || '');
      setComment(editingDog.comment || '');
    } else {
      setSelectedDogId('');
      setSearchTerm('');
      setDispositionDate('');
      setSaleAmount('');
      setBuyerName('');
      setBuyerAddress('');
      setBuyerContact('');
      setComment('');
    }
    setError('');
  }, [editingDog, isOpen]);

  if (!isOpen) return null;

  const currentDog = editingDog || availableDogs.find(d => String(d.dogid) === String(selectedDogId));

  const handleSaleAmountBlur = () => {
    if (saleAmount.trim()) {
      setSaleAmount(formatAed(saleAmount));
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    const match = availableDogs.find(d => String(d.dogid) === val);
    if (match) {
      setSelectedDogId(String(match.dogid));
    } else {
      setSelectedDogId('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentDog) {
      setError('Please select a valid animal from the database.');
      return;
    }

    setSaving(true);
    setError('');

    const body = {
      breed: currentDog.breed,
      dogname: currentDog.dogname,
      nickname: currentDog.nickname,
      gender: currentDog.gender,
      dob: currentDog.dob,
      microchip: currentDog.microchip,
      father: currentDog.father,
      mother: currentDog.mother,
      comment: comment || currentDog.comment,
      status: 'sold',
      photo: currentDog.photo,
      disposition_date: dispositionDate || null,
      sale_amount: saleAmount.replace(/[^0-9.]/g, ''),
      disposition_contact_name: buyerName,
      disposition_contact_address: buyerAddress,
      disposition_contact_details: buyerContact
    };

    try {
      await apiRequest(`/dogs/${currentDog.dogid}`, { method: 'PUT', body });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save sale record.');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" ref={modalRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0 }}>
            {editingDog ? `Edit Sale Record #${editingDog.dogid}` : 'Mark Animal as Sold'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!editingDog && (
            <div className="field">
              <label>Select Animal from Active Registry</label>
              <input
                type="search"
                list="availableDogOptions"
                placeholder="Type animal name, breed, nickname, or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                required
              />
              <datalist id="availableDogOptions">
                {availableDogs.map(d => (
                  <option key={d.dogid} value={d.dogid} label={dogLabel(d)} />
                ))}
              </datalist>
            </div>
          )}

          {currentDog && (
            <div style={{
              background: 'rgba(255,255,255,.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              marginBottom: '18px',
              fontSize: '13.5px'
            }}>
              <strong style={{ color: '#93c5fd' }}>{editingDog ? 'Editing Dog:' : 'Selected Dog:'}</strong> {dogLabel(currentDog)}
              {currentDog.microchip && ` | Microchip: ${currentDog.microchip}`}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="field">
              <label htmlFor="dispositionDate">Date Sold</label>
              <DateInput
                id="dispositionDate"
                required
                value={dispositionDate}
                onChange={(e) => setDispositionDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="saleAmount">Unit Price (AED)</label>
              <input
                id="saleAmount"
                type="text"
                inputMode="decimal"
                placeholder="0.00 AED"
                required
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                onBlur={handleSaleAmountBlur}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="buyerName">Buyer's Full Name</label>
            <input
              id="buyerName"
              type="text"
              required
              placeholder="e.g. Michael Smith"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="buyerAddress">Buyer's Address</label>
            <textarea
              id="buyerAddress"
              rows={2}
              required
              placeholder="Full physical/shipping address..."
              value={buyerAddress}
              onChange={(e) => setBuyerAddress(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="buyerContact">Buyer's Contact Details</label>
            <input
              id="buyerContact"
              type="text"
              required
              placeholder="Phone number, WhatsApp, email..."
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="comment">Sale Notes & Agreement Details</label>
            <textarea
              id="comment"
              rows={3}
              placeholder="Payment terms, delivery date, health guarantees..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save />
              <span>{saving ? 'Saving...' : editingDog ? 'Update Sale Record' : 'Save Sale Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

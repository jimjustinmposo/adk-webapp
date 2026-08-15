import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
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
      setError('Please select a valid dog from the database.');
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
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3 style={{ margin: '0 0 16px', color: '#fff' }}>
          {editingDog ? 'Edit Sale Record' : 'Mark Dog as Sold'}
        </h3>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!editingDog && (
            <div className="field">
              <label>Search Dog Database</label>
              <input
                type="search"
                list="availableDogOptions"
                placeholder="Type a dog's name, nickname, breed, or DogID"
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
              background: 'rgba(255,255,255,.15)',
              color: '#fff',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px'
            }}>
              <strong>{editingDog ? 'Editing:' : 'Selected:'}</strong> {dogLabel(currentDog)}
              {currentDog.microchip && ` | Microchip: ${currentDog.microchip}`}
            </div>
          )}

          <div className="field">
            <label htmlFor="dispositionDate">Date Sold</label>
            <input
              id="dispositionDate"
              type="date"
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

          <div className="field">
            <label htmlFor="buyerName">Buyer's Name</label>
            <input
              id="buyerName"
              type="text"
              required
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
              value={buyerContact}
              onChange={(e) => setBuyerContact(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="comment">Comments</label>
            <textarea
              id="comment"
              rows={3}
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
              <span>{saving ? 'Saving...' : editingDog ? 'Update Sale' : 'Save Sale'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

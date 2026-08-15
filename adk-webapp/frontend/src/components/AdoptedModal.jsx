import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { apiRequest } from '../api/client';

function dogLabel(dog) {
  return `${dog.dogname || 'Unnamed'}${dog.nickname ? ` "${dog.nickname}"` : ''}${dog.breed ? ` — ${dog.breed}` : ''}`;
}

export default function AdoptedModal({ isOpen, onClose, editingDog, availableDogs, onSaved }) {
  const [selectedDogId, setSelectedDogId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adoptionDate, setAdoptionDate] = useState('');
  const [adopterName, setAdopterName] = useState('');
  const [adopterAddress, setAdopterAddress] = useState('');
  const [adopterContact, setAdopterContact] = useState('');
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDog) {
      setSelectedDogId(String(editingDog.dogid));
      setSearchTerm('');
      setAdoptionDate((editingDog.disposition_date || '').substring(0, 10));
      setAdopterName(editingDog.disposition_contact_name || '');
      setAdopterAddress(editingDog.disposition_contact_address || '');
      setAdopterContact(editingDog.disposition_contact_details || '');
      setComment(editingDog.comment || '');
    } else {
      setSelectedDogId('');
      setSearchTerm('');
      setAdoptionDate('');
      setAdopterName('');
      setAdopterAddress('');
      setAdopterContact('');
      setComment('');
    }
    setError('');
  }, [editingDog, isOpen]);

  if (!isOpen) return null;

  const currentDog = editingDog || availableDogs.find(d => String(d.dogid) === String(selectedDogId));

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
      status: 'adopted',
      photo: currentDog.photo,
      disposition_date: adoptionDate || null,
      disposition_contact_name: adopterName,
      disposition_contact_address: adopterAddress,
      disposition_contact_details: adopterContact
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
          {editingDog ? 'Edit Adoption Record' : 'Mark Dog as Adopted'}
        </h3>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!editingDog && (
            <div className="field">
              <label>Search Dog Database</label>
              <input
                type="search"
                list="availableAdoptedDogOptions"
                placeholder="Type a dog's name, nickname, breed, or DogID"
                value={searchTerm}
                onChange={handleSearchChange}
                required
              />
              <datalist id="availableAdoptedDogOptions">
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
            <label htmlFor="adoptionDate">Date Adopted</label>
            <input
              id="adoptionDate"
              type="date"
              required
              value={adoptionDate}
              onChange={(e) => setAdoptionDate(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="adopterName">Adopter's Name</label>
            <input
              id="adopterName"
              type="text"
              required
              value={adopterName}
              onChange={(e) => setAdopterName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="adopterAddress">Adopter's Address</label>
            <textarea
              id="adopterAddress"
              rows={2}
              required
              value={adopterAddress}
              onChange={(e) => setAdopterAddress(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="adopterContact">Adopter's Contact Details</label>
            <input
              id="adopterContact"
              type="text"
              required
              value={adopterContact}
              onChange={(e) => setAdopterContact(e.target.value)}
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
              <span>{saving ? 'Saving...' : editingDog ? 'Update Adoption' : 'Save Adoption'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Camera, ZoomIn, ZoomOut, Save, X } from 'lucide-react';
import { apiRequest } from '../api/client';

const CROP_SIZE = 220;

function formatAedAmount(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount === 0) return '';
  return `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} AED`;
}

export default function DogFormModal({ dog, isOpen, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    breed: '',
    dogname: '',
    nickname: '',
    gender: '',
    dob: '',
    microchip: '',
    father: '',
    mother: '',
    status: 'active',
    disposition_date: '',
    sale_amount: '',
    disposition_contact_name: '',
    disposition_contact_address: '',
    disposition_contact_details: '',
    comment: '',
    photo: null
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropZoom, setCropZoom] = useState(100);
  const [cropTransform, setCropTransform] = useState({ naturalW: 0, naturalH: 0, minScale: 1, scale: 1, x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const cropImageRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, origX: 0, origY: 0 });
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
    if (dog) {
      setFormData({
        breed: dog.breed || '',
        dogname: dog.dogname || '',
        nickname: dog.nickname || '',
        gender: dog.gender || '',
        dob: dog.dob ? dog.dob.substring(0, 10) : '',
        microchip: dog.microchip || '',
        father: dog.father || '',
        mother: dog.mother || '',
        status: dog.status || 'active',
        disposition_date: dog.disposition_date ? dog.disposition_date.substring(0, 10) : '',
        sale_amount: dog.sale_amount !== null && dog.sale_amount !== undefined ? formatAedAmount(dog.sale_amount) : '',
        disposition_contact_name: dog.disposition_contact_name || '',
        disposition_contact_address: dog.disposition_contact_address || '',
        disposition_contact_details: dog.disposition_contact_details || '',
        comment: dog.comment || '',
        photo: dog.photo || null
      });
    } else {
      setFormData({
        breed: '',
        dogname: '',
        nickname: '',
        gender: '',
        dob: '',
        microchip: '',
        father: '',
        mother: '',
        status: 'active',
        disposition_date: '',
        sale_amount: '',
        disposition_contact_name: '',
        disposition_contact_address: '',
        disposition_contact_details: '',
        comment: '',
        photo: null
      });
    }
    setShowCropper(false);
    setError('');
  }, [dog, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSaleAmountBlur = (e) => {
    if (e.target.value.trim()) {
      setFormData(prev => ({ ...prev, sale_amount: formatAedAmount(e.target.value) }));
    }
  };

  // Image Upload & Crop Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Please choose an image smaller than 8MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      openCropper(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const openCropper = (src) => {
    setCropSrc(src);
    setShowCropper(true);
    setCropZoom(100);

    const img = new Image();
    img.onload = () => {
      const minScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
      const scale = minScale;
      const x = (CROP_SIZE - img.naturalWidth * scale) / 2;
      const y = (CROP_SIZE - img.naturalHeight * scale) / 2;
      setCropTransform({
        naturalW: img.naturalWidth,
        naturalH: img.naturalHeight,
        minScale,
        scale,
        x,
        y
      });
    };
    img.src = src;
  };

  const handleZoomChange = (e) => {
    const zoomVal = Number(e.target.value);
    setCropZoom(zoomVal);
    setCropTransform(prev => {
      const centerX = CROP_SIZE / 2;
      const centerY = CROP_SIZE / 2;
      const imgCenterX = (centerX - prev.x) / prev.scale;
      const imgCenterY = (centerY - prev.y) / prev.scale;
      const newScale = prev.minScale * (zoomVal / 100);
      let newX = centerX - imgCenterX * newScale;
      let newY = centerY - imgCenterY * newScale;

      const dispW = prev.naturalW * newScale;
      const dispH = prev.naturalH * newScale;
      const minX = Math.min(0, CROP_SIZE - dispW);
      const minY = Math.min(0, CROP_SIZE - dispH);
      newX = Math.max(minX, Math.min(0, newX));
      newY = Math.max(minY, Math.min(0, newY));

      return { ...prev, scale: newScale, x: newX, y: newY };
    });
  };

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: cropTransform.x,
      origY: cropTransform.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    let newX = dragStartRef.current.origX + dx;
    let newY = dragStartRef.current.origY + dy;

    const dispW = cropTransform.naturalW * cropTransform.scale;
    const dispH = cropTransform.naturalH * cropTransform.scale;
    const minX = Math.min(0, CROP_SIZE - dispW);
    const minY = Math.min(0, CROP_SIZE - dispH);
    newX = Math.max(minX, Math.min(0, newX));
    newY = Math.max(minY, Math.min(0, newY));

    setCropTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      origX: cropTransform.x,
      origY: cropTransform.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStartRef.current.x;
    const dy = t.clientY - dragStartRef.current.y;
    let newX = dragStartRef.current.origX + dx;
    let newY = dragStartRef.current.origY + dy;

    const dispW = cropTransform.naturalW * cropTransform.scale;
    const dispH = cropTransform.naturalH * cropTransform.scale;
    const minX = Math.min(0, CROP_SIZE - dispW);
    const minY = Math.min(0, CROP_SIZE - dispH);
    newX = Math.max(minX, Math.min(0, newX));
    newY = Math.max(minY, Math.min(0, newY));

    setCropTransform(prev => ({ ...prev, x: newX, y: newY }));
  };

  const applyCrop = () => {
    if (!cropImageRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');
    const srcX = -cropTransform.x / cropTransform.scale;
    const srcY = -cropTransform.y / cropTransform.scale;
    const srcW = CROP_SIZE / cropTransform.scale;
    const srcH = CROP_SIZE / cropTransform.scale;

    ctx.drawImage(cropImageRef.current, srcX, srcY, srcW, srcH, 0, 0, CROP_SIZE, CROP_SIZE);
    const finalDataUrl = canvas.toDataURL('image/jpeg', 0.88);

    setFormData(prev => ({ ...prev, photo: finalDataUrl }));
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelCrop = () => {
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setShowCropper(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const isSold = formData.status === 'sold';
    const isAdopted = formData.status === 'adopted';

    const body = {
      breed: formData.breed,
      dogname: formData.dogname,
      nickname: formData.nickname,
      gender: formData.gender,
      dob: formData.dob || null,
      microchip: formData.microchip,
      father: formData.father,
      mother: formData.mother,
      status: formData.status,
      disposition_date: (isSold || isAdopted) ? (formData.disposition_date || null) : null,
      sale_amount: isSold ? String(formData.sale_amount).replace(/[^0-9.]/g, '') : null,
      disposition_contact_name: (isSold || isAdopted) ? formData.disposition_contact_name : null,
      disposition_contact_address: (isSold || isAdopted) ? formData.disposition_contact_address : null,
      disposition_contact_details: (isSold || isAdopted) ? formData.disposition_contact_details : null,
      comment: formData.comment,
      photo: formData.photo || null
    };

    try {
      if (dog?.dogid) {
        await apiRequest(`/dogs/${dog.dogid}`, { method: 'PUT', body });
      } else {
        await apiRequest('/dogs', { method: 'POST', body });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save dog record.');
    } finally {
      setSaving(false);
    }
  };

  const isSold = formData.status === 'sold';
  const isAdopted = formData.status === 'adopted';
  const person = isSold ? 'Buyer' : 'Adopter';

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" ref={modalRef}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0 }}>{dog ? `Edit Dog Record #${dog.dogid}` : 'Register New Canine Record'}</h3>
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
          {/* Photo Section */}
          <div className="field">
            <label>Dog Profile Photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Dog Preview"
                  title="Click to reposition"
                  onClick={() => openCropper(formData.photo)}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    cursor: 'pointer'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '2px dashed rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Camera style={{ color: '#ffffff', opacity: 0.7, width: 24, height: 24 }} />
                </div>
              )}

              <div style={{ flex: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ padding: '8px' }}
                />
                {formData.photo && (
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => openCropper(formData.photo)}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '12px', minHeight: '28px' }}
                    >
                      Reposition
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="btn btn-secondary"
                      style={{ padding: '4px 12px', fontSize: '12px', minHeight: '28px' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cropper preview & reposition tool */}
            {showCropper && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-lg)' }}>
                <div
                  style={{
                    position: 'relative',
                    width: `${CROP_SIZE}px`,
                    height: `${CROP_SIZE}px`,
                    margin: '0 auto',
                    overflow: 'hidden',
                    borderRadius: '50%',
                    background: '#040d1e',
                    border: '2px solid rgba(59, 130, 246, 0.5)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    touchAction: 'none',
                    cursor: isDraggingRef.current ? 'grabbing' : 'grab'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <img
                    ref={cropImageRef}
                    src={cropSrc}
                    alt="Crop Preview"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transformOrigin: '0 0',
                      userSelect: 'none',
                      WebkitUserDrag: 'none',
                      pointerEvents: 'none',
                      width: `${cropTransform.naturalW * cropTransform.scale}px`,
                      height: `${cropTransform.naturalH * cropTransform.scale}px`,
                      transform: `translate(${cropTransform.x}px, ${cropTransform.y}px)`
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '12px',
                    maxWidth: `${CROP_SIZE}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  <ZoomOut style={{ color: '#ffffff', width: 16, height: 16 }} />
                  <input
                    type="range"
                    min="100"
                    max="300"
                    value={cropZoom}
                    onChange={handleZoomChange}
                    style={{ flex: 1 }}
                  />
                  <ZoomIn style={{ color: '#ffffff', width: 16, height: 16 }} />
                </div>
                <p style={{ textAlign: 'center', color: '#93c5fd', fontSize: '11.5px', margin: '6px 0 0' }}>
                  Drag photo inside circle to position
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '12px',
                    maxWidth: `${CROP_SIZE}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                >
                  <button
                    type="button"
                    onClick={cancelCrop}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', minHeight: '32px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={applyCrop}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '8px', fontSize: '12px', minHeight: '32px' }}
                  >
                    Save Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            <div className="field">
              <label htmlFor="breed">Breed</label>
              <input id="breed" type="text" value={formData.breed} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="dogname">Dog Name</label>
              <input id="dogname" type="text" value={formData.dogname} onChange={handleChange} required />
            </div>

            <div className="field">
              <label htmlFor="nickname">Nick Name</label>
              <input id="nickname" type="text" value={formData.nickname} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="gender">Gender</label>
              <select id="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="dob">Date of Birth</label>
              <input id="dob" type="date" value={formData.dob} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="microchip">Microchip Number</label>
              <input id="microchip" type="text" value={formData.microchip} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="father">Father (Sire)</label>
              <input id="father" type="text" value={formData.father} onChange={handleChange} />
            </div>

            <div className="field">
              <label htmlFor="mother">Mother (Dam)</label>
              <input id="mother" type="text" value={formData.mother} onChange={handleChange} />
            </div>
          </div>

          <div className="field" style={{ marginTop: 4 }}>
            <label htmlFor="status">Registry Status</label>
            <select id="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active (In Kennel)</option>
              <option value="deceased">Deceased</option>
              <option value="sold">Sold</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>

          {(isSold || isAdopted) && (
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: isSold ? 'repeat(2, 1fr)' : '1fr', gap: '14px' }}>
                <div className="field" style={{ marginBottom: 12 }}>
                  <label htmlFor="disposition_date">{isSold ? 'Date Sold' : 'Date Adopted'}</label>
                  <input
                    id="disposition_date"
                    type="date"
                    required
                    value={formData.disposition_date}
                    onChange={handleChange}
                  />
                </div>

                {isSold && (
                  <div className="field" style={{ marginBottom: 12 }}>
                    <label htmlFor="sale_amount">Unit Price (AED)</label>
                    <input
                      id="sale_amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00 AED"
                      required
                      value={formData.sale_amount}
                      onChange={handleChange}
                      onBlur={handleSaleAmountBlur}
                    />
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="disposition_contact_name">{person}'s Full Name</label>
                <input
                  id="disposition_contact_name"
                  type="text"
                  required
                  value={formData.disposition_contact_name}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ marginBottom: 12 }}>
                <label htmlFor="disposition_contact_address">{person}'s Address</label>
                <textarea
                  id="disposition_contact_address"
                  rows={2}
                  required
                  value={formData.disposition_contact_address}
                  onChange={handleChange}
                />
              </div>

              <div className="field" style={{ marginBottom: 0 }}>
                <label htmlFor="disposition_contact_details">{person}'s Phone & Email</label>
                <input
                  id="disposition_contact_details"
                  type="text"
                  required
                  value={formData.disposition_contact_details}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div className="field">
            <label htmlFor="comment">Comments & History</label>
            <textarea
              id="comment"
              rows={3}
              placeholder="Add medical notes, titles, awards, or special marks..."
              value={formData.comment}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save />
              <span>{saving ? 'Saving...' : 'Save Dog Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

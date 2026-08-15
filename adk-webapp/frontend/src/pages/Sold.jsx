import React, { useState, useEffect } from 'react';
import { Tag, Search, Edit2, CameraOff } from 'lucide-react';
import { apiRequest } from '../api/client';
import SoldModal from '../components/SoldModal';

function formatAed(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount)
    ? `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} AED`
    : '';
}

function dateText(value) {
  return value ? new Date(`${value.substring(0, 10)}T00:00:00`).toLocaleDateString() : '';
}

export default function Sold() {
  const [soldDogs, setSoldDogs] = useState([]);
  const [availableDogs, setAvailableDogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSoldDogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/dogs');
      const allDogs = data.dogs || [];
      setSoldDogs(allDogs.filter(dog => dog.status === 'sold'));
      setAvailableDogs(allDogs.filter(dog => dog.status === 'active'));
    } catch (err) {
      alert(err.message || 'Failed to load sold dogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSoldDogs();
  }, []);

  const filteredDogs = soldDogs.filter(dog => {
    const term = searchTerm.toLowerCase();
    return [
      dog.dogname,
      dog.breed,
      dog.disposition_contact_name,
      dog.microchip,
      String(dog.dogid)
    ].some(value => (value || '').toLowerCase().includes(term));
  });

  const handleOpenAdd = () => {
    setEditingDog(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dog) => {
    setEditingDog(dog);
    setModalOpen(true);
  };

  return (
    <main className="main fade-in-up">
      <h2 className="page-title">
        <Tag />
        <span>Sold Dogs</span>
      </h2>

      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search sold dogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd} style={{ width: 'auto' }}>
          <Tag />
          <span>Mark Dog as Sold</span>
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>DogID</th>
              <th>Dog Name</th>
              <th>Breed</th>
              <th>Date Sold</th>
              <th>Buyer</th>
              <th>Buyer's Address</th>
              <th>Unit Price</th>
              <th>Contact Details</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDogs.map((dog) => (
              <tr key={dog.dogid}>
                <td>
                  {dog.photo ? (
                    <img
                      src={dog.photo}
                      alt=""
                      style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: 'var(--blue-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CameraOff style={{ width: '14px', height: '14px', color: 'var(--blue)' }} />
                    </div>
                  )}
                </td>
                <td>{dog.dogid}</td>
                <td>{dog.dogname || ''}</td>
                <td>{dog.breed || ''}</td>
                <td>{dateText(dog.disposition_date)}</td>
                <td>{dog.disposition_contact_name || ''}</td>
                <td>{dog.disposition_contact_address || ''}</td>
                <td>{formatAed(dog.sale_amount)}</td>
                <td>{dog.disposition_contact_details || ''}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleOpenEdit(dog)}
                    style={{ width: 'auto', padding: '6px 12px' }}
                  >
                    <Edit2 />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filteredDogs.length === 0 && (
        <div className="empty-state">No sold dogs found.</div>
      )}

      <SoldModal
        isOpen={modalOpen}
        editingDog={editingDog}
        availableDogs={availableDogs}
        onClose={() => setModalOpen(false)}
        onSaved={loadSoldDogs}
      />
    </main>
  );
}

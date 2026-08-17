import React, { useState, useEffect } from 'react';
import { Heart, Search, Edit2, CameraOff } from 'lucide-react';
import { apiRequest } from '../api/client';
import AdoptedModal from '../components/AdoptedModal';

function dateText(value) {
  return value ? new Date(`${value.substring(0, 10)}T00:00:00`).toLocaleDateString() : '';
}

export default function Adopted() {
  const [adoptedDogs, setAdoptedDogs] = useState([]);
  const [availableDogs, setAvailableDogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAdoptedDogs = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/dogs');
      const allDogs = data.dogs || [];
      setAdoptedDogs(allDogs.filter(dog => dog.status === 'adopted'));
      setAvailableDogs(allDogs.filter(dog => dog.status === 'active'));
    } catch (err) {
      alert(err.message || 'Failed to load adopted animals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdoptedDogs();
  }, []);

  const filteredDogs = adoptedDogs.filter(dog => {
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
      <div className="page-header">
        <h2 className="page-title">
          <div className="page-title-icon">
            <Heart />
          </div>
          <div>
            <div>Adopted Animals Registry</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
              Manage re-homing, adoption agreements, and adopter details
            </div>
          </div>
        </h2>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Heart />
          <span>Mark Animal as Adopted</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search adopted animals by name, breed, adopter, or microchip..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Animal ID</th>
              <th>Animal Name</th>
              <th>Breed</th>
              <th>Date Adopted</th>
              <th>Adopter's Name</th>
              <th>Adopter's Address</th>
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
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--blue-200)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: 'var(--blue-50)',
                        border: '1.5px solid var(--blue-200)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CameraOff style={{ width: '15px', height: '15px', color: 'var(--blue-500)' }} />
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 700, color: 'var(--blue-950)' }}>#{dog.dogid}</td>
                <td style={{ fontWeight: 600 }}>{dog.dogname || '—'}</td>
                <td>{dog.breed || '—'}</td>
                <td>{dateText(dog.disposition_date)}</td>
                <td style={{ fontWeight: 500 }}>{dog.disposition_contact_name || '—'}</td>
                <td className="truncate-cell">{dog.disposition_contact_address || '—'}</td>
                <td>{dog.disposition_contact_details || '—'}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleOpenEdit(dog)}
                  >
                    <Edit2 />
                    <span>Edit Record</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filteredDogs.length === 0 && (
        <div className="empty-state">No adopted animal records found.</div>
      )}

      <AdoptedModal
        isOpen={modalOpen}
        editingDog={editingDog}
        availableDogs={availableDogs}
        onClose={() => setModalOpen(false)}
        onSaved={loadAdoptedDogs}
      />
    </main>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Database,
  Search,
  Plus,
  Filter,
  X,
  Eye,
  Edit2,
  Trash2,
  CameraOff
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSort, sortRows } from '../hooks/useSort';
import SortableTh from '../components/SortableTh';
import DogFormModal from '../components/DogFormModal';
import DogViewModal from '../components/DogViewModal';

export default function Dogs() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingDog, setViewingDog] = useState(null);

  // Filter params from URL
  const statusFilter = searchParams.get('status');
  const missingFilter = searchParams.get('filter');
  const sortBy = searchParams.get('sort');
  const locationFilter = searchParams.get('location');

  // Double scrollbar references
  const tableWrapRef = useRef(null);
  const tableScrollTopRef = useRef(null);
  const tableInnerRef = useRef(null);
  const isSyncingScrollRef = useRef(false);

  const loadDogs = async (search = '') => {
    setLoading(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiRequest(`/dogs${q}`);
      setDogs(data.dogs || []);
    } catch (err) {
      alert(err.message || 'Failed to load animals.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDogs(searchTerm);
  }, [searchTerm]);

  // Synchronize top and bottom scrollbars
  useEffect(() => {
    const updateScrollWidth = () => {
      if (tableWrapRef.current && tableInnerRef.current) {
        const table = tableWrapRef.current.querySelector('table');
        if (table) {
          tableInnerRef.current.style.width = `${table.scrollWidth}px`;
        }
      }
    };

    updateScrollWidth();
    window.addEventListener('resize', updateScrollWidth);
    return () => window.removeEventListener('resize', updateScrollWidth);
  }, [dogs]);

  const handleTopScroll = () => {
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    if (tableWrapRef.current && tableScrollTopRef.current) {
      tableWrapRef.current.scrollLeft = tableScrollTopRef.current.scrollLeft;
    }
    isSyncingScrollRef.current = false;
  };

  const handleBottomScroll = () => {
    if (isSyncingScrollRef.current) return;
    isSyncingScrollRef.current = true;
    if (tableWrapRef.current && tableScrollTopRef.current) {
      tableScrollTopRef.current.scrollLeft = tableWrapRef.current.scrollLeft;
    }
    isSyncingScrollRef.current = false;
  };

  // Client-side filtering logic
  const isMissingInfo = (d) => {
    const req = [d.breed, d.dogname, d.gender, d.dob, d.microchip, d.father, d.mother];
    return req.some(v => v === null || v === undefined || v === '');
  };

  const getFilteredDogs = () => {
    let result = [...dogs];
    if (statusFilter) result = result.filter(d => d.status === statusFilter);
    if (missingFilter === 'missing') result = result.filter(isMissingInfo);
    if (locationFilter === 'usa') result = result.filter(d => (d.comment || '').toLowerCase().includes('location: usa'));
    return result;
  };

  const [sort, toggleSort] = useSort(
    sortBy === 'breed' ? 'breed' : sortBy === 'gender' ? 'gender' : null
  );

  const getDogSortValue = (d, key) => {
    switch (key) {
      case 'dogid': return d.dogid;
      case 'breed': return d.breed;
      case 'dogname': return d.dogname;
      case 'nickname': return d.nickname;
      case 'gender': return d.gender;
      case 'dob': return d.dob;
      case 'microchip': return d.microchip;
      case 'father': return d.father;
      case 'mother': return d.mother;
      case 'status': return d.status;
      default: return null;
    }
  };

  const filteredDogs = sortRows(getFilteredDogs(), sort, getDogSortValue);

  // Filter chip label
  let filterLabel = null;
  if (statusFilter === 'active') filterLabel = 'Filter: Active Animals Only';
  else if (statusFilter === 'deceased') filterLabel = 'Filter: Deceased Animals Only';
  else if (missingFilter === 'missing') filterLabel = 'Filter: Animals With Missing Info';
  else if (locationFilter === 'usa') filterLabel = 'Filter: Animals Located in USA';
  else if (sortBy === 'breed') filterLabel = 'Sorted by: Breed';
  else if (sortBy === 'gender') filterLabel = 'Sorted by: Gender';

  const clearFilter = () => {
    setSearchParams({});
  };

  const handleOpenAdd = () => {
    setEditingDog(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (dog, e) => {
    e.stopPropagation();
    setEditingDog(dog);
    setFormModalOpen(true);
  };

  const handleOpenView = (dog, e) => {
    if (e) e.stopPropagation();
    setViewingDog(dog);
    setViewModalOpen(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this animal record?')) return;
    try {
      await apiRequest(`/dogs/${id}`, { method: 'DELETE' });
      loadDogs(searchTerm);
    } catch (err) {
      alert(err.message || 'Failed to delete animal.');
    }
  };

  return (
    <main className="main fade-in-up">
      <div className="page-header">
        <h2 className="page-title">
          <div className="page-title-icon">
            <Database />
          </div>
          <div>
            <div>Animal Information Database</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
              Manage, search, and edit animal registry records
            </div>
          </div>
        </h2>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus />
          <span>Add New Animal</span>
        </button>
      </div>

      {filterLabel && (
        <div className="filter-chip">
          <Filter style={{ width: 14, height: 14 }} />
          <span>{filterLabel}</span>
          <button onClick={clearFilter} title="Clear filter" type="button">
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      <div className="toolbar">
        <div className="search-box">
          <Search />
          <input
            type="text"
            placeholder="Search by animal name, breed, nickname, or microchip..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div
        className="table-scroll-top"
        ref={tableScrollTopRef}
        onScroll={handleTopScroll}
      >
        <div className="table-scroll-top-inner" ref={tableInnerRef} />
      </div>

      <div
        className="table-wrap"
        ref={tableWrapRef}
        onScroll={handleBottomScroll}
      >
        <table>
          <thead>
            <tr>
              <th>Photo</th>
              <SortableTh label="Animal ID" sortKey="dogid" sort={sort} onSort={toggleSort} />
              <SortableTh label="Breed" sortKey="breed" sort={sort} onSort={toggleSort} />
              <SortableTh label="Animal Name" sortKey="dogname" sort={sort} onSort={toggleSort} />
              <SortableTh label="Nick Name" sortKey="nickname" sort={sort} onSort={toggleSort} />
              <SortableTh label="Gender" sortKey="gender" sort={sort} onSort={toggleSort} />
              <SortableTh label="DOB" sortKey="dob" sort={sort} onSort={toggleSort} />
              <SortableTh label="Microchip" sortKey="microchip" sort={sort} onSort={toggleSort} />
              <SortableTh label="Father" sortKey="father" sort={sort} onSort={toggleSort} />
              <SortableTh label="Mother" sortKey="mother" sort={sort} onSort={toggleSort} />
              <th>Comments</th>
              <SortableTh label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDogs.map((d) => (
              <tr key={d.dogid} onClick={() => handleOpenView(d)}>
                <td>
                  {d.photo ? (
                    <img
                      src={d.photo}
                      alt=""
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid var(--blue-200)',
                        boxShadow: 'var(--shadow-sm)'
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
                <td style={{ fontWeight: 700, color: 'var(--blue-950)' }}>#{d.dogid}</td>
                <td>{d.breed || '—'}</td>
                <td style={{ fontWeight: 600 }}>{d.dogname || '—'}</td>
                <td>{d.nickname || '—'}</td>
                <td>{d.gender || '—'}</td>
                <td>{d.dob ? new Date(d.dob).toLocaleDateString() : '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '12.5px' }}>{d.microchip || '—'}</td>
                <td>{d.father || '—'}</td>
                <td>{d.mother || '—'}</td>
                <td className="truncate-cell" title="Click row to view full details">
                  {d.comment || '—'}
                </td>
                <td>
                  <span className={`status-pill ${d.status}`}>{d.status}</span>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={(e) => handleOpenView(d, e)}
                    title="View Details"
                  >
                    <Eye />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={(e) => handleOpenEdit(d, e)}
                        title="Edit Animal"
                      >
                        <Edit2 />
                      </button>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={(e) => handleDelete(d.dogid, e)}
                        title="Delete Animal"
                      >
                        <Trash2 />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filteredDogs.length === 0 && (
        <div className="empty-state">No animal records found matching your search.</div>
      )}

      <DogFormModal
        isOpen={formModalOpen}
        dog={editingDog}
        onClose={() => setFormModalOpen(false)}
        onSaved={() => loadDogs(searchTerm)}
      />

      <DogViewModal
        isOpen={viewModalOpen}
        dog={viewingDog}
        onClose={() => setViewModalOpen(false)}
      />
    </main>
  );
}

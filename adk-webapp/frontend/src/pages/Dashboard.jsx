import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Hash,
  Heart,
  Layers,
  Users,
  XCircle,
  AlertTriangle,
  Flag
} from 'lucide-react';
import { apiRequest } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDogs: '—',
    activeDogs: '—',
    deceasedDogs: '—',
    dogsWithMissingInfo: '—',
    dogsInUSA: '—',
    dogsByBreed: [],
    dogsByGender: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiRequest('/dashboard/stats');
        if (mounted) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const breedCount = stats.dogsByBreed?.length || 0;
  const breedTooltip = stats.dogsByBreed?.length
    ? stats.dogsByBreed.map(b => `${b.breed}: ${b.count}`).join(' · ')
    : '0';

  const male = stats.dogsByGender?.find(g => /male/i.test(g.gender) && !/female/i.test(g.gender));
  const female = stats.dogsByGender?.find(g => /female/i.test(g.gender));
  const genderRatioText = loading ? '—' : `${male ? male.count : 0} / ${female ? female.count : 0}`;

  return (
    <main className="main fade-in-up">
      <h2 className="page-title">
        <Activity />
        <span>Dashboard Overview</span>
      </h2>

      <div className="stat-grid" id="statGrid">
        <Link className="stat-card pop" to="/dogs">
          <Hash className="stat-icon" />
          <div className="stat-label">Total Number of Dogs</div>
          <div className="stat-value">{loading ? '—' : stats.totalDogs}</div>
        </Link>

        <Link className="stat-card pop" to="/dogs?status=active">
          <Heart className="stat-icon" />
          <div className="stat-label">Active Dogs</div>
          <div className="stat-value">{loading ? '—' : stats.activeDogs}</div>
        </Link>

        <Link className="stat-card pop" to="/dogs?sort=breed" title={breedTooltip}>
          <Layers className="stat-icon" />
          <div className="stat-label">Dogs by Breed</div>
          <div className="stat-value">{loading ? '—' : breedCount}</div>
        </Link>

        <Link className="stat-card pop" to="/dogs?sort=gender">
          <Users className="stat-icon" />
          <div className="stat-label">Male vs Female</div>
          <div className="stat-value">{genderRatioText}</div>
        </Link>

        <Link className="stat-card pop" to="/dogs?status=deceased">
          <XCircle className="stat-icon" />
          <div className="stat-label">Deceased Dogs</div>
          <div className="stat-value">{loading ? '—' : stats.deceasedDogs}</div>
        </Link>

        <Link className="stat-card pop" to="/dogs?filter=missing">
          <AlertTriangle className="stat-icon" />
          <div className="stat-label">Missing Information</div>
          <div className="stat-value">{loading ? '—' : stats.dogsWithMissingInfo}</div>
        </Link>

        <Link className="stat-card pop" to="/dogs?location=usa">
          <Flag className="stat-icon" />
          <div className="stat-label">Dogs in USA</div>
          <div className="stat-value">{loading ? '—' : stats.dogsInUSA}</div>
        </Link>
      </div>
    </main>
  );
}

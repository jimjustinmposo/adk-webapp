import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Hash,
  Heart,
  Layers,
  Users,
  XCircle,
  AlertTriangle,
  Flag,
  ArrowUpRight
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
  const genderRatioText = loading ? '—' : `${male ? male.count : 0}M / ${female ? female.count : 0}F`;

  return (
    <main className="main fade-in-up">
      <div className="page-header">
        <h2 className="page-title">
          <div className="page-title-icon">
            <LayoutDashboard />
          </div>
          <div>
            <div>Dashboard Overview</div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: 500, marginTop: 2 }}>
              Real-time kennel statistics & database summary
            </div>
          </div>
        </h2>
      </div>

      <div className="stat-grid">
        <Link className="stat-card" to="/dogs">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Hash />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Total Number of Dogs</div>
            <div className="stat-value">{loading ? '—' : stats.totalDogs}</div>
          </div>
        </Link>

        <Link className="stat-card" to="/dogs?status=active">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Heart />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Active Dogs</div>
            <div className="stat-value">{loading ? '—' : stats.activeDogs}</div>
          </div>
        </Link>

        <Link className="stat-card" to="/dogs?sort=breed" title={breedTooltip}>
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Layers />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Dogs by Breed ({breedCount} Breeds)</div>
            <div className="stat-value">{loading ? '—' : breedCount}</div>
          </div>
        </Link>

        <Link className="stat-card" to="/dogs?sort=gender">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Users />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Male vs Female Ratio</div>
            <div className="stat-value">{genderRatioText}</div>
          </div>
        </Link>

        <Link className="stat-card" to="/dogs?status=deceased">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <XCircle />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Deceased Dogs</div>
            <div className="stat-value">{loading ? '—' : stats.deceasedDogs}</div>
          </div>
        </Link>

        <Link className="stat-card" to="/dogs?filter=missing">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <AlertTriangle />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Missing Information</div>
            <div className="stat-value">{loading ? '—' : stats.dogsWithMissingInfo}</div>
          </div>
        </Link>

        <Link className="stat-card" to="/dogs?location=usa">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Flag />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Dogs in USA</div>
            <div className="stat-value">{loading ? '—' : stats.dogsInUSA}</div>
          </div>
        </Link>
      </div>
    </main>
  );
}

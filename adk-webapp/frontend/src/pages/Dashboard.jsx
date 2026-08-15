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
  ArrowUpRight,
  Tag,
  HeartHandshake,
  DollarSign
} from 'lucide-react';
import { apiRequest } from '../api/client';

function formatAed(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount)) return '0.00 AED';
  return `${new Intl.NumberFormat('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} AED`;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDogs: '—',
    activeDogs: '—',
    deceasedDogs: '—',
    soldDogs: 0,
    adoptedDogs: 0,
    totalSalesAmount: 0,
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
        const [dashData, dogsData] = await Promise.all([
          apiRequest('/dashboard/stats').catch(() => null),
          apiRequest('/dogs').catch(() => ({ dogs: [] }))
        ]);

        if (!mounted) return;

        const allDogs = dogsData?.dogs || [];
        const soldList = allDogs.filter(d => d.status === 'sold');
        const adoptedList = allDogs.filter(d => d.status === 'adopted');
        const computedSales = soldList.reduce((sum, d) => sum + Number(d.sale_amount || 0), 0);

        if (dashData) {
          setStats({
            ...dashData,
            soldDogs: dashData.soldDogs !== undefined ? dashData.soldDogs : soldList.length,
            adoptedDogs: dashData.adoptedDogs !== undefined ? dashData.adoptedDogs : adoptedList.length,
            totalSalesAmount: dashData.totalSalesAmount !== undefined ? dashData.totalSalesAmount : computedSales
          });
        } else {
          // Fallback entirely from dogs list
          const activeList = allDogs.filter(d => d.status === 'active');
          const deceasedList = allDogs.filter(d => d.status === 'deceased');
          const inUSAList = allDogs.filter(d => (d.comment || '').toLowerCase().includes('location: usa'));
          const missingList = allDogs.filter(d =>
            !d.breed || !d.dogname || !d.gender || !d.dob || !d.microchip || !d.father || !d.mother
          );

          setStats({
            totalDogs: allDogs.length,
            activeDogs: activeList.length,
            deceasedDogs: deceasedList.length,
            soldDogs: soldList.length,
            adoptedDogs: adoptedList.length,
            totalSalesAmount: computedSales,
            dogsWithMissingInfo: missingList.length,
            dogsInUSA: inUSAList.length,
            dogsByBreed: [],
            dogsByGender: []
          });
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
              Real-time kennel statistics, revenue metrics & registry summary
            </div>
          </div>
        </h2>
      </div>

      <div className="stat-grid">
        {/* Total Dogs */}
        <Link className="stat-card" to="/dogs">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Hash />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Total Registered Dogs</div>
            <div className="stat-value">{loading ? '—' : stats.totalDogs}</div>
          </div>
        </Link>

        {/* Active Dogs */}
        <Link className="stat-card" to="/dogs?status=active">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap">
              <Heart />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Active in Kennel</div>
            <div className="stat-value">{loading ? '—' : stats.activeDogs}</div>
          </div>
        </Link>

        {/* Sold Dogs & Total Sales Sum */}
        <Link className="stat-card" to="/sold">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(37, 99, 235, 0.25)', borderColor: 'rgba(96, 165, 250, 0.4)' }}>
              <Tag style={{ color: '#93c5fd' }} />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Sold Dogs & Total Revenue</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span className="stat-value">{loading ? '—' : stats.soldDogs}</span>
              <span style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600 }}>Sold</span>
            </div>
            <div style={{
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '13px',
              color: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <span style={{ color: '#bfdbfe', opacity: 0.8 }}>Sum:</span>
              <strong style={{ color: '#60a5fa', fontWeight: 700 }}>
                {loading ? '—' : formatAed(stats.totalSalesAmount)}
              </strong>
            </div>
          </div>
        </Link>

        {/* Adopted Dogs */}
        <Link className="stat-card" to="/adopted">
          <div className="stat-card-header">
            <div className="stat-card-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.2)', borderColor: 'rgba(252, 211, 77, 0.35)' }}>
              <HeartHandshake style={{ color: '#fcd34d' }} />
            </div>
            <ArrowUpRight className="stat-card-arrow" />
          </div>
          <div>
            <div className="stat-label">Total Dogs Adopted</div>
            <div className="stat-value">{loading ? '—' : stats.adoptedDogs}</div>
          </div>
        </Link>

        {/* Dogs by Breed */}
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

        {/* Male vs Female Ratio */}
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

        {/* Deceased Dogs */}
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

        {/* Missing Information */}
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

        {/* Dogs in USA */}
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

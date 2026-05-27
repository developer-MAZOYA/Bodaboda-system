import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})}`;

const pct = (part, total) => (total ? Math.round((Number(part || 0) / Number(total || 0)) * 100) : 0);

const statusTone = {
  REQUESTED: 'warning',
  ACCEPTED: 'info',
  STARTED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger'
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [requests, setRequests] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, earningsRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/earnings'),
        api.get('/admin/requests')
      ]);
      setStats(statsRes.data);
      setEarnings(earningsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      setError('Unable to load admin analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const insights = useMemo(() => {
    const rides = requests?.rides || [];
    const total = stats?.totalRides || requests?.totalRequests || 0;
    const completed = stats?.completedRides || requests?.completed || 0;
    const requested = stats?.requestedRides || requests?.pending || 0;
    const accepted = stats?.acceptedRides || requests?.accepted || 0;
    const fares = rides.map((ride) => Number(ride.fare || 0));
    const highestFare = fares.length ? Math.max(...fares) : 0;
    const today = new Date().toDateString();
    const todayRides = rides.filter((ride) => new Date(ride.createdAt).toDateString() === today).length;
    const unassigned = rides.filter((ride) => !ride.riderName || ride.riderName === 'Unassigned').length;
    const revenue = Number(earnings?.totalSystemEarnings || stats?.totalEarnings || 0);
    const activeRiders = Number(earnings?.totalActiveRiders || 0);

    return {
      total,
      requested,
      accepted,
      completed,
      completionRate: pct(completed, total),
      pendingRate: pct(requested, total),
      dispatchRate: pct(accepted + completed, total),
      averageFare: stats?.averageFare || 0,
      highestFare,
      todayRides,
      unassigned,
      revenue,
      activeRiders,
      revenuePerRider: activeRiders ? revenue / activeRiders : 0,
      recentRides: [...rides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
    };
  }, [stats, earnings, requests]);

  const distribution = [
    { label: 'Requested', value: insights.requested, tone: 'warning' },
    { label: 'Accepted', value: insights.accepted, tone: 'info' },
    { label: 'Completed', value: insights.completed, tone: 'success' }
  ];

  if (loading) return <div className="empty-state admin-loading">Loading admin dashboard...</div>;

  return (
    <div className="dashboard-shell admin-dashboard">
      <section className="hero-panel mb-4">
        <div>
          <span className="eyebrow">Control Center</span>
          <h1 className="page-title">Admin analytics</h1>
          <p className="page-subtitle">
            A clear view of demand, dispatch performance, revenue, riders, and recent ride activity.
          </p>
        </div>
        <button className="btn btn-light" onClick={loadData}>Refresh data</button>
      </section>

      {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

      <section className="metric-grid admin-metrics mb-4">
        <div className="metric-card featured">
          <span>Total revenue</span>
          <strong>{money(insights.revenue)}</strong>
          <small>{insights.completed} completed rides</small>
        </div>
        <div className="metric-card">
          <span>Total rides</span>
          <strong>{insights.total}</strong>
          <small>{insights.todayRides} created today</small>
        </div>
        <div className="metric-card">
          <span>Completion rate</span>
          <strong>{insights.completionRate}%</strong>
          <small>{insights.dispatchRate}% dispatched</small>
        </div>
        <div className="metric-card">
          <span>Average fare</span>
          <strong>{money(insights.averageFare)}</strong>
          <small>Highest {money(insights.highestFare)}</small>
        </div>
        <div className="metric-card">
          <span>Active riders</span>
          <strong>{insights.activeRiders}</strong>
          <small>{money(insights.revenuePerRider)} per rider</small>
        </div>
      </section>

      <div className="admin-tabs mb-4" role="tablist">
        {[
          ['overview', 'Overview'],
          ['earnings', 'Earnings'],
          ['requests', 'Ride Requests']
        ].map(([tab, label]) => (
          <button
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="row g-4">
          <div className="col-lg-7">
            <section className="table-panel h-100">
              <div className="section-heading mb-4">
                <span className="eyebrow">Demand Mix</span>
                <h2>Ride status distribution</h2>
              </div>
              <div className="status-stack">
                {distribution.map((item) => (
                  <div className="status-line" key={item.label}>
                    <div className="d-flex justify-content-between mb-2">
                      <span>{item.label}</span>
                      <strong>{item.value} rides</strong>
                    </div>
                    <div className="progress">
                      <div
                        className={`progress-bar bg-${item.tone}`}
                        style={{ width: `${pct(item.value, insights.total)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="insight-grid mt-4">
                <div>
                  <span>Pending pressure</span>
                  <strong>{insights.pendingRate}%</strong>
                </div>
                <div>
                  <span>Unassigned rides</span>
                  <strong>{insights.unassigned}</strong>
                </div>
                <div>
                  <span>Revenue per trip</span>
                  <strong>{money(insights.averageFare)}</strong>
                </div>
              </div>
            </section>
          </div>

          <div className="col-lg-5">
            <section className="table-panel h-100">
              <div className="section-heading mb-4">
                <span className="eyebrow">Latest Activity</span>
                <h2>Recent rides</h2>
              </div>
              <div className="activity-list">
                {insights.recentRides.length ? insights.recentRides.map((ride) => (
                  <article key={ride.rideId}>
                    <div>
                      <strong>{ride.pickupLocation}</strong>
                      <span>{ride.dropoffLocation}</span>
                    </div>
                    <span className={`status-pill status-${statusTone[ride.status] || 'secondary'}`}>{ride.status}</span>
                  </article>
                )) : (
                  <div className="empty-state">No recent activity yet.</div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'earnings' && earnings && (
        <section className="table-panel">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div className="section-heading">
              <span className="eyebrow">Revenue</span>
              <h2>Top riders by earnings</h2>
            </div>
            <div className="mini-summary">
              <span>{money(earnings.totalSystemEarnings)}</span>
              <small>{earnings.totalCompletedRides} completed rides</small>
            </div>
          </div>
          <div className="leaderboard">
            {(earnings.topRiders || []).length ? earnings.topRiders.map((rider, index) => {
              const share = pct(rider.totalEarnings, earnings.totalSystemEarnings);
              return (
                <article className="leaderboard-row" key={rider.riderId || rider.riderName}>
                  <div className="rank">{index + 1}</div>
                  <div className="leader-main">
                    <strong>{rider.riderName}</strong>
                    <span>{rider.completedRides} completed rides</span>
                    <div className="progress mt-2">
                      <div className="progress-bar bg-success" style={{ width: `${share}%` }} />
                    </div>
                  </div>
                  <div className="leader-value">
                    <strong>{money(rider.totalEarnings)}</strong>
                    <span>{share}% of revenue</span>
                  </div>
                </article>
              );
            }) : (
              <div className="empty-state">No rider earnings yet.</div>
            )}
          </div>
        </section>
      )}

      {activeTab === 'requests' && requests && (
        <section className="table-panel">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div className="section-heading">
              <span className="eyebrow">Requests</span>
              <h2>All ride requests</h2>
            </div>
            <div className="request-pills">
              <span>Pending {requests.pending}</span>
              <span>Accepted {requests.accepted}</span>
              <span>Completed {requests.completed}</span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle admin-table">
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Fare</th>
                  <th>Rider</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {(requests.rides || []).length ? requests.rides.map((ride) => (
                  <tr key={ride.rideId}>
                    <td>
                      <strong>{ride.pickupLocation}</strong>
                      <span className="table-subtext">{ride.dropoffLocation}</span>
                    </td>
                    <td><span className={`status-pill status-${statusTone[ride.status] || 'secondary'}`}>{ride.status}</span></td>
                    <td>{money(ride.fare)}</td>
                    <td>{ride.riderName || 'Unassigned'}</td>
                    <td>{new Date(ride.createdAt).toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5"><div className="empty-state">No requests yet.</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

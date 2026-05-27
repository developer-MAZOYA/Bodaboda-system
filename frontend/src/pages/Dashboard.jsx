import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';
import storage from '../services/storage.js';

const currency = (value) => `KES ${Number(value || 0).toLocaleString(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
})}`;

const statusTone = {
  REQUESTED: 'warning',
  ACCEPTED: 'info',
  STARTED: 'primary',
  COMPLETED: 'success',
  CANCELLED: 'danger'
};

const countByStatus = (rides, status) => rides.filter((ride) => ride.status === status).length;

export default function Dashboard() {
  const role = storage.getItem('role');
  const [rides, setRides] = useState([]);
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      const { data } = await api.get('/rides');
      setRides(data);
    } catch (err) {
      setError('Unable to load rides right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const metrics = useMemo(() => {
    const totalFare = rides.reduce((sum, ride) => sum + Number(ride.fare || 0), 0);
    return {
      total: rides.length,
      requested: countByStatus(rides, 'REQUESTED'),
      accepted: countByStatus(rides, 'ACCEPTED'),
      completed: countByStatus(rides, 'COMPLETED'),
      totalFare,
      completionRate: rides.length ? Math.round((countByStatus(rides, 'COMPLETED') / rides.length) * 100) : 0
    };
  }, [rides]);

  const latestRide = rides[0];

  const book = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError('');
      await api.post('/rides/book', { pickup, dropoff });
      setPickup('');
      setDropoff('');
      await load();
    } catch (err) {
      setError('Could not book that ride. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      setError('');
      await api.put(`/rides/${id}/status`, { status });
      await load();
    } catch (err) {
      setError('Could not update the ride status.');
    }
  };

  return (
    <div className="dashboard-shell">
      <section className="hero-panel mb-4">
        <div>
          <span className="eyebrow">{role === 'RIDER' ? 'Rider Workspace' : 'Passenger Workspace'}</span>
          <h1 className="page-title">Live ride dashboard</h1>
          <p className="page-subtitle">
            Track requests, monitor progress, and keep every trip moving from pickup to completion.
          </p>
        </div>
        <div className="hero-stat">
          <span>Completion</span>
          <strong>{metrics.completionRate}%</strong>
        </div>
      </section>

      {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}

      <section className="metric-grid mb-4">
        <div className="metric-card">
          <span>Total rides</span>
          <strong>{metrics.total}</strong>
          <small>{role === 'RIDER' ? 'Assigned and open requests' : 'Your request history'}</small>
        </div>
        <div className="metric-card">
          <span>Open requests</span>
          <strong>{metrics.requested}</strong>
          <small>Waiting for a rider</small>
        </div>
        <div className="metric-card">
          <span>In progress</span>
          <strong>{metrics.accepted}</strong>
          <small>Accepted rides</small>
        </div>
        <div className="metric-card">
          <span>Total value</span>
          <strong>{currency(metrics.totalFare)}</strong>
          <small>Across visible rides</small>
        </div>
      </section>

      <div className="row g-4 align-items-start">
        {role === 'CUSTOMER' && (
          <div className="col-lg-4">
            <form className="booking-panel" onSubmit={book}>
              <div className="section-heading mb-3">
                <span className="eyebrow">New request</span>
                <h2>Book a ride</h2>
              </div>
              <label className="form-label">Pickup point</label>
              <input
                className="form-control form-control-lg mb-3"
                placeholder="Nyerere Square"
                value={pickup}
                onChange={(event) => setPickup(event.target.value)}
                required
              />
              <label className="form-label">Dropoff point</label>
              <input
                className="form-control form-control-lg mb-4"
                placeholder="Mlimani City"
                value={dropoff}
                onChange={(event) => setDropoff(event.target.value)}
                required
              />
              <button className="btn btn-dark btn-lg w-100" disabled={saving}>
                {saving ? 'Booking...' : 'Book Ride'}
              </button>
              {latestRide && (
                <div className="latest-strip mt-4">
                  <span>Latest ride</span>
                  <strong>{latestRide.pickup} to {latestRide.dropoff}</strong>
                </div>
              )}
            </form>
          </div>
        )}

        <div className={role === 'CUSTOMER' ? 'col-lg-8' : 'col-12'}>
          <section className="table-panel">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div className="section-heading">
                <span className="eyebrow">Operations</span>
                <h2>{role === 'RIDER' ? 'Available and assigned rides' : 'Ride history'}</h2>
              </div>
              <button className="btn btn-outline-dark btn-sm" onClick={load} disabled={loading}>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="empty-state">Loading rides...</div>
            ) : rides.length === 0 ? (
              <div className="empty-state">
                <strong>No rides yet</strong>
                <span>{role === 'CUSTOMER' ? 'Create your first request to see it here.' : 'New passenger requests will appear here.'}</span>
              </div>
            ) : (
              <div className="ride-list">
                {rides.map((ride) => (
                  <article className="ride-row" key={ride.id}>
                    <div className="route-markers">
                      <span />
                      <i />
                      <span />
                    </div>
                    <div className="ride-main">
                      <div className="ride-route">
                        <strong>{ride.pickup}</strong>
                        <span>{ride.dropoff}</span>
                      </div>
                      <div className="ride-meta">
                        <span>{currency(ride.fare)}</span>
                        {ride.createdAt && <span>{new Date(ride.createdAt).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="ride-actions">
                      <span className={`status-pill status-${statusTone[ride.status] || 'secondary'}`}>
                        {ride.status}
                      </span>
                      {role === 'RIDER' && ride.status === 'REQUESTED' && (
                        <button className="btn btn-sm btn-success" onClick={() => setStatus(ride.id, 'ACCEPTED')}>Accept</button>
                      )}
                      {role === 'RIDER' && ride.status === 'ACCEPTED' && (
                        <button className="btn btn-sm btn-primary" onClick={() => setStatus(ride.id, 'COMPLETED')}>Complete</button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [requests, setRequests] = useState(null);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, earningsRes, requestsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/earnings'),
        api.get('/admin/requests')
      ]);
      setStats(statsRes.data);
      setEarnings(earningsRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="alert alert-info">Loading admin dashboard...</div>;

  return (
    <div>
      <h2 className="mb-4">📊 Admin Dashboard</h2>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} 
            onClick={() => setActiveTab('stats')}>Statistics</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveTab('earnings')}>Earnings</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}>All Requests</button>
        </li>
      </ul>

      {/* Statistics Tab */}
      {activeTab === 'stats' && stats && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title text-muted">Total Rides</h6>
                <h3 className="card-text text-primary">{stats.totalRides}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title text-muted">Requested</h6>
                <h3 className="card-text text-warning">{stats.requestedRides}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title text-muted">Completed</h6>
                <h3 className="card-text text-success">{stats.completedRides}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title text-muted">Total Earnings</h6>
                <h3 className="card-text text-info">KES {Number(stats.totalEarnings).toFixed(2)}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earnings Tab */}
      {activeTab === 'earnings' && earnings && (
        <div>
          <div className="card mb-4 bg-light">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-muted">System Total Earnings</h6>
                  <h2 className="text-success">KES {Number(earnings.totalSystemEarnings).toFixed(2)}</h2>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Completed Rides</h6>
                  <h2 className="text-info">{earnings.totalCompletedRides}</h2>
                </div>
                <div className="col-md-4">
                  <h6 className="text-muted">Active Riders</h6>
                  <h2 className="text-primary">{earnings.totalActiveRiders}</h2>
                </div>
              </div>
            </div>
          </div>

          <h5 className="mb-3">Top Riders by Earnings</h5>
          <table className="table table-striped table-hover">
            <thead className="table-light">
              <tr>
                <th>Rider Name</th>
                <th>Completed Rides</th>
                <th>Total Earnings</th>
              </tr>
            </thead>
            <tbody>
              {earnings.topRiders.length > 0 ? (
                earnings.topRiders.map((rider, idx) => (
                  <tr key={idx}>
                    <td>{rider.riderName}</td>
                    <td><span className="badge bg-primary">{rider.completedRides}</span></td>
                    <td className="fw-bold">KES {Number(rider.totalEarnings).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="text-center text-muted">No earnings data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* All Requests Tab */}
      {activeTab === 'requests' && requests && (
        <div>
          <div className="alert alert-info mb-3">
            <strong>Total Requests: {requests.totalRequests}</strong> | 
            <span className="ms-3"><span className="badge bg-warning">Pending: {requests.pending}</span></span>
            <span className="ms-2"><span className="badge bg-info">Accepted: {requests.accepted}</span></span>
            <span className="ms-2"><span className="badge bg-success">Completed: {requests.completed}</span></span>
          </div>

          <table className="table table-striped table-sm">
            <thead className="table-light">
              <tr>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Status</th>
                <th>Fare (KES)</th>
                <th>Rider</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {requests.rides.length > 0 ? (
                requests.rides.map(r => (
                  <tr key={r.rideId}>
                    <td>{r.pickupLocation}</td>
                    <td>{r.dropoffLocation}</td>
                    <td>
                      <span className={`badge ${
                        r.status === 'COMPLETED' ? 'bg-success' :
                        r.status === 'ACCEPTED' ? 'bg-info' :
                        'bg-warning'
                      }`}>{r.status}</span>
                    </td>
                    <td>{Number(r.fare).toFixed(2)}</td>
                    <td>{r.riderName}</td>
                    <td><small>{new Date(r.createdAt).toLocaleString()}</small></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-muted">No requests yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

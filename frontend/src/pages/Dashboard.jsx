import React, { useEffect, useState } from 'react';
import api from '../services/api.js';
export default function Dashboard() {
  const role = localStorage.getItem('role');
  const [rides, setRides] = useState([]);
  const [pickup, setPickup] = useState(''); const [dropoff, setDropoff] = useState('');
  const load = async () => { const { data } = await api.get('/rides'); setRides(data); };
  useEffect(() => { load(); }, []);
  const book = async (e) => {
    e.preventDefault();
    await api.post('/rides/book', { pickup, dropoff });
    setPickup(''); setDropoff(''); load();
  };
  const setStatus = async (id, status) => { await api.put(`/rides/${id}/status`, { status }); load(); };
  return (
    <div>
      <h2 className="mb-3">Dashboard <small className="text-muted">({role})</small></h2>
      {role === 'CUSTOMER' && (
        <form className="row g-2 mb-4" onSubmit={book}>
          <div className="col-md-5"><input className="form-control" placeholder="Pickup" value={pickup} onChange={e=>setPickup(e.target.value)} required /></div>
          <div className="col-md-5"><input className="form-control" placeholder="Dropoff" value={dropoff} onChange={e=>setDropoff(e.target.value)} required /></div>
          <div className="col-md-2"><button className="btn btn-primary w-100">Book Ride</button></div>
        </form>
      )}
      <table className="table table-striped">
        <thead><tr><th>Pickup</th><th>Dropoff</th><th>Status</th><th>Fare</th><th>Actions</th></tr></thead>
        <tbody>
          {rides.map(r => (
            <tr key={r.id}>
              <td>{r.pickup}</td><td>{r.dropoff}</td>
              <td><span className="badge bg-info">{r.status}</span></td>
              <td>KES {r.fare}</td>
              <td>
                {role==='RIDER' && r.status==='REQUESTED' && <button className="btn btn-sm btn-success me-1" onClick={()=>setStatus(r.id,'ACCEPTED')}>Accept</button>}
                {role==='RIDER' && r.status==='ACCEPTED' && <button className="btn btn-sm btn-primary" onClick={()=>setStatus(r.id,'COMPLETED')}>Complete</button>}
              </td>
            </tr>
          ))}
          {rides.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No rides yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

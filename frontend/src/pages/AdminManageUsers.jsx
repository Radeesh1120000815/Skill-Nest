import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Manage Users — Skill Nest';

    const stored = localStorage.getItem('userInfo');
    if (!stored) {
      navigate('/admin');
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      navigate('/signin');
      return;
    }

    if (parsed.role !== 'ADMIN') {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');

        const backendUrl = 'http://localhost:5000';
        const token = parsed.token;

        const params = {};
        if (filterRole !== 'all') {
          params.role = filterRole;
        }

        const { data } = await axios.get(`${backendUrl}/api/admin/users`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          params,
        });

        setUsers(data || []);
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load users.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole, navigate]);

  const handleStatusChange = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'blocked' ? 'active' : 'blocked';

    const stored = localStorage.getItem('userInfo');
    if (!stored) return;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      return;
    }

    try {
      const backendUrl = 'http://localhost:5000';
      const token = parsed.token;

      const { data } = await axios.patch(
        `${backendUrl}/api/admin/users/${userId}/status`,
        { status: nextStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update user status.';
      setError(message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;

    const stored = localStorage.getItem('userInfo');
    if (!stored) return;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      return;
    }

    try {
      const backendUrl = 'http://localhost:5000';
      const token = parsed.token;

      await axios.delete(`${backendUrl}/api/admin/users/${userId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete user.';
      setError(message);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f2]">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Manage Users</h1>
            <p className="text-slate-600 mt-2 max-w-2xl text-sm">
              View all registered students, lecturers, and admins. I can block or unblock
              accounts and permanently remove users if needed.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              
              Back to Dashboard
            </button>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
            >
              <option value="all">All roles</option>
              <option value="STUDENT">Students</option>
              <option value="LECTURER">Lecturers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
            <p className="text-sm text-slate-500">No users found for this filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Role</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-600">Created</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-900 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{user.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            user.status === 'blocked'
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {user.status === 'blocked' ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(user._id, user.status)}
                            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
                          >
                            {user.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user._id)}
                            className="inline-flex items-center justify-center rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

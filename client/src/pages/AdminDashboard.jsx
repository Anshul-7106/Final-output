import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import Navbar from '../components/Navbar';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        adminService.getDashboardStats().catch(() => null),
        adminService.getUsers({ limit: 10 }).catch(() => ({ data: { users: [] } })),
        adminService.getCourses({ limit: 10 }).catch(() => ({ data: { courses: [] } }))
      ]);

      if (statsRes?.success) setStats(statsRes.data);
      if (usersRes?.success) setUsers(usersRes.data.users);
      if (coursesRes?.success) setCourses(coursesRes.data.courses);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleTogglePublish = async (courseId) => {
    try {
      await adminService.toggleCoursePublish(courseId);
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar user={user} isAdmin={isAdmin} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-1">Manage your platform</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="text-3xl font-bold text-yellow-500">{stats?.stats?.totalUsers || 0}</div>
            <div className="text-zinc-400 text-sm mt-1">Total Users</div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="text-3xl font-bold text-green-500">{stats?.stats?.totalCourses || 0}</div>
            <div className="text-zinc-400 text-sm mt-1">Total Courses</div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="text-3xl font-bold text-blue-500">{stats?.stats?.totalPayments || 0}</div>
            <div className="text-zinc-400 text-sm mt-1">Total Sales</div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="text-3xl font-bold text-purple-500">
              ₹{stats?.stats?.totalRevenue?.toLocaleString() || 0}
            </div>
            <div className="text-zinc-400 text-sm mt-1">Total Revenue</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-zinc-700">
          {['overview', 'users', 'courses'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats?.recentUsers?.map((u) => (
                  <div key={u._id} className="flex items-center justify-between py-2 border-b border-zinc-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-sm font-bold">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400 capitalize bg-zinc-700 px-2 py-1 rounded">
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-zinc-800 rounded-xl border border-zinc-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
              <div className="space-y-3">
                {stats?.recentPayments?.length > 0 ? (
                  stats.recentPayments.map((p) => (
                    <div key={p._id} className="flex items-center justify-between py-2 border-b border-zinc-700 last:border-0">
                      <div>
                        <p className="font-medium">{p.user?.name || 'User'}</p>
                        <p className="text-xs text-zinc-500">{p.course?.title || 'Course'}</p>
                      </div>
                      <span className="text-green-500 font-semibold">₹{p.amount}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-center py-4">No recent payments</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Email</th>
                  <th className="text-left py-3 px-4 font-semibold">Role</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-zinc-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-sm font-bold">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{u.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-sm"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-zinc-400 hover:text-white text-sm">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-700">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Course</th>
                  <th className="text-left py-3 px-4 font-semibold">Instructor</th>
                  <th className="text-left py-3 px-4 font-semibold">Price</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id} className="border-t border-zinc-700">
                    <td className="py-3 px-4">
                      <p className="font-medium">{c.title}</p>
                      <p className="text-xs text-zinc-500">{c.lessons?.length || 0} lessons</p>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{c.instructor?.name || 'Unknown'}</td>
                    <td className="py-3 px-4">
                      {c.price === 0 ? (
                        <span className="text-green-500">Free</span>
                      ) : (
                        <span>₹{c.price}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${
                        c.isPublished ? 'bg-green-500/20 text-green-500' : 'bg-zinc-600 text-zinc-400'
                      }`}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePublish(c._id)}
                        className="text-yellow-500 hover:text-yellow-400 text-sm"
                      >
                        {c.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

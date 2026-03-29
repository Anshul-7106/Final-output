import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import progressService from '../services/progressService';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [enrolledRes, coursesRes, certsRes] = await Promise.all([
        courseService.getEnrolledCourses().catch(() => ({ data: { courses: [] } })),
        courseService.getCourses({ limit: 6 }).catch(() => ({ data: { courses: [] } })),
        progressService.getCertificates().catch(() => ({ data: { certificates: [] } }))
      ]);

      setEnrolledCourses(enrolledRes.data?.courses || []);
      setAvailableCourses(coursesRes.data?.courses || []);
      setCertificates(certsRes.data?.certificates || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-800/50 rounded-2xl p-6 mb-8 border border-yellow-500/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, <span className="text-yellow-500">{user?.name || 'Learner'}</span>!
              </h1>
              <p className="text-zinc-400 mt-1">Continue your learning journey</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/video"
                className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Browse Courses
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-zinc-700 text-white font-semibold rounded-lg hover:bg-zinc-600 transition-colors border border-yellow-500/30"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                <p className="text-zinc-400 text-sm">Enrolled Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">{certificates.length}</p>
                <p className="text-zinc-400 text-sm">Certificates Earned</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-xl p-5 border border-zinc-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {enrolledCourses.filter(c => c.progress?.isCompleted).length}
                </p>
                <p className="text-zinc-400 text-sm">Completed Courses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-zinc-700">
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-1 font-semibold transition-colors ${
              activeTab === 'courses'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            My Courses
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 px-1 font-semibold transition-colors ${
              activeTab === 'certificates'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Certificates
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`pb-3 px-1 font-semibold transition-colors ${
              activeTab === 'explore'
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Explore
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' && (
          <div>
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">No courses yet</h3>
                <p className="text-zinc-500 mb-4">Start your learning journey by enrolling in a course</p>
                <Link
                  to="/video"
                  className="inline-block px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((enrollment) => (
                  <div key={enrollment._id} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-500/50 transition-colors group">
                    <div className="aspect-video bg-zinc-700 relative">
                      {enrollment.course?.thumbnail ? (
                        <img
                          src={enrollment.course.thumbnail}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {enrollment.progress && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-600">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${enrollment.progress.percentageComplete || 0}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white group-hover:text-yellow-500 transition-colors line-clamp-2">
                        {enrollment.course?.title || 'Course Title'}
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1">
                        {enrollment.progress?.completedLessons || 0} / {enrollment.progress?.totalLessons || 0} lessons
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {enrollment.progress?.percentageComplete || 0}% complete
                        </span>
                        <Link
                          to={`/video/${enrollment.course?._id}`}
                          className="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-lg hover:bg-yellow-500/20 transition-colors"
                        >
                          Continue
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div>
            {certificates.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <h3 className="text-xl font-semibold text-zinc-300 mb-2">No certificates yet</h3>
                <p className="text-zinc-500">Complete a course to earn your first certificate</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div key={cert._id} className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{cert.course?.title}</h3>
                        <p className="text-zinc-400 text-sm mt-1">
                          Issued on {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                        <p className="text-zinc-500 text-xs mt-1">ID: {cert.certificateId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'explore' && (
          <div>
            {availableCourses.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800/50 rounded-xl border border-zinc-700">
                <p className="text-zinc-500">No courses available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course) => (
                  <div key={course._id} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-yellow-500/50 transition-colors group">
                    <div className="aspect-video bg-zinc-700 relative">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {course.price === 0 && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white group-hover:text-yellow-500 transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-zinc-400 text-sm mt-1 line-clamp-2">
                        {course.shortDescription || course.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-yellow-500 font-bold">
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                        <Link
                          to={`/video/${course._id}`}
                          className="px-3 py-1.5 bg-yellow-500 text-black text-sm font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

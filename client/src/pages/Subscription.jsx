import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import courseService from '../services/courseService';
import paymentService from '../services/paymentService';
import Navbar from '../components/Navbar';

export default function Subscription() {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await courseService.getCourses({ limit: 20 });
      if (response.success) {
        setCourses(response.data.courses.filter(c => c.price > 0));
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePurchase = async (course) => {
    try {
      setProcessingPayment(course._id);

      // Load Razorpay SDK
      await paymentService.initializeRazorpay();

      // Create order
      const orderRes = await paymentService.createOrder(course._id);
      if (!orderRes.success) {
        alert('Error creating order');
        return;
      }

      // Open Razorpay checkout
      paymentService.openCheckout(
        {
          orderId: orderRes.data.orderId,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          description: `Purchase: ${course.title}`,
          courseId: course._id
        },
        {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        (result) => {
          // Success callback
          alert('Payment successful! Course enrolled.');
          navigate('/dashboard');
        },
        (error) => {
          // Error callback
          console.error('Payment error:', error);
          alert(error.message || 'Payment failed');
        }
      );
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Error processing payment');
    } finally {
      setProcessingPayment(null);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Premium Courses</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Invest in your future with our premium courses. Get lifetime access to high-quality content and certificates upon completion.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-500">No premium courses available at the moment.</p>
            <Link to="/video" className="text-yellow-500 hover:underline mt-4 inline-block">
              Browse free courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-zinc-800 rounded-2xl overflow-hidden border border-zinc-700 hover:border-yellow-500/50 transition-all duration-300 group"
              >
                <div className="aspect-video bg-zinc-700 relative">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full">
                    Premium
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold group-hover:text-yellow-500 transition-colors mb-2">
                    {course.title}
                  </h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {course.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {course.totalDuration ? `${Math.floor(course.totalDuration / 60)}h` : 'Self-paced'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {course.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-yellow-500">₹{course.discountPrice}</span>
                          <span className="text-zinc-500 line-through">₹{course.price}</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-yellow-500">₹{course.price}</span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePurchase(course)}
                      disabled={processingPayment === course._id}
                      className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPayment === course._id ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Buy Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

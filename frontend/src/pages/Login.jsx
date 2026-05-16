import { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/authSlice';
import { FiUser, FiShield, FiBriefcase, FiActivity, FiCheckCircle, FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password }, { withCredentials: true });
      dispatch(setUser(res.data));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    window.location.href = `http://localhost:5000/auth/demo/${role}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

      <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-3xl mb-4">
            <FiActivity />
          </div>
          <h2 className="text-center text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            DevTaskManager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 font-medium max-w-xs">
            Sign in with your company email and password to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="email"
                required
                placeholder="developer@company.com"
                className="w-full bg-white border border-gray-300 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-white border border-gray-300 rounded-2xl pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group w-full flex items-center justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider font-bold">
              <span className="bg-white/80 px-4 text-gray-500 rounded-full py-1 border border-gray-200 backdrop-blur-xs">Or Instant Role-Based Demo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('Admin')}
              className="flex items-center justify-center gap-3 py-3.5 px-4 border border-purple-200 text-sm font-bold rounded-2xl text-purple-700 bg-purple-50/80 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FiShield className="text-purple-600 text-xl" />
              Demo as Executive Admin
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('Manager')}
              className="flex items-center justify-center gap-3 py-3.5 px-4 border border-blue-200 text-sm font-bold rounded-2xl text-blue-700 bg-blue-50/80 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FiBriefcase className="text-blue-600 text-xl" />
              Demo as Project Manager
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('Developer')}
              className="flex items-center justify-center gap-3 py-3.5 px-4 border border-indigo-200 text-sm font-bold rounded-2xl text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-xs hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FiUser className="text-indigo-600 text-xl" />
              Demo as Lead Developer
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100/80 flex flex-col space-y-2 text-center text-xs text-gray-500 font-semibold">
            <div className="flex items-center justify-center gap-1 text-green-600 font-bold">
              <FiCheckCircle /> Secured with Neon Serverless & Prisma ORM
            </div>
            <div>Designed with Tailwind v4 & Glassmorphic Accents</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

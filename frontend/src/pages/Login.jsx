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
      const res = await axios.post('/auth/login', { email, password }, { withCredentials: true });
      dispatch(setUser(res.data));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid email or password');
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    window.location.href = import.meta.env.DEV ? `http://localhost:5000/auth/demo/${role}` : `/auth/demo/${role}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B132B] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-['Inter']">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#00D2FF]/20 to-[#3a7BD5]/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-br from-[#7F00FF]/20 to-[#E100FF]/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Floating Decorative Badges */}
      <div className="absolute top-1/4 left-16 hidden lg:flex items-center space-x-3 bg-white/10 backdrop-blur-2xl border border-white/10 py-3.5 px-6 rounded-3xl shadow-2xl animate-bounce duration-1000">
        <div className="w-10 h-10 rounded-2xl bg-[#00D2FF]/20 flex items-center justify-center text-[#00D2FF] text-xl border border-[#00D2FF]/30">
          <FiShield />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Enterprise Security</p>
          <h4 className="text-sm font-bold text-white font-['Outfit']">256-bit WSS Encrypted</h4>
        </div>
      </div>

      <div className="absolute bottom-1/4 right-16 hidden lg:flex items-center space-x-3 bg-white/10 backdrop-blur-2xl border border-white/10 py-3.5 px-6 rounded-3xl shadow-2xl animate-pulse">
        <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-xl border border-purple-500/30">
          <FiBriefcase />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Hierarchy Management</p>
          <h4 className="text-sm font-bold text-white font-['Outfit']">Admin • Manager • Developer</h4>
        </div>
      </div>

      <div className="max-w-md w-full bg-[#131C2E]/80 backdrop-blur-3xl p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#222F4A] relative z-10 space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#00D2FF] to-[#3a7BD5] flex items-center justify-center shadow-lg shadow-[#00D2FF]/20 text-slate-950 font-bold text-3xl mb-4 transform hover:scale-110 transition-transform duration-300">
            <FiActivity />
          </div>
          <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight">
            Abhee <span className="bg-gradient-to-r from-[#00D2FF] to-[#3a7BD5] bg-clip-text text-transparent">Management</span>
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-slate-400 font-medium max-w-xs">
            Sign in with your corporate credentials or explore via instant role-based demo.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs font-bold text-center backdrop-blur-sm animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="email"
                required
                placeholder="developer@abheemanagement.com"
                className="w-full bg-[#0B101B] border border-[#222F4A] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF] transition-all shadow-inner"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-base" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="w-full bg-[#0B101B] border border-[#222F4A] rounded-2xl pl-11 pr-4 py-3.5 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF] transition-all shadow-inner"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-slate-950 bg-gradient-to-r from-[#00D2FF] to-[#3a7BD5] hover:from-[#33d4ff] hover:to-[#5c92df] focus:outline-none shadow-lg shadow-[#00D2FF]/20 hover:shadow-[#00D2FF]/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 font-['Outfit'] tracking-wide uppercase"
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#222F4A]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
              <span className="bg-[#131C2E] px-4 text-slate-400 border border-[#222F4A] rounded-full py-1.5 shadow-md font-['Outfit']">Or Instant Role-Based Demo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            <button
              type="button"
              onClick={() => handleDemoLogin('Admin')}
              className="flex items-center justify-center gap-3 py-3.5 px-4 border border-purple-500/30 text-sm font-bold rounded-2xl text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 focus:outline-none shadow-xs hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200 transform hover:-translate-y-0.5 font-['Outfit']"
            >
              <FiShield className="text-purple-400 text-xl" />
              Demo as Executive Admin
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('Manager')}
              className="flex items-center justify-center gap-3 py-3.5 px-4 border border-blue-500/30 text-sm font-bold rounded-2xl text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 focus:outline-none shadow-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 transform hover:-translate-y-0.5 font-['Outfit']"
            >
              <FiBriefcase className="text-blue-400 text-xl" />
              Demo as Project Manager
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('Developer')}
              className="flex items-center justify-center gap-3 py-3.5 px-4 border border-emerald-500/30 text-sm font-bold rounded-2xl text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/50 focus:outline-none shadow-xs hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-200 transform hover:-translate-y-0.5 font-['Outfit']"
            >
              <FiUser className="text-emerald-400 text-xl" />
              Demo as Lead Developer
            </button>
          </div>

          <div className="pt-6 border-t border-[#222F4A] flex flex-col space-y-2 text-center text-xs text-slate-500 font-medium">
            <div className="flex items-center justify-center gap-1.5 text-[#00D2FF] font-bold font-['Outfit'] tracking-wide">
              <FiCheckCircle className="text-base" /> Secured with Neon Serverless & Prisma ORM
            </div>
            <div>Designed with Premium Glassmorphism • Abhee Management</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

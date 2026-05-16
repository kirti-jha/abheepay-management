import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiLock, FiKey, FiSun, FiMoon, FiShield, FiCheckCircle, FiXCircle, FiClock, FiCheck } from 'react-icons/fi';

const SettingsPanel = ({ currentTheme, onThemeChange }) => {
  const { user } = useSelector(state => state.auth);
  
  // Change Password State
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [changingPass, setChangingPass] = useState(false);

  // Request Password Change State
  const [reqReason, setReqReason] = useState('');
  const [requestingPass, setRequestingPass] = useState(false);

  // Admin/Manager Requests Management State
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (user && (user.role === 'Admin' || user.role === 'Manager')) {
      fetchPasswordRequests();
    }
  }, [user]);

  const fetchPasswordRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await axios.get('/auth/password-requests', { withCredentials: true });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPass(true);
    try {
      const res = await axios.put('/auth/change-password', passForm, { withCredentials: true });
      alert('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error changing password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleRequestPasswordChange = async (e) => {
    e.preventDefault();
    setRequestingPass(true);
    try {
      await axios.post('/auth/password-request', { reason: reqReason }, { withCredentials: true });
      alert('Password change request submitted to Admin/Manager successfully!');
      setReqReason('');
    } catch (err) {
      console.error(err);
      alert('Error submitting password change request');
    } finally {
      setRequestingPass(false);
    }
  };

  const handleHandleRequest = async (id, status) => {
    let newPassword = '';
    if (status === 'Approved') {
      newPassword = prompt('Enter the new temporary password for this user:');
      if (!newPassword) return; // cancelled
    }

    try {
      await axios.put(`/auth/password-requests/${id}`, { status, newPassword }, { withCredentials: true });
      alert(`Request ${status.toLowerCase()} successfully! ${newPassword ? `User password set to: ${newPassword}` : ''}`);
      fetchPasswordRequests();
    } catch (err) {
      console.error(err);
      alert('Error updating request');
    }
  };

  const themes = [
    { id: 'light', name: 'Light Mode', icon: FiSun, bg: 'bg-white text-gray-900 border-gray-200' },
    { id: 'abheepaydark', name: 'Abhee Management Dark', icon: FiMoon, bg: 'bg-[#0B132B] text-[#00D2FF] border-[#222F4A]' }
  ];

  const isDark = currentTheme === 'abheepaydark';

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      <div className={`border-b pb-5 ${isDark ? 'border-[#222F4A]' : 'border-gray-200/60'}`}>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Account & System Settings ⚙️</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Manage your security credentials, request administrative password resets, and customize your dashboard appearance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Change Own Password */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-md border space-y-6 ${
          isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
        }`}>
          <div className={`flex items-center space-x-3 border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
            <div className={`p-3 rounded-2xl text-xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-blue-50 text-blue-600'}`}>
              <FiLock />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Change Your Password</h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Update your active account password directly.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Current Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
                value={passForm.currentPassword}
                onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-500'
                }`}
                value={passForm.newPassword}
                onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 ${
                isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              }`}
            >
              <FiKey /> {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Theme Switcher */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-md border space-y-6 ${
          isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
        }`}>
          <div className={`flex items-center space-x-3 border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
            <div className={`p-3 rounded-2xl text-xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-purple-50 text-purple-600'}`}>
              <FiSun />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard Theme</h3>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Customize the visual aesthetic of your workspace.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {themes.map(t => {
              const Icon = t.icon;
              const active = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${
                    active 
                      ? (isDark ? 'border-[#00D2FF] ring-4 ring-[#00D2FF]/10 bg-[#1A263E] shadow-md' : 'border-purple-600 ring-4 ring-purple-600/10 bg-white shadow-md') 
                      : (isDark ? 'border-[#2B3C5F] hover:border-[#00D2FF]/50 bg-[#0B101B]' : 'border-gray-200 hover:border-purple-300 bg-white')
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={`p-2.5 rounded-xl border ${t.bg}`}>
                      <Icon className="text-base" />
                    </div>
                    {active && <span className={`p-1 rounded-full text-xs ${isDark ? 'bg-[#00D2FF] text-slate-950' : 'bg-purple-600 text-white'}`}><FiCheck /></span>}
                  </div>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{t.name}</span>
                  <span className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Click to activate</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request Password Change (For Developers/Managers) */}
        {user && user.role !== 'Admin' && (
          <div className={`rounded-3xl p-6 sm:p-8 shadow-md border space-y-6 lg:col-span-2 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex items-center space-x-3 border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
              <div className={`p-3 rounded-2xl text-xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-amber-50 text-amber-600'}`}>
                <FiKey />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Forgot Password / Request Admin Reset</h3>
                <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>If you forgot your password or cannot log in correctly, submit a reset request to your Manager or Admin.</p>
              </div>
            </div>

            <form onSubmit={handleRequestPasswordChange} className="space-y-4 max-w-2xl">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Reason / Notes</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lost credentials, please generate a new temporary password"
                  className={`w-full border rounded-xl py-2.5 px-3.5 text-xs font-medium focus:outline-none ${
                    isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                  value={reqReason}
                  onChange={e => setReqReason(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={requestingPass}
                className={`flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-md text-xs font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 ${
                  isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                }`}
              >
                <FiKey /> {requestingPass ? 'Submitting...' : 'Submit Reset Request'}
              </button>
            </form>
          </div>
        )}

        {/* Password Change Requests Management (For Admins & Managers) */}
        {user && (user.role === 'Admin' || user.role === 'Manager') && (
          <div className={`rounded-3xl p-6 sm:p-8 shadow-md border space-y-6 lg:col-span-2 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-2xl text-xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-purple-50 text-purple-600'}`}>
                  <FiShield />
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Member Password Reset Requests</h3>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Review and fulfill password change requests submitted by your team members.</p>
                </div>
              </div>
              <button
                onClick={fetchPasswordRequests}
                disabled={loadingRequests}
                className={`text-xs font-bold hover:underline flex items-center gap-1 ${isDark ? 'text-[#00D2FF]' : 'text-purple-600'}`}
              >
                <FiClock /> Refresh List
              </button>
            </div>

            <div className="space-y-4">
              {requests.map(req => (
                <div key={req.id} className={`border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                }`}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{req.user?.name || 'User'}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30' : 'bg-purple-100 text-purple-800 border-purple-200'
                      }`}>
                        {req.user?.role || 'Developer'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isDark 
                          ? (req.status === 'Approved' ? 'bg-[#131C2E] text-emerald-400 border-emerald-500/30' : req.status === 'Rejected' ? 'bg-[#131C2E] text-red-400 border-red-500/30' : 'bg-[#131C2E] text-amber-400 border-amber-500/30')
                          : (req.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' : req.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-amber-100 text-amber-800 border-amber-200')
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Email: {req.user?.email}</p>
                    <p className={`text-xs p-2 rounded-xl border inline-block font-medium ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-slate-300' : 'bg-white border-gray-200/60 text-gray-700'
                    }`}>Reason: {req.reason}</p>
                  </div>

                  {req.status === 'Pending' && (
                    <div className={`flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 ${isDark ? 'border-[#2B3C5F]' : 'border-gray-200/60'}`}>
                      <button
                        onClick={() => handleHandleRequest(req.id, 'Approved')}
                        className={`flex items-center gap-1 px-4 py-2 font-bold text-xs rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 ${
                          isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff]' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        <FiCheckCircle /> Approve & Set Pass
                      </button>
                      <button
                        onClick={() => handleHandleRequest(req.id, 'Rejected')}
                        className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
                      >
                        <FiXCircle /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {requests.length === 0 && (
                <div className={`text-center py-12 rounded-2xl border border-dashed ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-gray-50 border-gray-200'
                }`}>
                  <FiShield className={`mx-auto text-4xl mb-2 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                  <p className={`font-semibold text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No pending password change requests.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;

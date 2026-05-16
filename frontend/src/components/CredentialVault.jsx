import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  FiLock, FiPlus, FiEye, FiEyeOff, FiTrash2,
  FiCopy, FiExternalLink, FiX, FiCheck, FiKey, FiSearch
} from 'react-icons/fi';

const CredentialVault = ({ currentTheme }) => {
  const { user } = useSelector((state) => state.auth);
  const [credentials, setCredentials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({ siteName: '', url: '', username: '', password: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/credentials?userId=${user._id || user.id}`, { withCredentials: true });
      setCredentials(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/credentials', { ...form, userId: user._id || user.id }, { withCredentials: true });
      setForm({ siteName: '', url: '', username: '', password: '', notes: '' });
      setShowForm(false);
      fetchCredentials();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this credential?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/credentials/${id}`, { withCredentials: true });
      fetchCredentials();
    } catch (err) {
      console.error(err);
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredCredentials = credentials.filter(cred => 
    cred.siteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isDark = currentTheme === 'abheepaydark';

  return (
    <div className={`space-y-6 pt-4 border-t ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl text-white shadow-md ${
            isDark ? 'bg-[#1E2D4A] text-[#00D2FF] shadow-cyan-500/10' : 'bg-gradient-to-tr from-purple-500 to-indigo-500 shadow-purple-500/20'
          }`}>
            <FiKey className="text-2xl" />
          </div>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Secure Credential Vault 🔐</h2>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Encrypted storage for your development environments, servers & API keys</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vault..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`pl-9 pr-4 py-2 w-full sm:w-48 border rounded-xl text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-purple-500'
              }`}
            />
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md transform hover:-translate-y-0.5 ${
              isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
            }`}
          >
            {showForm ? <FiX /> : <FiPlus />}
            {showForm ? 'Cancel' : 'Add Credential'}
          </button>
        </div>
      </div>

      {/* Add Credential Form */}
      {showForm && (
        <div className={`border rounded-2xl p-6 shadow-inner animate-fadeIn ${
          isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-purple-50/50 border-purple-100'
        }`}>
          <h3 className={`font-bold mb-4 text-base flex items-center gap-2 ${isDark ? 'text-[#00D2FF]' : 'text-purple-950'}`}>
            <FiLock className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
            Store New Credential
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Site / App Name *</label>
              <input
                required
                type="text"
                placeholder="e.g. AWS Production, Stripe API, GitHub"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                }`}
                value={form.siteName}
                onChange={e => setForm({ ...form, siteName: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>URL / Endpoint</label>
              <input
                type="url"
                placeholder="https://console.aws.amazon.com"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                }`}
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Username / Email *</label>
              <input
                required
                type="text"
                placeholder="admin@company.com"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                }`}
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Password / API Key *</label>
              <input
                required
                type="password"
                placeholder="••••••••••••••••"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                }`}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Notes & Metadata</label>
              <textarea
                placeholder="Any additional notes (e.g. 2FA enabled, environment details)..."
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                }`}
                rows={2}
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-md transform hover:-translate-y-0.5 ${
                  isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                }`}
              >
                Save Credential Securely
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials List */}
      {loading ? (
        <div className={`text-center py-12 font-medium text-sm animate-pulse ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Decrypting vault credentials...</div>
      ) : filteredCredentials.length === 0 ? (
        <div className={`text-center py-12 border-2 border-dashed rounded-2xl ${
          isDark ? 'border-[#2B3C5F] bg-[#1A263E]' : 'border-gray-200 bg-gray-50/50'
        }`}>
          <FiLock className={`mx-auto text-4xl mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
          <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>No credentials found in vault.</p>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Click &quot;Add Credential&quot; above to store your first secure login.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCredentials.map(cred => (
            <div key={cred.id || cred._id} className={`border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${
              isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/80 border-gray-100 hover:bg-white hover:shadow-md'
            }`}>
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-base font-bold uppercase flex-shrink-0 shadow-md ${
                      isDark ? 'bg-[#1E2D4A] text-[#00D2FF] shadow-cyan-500/10' : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/20'
                    }`}>
                      {cred.siteName?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{cred.siteName}</h3>
                      {cred.url && (
                        <a href={cred.url} target="_blank" rel="noopener noreferrer"
                          className={`text-xs font-semibold hover:underline flex items-center gap-1 truncate mt-0.5 ${isDark ? 'text-[#00D2FF]' : 'text-blue-600'}`}>
                          {cred.url} <FiExternalLink className="text-xs flex-shrink-0" />
                        </a>
                      )}
                      {cred.user && cred.user.id !== (user._id || user.id) && (
                        <div className={`text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1 border shadow-xs ${
                          isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#222F4A]' : 'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          👤 {cred.user.name} ({cred.user.role})
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(cred.id || cred._id)}
                    className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
                      isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30' : 'text-gray-300 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title="Delete credential"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>

                <div className={`space-y-2 p-3.5 rounded-xl border shadow-xs ${
                  isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-white border-gray-100'
                }`}>
                  {/* Username */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={`font-bold uppercase tracking-wider flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>User</span>
                    <span className={`font-mono font-bold truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{cred.username}</span>
                    <button
                      onClick={() => copyToClipboard(cred.username, `u-${cred.id || cred._id}`)}
                      className={`p-1 rounded-lg transition-colors flex-shrink-0 ${
                        isDark ? 'text-slate-500 hover:text-[#00D2FF] hover:bg-[#1A263E]' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                      title="Copy username"
                    >
                      {copiedId === `u-${cred.id || cred._id}` ? <FiCheck className="text-green-500 text-sm" /> : <FiCopy className="text-xs" />}
                    </button>
                  </div>

                  {/* Password */}
                  <div className={`flex items-center justify-between gap-2 text-xs pt-2 border-t ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
                    <span className={`font-bold uppercase tracking-wider flex-shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Pass</span>
                    <span className={`font-mono font-bold truncate ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                      {visiblePasswords[cred.id || cred._id] ? cred.password : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => togglePasswordVisibility(cred.id || cred._id)}
                        className={`p-1 rounded-lg transition-colors ${
                          isDark ? 'text-slate-500 hover:text-[#00D2FF] hover:bg-[#1A263E]' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title={visiblePasswords[cred.id || cred._id] ? 'Hide' : 'Show'}
                      >
                        {visiblePasswords[cred.id || cred._id] ? <FiEyeOff className="text-xs" /> : <FiEye className="text-xs" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(cred.password, `p-${cred.id || cred._id}`)}
                        className={`p-1 rounded-lg transition-colors ${
                          isDark ? 'text-slate-500 hover:text-[#00D2FF] hover:bg-[#1A263E]' : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title="Copy password"
                      >
                        {copiedId === `p-${cred.id || cred._id}` ? <FiCheck className="text-green-500 text-sm" /> : <FiCopy className="text-xs" />}
                      </button>
                    </div>
                  </div>
                </div>

                {cred.notes && (
                  <p className={`mt-3 text-xs border rounded-xl px-3 py-2 font-medium leading-relaxed ${
                    isDark ? 'bg-amber-950/30 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'
                  }`}>
                    📝 {cred.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CredentialVault;

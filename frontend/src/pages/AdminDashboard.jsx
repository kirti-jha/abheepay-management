import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiShield, FiBriefcase, FiUsers, FiClock, FiPlus, FiFolder, FiMapPin, FiCheckCircle, FiActivity, FiSettings, FiCode, FiExternalLink, FiGithub, FiUser, FiMail, FiLock, FiTrash2 } from 'react-icons/fi';
import CredentialVault from '../components/CredentialVault';
import SettingsPanel from '../components/SettingsPanel';

const AdminDashboard = ({ currentTheme, onThemeChange }) => {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'projects', 'reports', 'users', 'tasks', 'settings'

  // New Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    managerId: '',
    developerIds: []
  });

  // Onboard User Form State (Admin / Manager / Developer)
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Admin' });
  const [loadingUser, setLoadingUser] = useState(false);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleOnboardUser = async (e) => {
    e.preventDefault();
    setLoadingUser(true);
    try {
      const res = await axios.post('/auth/create-developer', {
        ...userForm
      }, { withCredentials: true });
      const createdUser = res.data;
      const mailNote = createdUser.emailSent
        ? 'Credentials email sent successfully.'
        : `Credentials email was not sent${createdUser.emailError ? `: ${createdUser.emailError}` : '.'}\nShare these credentials manually.`;
      alert(`Successfully onboarded new ${userForm.role}.\n\nName: ${createdUser.name}\nEmail: ${createdUser.email}\nTemporary password: ${userForm.password}\n\n${mailNote}`);
      setUserForm({ name: '', email: '', password: '', role: 'Admin' });
      fetchSystemData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || `Error onboarding ${userForm.role}`);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchSystemData = async () => {
    try {
      const [projRes, repRes, userRes, taskRes, portRes] = await Promise.all([
        axios.get('/api/projects', { withCredentials: true }),
        axios.get('/api/reports', { withCredentials: true }),
        axios.get('/auth/users', { withCredentials: true }),
        axios.get('/api/tasks', { withCredentials: true }),
        axios.get('/api/portfolio', { withCredentials: true })
      ]);
      setProjects(projRes.data);
      setReports(repRes.data);
      setUsers(userRes.data);
      setTasks(taskRes.data);
      setPortfolios(portRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', projectForm, { withCredentials: true });
      alert('Project created successfully!');
      setProjectForm({ title: '', description: '', managerId: '', developerIds: [] });
      fetchSystemData();
    } catch (err) {
      console.error(err);
      alert('Error creating project');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    const targetUserId = targetUser.id || targetUser._id;
    const firstConfirm = window.confirm(`Delete ${targetUser.name} from the company user list?`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      `This permanently removes ${targetUser.name}, their reports, credentials, password requests, and portfolio data. Continue?`
    );
    if (!secondConfirm) return;

    try {
      const res = await axios.delete(`/auth/users/${targetUserId}`, { withCredentials: true });
      alert(res.data?.message || 'User deleted successfully.');
      fetchSystemData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error deleting user');
    }
  };

  const handleDeveloperToggle = (devId) => {
    const current = [...projectForm.developerIds];
    if (current.includes(devId)) {
      setProjectForm({ ...projectForm, developerIds: current.filter(id => id !== devId) });
    } else {
      setProjectForm({ ...projectForm, developerIds: [...current, devId] });
    }
  };

  const totalHoursCompany = reports.reduce((acc, curr) => acc + (curr.hoursLogged || 0), 0);
  const managers = users.filter(u => u.role === 'Manager');
  const developers = users.filter(u => u.role === 'Developer');

  const navItems = [
    { id: 'overview', name: 'System Overview', icon: FiActivity },
    { id: 'projects', name: 'Project Management', icon: FiBriefcase },
    { id: 'reports', name: 'Attendance Feed', icon: FiClock },
    { id: 'users', name: 'User Directory', icon: FiUsers },
    { id: 'onboard', name: 'Onboard System User', icon: FiPlus },
    { id: 'tasks', name: 'Tasks Master List', icon: FiCheckCircle },
    { id: 'settings', name: 'Settings & Security', icon: FiSettings },
  ];

  const isDark = currentTheme === 'abheepaydark';

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-4">
      {/* Sidebar Navigation */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className={`rounded-3xl p-6 shadow-md border lg:sticky lg:top-24 space-y-6 transition-all ${
          isDark ? 'bg-[#131A2A] border-[#222F4A]' : 'bg-white border-gray-100'
        }`}>
          <div className={`flex items-center space-x-3 px-2 pb-4 border-b ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
            <div className={`p-3 rounded-2xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-purple-50 text-purple-600'}`}>
              <FiShield />
            </div>
            <div>
              <h2 className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Portal</h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Executive Command</p>
            </div>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`min-w-[220px] lg:w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                    active 
                      ? (isDark ? 'bg-[#1E293B] border-l-4 border-[#00D2FF] text-[#00D2FF] shadow-lg shadow-cyan-500/10 transform -translate-y-0.5' : 'bg-purple-600 text-white shadow-md shadow-purple-500/20 transform -translate-y-0.5') 
                      : (isDark ? 'text-slate-400 hover:bg-[#1A263E] hover:text-slate-200' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900')
                  }`}
                >
                  <Icon className={`text-lg ${active ? (isDark ? 'text-[#00D2FF]' : 'text-white') : (isDark ? 'text-slate-500' : 'text-gray-400')}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0">
        {/* Header Banner */}
        <div className={`rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 backdrop-blur-lg transition-all ${
          isDark ? 'bg-[#00D2FF] text-slate-950 shadow-cyan-500/10' : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-purple-500/20'
        }`}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Executive Dashboard 👑</h1>
            <p className={`mt-2 text-base max-w-2xl font-bold ${isDark ? 'text-slate-900' : 'text-purple-100'}`}>
              Complete company-wide visibility. Oversee all projects, attendance logs, system users, and master task lists.
            </p>
          </div>
          <div className={`w-full md:w-auto flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-inner ${
            isDark ? 'bg-slate-950/20 border-slate-950/20 text-slate-950' : 'bg-white/10 backdrop-blur-md border-white/20 text-white'
          }`}>
            <FiShield className={`text-3xl ${isDark ? 'text-slate-950' : 'text-purple-200'}`} />
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-900' : 'text-purple-200'}`}>System Status</div>
              <div className="text-lg font-bold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                All Systems Operational
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - ALL CARDS FULLY CLICKABLE & CONNECTED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => setActiveTab('projects')}
            className={`p-6 rounded-2xl shadow-md border flex items-center space-x-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-purple-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
              <FiFolder />
            </div>
            <div>
              <div className={`text-sm font-semibold ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Total Projects</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{projects.length}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('users')}
            className={`p-6 rounded-2xl shadow-md border flex items-center space-x-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-blue-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              <FiUsers />
            </div>
            <div>
              <div className={`text-sm font-semibold ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>System Users</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${isDark ? 'text-[#00D2FF]' : 'text-blue-600'}`}>{users.length}</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('reports')}
            className={`p-6 rounded-2xl shadow-md border flex items-center space-x-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-green-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              <FiClock />
            </div>
            <div>
              <div className={`text-sm font-semibold ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Hours Logged</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${isDark ? 'text-[#00D2FF]' : 'text-green-600'}`}>{totalHoursCompany} hrs</span>
              </div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('tasks')}
            className={`p-6 rounded-2xl shadow-md border flex items-center space-x-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-amber-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              <FiCheckCircle />
            </div>
            <div>
              <div className={`text-sm font-semibold ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Total Tasks</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${isDark ? 'text-[#00D2FF]' : 'text-amber-600'}`}>{tasks.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: System Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Projects */}
            <div className={`lg:col-span-2 rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiFolder className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                  Active Projects Overview
                </h2>
                <button onClick={() => setActiveTab('projects')} className={`text-xs font-bold hover:underline ${isDark ? 'text-[#00D2FF]' : 'text-purple-600'}`}>View All &rarr;</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.slice(0, 4).map(proj => (
                  <div key={proj.id || proj._id} className={`border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{proj.title}</h3>
                        <span className={`px-2.5 py-0.5 border rounded-full text-xs font-bold ${
                          isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30' : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {proj.tasks?.length || 0} Tasks
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{proj.description}</p>
                    </div>

                    <div className={`pt-3 border-t flex justify-between items-center text-xs font-semibold ${
                      isDark ? 'border-[#2B3C5F] text-slate-400' : 'border-gray-200/60 text-gray-500'
                    }`}>
                      <span>Manager: {proj.manager?.name || 'Unassigned'}</span>
                      <span>{proj.members?.length || 0} Devs</span>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No projects created yet.</p>}
              </div>
            </div>

            {/* Quick Roster Summary */}
            <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiUsers className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                System Roster
              </h2>

              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-purple-50 border-purple-100'
                }`}>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-purple-900'}`}>Administrators</span>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${isDark ? 'bg-[#00D2FF] text-slate-950' : 'bg-purple-200 text-purple-800'}`}>{users.filter(u=>u.role==='Admin').length}</span>
                </div>
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-blue-50 border-blue-100'
                }`}>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-blue-900'}`}>Project Managers</span>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${isDark ? 'bg-[#00D2FF] text-slate-950' : 'bg-blue-200 text-blue-800'}`}>{managers.length}</span>
                </div>
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-indigo-50 border-indigo-100'
                }`}>
                  <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-indigo-900'}`}>Developers</span>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${isDark ? 'bg-[#00D2FF] text-slate-950' : 'bg-indigo-200 text-indigo-800'}`}>{developers.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Project Management & Creation */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Project Form */}
            <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 xl:sticky xl:top-24 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiPlus className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                Create New Project
              </h2>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NextGen Mobile App"
                    className={`block w-full border rounded-xl py-2 px-3 text-sm focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    value={projectForm.title}
                    onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    required
                    placeholder="Project goals, scope, and deliverables..."
                    rows={3}
                    className={`block w-full border rounded-xl py-2 px-3 text-sm focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    value={projectForm.description}
                    onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assign Project Manager</label>
                  <select
                    required
                    className={`block w-full border rounded-xl py-2 px-3 text-xs font-bold focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 bg-white focus:ring-2 focus:ring-purple-500'
                    }`}
                    value={projectForm.managerId}
                    onChange={e => setProjectForm({...projectForm, managerId: e.target.value})}
                  >
                    <option value="">Select Manager</option>
                    {managers.map(mgr => (
                      <option key={mgr.id || mgr._id} value={mgr.id || mgr._id}>{mgr.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assign Developers</label>
                  <div className={`space-y-2 max-h-48 overflow-y-auto pr-2 border rounded-xl p-3 ${
                    isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    {developers.map(dev => (
                      <label key={dev.id || dev._id} className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all ${
                        isDark ? 'hover:bg-[#1A263E]' : 'hover:bg-white'
                      }`}>
                        <input
                          type="checkbox"
                          checked={projectForm.developerIds.includes(dev.id || dev._id)}
                          onChange={() => handleDeveloperToggle(dev.id || dev._id)}
                          className={`h-4 w-4 rounded ${isDark ? 'text-[#00D2FF] focus:ring-[#00D2FF] border-slate-700 bg-slate-900' : 'text-purple-600 focus:ring-purple-50 border-gray-300'}`}
                        />
                        <div className="flex items-center space-x-2">
                          <img className="h-6 w-6 rounded-full" src={dev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.name}`} alt="" />
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{dev.name}</span>
                        </div>
                      </label>
                    ))}
                    {developers.length === 0 && <p className={`text-xs italic p-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No developers available.</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold transition-all transform hover:-translate-y-0.5 ${
                    isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                  }`}
                >
                  <FiPlus /> Create Project & Assign Team
                </button>
              </form>
            </div>

            {/* Existing Projects List */}
            <div className={`lg:col-span-2 rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiFolder className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                All Company Projects
              </h2>

              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id || project._id} className={`border rounded-2xl p-6 transition-all ${
                    isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
                      <span className={`px-3 py-1 border rounded-full text-xs font-bold ${
                        isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30' : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        Manager: {project.manager?.name || 'Unassigned'}
                      </span>
                    </div>
                    <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{project.description}</p>
                    
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t text-xs font-medium ${
                      isDark ? 'border-[#2B3C5F] text-slate-400' : 'border-gray-200/60 text-gray-500'
                    }`}>
                      <div>Project ID: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{project.id || project._id}</span></div>
                      <div>Team Size: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{project.members?.length || 0} Developers</span></div>
                      <div>Total Tasks: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{project.tasks?.length || 0} Tasks</span></div>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No projects created yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Company Attendance Feed */}
        {activeTab === 'reports' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiClock className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                  Company-Wide Attendance & Progress Logs
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Live monitoring feed of all developers&apos; daily punch-in/out times, work locations, and hurdles.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map(rep => (
                <div key={rep.id || rep._id} className={`border rounded-2xl p-6 shadow-xs transition-all duration-200 flex flex-col justify-between ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-gray-50 border-gray-100 hover:shadow-md'
                }`}>
                  <div>
                    <div className={`flex justify-between items-start gap-4 mb-4 pb-4 border-b ${isDark ? 'border-[#2B3C5F]' : 'border-gray-200/60'}`}>
                      <div className="flex items-center space-x-3">
                        <img
                          className="h-10 w-10 rounded-full border border-white shadow-sm"
                          src={rep.developer?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rep.developer?.name || 'Dev'}`}
                          alt={rep.developer?.name}
                        />
                        <div>
                          <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{rep.developer?.name || 'Developer'}</h3>
                          <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{rep.developer?.email}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold block mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          {new Date(rep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className={`px-2.5 py-0.5 border rounded-full text-xs font-bold shadow-xs ${
                          isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30' : 'bg-purple-100 text-purple-800 border-purple-200'
                        }`}>
                          {rep.hoursLogged} Hours Logged
                        </span>
                      </div>
                    </div>

                    {/* Attendance Badges */}
                    <div className={`flex flex-wrap items-center gap-2 text-xs font-bold mb-4 p-3 rounded-xl border shadow-xs ${
                      isDark ? 'bg-[#131C2E] border-[#2B3C5F]' : 'bg-white border-gray-100'
                    }`}>
                      <span className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg ${
                        isDark ? 'bg-[#1E2D4A] text-[#00D2FF] border-[#2B3C5F]' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <FiClock /> In: {rep.inTime || '09:00 AM'}
                      </span>
                      <span className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg ${
                        isDark ? 'bg-[#1E2D4A] text-[#00D2FF] border-[#2B3C5F]' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        <FiClock /> Out: {rep.outTime || '06:00 PM'}
                      </span>
                      <span className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg ${
                        isDark ? 'bg-[#1E2D4A] text-emerald-400 border-[#2B3C5F]' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <FiMapPin /> {rep.workLocation || 'Office'}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className={`font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Tasks Completed</div>
                        <p className={`p-3 rounded-xl border font-medium leading-relaxed ${
                          isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-slate-200' : 'bg-white border-gray-100 text-gray-800'
                        }`}>{rep.tasksCompleted || 'None'}</p>
                      </div>
                      <div>
                        <div className={`font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Tasks In Progress</div>
                        <p className={`p-3 rounded-xl border font-medium leading-relaxed ${
                          isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-slate-200' : 'bg-white border-gray-100 text-gray-800'
                        }`}>{rep.tasksInProgress || 'None'}</p>
                      </div>
                      
                      {rep.hurdlesFaced && (
                        <div>
                          <div className="font-bold text-red-500 uppercase tracking-wider mb-1">Hurdles Faced</div>
                          <p className={`p-3 rounded-xl border font-medium leading-relaxed ${
                            isDark ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-red-50 border-red-100 text-red-800'
                          }`}>{rep.hurdlesFaced}</p>
                        </div>
                      )}
                      {rep.dependencies && (
                        <div>
                          <div className="font-bold text-amber-500 uppercase tracking-wider mb-1">Dependencies</div>
                          <p className={`p-3 rounded-xl border font-medium leading-relaxed ${
                            isDark ? 'bg-amber-950/40 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'
                          }`}>{rep.dependencies}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {reports.length === 0 && (
                <div className={`col-span-2 text-center py-12 rounded-2xl border border-dashed ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-gray-50 border-gray-200'
                }`}>
                  <FiClock className={`mx-auto text-4xl mb-2 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  <p className={`font-semibold text-base ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No daily reports or attendance logged by team members yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: User Directory */}
        {activeTab === 'users' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FiUsers className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
              Company User Directory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(u => {
                const userPortfolios = portfolios.filter(p => p.developerId === (u.id || u._id));
                return (
                  <div key={u.id || u._id} className={`border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                  }`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <img
                          className="h-14 w-14 rounded-full border-2 border-white shadow-md"
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                          alt={u.name}
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{u.name}</h3>
                          <p className={`text-xs font-medium mb-2 truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{u.email}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isDark 
                              ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30'
                              : (u.role === 'Admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : u.role === 'Manager' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200')
                          }`}>
                            {u.role}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                          isDark
                            ? 'border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20'
                            : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        <FiTrash2 />
                        Delete
                      </button>
                    </div>

                    {/* User Portfolio Section (For Developers) */}
                    {u.role === 'Developer' && (
                      <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-[#2B3C5F]' : 'border-gray-200/60'}`}>
                        <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          <FiCode className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                          Completed Projects ({userPortfolios.length})
                        </h4>

                        {userPortfolios.length > 0 ? (
                          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {userPortfolios.map(item => (
                              <div key={item.id} className={`p-3 rounded-xl border space-y-1.5 ${
                                isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-white border-gray-100 shadow-xs'
                              }`}>
                                <div className="flex justify-between items-start gap-2">
                                  <h5 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h5>
                                  <div className="flex items-center gap-2 text-[10px]">
                                    {item.liveUrl && (
                                      <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-0.5 hover:underline ${isDark ? 'text-[#00D2FF]' : 'text-blue-600'}`}>
                                        <FiExternalLink /> Live
                                      </a>
                                    )}
                                    {item.githubUrl && (
                                      <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-0.5 hover:underline ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                        <FiGithub /> Repo
                                      </a>
                                    )}
                                  </div>
                                </div>
                                {item.description && (
                                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{item.description}</p>
                                )}
                                {item.techStack && (
                                  <div className="flex flex-wrap gap-1 pt-0.5">
                                    {item.techStack.split(',').map((t, idx) => (
                                      <span key={idx} className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                        isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#2B3C5F]' : 'bg-gray-50 text-gray-600 border-gray-200'
                                      }`}>
                                        {t.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No portfolio projects added by this developer yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4.5: Onboard System User Form */}
        {activeTab === 'onboard' && (
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-3xl shadow-xl border p-8 sm:p-10 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <div className="border-b pb-6 dark:border-[#2B3C5F]">
                <h2 className={`text-2xl font-extrabold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiPlus className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                  Onboard System User
                </h2>
                <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  Instantly provision Administrators, Managers, or Developers. Credentials will be emailed if SMTP is configured.
                </p>
              </div>

              <form onSubmit={handleOnboardUser} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>System Role</label>
                  <select
                    className={`w-full border rounded-2xl py-3 px-4 text-xs font-bold focus:outline-none shadow-xs ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                    }`}
                    value={userForm.role}
                    onChange={e => setUserForm({...userForm, role: e.target.value})}
                  >
                    <option value="Admin">Administrator (Full Access)</option>
                    <option value="Manager">Project Manager</option>
                    <option value="Developer">Software Developer</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Connor"
                      className={`w-full border rounded-2xl pl-12 pr-4 py-3 text-xs font-medium focus:outline-none shadow-xs ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                      value={userForm.name}
                      onChange={e => setUserForm({...userForm, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="email"
                      required
                      placeholder="sarah@company.com"
                      className={`w-full border rounded-2xl pl-12 pr-4 py-3 text-xs font-medium focus:outline-none shadow-xs ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                      value={userForm.email}
                      onChange={e => setUserForm({...userForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Temporary Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. MasterPass123"
                      className={`w-full border rounded-2xl pl-12 pr-4 py-3 text-xs font-medium focus:outline-none shadow-xs ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                      value={userForm.password}
                      onChange={e => setUserForm({...userForm, password: e.target.value})}
                    />
                  </div>
                  <p className={`text-[11px] mt-1.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>This temporary password is shown after creation. Email works only when SMTP settings are configured.</p>
                </div>

                <button
                  type="submit"
                  disabled={loadingUser}
                  className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 ${
                    isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                  }`}
                >
                  {loadingUser ? 'Provisioning User...' : 'Provision User'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Company Tasks Master List */}
        {activeTab === 'tasks' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiCheckCircle className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                  Company-Wide Tasks Master Directory
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Full administrative overview of all tasks across all projects and developers.</p>
              </div>
            </div>

            <div className="space-y-4">
              {tasks.map(task => (
                <div key={task.id || task._id} className={`border rounded-2xl p-6 transition-all ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                }`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        isDark 
                          ? 'bg-[#131C2E] text-amber-400 border-amber-500/30' 
                          : (task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200')
                      }`}>
                        {task.priority || 'Medium'} Priority
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                        isDark 
                          ? (task.status === 'Done' ? 'bg-[#131C2E] text-emerald-400 border-emerald-500/30' : 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30')
                          : (task.status === 'Done' ? 'bg-green-50 text-green-700 border-green-200' : task.status === 'InProgress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-200')
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{task.description}</p>
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t text-xs font-medium ${
                    isDark ? 'border-[#2B3C5F] text-slate-400' : 'border-gray-200/60 text-gray-500'
                  }`}>
                    <div>Project ID: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{task.projectId}</span></div>
                    <div>Assigned To ID: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{task.assignedToId || 'Unassigned'}</span></div>
                    <div>Created By ID: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{task.createdById || 'System'}</span></div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No tasks created across the company yet.</p>}
            </div>
          </div>
        )}

        {/* Tab 6: Settings & Security */}
        {activeTab === 'settings' && (
          <SettingsPanel currentTheme={currentTheme} onThemeChange={onThemeChange} />
        )}

        {/* Credential Vault — available to all roles */}
        <div className={`rounded-3xl shadow-md border p-6 sm:p-8 ${
          isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
        }`}>
          <CredentialVault currentTheme={currentTheme} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

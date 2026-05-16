import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiBriefcase, FiUsers, FiClock, FiCheckCircle, FiPlus, FiUploadCloud, FiLink, FiFolder, FiMapPin, FiUser, FiMail, FiLock, FiSettings, FiCode, FiExternalLink, FiGithub, FiTrash2 } from 'react-icons/fi';
import CredentialVault from '../components/CredentialVault';
import SettingsPanel from '../components/SettingsPanel';

const ManagerDashboard = ({ currentTheme, onThemeChange }) => {
  const { user } = useSelector((state) => state.auth);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedToId: '', priority: 'Medium' });
  const [figmaLink, setFigmaLink] = useState('');
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'reports', 'developers', 'tasks', 'settings'

  // New Developer Form State
  const [devForm, setDevForm] = useState({ name: '', email: '', password: '' });
  const [loadingDev, setLoadingDev] = useState(false);

  // New Project Form State for Manager
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    figmaLink: '',
    brdFileUrl: '',
    developerIds: []
  });

  useEffect(() => {
    fetchProjects();
    fetchReports();
    fetchDevelopers();
    fetchTasks();
    fetchPortfolios();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects', { withCredentials: true });
      const myProjects = res.data.filter(p => p.managerId === (user._id || user.id));
      setProjects(myProjects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports', { withCredentials: true });
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDevelopers = async () => {
    try {
      const res = await axios.get('/auth/users', { withCredentials: true });
      const devs = res.data.filter(u => u.role === 'Developer');
      setDevelopers(devs);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', { withCredentials: true });
      const myTasks = res.data.filter(t => t.createdById === (user._id || user.id));
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPortfolios = async () => {
    try {
      const res = await axios.get('/api/portfolio', { withCredentials: true });
      setPortfolios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', {
        ...projectForm,
        managerId: user._id || user.id
      }, { withCredentials: true });
      alert('Project created successfully!');
      setProjectForm({ title: '', description: '', figmaLink: '', brdFileUrl: '', developerIds: [] });
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Error creating project');
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

  const handleCreateTask = async (e, projectId) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', {
        ...taskForm,
        projectId,
        createdById: user._id || user.id,
        status: 'Todo'
      }, { withCredentials: true });
      alert('Task assigned successfully!');
      setTaskForm({ title: '', description: '', assignedToId: '', priority: 'Medium' });
      fetchProjects();
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert('Error assigning task');
    }
  };

  const handleAddFigmaLink = async (e, projectId) => {
    e.preventDefault();
    try {
      await axios.post(`/api/projects/${projectId}/figma-link`, { link: figmaLink }, { withCredentials: true });
      alert('Figma link added successfully!');
      setFigmaLink('');
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Error adding Figma link');
    }
  };

  const handleFileUpload = async (e, projectId) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await axios.post(`/api/projects/${projectId}/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Files uploaded successfully!');
      fetchProjects();
    } catch (err) {
      console.error(err);
      alert('Error uploading files');
    }
  };

  const handleAddDeveloper = async (e) => {
    e.preventDefault();
    setLoadingDev(true);
    try {
      const res = await axios.post('/auth/create-developer', {
        ...devForm,
        role: 'Developer'
      }, { withCredentials: true });
      const createdUser = res.data;
      const mailNote = createdUser.emailSent
        ? 'Credentials email sent successfully.'
        : `Credentials email was not sent${createdUser.emailError ? `: ${createdUser.emailError}` : '.'}\nShare these credentials manually.`;
      alert(`Developer added successfully.\n\nName: ${createdUser.name}\nEmail: ${createdUser.email}\nTemporary password: ${devForm.password}\n\n${mailNote}`);
      setDevForm({ name: '', email: '', password: '' });
      fetchDevelopers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error adding developer');
    } finally {
      setLoadingDev(false);
    }
  };

  const handleDeleteDeveloper = async (developer) => {
    const developerId = developer.id || developer._id;
    const firstConfirm = window.confirm(`Delete ${developer.name} from the user list?`);
    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      `This permanently removes ${developer.name}, their reports, saved credentials, portfolios, and task links. Continue?`
    );
    if (!secondConfirm) return;

    try {
      const res = await axios.delete(`/auth/users/${developerId}`, { withCredentials: true });
      alert(res.data?.message || 'Developer deleted successfully.');
      fetchDevelopers();
      fetchProjects();
      fetchTasks();
      fetchReports();
      fetchPortfolios();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error deleting developer');
    }
  };

  const totalHoursTeam = reports.reduce((acc, curr) => acc + (curr.hoursLogged || 0), 0);

  const navItems = [
    { id: 'projects', name: 'Projects & Tasks', icon: FiBriefcase },
    { id: 'reports', name: 'Attendance & Reports', icon: FiClock },
    { id: 'developers', name: 'Developers Directory', icon: FiUsers },
    { id: 'tasks', name: 'Assigned Overview', icon: FiCheckCircle },
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
            <div className={`p-3 rounded-2xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-blue-50 text-blue-600'}`}>
              <FiBriefcase />
            </div>
            <div>
              <h2 className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Manager Portal</h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Project Command</p>
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
                      ? (isDark ? 'bg-[#1E293B] border-l-4 border-[#00D2FF] text-[#00D2FF] shadow-lg shadow-cyan-500/10 transform -translate-y-0.5' : 'bg-blue-600 text-white shadow-md shadow-blue-500/20 transform -translate-y-0.5') 
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
          isDark ? 'bg-[#00D2FF] text-slate-950 shadow-cyan-500/10' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-indigo-500/20'
        }`}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Manager Command Center 🚀</h1>
            <p className={`mt-2 text-base max-w-2xl font-bold ${isDark ? 'text-slate-900' : 'text-indigo-100'}`}>
              Create projects, assign tasks to developers, monitor attendance & daily progress, and manage project assets seamlessly.
            </p>
          </div>
          <div className={`w-full md:w-auto flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-inner ${
            isDark ? 'bg-slate-950/20 border-slate-950/20 text-slate-950' : 'bg-white/10 backdrop-blur-md border-white/20 text-white'
          }`}>
            <FiUsers className={`text-3xl ${isDark ? 'text-slate-950' : 'text-indigo-200'}`} />
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-900' : 'text-indigo-200'}`}>Active Developers</div>
              <div className="text-lg font-bold">{developers.length} Developers</div>
            </div>
          </div>
        </div>

        {/* Stats Grid - ALL CARDS FULLY CLICKABLE & CONNECTED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
          <div
            onClick={() => setActiveTab('projects')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-blue-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
              <FiBriefcase />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Projects Managed</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{projects.length}</div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('developers')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-purple-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
              <FiUsers />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Developers</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-[#00D2FF]' : 'text-purple-600'}`}>{developers.length}</div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('tasks')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-indigo-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
              <FiCheckCircle />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Tasks Assigned</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-[#00D2FF]' : 'text-indigo-600'}`}>{tasks.length}</div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('reports')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-green-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-green-50 text-green-600 border border-green-100'}`}>
              <FiClock />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Hours Logged</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-[#00D2FF]' : 'text-green-600'}`}>{totalHoursTeam} hrs</div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('reports')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-amber-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
              <FiCheckCircle />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Reports Submitted</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-[#00D2FF]' : 'text-amber-600'}`}>{reports.length}</div>
            </div>
          </div>
        </div>

        {/* Tab 1: Projects & Tasks */}
        {activeTab === 'projects' && (
          <div className="space-y-8">
            {/* Create Project Section */}
            <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiPlus className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                Create New Project & Assign Developers
              </h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>As a Project Manager, initialize a new project workspace and assign your developers to it.</p>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Enterprise Portal Redesign"
                      className={`block w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      }`}
                      value={projectForm.title}
                      onChange={e => setProjectForm({...projectForm, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Project Description</label>
                    <input
                      type="text"
                      required
                      placeholder="Brief overview of goals and deliverables..."
                      className={`block w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      }`}
                      value={projectForm.description}
                      onChange={e => setProjectForm({...projectForm, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Figma Design URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://figma.com/file/..."
                      className={`block w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      }`}
                      value={projectForm.figmaLink}
                      onChange={e => setProjectForm({...projectForm, figmaLink: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>BRD Document URL / Cloud Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://docs.google.com/document/d/..."
                      className={`block w-full border rounded-xl py-2.5 px-3.5 text-xs focus:outline-none ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      }`}
                      value={projectForm.brdFileUrl}
                      onChange={e => setProjectForm({...projectForm, brdFileUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assign Developers to Project</label>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border rounded-2xl ${
                    isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    {developers.map(dev => (
                      <label key={dev.id || dev._id} className={`flex items-center space-x-3 p-2.5 rounded-xl cursor-pointer border transition-all shadow-xs ${
                        isDark ? 'hover:bg-[#1A263E] border-transparent hover:border-[#2B3C5F]' : 'hover:bg-white border-transparent hover:border-gray-200'
                      }`}>
                        <input
                          type="checkbox"
                          checked={projectForm.developerIds.includes(dev.id || dev._id)}
                          onChange={() => handleDeveloperToggle(dev.id || dev._id)}
                          className={`h-4 w-4 rounded ${isDark ? 'text-[#00D2FF] focus:ring-[#00D2FF] border-slate-700 bg-slate-900' : 'text-blue-600 focus:ring-blue-500 border-gray-300'}`}
                        />
                        <div className="flex items-center space-x-2 truncate">
                          <img className="h-6 w-6 rounded-full" src={dev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.name}`} alt="" />
                          <span className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{dev.name}</span>
                        </div>
                      </label>
                    ))}
                    {developers.length === 0 && <p className={`text-xs italic p-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No developers available. Onboard developers first!</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  className={`flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-xl shadow-md text-xs font-bold transition-all transform hover:-translate-y-0.5 ${
                    isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                  }`}
                >
                  <FiPlus className="text-base" /> Create Project
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Project List */}
              <div className="lg:col-span-2 space-y-6">
                <div className={`rounded-3xl shadow-md border p-6 sm:p-8 ${
                  isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
                }`}>
                  <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FiFolder className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                    My Managed Projects
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map(project => {
                      const isSelected = selectedProject?.id === project.id;
                      return (
                        <div
                          key={project.id || project._id}
                          onClick={() => setSelectedProject(project)}
                          className={`border rounded-2xl p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                            isSelected 
                              ? (isDark ? 'border-[#00D2FF] ring-2 ring-[#00D2FF]/20 bg-[#1A263E] shadow-lg' : 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/20 shadow-md') 
                              : (isDark ? 'border-[#2B3C5F] hover:shadow-md hover:border-[#00D2FF]/50 bg-[#1A263E]' : 'border-gray-200 hover:shadow-md hover:border-blue-200 bg-white')
                          }`}
                        >
                          <div>
                            <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
                            <p className={`text-sm mt-2 leading-relaxed line-clamp-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{project.description}</p>
                          </div>

                          <div className={`mt-6 pt-4 border-t flex justify-between items-center text-xs font-semibold ${
                            isDark ? 'border-[#2B3C5F] text-slate-400' : 'border-gray-100 text-gray-500'
                          }`}>
                            <span>{project.members?.length || 0} Members</span>
                            <span className={`font-bold hover:underline flex items-center gap-1 ${isDark ? 'text-[#00D2FF]' : 'text-blue-600'}`}>
                              Manage Tasks & Assets &rarr;
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {projects.length === 0 && (
                      <div className={`col-span-2 text-center py-12 rounded-2xl border border-dashed ${
                        isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <FiFolder className={`mx-auto text-4xl mb-2 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                        <p className={`font-semibold text-base ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No projects assigned to you yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Management Panel */}
              <div className="space-y-6">
                {selectedProject ? (
                  <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 xl:sticky xl:top-24 ${
                    isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
                  }`}>
                    <div className={`border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
                      <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedProject.title}</h2>
                      <p className={`text-xs mt-1 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Project ID: {selectedProject.id || selectedProject._id}</p>
                    </div>

                    {/* Assign Task Form */}
                    <form onSubmit={(e) => handleCreateTask(e, selectedProject.id || selectedProject._id)} className="space-y-4">
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <FiPlus className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                        Assign New Task
                      </h3>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Task Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Implement OAuth2 Login"
                          className={`block w-full border rounded-xl py-2 px-3 text-sm focus:outline-none ${
                            isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          }`}
                          value={taskForm.title}
                          onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
                        <textarea
                          required
                          placeholder="Detailed task requirements..."
                          rows={2}
                          className={`block w-full border rounded-xl py-2 px-3 text-sm focus:outline-none ${
                            isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          }`}
                          value={taskForm.description}
                          onChange={e => setTaskForm({...taskForm, description: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Assign To</label>
                          <select
                            required
                            className={`block w-full border rounded-xl py-2 px-3 text-xs font-bold focus:outline-none ${
                              isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500'
                            }`}
                            value={taskForm.assignedToId}
                            onChange={e => setTaskForm({...taskForm, assignedToId: e.target.value})}
                          >
                            <option value="">Select Developer</option>
                            {developers.map(dev => (
                              <option key={dev.id || dev._id} value={dev.id || dev._id}>{dev.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
                          <select
                            className={`block w-full border rounded-xl py-2 px-3 text-xs font-bold focus:outline-none ${
                              isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500'
                            }`}
                            value={taskForm.priority}
                            onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className={`w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-xs font-bold rounded-xl shadow-md transition-all ${
                          isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff]' : 'text-white bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <FiPlus /> Assign Task
                      </button>
                    </form>

                    {/* Add Figma Link */}
                    <form onSubmit={(e) => handleAddFigmaLink(e, selectedProject.id || selectedProject._id)} className={`space-y-3 pt-4 border-t ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <FiLink className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                        Add Figma Link
                      </h3>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          required
                          placeholder="https://figma.com/file/..."
                          className={`block w-full border rounded-xl py-2 px-3 text-xs focus:outline-none ${
                            isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                          }`}
                          value={figmaLink}
                          onChange={e => setFigmaLink(e.target.value)}
                        />
                        <button
                          type="submit"
                          className={`flex justify-center items-center px-4 border border-transparent rounded-xl shadow-xs text-xs font-bold transition-all ${
                            isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff]' : 'text-white bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          Add
                        </button>
                      </div>
                    </form>

                    {/* Upload BRD / Files */}
                    <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <FiUploadCloud className={isDark ? 'text-[#00D2FF]' : 'text-emerald-600'} />
                        Upload BRD / Architecture Files
                      </h3>
                      <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                        isDark ? 'border-[#2B3C5F] bg-[#0B101B] hover:bg-[#1A263E]' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUploadCloud className={`w-8 h-8 mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                          <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Click to upload files (Max 10)</p>
                        </div>
                        <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, selectedProject.id || selectedProject._id)} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className={`rounded-3xl shadow-md border p-8 text-center xl:sticky xl:top-24 ${
                    isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
                  }`}>
                    <FiBriefcase className={`mx-auto text-4xl mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>No Project Selected</h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Select a project from the left grid to manage tasks, Figma links, and BRD files.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance & Daily Reports */}
        {activeTab === 'reports' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className={`flex justify-between items-center border-b pb-4 ${isDark ? 'border-[#222F4A]' : 'border-gray-100'}`}>
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiClock className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                  Attendance & Progress Logs
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

        {/* Tab 3: Developers Directory & Onboarding */}
        {activeTab === 'developers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Developer Form */}
            <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 xl:sticky xl:top-24 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiPlus className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                Onboard New Developer
              </h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Add a developer to your team. Credentials will be emailed if SMTP is configured.</p>

              <form onSubmit={handleAddDeveloper} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Johnson"
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                      value={devForm.name}
                      onChange={e => setDevForm({...devForm, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                      value={devForm.email}
                      onChange={e => setDevForm({...devForm, email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Temporary Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. SecurePass123"
                      className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none shadow-xs ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white placeholder-slate-500 focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-purple-500'
                      }`}
                      value={devForm.password}
                      onChange={e => setDevForm({...devForm, password: e.target.value})}
                    />
                  </div>
                  <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>This temporary password is shown after creation. Email works only when SMTP settings are configured.</p>
                </div>

                <button
                  type="submit"
                  disabled={loadingDev}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 ${
                    isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/20'
                  }`}
                >
                  {loadingDev ? 'Adding Developer...' : 'Add Developer'}
                </button>
              </form>
            </div>

            {/* Developers List */}
            <div className={`lg:col-span-2 rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiUsers className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                Developers Roster
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {developers.map(dev => {
                  const devPortfolios = portfolios.filter(p => p.developerId === (dev.id || dev._id));
                  return (
                    <div key={dev.id || dev._id} className={`border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                      isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <img
                            className="h-14 w-14 rounded-full border-2 border-white shadow-md"
                            src={dev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.name}`}
                            alt={dev.name}
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{dev.name}</h3>
                            <p className={`text-xs font-medium mb-2 truncate ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{dev.email}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${
                              isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30' : 'bg-purple-100 text-purple-800 border-purple-200'
                            }`}>
                              {dev.role}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteDeveloper(dev)}
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

                      {/* Developer Portfolio Section */}
                      <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-[#2B3C5F]' : 'border-gray-200/60'}`}>
                        <h4 className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                          <FiCode className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                          Completed Projects ({devPortfolios.length})
                        </h4>

                        {devPortfolios.length > 0 ? (
                          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                            {devPortfolios.map(item => (
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
                    </div>
                  );
                })}
                {developers.length === 0 && (
                  <div className={`col-span-2 text-center py-12 rounded-2xl border border-dashed ${
                    isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <FiUsers className={`mx-auto text-4xl mb-2 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                    <p className={`font-semibold text-base ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>No developers added to your team yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Tasks Assigned Overview */}
        {activeTab === 'tasks' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiCheckCircle className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                  Tasks Assigned Overview
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Full directory of all project tasks assigned by you to developers.</p>
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
                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t text-xs font-medium ${
                    isDark ? 'border-[#2B3C5F] text-slate-400' : 'border-gray-200/60 text-gray-500'
                  }`}>
                    <div>Project ID: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{task.projectId}</span></div>
                    <div>Assigned To ID: <span className={isDark ? 'text-white font-semibold' : 'text-gray-700 font-semibold'}>{task.assignedToId || 'Unassigned'}</span></div>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No tasks assigned by you yet.</p>}
            </div>
          </div>
        )}

        {/* Tab 5: Settings & Security */}
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

export default ManagerDashboard;

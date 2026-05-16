import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FiList, FiClock, FiCheckCircle, FiTrendingUp, FiSend, FiMapPin, FiCalendar, FiUser, FiCode, FiSettings, FiPlus, FiTrash2, FiExternalLink, FiGithub, FiBriefcase, FiFolder, FiLink, FiFileText } from 'react-icons/fi';
import CredentialVault from '../components/CredentialVault';
import SettingsPanel from '../components/SettingsPanel';

const DeveloperDashboard = ({ currentTheme, onThemeChange }) => {
  const { user } = useSelector((state) => state.auth);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'tasks', 'reports', 'portfolio', 'settings'
  const [statusFilter, setStatusFilter] = useState('All');

  // Report Form State
  const [reportForm, setReportForm] = useState({
    tasksCompleted: '',
    tasksInProgress: '',
    hurdlesFaced: '',
    dependencies: '',
    inTime: '10:00 AM',
    outTime: '07:00 PM',
    workLocation: 'Office'
  });

  // Portfolio Form State
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    techStack: '',
    liveUrl: '',
    githubUrl: ''
  });
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchReports();
    fetchPortfolios();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', { withCredentials: true });
      const myTasks = res.data.filter(t => t.assignedToId === (user._id || user.id));
      setTasks(myTasks);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects', { withCredentials: true });
      const myProjects = res.data.filter(p => p.members?.some(m => m.userId === (user._id || user.id)));
      setProjects(myProjects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports', { withCredentials: true });
      const myReports = res.data.filter(r => r.developerId === (user._id || user.id));
      setReports(myReports);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPortfolios = async () => {
    try {
      const res = await axios.get(`/api/portfolio?developerId=${user._id || user.id}`, { withCredentials: true });
      setPortfolios(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateHours = (inT, outT) => {
    try {
      const parseTime = (timeStr) => {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return hours + minutes / 60;
      };
      const inHrs = parseTime(inT);
      const outHrs = parseTime(outT);
      const diff = outHrs - inHrs;
      return diff > 0 ? parseFloat(diff.toFixed(1)) : 8.0;
    } catch (e) {
      return 8.0;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/tasks/${taskId}`, { status: newStatus }, { withCredentials: true });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    const calculatedHours = calculateHours(reportForm.inTime, reportForm.outTime);

    try {
      await axios.post('/api/reports', {
        ...reportForm,
        hoursLogged: calculatedHours,
        developerId: user._id || user.id
      }, { withCredentials: true });
      alert(`Daily Report submitted successfully! Logged ${calculatedHours} hours.`);
      setReportForm({
        tasksCompleted: '',
        tasksInProgress: '',
        hurdlesFaced: '',
        dependencies: '',
        inTime: '10:00 AM',
        outTime: '07:00 PM',
        workLocation: 'Office'
      });
      fetchReports();
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    setLoadingPortfolio(true);
    try {
      await axios.post('/api/portfolio', {
        ...portfolioForm,
        developerId: user._id || user.id
      }, { withCredentials: true });
      alert('Project added to your portfolio successfully!');
      setPortfolioForm({ title: '', description: '', techStack: '', liveUrl: '', githubUrl: '' });
      fetchPortfolios();
    } catch (err) {
      console.error(err);
      alert('Error adding portfolio item');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleDeletePortfolio = async (id) => {
    if (!confirm('Are you sure you want to delete this project from your portfolio?')) return;
    try {
      await axios.delete(`/api/portfolio/${id}`, { withCredentials: true });
      fetchPortfolios();
    } catch (err) {
      console.error(err);
    }
  };

  const completedTasksCount = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasksCount = tasks.filter(t => t.status === 'InProgress').length;
  const totalHours = reports.reduce((acc, curr) => acc + (curr.hoursLogged || 0), 0);

  const filteredTasks = tasks.filter(t => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  const navItems = [
    { id: 'projects', name: 'My Assigned Projects', icon: FiBriefcase },
    { id: 'tasks', name: 'My Task Board', icon: FiList },
    { id: 'reports', name: 'Attendance & Reports', icon: FiClock },
    { id: 'portfolio', name: 'My Past Projects', icon: FiCode },
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
            <div className={`p-3 rounded-2xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-indigo-50 text-indigo-600'}`}>
              <FiCode />
            </div>
            <div>
              <h2 className={`font-extrabold text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Dev Portal</h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Workspace</p>
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
                      ? (isDark ? 'bg-[#1E293B] border-l-4 border-[#00D2FF] text-[#00D2FF] shadow-lg shadow-cyan-500/10 transform -translate-y-0.5' : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 transform -translate-y-0.5') 
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
          isDark ? 'bg-[#00D2FF] text-slate-950 shadow-cyan-500/10' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-purple-500/20'
        }`}>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {user.name} 👋</h1>
            <p className={`mt-2 text-base max-w-2xl font-bold ${isDark ? 'text-slate-900' : 'text-indigo-100'}`}>
              View your active task board, submit your daily attendance & progress reports, and showcase your past project portfolio.
            </p>
          </div>
          <div className={`w-full md:w-auto flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-inner ${
            isDark ? 'bg-slate-950/20 border-slate-950/20 text-slate-950' : 'bg-white/10 backdrop-blur-md border-white/20 text-white'
          }`}>
            <FiCalendar className={`text-3xl ${isDark ? 'text-slate-950' : 'text-indigo-200'}`} />
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-900' : 'text-indigo-200'}`}>Today&apos;s Schedule</div>
              <div className="text-lg font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid - ALL CARDS FULLY CLICKABLE & CONNECTED */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Assigned Projects</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{projects.length}</div>
            </div>
          </div>

          <div
            onClick={() => { setActiveTab('tasks'); setStatusFilter('All'); }}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-indigo-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'}`}>
              <FiList />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Assigned Tasks</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-[#00D2FF]' : 'text-indigo-600'}`}>{tasks.length}</div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('portfolio')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-yellow-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>
              <FiCode />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Portfolio Projects</div>
              <div className={`text-2xl font-bold mt-2 ${isDark ? 'text-[#00D2FF]' : 'text-yellow-600'}`}>{portfolios.length}</div>
            </div>
          </div>

          <div
            onClick={() => setActiveTab('reports')}
            className={`min-h-[160px] p-6 rounded-2xl shadow-md border flex flex-col items-start justify-center gap-4 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer ring-2 ring-transparent ${
              isDark ? 'bg-[#131C2E] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-white border-gray-100 hover:ring-purple-500/20'
            }`}
          >
            <div className={`p-4 rounded-xl text-2xl ${isDark ? 'bg-[#1E2D4A] text-[#00D2FF]' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
              <FiTrendingUp />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-semibold leading-snug ${isDark ? 'text-slate-400 uppercase text-xs tracking-wider' : 'text-gray-500'}`}>Total Hours Logged</div>
              <div className={`text-2xl font-bold mt-2 whitespace-nowrap ${isDark ? 'text-[#00D2FF]' : 'text-purple-600'}`}>{totalHours} hrs</div>
            </div>
          </div>
        </div>

        {/* Tab 0: Assigned Projects */}
        {activeTab === 'projects' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiBriefcase className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                My Assigned Projects & Architecture Assets
              </h2>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>View the projects you are assigned to, along with Figma designs and BRD documents provided by your Manager.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map(project => (
                <div key={project.id || project._id} className={`border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-white border-gray-200'
                }`}>
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#222F4A]' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        Active Project
                      </span>
                    </div>
                    <p className={`text-xs mt-2 leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{project.description}</p>
                    
                    {project.manager && (
                      <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 border ${isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-gray-50 border-gray-100'}`}>
                        <img src={project.manager.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.manager.name}`} className="w-8 h-8 rounded-full" alt="" />
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Project Manager</div>
                          <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{project.manager.name}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-[#2B3C5F]' : 'border-gray-100'}`}>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Assets & Links</div>
                    <div className="flex flex-wrap gap-2">
                      {project.figmaLinks && project.figmaLinks.length > 0 ? (
                        project.figmaLinks.map((link, idx) => (
                          <a
                            key={link.id || idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                              isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#222F4A] hover:border-[#00D2FF]' : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                            }`}
                          >
                            <FiLink /> Figma Design {idx + 1}
                          </a>
                        ))
                      ) : (
                        <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No Figma links added</span>
                      )}

                      {project.brdFiles && project.brdFiles.length > 0 ? (
                        project.brdFiles.map((file, idx) => (
                          <a
                            key={file.id || idx}
                            href={file.path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                              isDark ? 'bg-[#131C2E] text-emerald-400 border-[#222F4A] hover:border-emerald-50' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            <FiFileText /> {file.filename || `BRD Document ${idx + 1}`}
                          </a>
                        ))
                      ) : (
                        <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>No BRD documents uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className={`col-span-2 text-center py-12 rounded-2xl border border-dashed ${
                  isDark ? 'bg-[#1A263E] border-[#2B3C5F]' : 'bg-gray-50 border-gray-200'
                }`}>
                  <FiBriefcase className={`mx-auto text-4xl mb-2 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                  <p className={`font-semibold text-base ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>You have not been assigned to any projects yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Task Board */}
        {activeTab === 'tasks' && (
          <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiList className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                  My Active Task Board
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Manage and update the status of your assigned tasks.</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                {['All', 'Todo', 'InProgress', 'Done'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                      statusFilter === f 
                        ? (isDark ? 'bg-[#00D2FF] text-slate-950 shadow-md shadow-cyan-500/20' : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20') 
                        : (isDark ? 'bg-[#1A263E] text-slate-400 hover:bg-[#1E2D4A]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                    }`}
                  >
                    {f} {f !== 'All' && `(${tasks.filter(t => t.status === f).length})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Todo', 'InProgress', 'Done'].map(colStatus => {
                const colTasks = filteredTasks.filter(t => t.status === colStatus);
                return (
                  <div key={colStatus} className={`rounded-2xl p-5 border flex flex-col min-h-[300px] ${
                    isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-gray-50/80 border-gray-100'
                  }`}>
                    <div className={`flex justify-between items-center mb-4 pb-3 border-b ${isDark ? 'border-[#222F4A]' : 'border-gray-200/60'}`}>
                      <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          colStatus === 'Todo' ? 'bg-blue-500' :
                          colStatus === 'InProgress' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        {colStatus === 'InProgress' ? 'In Progress' : colStatus}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${
                        isDark ? 'bg-[#131C2E] text-slate-300 border-[#222F4A]' : 'bg-white text-gray-600 border-gray-200'
                      }`}>
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="space-y-4 flex-1">
                      {colTasks.map(task => (
                        <div key={task.id || task._id} className={`rounded-2xl p-5 shadow-xs border transition-all space-y-3 ${
                          isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-white border-gray-100 hover:shadow-md'
                        }`}>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isDark 
                                ? 'bg-[#131C2E] text-amber-400 border-amber-500/30' 
                                : (task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200')
                            }`}>
                              {task.priority || 'Medium'}
                            </span>
                          </div>
                          <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{task.description}</p>
                          
                          <div className={`pt-3 border-t flex justify-between items-center ${isDark ? 'border-[#2B3C5F]' : 'border-gray-100'}`}>
                            <span className="text-[10px] font-bold text-gray-400">ID: {task.projectId}</span>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id || task._id, e.target.value)}
                              className={`text-xs font-bold border rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[#00D2FF] cursor-pointer ${
                                isDark ? 'bg-[#0B101B] border-[#222F4A] text-[#00D2FF]' : 'bg-gray-50 border-gray-200 text-gray-700'
                              }`}
                            >
                              <option value="Todo">Todo</option>
                              <option value="InProgress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                          </div>
                        </div>
                      ))}
                      {colTasks.length === 0 && (
                        <div className={`flex items-center justify-center h-48 border-2 border-dashed rounded-2xl text-xs font-medium ${
                          isDark ? 'border-[#222F4A] text-slate-500' : 'border-gray-200 text-gray-400'
                        }`}>
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Attendance & Daily Reports */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submit Report Form */}
            <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 xl:sticky xl:top-24 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiSend className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                Log Daily Attendance & Report
              </h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Punch in/out and submit your daily accomplishments. Hours logged will be calculated automatically.</p>

              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Punch In Time</label>
                    <input
                      type="text"
                      required
                      placeholder="10:00 AM"
                      className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                      }`}
                      value={reportForm.inTime}
                      onChange={e => setReportForm({...reportForm, inTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Punch Out Time</label>
                    <input
                      type="text"
                      required
                      placeholder="07:00 PM"
                      className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                        isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                      }`}
                      value={reportForm.outTime}
                      onChange={e => setReportForm({...reportForm, outTime: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Work Location</label>
                  <select
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-bold focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={reportForm.workLocation}
                    onChange={e => setReportForm({...reportForm, workLocation: e.target.value})}
                  >
                    <option value="Office">Office</option>
                    <option value="Work From Home">Work From Home</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Tasks Completed Today</label>
                  <textarea
                    required
                    placeholder="List completed tasks/PRs..."
                    rows={4}
                    className={`w-full min-h-[120px] resize-y border rounded-xl py-3 px-4 text-sm font-medium leading-relaxed focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={reportForm.tasksCompleted}
                    onChange={e => setReportForm({...reportForm, tasksCompleted: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Tasks In Progress</label>
                  <textarea
                    required
                    placeholder="Ongoing tasks..."
                    rows={4}
                    className={`w-full min-h-[120px] resize-y border rounded-xl py-3 px-4 text-sm font-medium leading-relaxed focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={reportForm.tasksInProgress}
                    onChange={e => setReportForm({...reportForm, tasksInProgress: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Hurdles Faced (Optional)</label>
                  <textarea
                    placeholder="Any blockers or challenges..."
                    rows={4}
                    className={`w-full min-h-[120px] resize-y border rounded-xl py-3 px-4 text-sm font-medium leading-relaxed focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={reportForm.hurdlesFaced}
                    onChange={e => setReportForm({...reportForm, hurdlesFaced: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Dependencies (Optional)</label>
                  <textarea
                    placeholder="Waiting on API, design, etc..."
                    rows={4}
                    className={`w-full min-h-[120px] resize-y border rounded-xl py-3 px-4 text-sm font-medium leading-relaxed focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={reportForm.dependencies}
                    onChange={e => setReportForm({...reportForm, dependencies: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold transition-all transform hover:-translate-y-0.5 ${
                    isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20'
                  }`}
                >
                  <FiSend /> Submit Daily Report
                </button>
              </form>
            </div>

            {/* My Past Reports List */}
            <div className={`lg:col-span-2 rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiClock className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                My Submission History
              </h2>

              <div className="space-y-4">
                {reports.map(rep => (
                  <div key={rep.id || rep._id} className={`border rounded-2xl p-6 transition-all space-y-4 ${
                    isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                  }`}>
                    <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-[#2B3C5F]' : 'border-gray-200/60'}`}>
                      <span className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        <FiCalendar className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                        {new Date(rep.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className={`inline-flex items-center whitespace-nowrap px-3 py-1 border rounded-full text-xs font-bold shadow-xs ${
                        isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#00D2FF]/30' : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}>
                        {rep.hoursLogged} Hours Logged
                      </span>
                    </div>

                    <div className={`flex flex-wrap gap-2 text-xs font-bold p-3 rounded-xl border shadow-xs ${
                      isDark ? 'bg-[#131C2E] border-[#2B3C5F]' : 'bg-white border-gray-100'
                    }`}>
                      <span className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg ${
                        isDark ? 'bg-[#1E2D4A] text-[#00D2FF] border-[#2B3C5F]' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        <FiClock /> In: {rep.inTime || '10:00 AM'}
                      </span>
                      <span className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg ${
                        isDark ? 'bg-[#1E2D4A] text-[#00D2FF] border-[#2B3C5F]' : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        <FiClock /> Out: {rep.outTime || '07:00 PM'}
                      </span>
                      <span className={`flex items-center gap-1 px-2.5 py-1 border rounded-lg ${
                        isDark ? 'bg-[#1E2D4A] text-emerald-400 border-[#2B3C5F]' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <FiMapPin /> {rep.workLocation || 'Office'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className={`font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Completed</span>
                        <p className={`p-3 rounded-xl border font-medium leading-relaxed ${
                          isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-slate-200' : 'bg-white border-gray-100 text-gray-800'
                        }`}>{rep.tasksCompleted || 'None'}</p>
                      </div>
                      <div>
                        <span className={`font-bold uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>In Progress</span>
                        <p className={`p-3 rounded-xl border font-medium leading-relaxed ${
                          isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-slate-200' : 'bg-white border-gray-100 text-gray-800'
                        }`}>{rep.tasksInProgress || 'None'}</p>
                      </div>
                    </div>

                    {(rep.hurdlesFaced || rep.dependencies) && (
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t text-xs ${isDark ? 'border-[#2B3C5F]' : 'border-gray-100'}`}>
                        {rep.hurdlesFaced && (
                          <div>
                            <span className="font-bold text-red-500 uppercase tracking-wider block mb-1">Hurdles</span>
                            <p className={`p-3 rounded-xl border font-medium ${
                              isDark ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-red-50 border-red-100 text-red-800'
                            }`}>{rep.hurdlesFaced}</p>
                          </div>
                        )}
                        {rep.dependencies && (
                          <div>
                            <span className="font-bold text-amber-500 uppercase tracking-wider block mb-1">Dependencies</span>
                            <p className={`p-3 rounded-xl border font-medium ${
                              isDark ? 'bg-amber-950/40 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'
                            }`}>{rep.dependencies}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {reports.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No daily reports submitted yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: My Past Projects / Portfolio */}
        {activeTab === 'portfolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Portfolio Form */}
            <div className={`rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 xl:sticky xl:top-24 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiPlus className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                Add Past Project
              </h2>
              <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Add a completed project, client app, or open-source work to your developer portfolio.</p>

              <form onSubmit={handleAddPortfolio} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E-Commerce Platform"
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={portfolioForm.title}
                    onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Description</label>
                  <textarea
                    placeholder="Key achievements, architecture, and role..."
                    rows={2}
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={portfolioForm.description}
                    onChange={e => setPortfolioForm({...portfolioForm, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Tech Stack / Tools</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, PostgreSQL, Docker"
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={portfolioForm.techStack}
                    onChange={e => setPortfolioForm({...portfolioForm, techStack: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Live URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://myproject.com"
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={portfolioForm.liveUrl}
                    onChange={e => setPortfolioForm({...portfolioForm, liveUrl: e.target.value})}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>GitHub / Repo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    className={`w-full border rounded-xl py-2 px-3 text-xs font-medium focus:outline-none ${
                      isDark ? 'bg-[#0B101B] border-[#222F4A] text-white focus:ring-2 focus:ring-[#00D2FF]' : 'bg-white border-gray-300 focus:ring-2 focus:ring-indigo-500'
                    }`}
                    value={portfolioForm.githubUrl}
                    onChange={e => setPortfolioForm({...portfolioForm, githubUrl: e.target.value})}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingPortfolio}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-xs font-bold transition-all transform hover:-translate-y-0.5 disabled:opacity-50 ${
                    isDark ? 'bg-[#00D2FF] text-slate-950 hover:bg-[#33d4ff] shadow-cyan-500/20' : 'text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/20'
                  }`}
                >
                  <FiPlus /> {loadingPortfolio ? 'Adding...' : 'Add Project to Portfolio'}
                </button>
              </form>
            </div>

            {/* My Portfolio List */}
            <div className={`lg:col-span-2 rounded-3xl shadow-md border p-6 sm:p-8 space-y-6 ${
              isDark ? 'bg-[#131C2E] border-[#222F4A]' : 'bg-white border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiCode className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                My Project Portfolio & History
              </h2>

              <div className="space-y-4">
                {portfolios.map(item => (
                  <div key={item.id} className={`border rounded-2xl p-6 transition-all space-y-4 ${
                    isDark ? 'bg-[#1A263E] border-[#2B3C5F] hover:bg-[#1E2D4A]' : 'bg-gray-50/60 border-gray-100 hover:bg-white hover:shadow-md'
                  }`}>
                    <div className={`flex justify-between items-start border-b pb-3 ${isDark ? 'border-[#2B3C5F]' : 'border-gray-200/60'}`}>
                      <div>
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                        <span className={`text-xs block mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          Added on {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeletePortfolio(item.id)}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-950/30' : 'text-gray-300 hover:text-red-50 hover:bg-red-50'}`}
                        title="Delete project"
                      >
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>{item.description || 'No description provided.'}</p>

                    {item.techStack && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.techStack.split(',').map((tech, idx) => (
                          <span key={idx} className={`px-2.5 py-1 border rounded-lg text-xs font-bold shadow-xs ${
                            isDark ? 'bg-[#131C2E] text-[#00D2FF] border-[#2B3C5F]' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }`}>
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {(item.liveUrl || item.githubUrl) && (
                      <div className={`flex items-center gap-4 pt-3 border-t text-xs font-bold ${isDark ? 'border-[#2B3C5F]' : 'border-gray-100'}`}>
                        {item.liveUrl && (
                          <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 hover:underline ${isDark ? 'text-[#00D2FF]' : 'text-blue-600'}`}>
                            <FiExternalLink /> Live Demo
                          </a>
                        )}
                        {item.githubUrl && (
                          <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1 hover:underline ${isDark ? 'text-slate-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}>
                            <FiGithub /> GitHub Repo
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {portfolios.length === 0 && <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>No portfolio projects added yet.</p>}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Settings & Security */}
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

export default DeveloperDashboard;

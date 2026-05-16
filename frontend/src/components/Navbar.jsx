import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiShield, FiBriefcase, FiUser, FiLogOut, FiActivity, FiBell, FiCheck, FiInfo, FiClock, FiCheckCircle } from 'react-icons/fi';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentTheme(localStorage.getItem('app_theme') || 'light');
    };

    window.addEventListener('theme_changed', handleThemeChange);
    return () => {
      window.removeEventListener('theme_changed', handleThemeChange);
    };
  }, []);

  // Fetch and generate real-time notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotificationData = async () => {
      try {
        const notifs = [];
        const userId = user._id || user.id;

        // Fetch Tasks
        const taskRes = await axios.get('http://localhost:5000/api/tasks', { withCredentials: true }).catch(() => ({ data: [] }));
        const tasks = taskRes.data || [];

        // Fetch Projects
        const projRes = await axios.get('http://localhost:5000/api/projects', { withCredentials: true }).catch(() => ({ data: [] }));
        const projects = projRes.data || [];

        // Fetch Reports
        const repRes = await axios.get('http://localhost:5000/api/reports', { withCredentials: true }).catch(() => ({ data: [] }));
        const reports = repRes.data || [];

        if (user.role === 'Developer') {
          // Tasks assigned to developer
          const myTasks = tasks.filter(t => t.assignedToId === userId);
          myTasks.forEach(t => {
            notifs.push({
              id: `task_${t.id || t._id}`,
              title: `New Task Assigned`,
              message: `You have been assigned: "${t.title}" (${t.priority || 'Medium'} Priority)`,
              time: t.createdAt ? new Date(t.createdAt) : new Date(),
              type: 'task',
              read: false
            });
          });

          // Projects assigned to developer
          const myProjects = projects.filter(p => p.developerIds && p.developerIds.includes(userId));
          myProjects.forEach(p => {
            notifs.push({
              id: `proj_${p.id || p._id}`,
              title: `Project Assignment`,
              message: `You were added to project: "${p.title}"`,
              time: p.createdAt ? new Date(p.createdAt) : new Date(),
              type: 'project',
              read: false
            });
          });
        } else if (user.role === 'Manager') {
          // Reports submitted by team
          reports.forEach(r => {
            notifs.push({
              id: `rep_${r.id || r._id}`,
              title: `Daily Report Submitted`,
              message: `${r.developer?.name || 'A developer'} logged ${r.hoursLogged || 8} hours today.`,
              time: r.date ? new Date(r.date) : new Date(),
              type: 'report',
              read: false
            });
          });

          // Tasks updated by developers
          const myCreatedTasks = tasks.filter(t => t.createdById === userId && t.status !== 'Todo');
          myCreatedTasks.forEach(t => {
            notifs.push({
              id: `task_up_${t.id || t._id}`,
              title: `Task Status Updated`,
              message: `"${t.title}" was moved to ${t.status}`,
              time: t.updatedAt ? new Date(t.updatedAt) : new Date(),
              type: 'task_update',
              read: false
            });
          });

          // New Projects created by this manager
          const myProjects = projects.filter(p => p.managerId === userId);
          myProjects.forEach(p => {
            notifs.push({
              id: `proj_${p.id || p._id}`,
              title: `Project Active`,
              message: `Your project "${p.title}" is currently active.`,
              time: p.createdAt ? new Date(p.createdAt) : new Date(),
              type: 'project',
              read: false
            });
          });
        } else if (user.role === 'Admin') {
          // All new projects
          projects.forEach(p => {
            notifs.push({
              id: `proj_${p.id || p._id}`,
              title: `New Project Created`,
              message: `Project "${p.title}" was initialized by Manager.`,
              time: p.createdAt ? new Date(p.createdAt) : new Date(),
              type: 'project',
              read: false
            });
          });

          // All reports
          reports.slice(0, 10).forEach(r => {
            notifs.push({
              id: `rep_${r.id || r._id}`,
              title: `System Attendance Log`,
              message: `${r.developer?.name || 'Developer'} submitted daily report (${r.hoursLogged || 8} hrs).`,
              time: r.date ? new Date(r.date) : new Date(),
              type: 'report',
              read: false
            });
          });
        }

        // Sort by time descending
        notifs.sort((a, b) => b.time - a.time);

        // Check localStorage for dismissed/read notification IDs
        const readNotifs = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '[]');
        const updatedNotifs = notifs.map(n => ({
          ...n,
          read: readNotifs.includes(n.id)
        }));

        setNotifications(updatedNotifs);
        setUnreadCount(updatedNotifs.filter(n => !n.read).length);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotificationData();
    const interval = setInterval(fetchNotificationData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = () => {
    if (!user) return;
    const userId = user._id || user.id;
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(allIds));
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markAsRead = (id) => {
    if (!user) return;
    const userId = user._id || user.id;
    const readNotifs = JSON.parse(localStorage.getItem(`read_notifs_${userId}`) || '[]');
    if (!readNotifs.includes(id)) {
      const updated = [...readNotifs, id];
      localStorage.setItem(`read_notifs_${userId}`, JSON.stringify(updated));
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const isDark = currentTheme === 'abheepaydark';

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Admin': return <FiShield className={isDark ? "text-[#00D2FF] text-sm" : "text-purple-600 text-sm"} />;
      case 'Manager': return <FiBriefcase className={isDark ? "text-[#00D2FF] text-sm" : "text-blue-600 text-sm"} />;
      default: return <FiUser className={isDark ? "text-[#00D2FF] text-sm" : "text-indigo-600 text-sm"} />;
    }
  };

  const getRoleBadge = (role) => {
    if (isDark) {
      return 'bg-[#1E2D4A] text-[#00D2FF] border-[#2B3C5F]';
    }
    switch(role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-sm transition-all duration-300 ${
      isDark ? 'bg-[#0B132B]/80 border-[#222F4A]' : 'bg-white/80 border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md text-white font-bold text-xl ${
              isDark ? 'bg-[#1E2D4A] text-[#00D2FF] border border-[#2B3C5F]' : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/30'
            }`}>
              <FiActivity />
            </div>
            <Link to="/" className={`text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity ${
              isDark ? 'text-[#00D2FF]' : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent'
            }`}>
              DevTaskManager
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-full border transition-all relative flex items-center justify-center ${
                    isDark 
                      ? 'bg-[#131C2E] border-[#2B3C5F] text-[#00D2FF] hover:bg-[#1E2D4A]' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Notifications"
                >
                  <FiBell className="text-lg" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Popover */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl shadow-2xl border overflow-hidden transition-all z-50 ${
                    isDark ? 'bg-[#131C2E] border-[#2B3C5F]' : 'bg-white border-gray-100'
                  }`}>
                    <div className={`p-4 border-b flex justify-between items-center ${isDark ? 'border-[#2B3C5F] bg-[#1A263E]' : 'border-gray-100 bg-gray-50/80'}`}>
                      <div className="flex items-center gap-2">
                        <FiBell className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                        <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isDark ? 'bg-[#0B132B] text-[#00D2FF]' : 'bg-blue-100 text-blue-800'
                        }`}>{unreadCount} unread</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className={`text-xs font-bold hover:underline flex items-center gap-1 ${
                            isDark ? 'text-[#00D2FF]' : 'text-blue-600'
                          }`}
                        >
                          <FiCheck /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-[#2B3C5F]">
                      {notifications.length > 0 ? (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-4 transition-all cursor-pointer flex gap-3 items-start ${
                              !n.read 
                                ? (isDark ? 'bg-[#1E2D4A]/60 border-l-4 border-[#00D2FF]' : 'bg-blue-50/50 border-l-4 border-blue-500') 
                                : (isDark ? 'hover:bg-[#1A263E]' : 'hover:bg-gray-50')
                            }`}
                          >
                            <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                              n.type === 'task' ? (isDark ? 'bg-blue-950 text-[#00D2FF]' : 'bg-blue-100 text-blue-600') :
                              n.type === 'project' ? (isDark ? 'bg-purple-950 text-purple-400' : 'bg-purple-100 text-purple-600') :
                              n.type === 'report' ? (isDark ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-100 text-emerald-600') :
                              (isDark ? 'bg-amber-950 text-amber-400' : 'bg-amber-100 text-amber-600')
                            }`}>
                              {n.type === 'task' ? <FiCheckCircle className="text-sm" /> :
                               n.type === 'project' ? <FiBriefcase className="text-sm" /> :
                               n.type === 'report' ? <FiClock className="text-sm" /> : <FiInfo className="text-sm" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-2">
                                <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{n.title}</h4>
                                <span className={`text-[10px] font-medium flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                                  {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{n.message}</p>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#00D2FF] mt-1 flex-shrink-0 shadow-sm shadow-cyan-500/50"></span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={`p-8 text-center ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                          <FiBell className="mx-auto text-3xl mb-2 opacity-50" />
                          <p className="text-xs font-medium">No notifications right now.</p>
                        </div>
                      )}
                    </div>

                    <div className={`p-3 border-t text-center ${isDark ? 'border-[#2B3C5F] bg-[#1A263E]' : 'border-gray-100 bg-gray-50/80'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        Live Activity Feed
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className={`flex items-center space-x-3 px-4 py-1.5 rounded-full border shadow-inner transition-all ${
                isDark ? 'bg-[#131C2E] border-[#2B3C5F]' : 'bg-gray-50/80 border-gray-100'
              }`}>
                <img
                  className="h-8 w-8 rounded-full border border-white shadow-sm"
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                />
                <div className="flex flex-col text-left">
                  <span className={`text-sm font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>{user.name}</span>
                  <span className={`text-xs leading-tight ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{user.email}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${getRoleBadge(user.role)}`}>
                  {getRoleIcon(user.role)}
                  {user.role}
                </span>
              </div>

              <a
                href="http://localhost:5000/auth/logout"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-xs hover:shadow-sm ${
                  isDark 
                    ? 'text-red-400 bg-red-950/40 hover:bg-red-950/70 border border-red-900/50 hover:border-red-800' 
                    : 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200'
                }`}
              >
                <FiLogOut />
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

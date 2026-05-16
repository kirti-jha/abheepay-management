import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DeveloperDashboard from './DeveloperDashboard';
import ManagerDashboard from './ManagerDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', currentTheme);
    window.dispatchEvent(new Event('theme_changed'));
    if (currentTheme === 'abheepaydark') {
      document.body.className = 'bg-[#090D16] text-slate-100';
    } else {
      document.body.className = 'bg-gray-50 text-gray-900';
    }
  }, [currentTheme]);

  if (!user) return <div className="flex justify-center items-center h-screen font-bold text-gray-500">Loading Dashboard...</div>;

  return (
    <div className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
      currentTheme === 'abheepaydark' ? 'bg-[#090D16] text-slate-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-[90rem] mx-auto">
        {user.role === 'Admin' && <AdminDashboard currentTheme={currentTheme} onThemeChange={setCurrentTheme} />}
        {user.role === 'Manager' && <ManagerDashboard currentTheme={currentTheme} onThemeChange={setCurrentTheme} />}
        {user.role === 'Developer' && <DeveloperDashboard currentTheme={currentTheme} onThemeChange={setCurrentTheme} />}
      </div>
    </div>
  );
};

export default Dashboard;

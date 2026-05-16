import {
  FiX,
  FiUser,
  FiMail,
  FiShield,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiCode,
  FiExternalLink,
  FiGithub,
} from 'react-icons/fi';

const UserProfileModal = ({ user, reports = [], portfolios = [], projects = [], tasks = [], isDark, onClose, scopeLabel = 'Profile Overview' }) => {
  if (!user) return null;

  const userId = user.id || user._id;
  const userReports = reports.filter((rep) => rep.developerId === userId);
  const userPortfolios = portfolios.filter((item) => item.developerId === userId);
  const managedProjects = projects.filter((project) => project.managerId === userId);
  const memberProjects = projects.filter((project) => project.members?.some((member) => member.userId === userId));
  const assignedTasks = tasks.filter((task) => task.assignedToId === userId);
  const createdTasks = tasks.filter((task) => task.createdById === userId);
  const totalHours = userReports.reduce((sum, rep) => sum + (rep.hoursLogged || 0), 0);

  const statCards = [
    { label: 'Reports Submitted', value: userReports.length, icon: FiClock, color: isDark ? 'text-[#00D2FF]' : 'text-blue-600' },
    { label: 'Hours Logged', value: `${totalHours} hrs`, icon: FiCheckCircle, color: isDark ? 'text-emerald-400' : 'text-emerald-600' },
    { label: 'Portfolio Projects', value: userPortfolios.length, icon: FiCode, color: isDark ? 'text-fuchsia-300' : 'text-purple-600' },
    { label: user.role === 'Manager' ? 'Managed Projects' : 'Assigned Projects', value: user.role === 'Manager' ? managedProjects.length : memberProjects.length, icon: FiBriefcase, color: isDark ? 'text-amber-300' : 'text-amber-600' },
  ];

  const sectionCardClass = isDark
    ? 'bg-[#131C2E] border-[#222F4A]'
    : 'bg-white border-gray-100';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className={`max-w-6xl mx-auto rounded-[2rem] border shadow-2xl ${sectionCardClass}`}>
        <div className={`sticky top-0 z-10 rounded-t-[2rem] border-b px-6 py-5 sm:px-8 ${isDark ? 'bg-[#131C2E]/95 border-[#222F4A]' : 'bg-white/95 border-gray-100'} backdrop-blur`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <img
                className="h-16 w-16 rounded-full border-2 border-white shadow-lg"
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
              />
              <div className="min-w-0">
                <div className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{scopeLabel}</div>
                <h2 className={`text-2xl sm:text-3xl font-extrabold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border font-semibold ${isDark ? 'bg-[#0B101B] border-[#222F4A] text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                    <FiMail />
                    {user.email}
                  </span>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 border font-semibold ${isDark ? 'bg-[#0B101B] border-[#222F4A] text-[#00D2FF]' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                    <FiShield />
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-bold transition-colors ${isDark ? 'border-[#2B3C5F] bg-[#0B101B] text-white hover:bg-[#1A263E]' : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
            >
              <FiX />
              Close
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`rounded-2xl border p-5 ${sectionCardClass}`}>
                  <div className={`inline-flex rounded-2xl p-3 text-2xl ${isDark ? 'bg-[#0B101B]' : 'bg-gray-50'} ${card.color}`}>
                    <Icon />
                  </div>
                  <div className={`mt-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{card.label}</div>
                  <div className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.value}</div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className={`rounded-3xl border p-6 space-y-4 xl:col-span-1 ${sectionCardClass}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiUser className={isDark ? 'text-[#00D2FF]' : 'text-blue-600'} />
                Profile Snapshot
              </h3>
              <div className="space-y-3 text-sm">
                <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0B101B] border-[#222F4A] text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Role</div>
                  <div className="font-semibold">{user.role}</div>
                </div>
                <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0B101B] border-[#222F4A] text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Accessible Task View</div>
                  <div className="font-semibold">
                    {user.role === 'Manager'
                      ? `${createdTasks.length} created tasks visible`
                      : `${assignedTasks.length} assigned tasks visible`}
                  </div>
                </div>
                <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0B101B] border-[#222F4A] text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Projects In View</div>
                  <div className="font-semibold">
                    {user.role === 'Manager'
                      ? `${managedProjects.length} managed projects`
                      : `${memberProjects.length} assigned projects`}
                  </div>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl border p-6 space-y-4 xl:col-span-2 ${sectionCardClass}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiBriefcase className={isDark ? 'text-[#00D2FF]' : 'text-purple-600'} />
                Project Visibility
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user.role === 'Manager' ? managedProjects : memberProjects).length > 0 ? (
                  (user.role === 'Manager' ? managedProjects : memberProjects).map((project) => (
                    <div key={project.id} className={`rounded-2xl border p-4 space-y-2 ${isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-gray-50 border-gray-200'}`}>
                      <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</div>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{project.description || 'No description added yet.'}</p>
                    </div>
                  ))
                ) : (
                  <div className={`md:col-span-2 rounded-2xl border border-dashed p-8 text-sm ${isDark ? 'border-[#2B3C5F] text-slate-400 bg-[#0B101B]' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                    No visible projects for this user in the current dashboard scope.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className={`rounded-3xl border p-6 space-y-4 ${sectionCardClass}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiClock className={isDark ? 'text-[#00D2FF]' : 'text-indigo-600'} />
                Daily Reports
              </h3>
              {userReports.length > 0 ? (
                <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-1">
                  {userReports.map((rep) => (
                    <div key={rep.id} className={`rounded-2xl border p-4 space-y-3 ${isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {new Date(rep.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold border ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-[#00D2FF]' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                          {rep.hoursLogged} Hours Logged
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-bold">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 border ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-[#00D2FF]' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                          <FiClock />
                          In: {rep.inTime || '10:00 AM'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 border ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-[#00D2FF]' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                          <FiClock />
                          Out: {rep.outTime || '07:00 PM'}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 border ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                          <FiMapPin />
                          {rep.workLocation || 'Office'}
                        </span>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Tasks Completed</div>
                          <p className={`rounded-xl border p-3 leading-relaxed ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-slate-200' : 'bg-white border-gray-200 text-gray-700'}`}>{rep.tasksCompleted || 'None'}</p>
                        </div>
                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Tasks In Progress</div>
                          <p className={`rounded-xl border p-3 leading-relaxed ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-slate-200' : 'bg-white border-gray-200 text-gray-700'}`}>{rep.tasksInProgress || 'None'}</p>
                        </div>
                        {rep.hurdlesFaced && (
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider mb-1 text-red-500">Hurdles Faced</div>
                            <p className={`rounded-xl border p-3 leading-relaxed ${isDark ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-red-50 border-red-100 text-red-800'}`}>{rep.hurdlesFaced}</p>
                          </div>
                        )}
                        {rep.dependencies && (
                          <div>
                            <div className="text-xs font-bold uppercase tracking-wider mb-1 text-amber-500">Dependencies</div>
                            <p className={`rounded-xl border p-3 leading-relaxed ${isDark ? 'bg-amber-950/40 border-amber-900/50 text-amber-200' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>{rep.dependencies}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-2xl border border-dashed p-8 text-sm ${isDark ? 'border-[#2B3C5F] text-slate-400 bg-[#0B101B]' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                  No daily reports available for this user in the current view.
                </div>
              )}
            </div>

            <div className={`rounded-3xl border p-6 space-y-4 ${sectionCardClass}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FiCode className={isDark ? 'text-[#00D2FF]' : 'text-fuchsia-600'} />
                Portfolio and Tasks
              </h3>

              <div className="space-y-4">
                {userPortfolios.length > 0 ? (
                  userPortfolios.map((item) => (
                    <div key={item.id} className={`rounded-2xl border p-4 space-y-2 ${isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title}</h4>
                        <div className="flex items-center gap-3 text-xs font-bold">
                          {item.liveUrl && (
                            <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className={isDark ? 'text-[#00D2FF] hover:underline' : 'text-blue-600 hover:underline'}>
                              <span className="inline-flex items-center gap-1"><FiExternalLink /> Live</span>
                            </a>
                          )}
                          {item.githubUrl && (
                            <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className={isDark ? 'text-slate-300 hover:text-white hover:underline' : 'text-gray-700 hover:text-gray-900 hover:underline'}>
                              <span className="inline-flex items-center gap-1"><FiGithub /> Repo</span>
                            </a>
                          )}
                        </div>
                      </div>
                      {item.description && (
                        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{item.description}</p>
                      )}
                      {item.techStack && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.techStack.split(',').map((tech, index) => (
                            <span key={`${item.id}-${index}`} className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${isDark ? 'bg-[#131C2E] border-[#2B3C5F] text-[#00D2FF]' : 'bg-white border-gray-200 text-gray-700'}`}>
                              {tech.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className={`rounded-2xl border border-dashed p-6 text-sm ${isDark ? 'border-[#2B3C5F] text-slate-400 bg-[#0B101B]' : 'border-gray-300 text-gray-500 bg-gray-50'}`}>
                    No portfolio projects available for this user.
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Assigned Tasks In View</div>
                    <div className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{assignedTasks.length}</div>
                  </div>
                  <div className={`rounded-2xl border p-4 ${isDark ? 'bg-[#0B101B] border-[#222F4A]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Created Tasks In View</div>
                    <div className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{createdTasks.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;

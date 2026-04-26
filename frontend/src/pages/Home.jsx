import React, { useEffect, useState } from 'react';
import { verifyService, studentService } from '../services/api';
import { History, Activity, ShieldCheck, AlertTriangle, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Home = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, tampered: 0 });
  const [branchData, setBranchData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch logs (accessible to all authenticated users)
        const logsRes = await verifyService.getLogs();
        const logsData = logsRes.data;
        
        setLogs(logsData);

        // Basic Stats
        const valid = logsData.filter(l => l.status === 'VALID').length;
        const tampered = logsData.filter(l => l.status === 'TAMPERED').length;
        setStats({ total: logsData.length, valid, tampered });

        // Verification Trend (Last 7 Days)
        const trend = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          trend[dateStr] = 0;
        }

        logsData.forEach(l => {
          const lDate = l.verified_at.split('T')[0];
          if (trend.hasOwnProperty(lDate)) {
            trend[lDate]++;
          }
        });

        setTrendData(Object.keys(trend).map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          scans: trend[date]
        })));

      } catch (err) {
        console.error('Failed to fetch dashboard logs', err);
      }

      try {
        // Fetch students (admin only)
        const studentsRes = await studentService.list();
        const studentsData = studentsRes.data;
        
        // Branch Distribution (Pie Chart)
        const branches = {};
        studentsData.forEach(s => {
          branches[s.branch] = (branches[s.branch] || 0) + 1;
        });
        setBranchData(Object.keys(branches).map(name => ({ name, value: branches[name] })));
      } catch (err) {
        console.warn('Could not fetch students (User might not be an admin):', err.message);
        // Provide empty or dummy data so the pie chart doesn't break, or just leave branchData empty
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">System Intelligence</h1>
          <p className="mt-1 text-slate-400">Real-time cryptographic verification metrics.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Network Live</span>
        </div>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={Activity} label="Total Scans" value={stats.total} color="blue" />
        <StatCard icon={ShieldCheck} label="Verified Valid" value={stats.valid} color="green" />
        <StatCard icon={AlertTriangle} label="Compromised" value={stats.tampered} color="red" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3 text-blue-400">
              <TrendingUp className="h-6 w-6" />
              <h3 className="text-lg font-black uppercase tracking-widest">Verification Trend</h3>
            </div>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-tighter">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="scans" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3 text-emerald-400">
              <PieIcon className="h-6 w-6" />
              <h3 className="text-lg font-black uppercase tracking-widest">Branch Distribution</h3>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-black uppercase tracking-widest text-white">Live Activity Log</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Intel Summary</th>
                <th className="px-8 py-5">Cryptographic Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border transition-all ${
                      log.status === 'VALID' 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-300 text-sm max-w-md truncate font-medium group-hover:text-white transition-colors">{log.message}</td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-mono">
                    {new Date(log.verified_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-8 py-16 text-center text-slate-600 italic uppercase tracking-widest text-sm">NO CRYPTOGRAPHIC ACTIVITY DETECTED</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/5',
    green: 'border-green-500/30 text-green-400 bg-green-500/5',
    red: 'border-red-500/30 text-red-400 bg-red-500/5',
  };

  return (
    <div className={`p-8 rounded-3xl border shadow-xl flex flex-col justify-between h-48 transition-all hover:scale-[1.02] ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-8 w-8" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{label}</span>
      </div>
      <p className="text-5xl font-black tracking-tighter text-white">{value}</p>
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight,
  Settings,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Reuse the same Job interface
interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  salary: string;
  description: string[];
  requirements: string[];
  count: number;
}

export default function Admin() {
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'jobs'>('jobs');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem('tchat_admin_key') || '');

  // Fetch Jobs
  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey) {
      const key = prompt('請輸入管理者金鑰以儲存變更：');
      if (!key) return;
      setAdminKey(key);
      localStorage.setItem('tchat_admin_key', key);
    }

    setIsSaving(true);
    try {
      const isEdit = !!editingJob?.id;
      const url = isEdit ? `/api/admin/jobs/${editingJob.id}` : '/api/admin/jobs';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': adminKey || localStorage.getItem('tchat_admin_key') || ''
        },
        body: JSON.stringify(editingJob)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || '儲存失敗');
      }

      setIsModalOpen(false);
      setEditingJob(null);
      await fetchJobs();
    } catch (err: any) {
      alert(`錯誤: ${err.message}`);
      if (err.message.includes('Key')) {
        localStorage.removeItem('tchat_admin_key');
        setAdminKey('');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('確定要刪除此職缺嗎？此操作不可恢復。')) return;

    let currentKey = adminKey || localStorage.getItem('tchat_admin_key');
    if (!currentKey) {
      currentKey = prompt('請輸入管理者金鑰以執行刪除：');
      if (!currentKey) return;
      setAdminKey(currentKey);
      localStorage.setItem('tchat_admin_key', currentKey);
    }

    try {
      const res = await fetch(`/api/admin/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Key': currentKey
        }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || '刪除失敗');
      }

      await fetchJobs();
    } catch (err: any) {
      alert(`錯誤: ${err.message}`);
    }
  };

  const openEditModal = (job: Job | null = null) => {
    setEditingJob(job || {
      title: '',
      category: '',
      location: '台北市中山區中山北路二段113號',
      salary: '待遇面議',
      description: [''],
      requirements: [''],
      count: 1
    });
    setIsModalOpen(true);
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-gray-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col">
        <div className="p-8">
          <h1 className="text-xl font-bold tracking-widest text-amber-gold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-gold flex items-center justify-center">
              <span className="text-black text-xs font-black">Admin</span>
            </div>
            台泥招募中心
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="管理概覽" 
            active={activeMenu === 'dashboard'} 
            onClick={() => setActiveMenu('dashboard')}
          />
          <SidebarItem 
            icon={<Briefcase size={20} />} 
            label="職缺控管" 
            active={activeMenu === 'jobs'} 
            onClick={() => setActiveMenu('jobs')}
          />
          <div className="pt-8 pb-2 px-4 text-[10px] text-gray-500 uppercase tracking-widest font-bold">系統設定</div>
          <SidebarItem icon={<Settings size={20} />} label="網站設定" active={false} />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors text-sm w-full px-4 py-2">
            <LogOut size={18} />
            <span>登出系統</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 border-b border-white/5 bg-black/20 backdrop-blur-md px-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-white">
              {activeMenu === 'dashboard' ? '數據概覽' : '職缺列表控管'}
            </h2>
            <div className="h-4 w-px bg-white/10" />
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <CheckCircle2 size={12} className="text-green-500" />
              系統同步中
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="搜尋職缺..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-gold/50 transition-all w-64"
              />
            </div>
            <button 
              onClick={() => openEditModal()}
              className="bg-amber-gold hover:bg-amber-gold/90 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Plus size={18} />
              新增職缺
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <section className="flex-1 overflow-y-auto p-10 space-y-8">
          {activeMenu === 'dashboard' ? (
            <div className="grid grid-cols-4 gap-6">
              <StatCard label="目前線上職缺" value={jobs.length} delta="+2" />
              <StatCard label="儲備幹部計畫 (MA)" value={jobs.filter(j => j.category === 'MA').length} delta="Active" />
              <StatCard label="廠區需求總額" value={jobs.reduce((acc, curr) => acc + curr.count, 0)} delta="Updated" />
              <StatCard label="平均面試評分" value="4.8" delta="Top tier" />
            </div>
          ) : (
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.03] text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                    <th className="px-8 py-5">職缺名稱</th>
                    <th className="px-6 py-5">類別</th>
                    <th className="px-6 py-5">地點</th>
                    <th className="px-6 py-5">名額</th>
                    <th className="px-8 py-5 text-right">管理操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-amber-gold mb-4" size={32} />
                        <p className="text-gray-500 text-sm tracking-widest uppercase">載入數據中...</p>
                      </td>
                    </tr>
                  ) : filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-white group-hover:text-amber-gold transition-colors">{job.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{job.salary}</div>
                      </td>
                      <td className="px-6 py-6 text-sm">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider">
                          {job.category}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-400 font-light">{job.location.split('號')[0]}號</td>
                      <td className="px-6 py-6 text-sm text-amber-gold/80 font-mono font-bold">{job.count}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                          <button 
                            onClick={() => openEditModal(job)}
                            className="p-2 hover:bg-amber-gold/10 rounded-lg text-amber-gold transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <form onSubmit={handleSaveJob} className="p-10 space-y-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-amber-gold tracking-widest">
                    {editingJob?.id ? '編輯職缺' : '新增職缺'}
                  </h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="職缺名稱">
                    <input 
                      required
                      value={editingJob?.title}
                      onChange={e => setEditingJob(p => ({...p!, title: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-gold/50" 
                    />
                  </InputGroup>
                  <InputGroup label="職缺類別 (Category)">
                    <input 
                      required
                      value={editingJob?.category}
                      onChange={e => setEditingJob(p => ({...p!, category: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-gold/50" 
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <InputGroup label="工作地點">
                    <input 
                      value={editingJob?.location}
                      onChange={e => setEditingJob(p => ({...p!, location: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-gold/50" 
                    />
                  </InputGroup>
                  <InputGroup label="薪資待遇">
                    <input 
                      value={editingJob?.salary}
                      onChange={e => setEditingJob(p => ({...p!, salary: e.target.value}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-gold/50" 
                    />
                  </InputGroup>
                </div>

                <div className="flex items-end gap-6">
                  <InputGroup label="招募人數" className="flex-1">
                    <input 
                      type="number"
                      value={editingJob?.count}
                      onChange={e => setEditingJob(p => ({...p!, count: parseInt(e.target.value)}))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-gold/50" 
                    />
                  </InputGroup>
                  <div className="flex-1" />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-3 text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
                  >
                    取消
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="bg-amber-gold h-12 px-10 rounded-full text-black font-black uppercase tracking-[2px] shadow-xl active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : '確認儲存'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300",
        active ? "bg-amber-gold text-black shadow-[0_0_20px_rgba(255,184,0,0.3)] font-bold" : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
      )}
    >
      {icon}
      <span className="text-sm tracking-widest">{label}</span>
    </button>
  );
}

function StatCard({ label, value, delta }: { label: string, value: string | number, delta: string }) {
  return (
    <div className="p-8 bg-white/[0.02] border border-white/10 rounded-[32px] space-y-4 backdrop-blur-sm group hover:border-amber-gold/30 transition-all duration-500">
      <div className="flex justify-between items-start">
        <h4 className="text-[10px] uppercase tracking-[3px] font-bold text-gray-500">{label}</h4>
        <span className="text-[10px] font-mono text-amber-gold bg-amber-gold/10 px-2 py-0.5 rounded-full">{delta}</span>
      </div>
      <div className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">{value}</div>
    </div>
  );
}

function InputGroup({ label, children, className }: { label: string, children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 px-1">{label}</label>
      {children}
    </div>
  );
}

function X({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

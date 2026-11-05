import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Shield, 
  Clock, 
  Wrench, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  X, 
  Check,
  Phone,
  MessageCircle,
  Award,
  Activity,
  Sparkles,
  Briefcase
} from 'lucide-react';
import { Employee, UserSession } from '../types';

interface EmployeesProps {
  session?: UserSession;
  syncData?: (key: string, data: any) => Promise<void>;
}

interface TeamMember extends Employee {
  phone?: string;
  specialty?: string;
}

const DEFAULT_EMPLOYEES: TeamMember[] = [
  {
    id: 'emp-01',
    name: 'Rafael Kaen',
    role: 'Chefe de Oficina / Master Tech',
    shift: 'Diurno',
    services: 142,
    status: 'Ativo',
    phone: '(13) 99689-2958',
    specialty: 'Diagnóstico Eletrônico & Injeção Direta',
    createdAt: '2024-01-10T08:00:00.000Z'
  },
  {
    id: 'emp-02',
    name: 'Eduardo Maciel',
    role: 'Mecânico Sênior',
    shift: 'Diurno',
    services: 98,
    status: 'Ativo',
    phone: '(13) 99742-1180',
    specialty: 'Motores TSI/TFSI, Câmbio & Cabeçotes',
    createdAt: '2024-02-15T08:00:00.000Z'
  },
  {
    id: 'emp-03',
    name: 'Thiago Rover',
    role: 'Mecânico de Pista',
    shift: 'Diurno',
    services: 76,
    status: 'Ativo',
    phone: '(13) 99611-4455',
    specialty: 'Freios de Alta Performance & Suspensão 3D',
    createdAt: '2024-03-01T08:00:00.000Z'
  },
  {
    id: 'emp-04',
    name: 'Janete Silva',
    role: 'Recepção Técnica & Faturamento',
    shift: 'Diurno',
    services: 184,
    status: 'Ativo',
    phone: '(13) 99702-8822',
    specialty: 'Atendimento Consultivo & Emissão NF-e',
    createdAt: '2024-01-20T08:00:00.000Z'
  },
  {
    id: 'emp-05',
    name: 'Lucas Santos',
    role: 'Auxiliar Técnico & Preparador',
    shift: 'Diurno',
    services: 45,
    status: 'Ativo',
    phone: '(13) 99655-3210',
    specialty: 'Manutenção Rápida, Troca de Óleo & Pátio',
    createdAt: '2024-04-10T08:00:00.000Z'
  }
];

const Employees: React.FC<EmployeesProps> = ({ session, syncData }) => {
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: 'Mecânico de Pista',
    shift: 'Diurno',
    phone: '',
    specialty: ''
  });

  const loadData = () => {
    if (session) {
      const savedRaw = localStorage.getItem(`kaenpro_${session.username}_employees`);
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStaff(parsed);
            return;
          }
        } catch (e) {
          console.warn("Could not parse employees from storage, seeding defaults", e);
        }
      }
      // Populate defaults
      setStaff(DEFAULT_EMPLOYEES);
      localStorage.setItem(`kaenpro_${session.username}_employees`, JSON.stringify(DEFAULT_EMPLOYEES));
      localStorage.setItem(`kaenpro_rafael_employees`, JSON.stringify(DEFAULT_EMPLOYEES));
      if (syncData) {
        syncData('employees', DEFAULT_EMPLOYEES).catch(() => {});
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('kaen_storage_updated', loadData);
    return () => window.removeEventListener('kaen_storage_updated', loadData);
  }, [session]);

  const handleSave = async () => {
    if (!newEmployee.name.trim() || !session) return;

    const employee: TeamMember = {
      id: 'emp-' + Math.random().toString(36).substr(2, 8),
      name: newEmployee.name.trim(),
      role: newEmployee.role,
      shift: newEmployee.shift,
      phone: newEmployee.phone.trim() || '(13) 99000-0000',
      specialty: newEmployee.specialty.trim() || 'Serviços Gerais Automotivos',
      services: 0,
      status: 'Ativo',
      createdAt: new Date().toISOString()
    };

    const updatedStaff = [employee, ...staff];
    setStaff(updatedStaff);
    if (syncData) {
      await syncData('employees', updatedStaff);
    } else {
      localStorage.setItem(`kaenpro_${session.username}_employees`, JSON.stringify(updatedStaff));
    }
    setShowModal(false);
    setNewEmployee({ name: '', role: 'Mecânico de Pista', shift: 'Diurno', phone: '', specialty: '' });
  };

  const handleDelete = async (id: string) => {
    if (!session) return;
    if (confirm("Deseja remover este colaborador da equipe Kaen?")) {
      const updated = staff.filter(e => e.id !== id);
      setStaff(updated);
      if (syncData) {
        await syncData('employees', updated);
      } else {
        localStorage.setItem(`kaenpro_${session.username}_employees`, JSON.stringify(updated));
      }
    }
  };

  const filtered = staff.filter(e => {
    const matchesSearch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.specialty && e.specialty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = 
      roleFilter === 'ALL' ? true :
      roleFilter === 'MECANICO' ? (e.role.toLowerCase().includes('mecânico') || e.role.toLowerCase().includes('tech') || e.role.toLowerCase().includes('chefe')) :
      roleFilter === 'RECEPCAO' ? e.role.toLowerCase().includes('recepção') :
      true;

    return matchesSearch && matchesRole;
  });

  const totalServices = staff.reduce((acc, curr) => acc + (curr.services || 0), 0);
  const activeCount = staff.filter(s => s.status === 'Ativo').length;

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-28 px-2 sm:px-4 max-w-7xl mx-auto text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white italic uppercase tracking-tighter">
              Equipe <span className="text-[#FF2D55]">Kaen</span>
            </h1>
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {activeCount} Ativos
            </span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center gap-1.5 mt-1">
            <UserCheck size={11} className="text-[#FF2D55]" />
            Corpo técnico & recepção de alta performance em <span className="text-white">{session?.username || 'Kaen Pro'}</span>
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-[#FF2D55] text-white px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 hover:bg-[#D11D40] transition-all transform active:scale-95 shadow-xl shadow-red-900/25 italic"
        >
          <Plus size={18} />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* QUICK STATS CARDS FOR TEAM METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="glass-card p-4 rounded-2xl sm:rounded-3xl border border-white/5 bg-zinc-900/60">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Membros Totais</p>
          <p className="text-2xl sm:text-3xl font-black text-white italic">{staff.length}</p>
          <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1 block">Quadro Completo</span>
        </div>

        <div className="glass-card p-4 rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-zinc-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Técnicos Ativos</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 italic">
            {staff.filter(s => s.role.toLowerCase().includes('mecânico') || s.role.toLowerCase().includes('tech') || s.role.toLowerCase().includes('chefe') || s.role.toLowerCase().includes('auxiliar')).length}
          </p>
          <span className="text-[8px] text-emerald-500/80 font-bold uppercase mt-1 block">Operação de Pista</span>
        </div>

        <div className="glass-card p-4 rounded-2xl sm:rounded-3xl border border-blue-500/20 bg-blue-500/5">
          <p className="text-zinc-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Atendimento / Recepção</p>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 italic">
            {staff.filter(s => s.role.toLowerCase().includes('recepção') || s.role.toLowerCase().includes('gerente')).length}
          </p>
          <span className="text-[8px] text-blue-400/80 font-bold uppercase mt-1 block">Frente de Balcão</span>
        </div>

        <div className="glass-card p-4 rounded-2xl sm:rounded-3xl border border-[#FF2D55]/20 bg-[#FF2D55]/5">
          <p className="text-zinc-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Serviços Executados</p>
          <p className="text-2xl sm:text-3xl font-black text-[#FF2D55] italic">{totalServices}</p>
          <span className="text-[8px] text-[#FF2D55]/80 font-bold uppercase mt-1 block">Histórico de OSs</span>
        </div>
      </div>

      {/* SEARCH AND FILTER BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por colaborador, função ou especialidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none focus:border-[#FF2D55] transition-all placeholder-zinc-600 font-medium" 
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
          <button 
            onClick={() => setRoleFilter('ALL')}
            className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap ${roleFilter === 'ALL' ? 'bg-white text-black border-white shadow-md' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
          >
            Todos ({staff.length})
          </button>
          <button 
            onClick={() => setRoleFilter('MECANICO')}
            className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${roleFilter === 'MECANICO' ? 'bg-[#FF2D55] text-white border-[#FF2D55] font-black shadow-md' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
          >
            <Wrench size={12} />
            Mecânicos ({staff.filter(s => s.role.toLowerCase().includes('mecânico') || s.role.toLowerCase().includes('tech') || s.role.toLowerCase().includes('chefe')).length})
          </button>
          <button 
            onClick={() => setRoleFilter('RECEPCAO')}
            className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${roleFilter === 'RECEPCAO' ? 'bg-blue-500 text-white border-blue-500 font-black shadow-md' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
          >
            <User size={12} />
            Recepção ({staff.filter(s => s.role.toLowerCase().includes('recepção')).length})
          </button>
        </div>
      </div>

      {/* MOBILE TEAM CARDS VIEW (block on mobile screens, hidden on md+) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-white/5">
            <UserCheck size={36} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-black uppercase text-xs tracking-widest">Nenhum colaborador encontrado</p>
            <p className="text-zinc-600 text-[10px] mt-1">Ajuste o termo de pesquisa ou filtro.</p>
          </div>
        ) : (
          filtered.map(emp => {
            const initials = emp.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            const cleanPhone = (emp.phone || '').replace(/\D/g, '');

            return (
              <div 
                key={emp.id}
                className="glass-card p-4 rounded-3xl border border-white/5 bg-zinc-900/60 space-y-3.5"
              >
                {/* Header: Avatar, Name, Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FF2D55] text-white flex items-center justify-center text-sm font-black italic shadow-lg shadow-[#FF2D55]/20 shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase italic leading-tight">
                        {emp.name}
                      </h3>
                      <span className="text-[10px] font-bold text-[#FF2D55] uppercase block mt-0.5">
                        {emp.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {emp.status}
                  </div>
                </div>

                {/* Specialty and details */}
                {emp.specialty && (
                  <div className="bg-zinc-950/80 border border-zinc-800/80 p-2.5 rounded-xl text-left">
                    <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block">
                      Especialidade Principal:
                    </span>
                    <p className="text-xs text-zinc-300 font-medium italic mt-0.5">
                      {emp.specialty}
                    </p>
                  </div>
                )}

                {/* Metrics bar: Turno, Serviços, Início */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/5 text-[9px]">
                  <div>
                    <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[8px]">Turno</span>
                    <span className="text-white font-black uppercase flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-zinc-500" />
                      {emp.shift}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[8px]">OSs Feitas</span>
                    <span className="text-emerald-400 font-black italic text-xs mt-0.5 block">
                      {emp.services || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block font-bold uppercase tracking-wider text-[8px]">Desde</span>
                    <span className="text-zinc-300 font-bold mt-0.5 block">
                      {new Date(emp.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Action Bar for Mobile */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    {cleanPhone && (
                      <a 
                        href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá ${emp.name}, tudo bem? Mensagem da equipe Kaen.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-9 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all"
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </a>
                    )}
                    {emp.phone && (
                      <a 
                        href={`tel:${cleanPhone}`}
                        className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center active:scale-95 transition-all"
                        title="Ligar"
                      >
                        <Phone size={13} />
                      </a>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center active:scale-95 transition-all hover:bg-red-500 hover:text-white"
                    title="Remover Colaborador"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (hidden on mobile, block on md+) */}
      <div className="hidden md:block bg-zinc-900/90 border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-950 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-zinc-800">
                <th className="px-8 py-5">Colaborador</th>
                <th className="px-6 py-5">Função & Especialidade</th>
                <th className="px-6 py-5">Turno</th>
                <th className="px-6 py-5 text-center">OSs Executadas</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Contato</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filtered.map((e) => {
                const cleanPhone = (e.phone || '').replace(/\D/g, '');
                return (
                  <tr key={e.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-400 border border-zinc-800 group-hover:border-[#FF2D55]/50 transition-all font-black text-xs italic">
                          {e.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{e.name}</p>
                          <span className="text-[9px] text-zinc-500 font-mono">Desde {new Date(e.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-black text-[#FF2D55] uppercase tracking-wide">
                          {e.role}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium italic">
                          {e.specialty || 'Serviços Gerais'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Clock size={13} className="text-zinc-600" />
                        <span className="text-[10px] font-black uppercase">{e.shift}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-base font-black text-emerald-400 italic">
                        {e.services || 0}
                      </span>
                      <span className="text-[8px] block text-zinc-500 uppercase font-bold">concluídas</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{e.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {cleanPhone && (
                          <a 
                            href={`https://wa.me/55${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>
                        )}
                        <span className="text-xs font-mono text-zinc-400">{e.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(e.id)}
                        className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Remover Colaborador"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-zinc-600">
                      <UserCheck size={40} className="opacity-20" />
                      <p className="font-bold uppercase text-xs tracking-widest italic">Nenhum funcionário encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NEW EMPLOYEE (MOBILE FIT WITH SAFE SCROLL) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar text-left">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 bg-[#FF2D55] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-900/30">
                <UserCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter">Novo Integrante</h2>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Equipe Kaen Pro</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="EX: MATEUS RODRIGUES"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF2D55] outline-none font-bold uppercase placeholder-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Função / Cargo</label>
                  <select 
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-bold"
                  >
                    <option value="Mecânico de Pista">Mecânico de Pista</option>
                    <option value="Mecânico Sênior">Mecânico Sênior</option>
                    <option value="Chefe de Oficina / Master Tech">Chefe de Oficina</option>
                    <option value="Recepção Técnica & Faturamento">Recepção Técnica</option>
                    <option value="Auxiliar Técnico & Preparador">Auxiliar Técnico</option>
                    <option value="Gerente Operacional">Gerente Operacional</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Turno</label>
                  <select 
                    value={newEmployee.shift}
                    onChange={(e) => setNewEmployee({...newEmployee, shift: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-bold"
                  >
                    <option value="Diurno">Diurno (08h às 18h)</option>
                    <option value="Noturno">Noturno</option>
                    <option value="Flexível">Flexível</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">WhatsApp / Telefone</label>
                <input 
                  type="text" 
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  placeholder="(13) 99999-9999"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Especialidade / Foco Técnico</label>
                <input 
                  type="text" 
                  value={newEmployee.specialty}
                  onChange={(e) => setNewEmployee({...newEmployee, specialty: e.target.value})}
                  placeholder="Ex: Alinhamento 3D, Câmbio Automático, Diagnóstico..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-medium"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={!newEmployee.name.trim()}
                className="w-full bg-[#FF2D55] hover:bg-[#D11D40] py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all transform active:scale-95 shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 mt-4 italic disabled:opacity-40"
              >
                <Check size={18} />
                <span>Efetivar Contratação</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

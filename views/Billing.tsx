import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Search,
  Users,
  Calendar,
  X,
  History,
  AlertTriangle
} from 'lucide-react';
import { ServiceOrder, PaymentStatus, Client, UserSession, OSStatus, PaymentMethod } from '../types';

const DEFAULT_SEED_ORDERS: ServiceOrder[] = [
  {
    id: "os-1047",
    osNumber: "1047",
    clientId: "cli-06",
    clientName: "Agropecuária Vale do Ribeira",
    clientPhone: "(13) 99633-9900",
    vehicleId: "veh-06",
    vehiclePlate: "HIL5X99",
    vehicleModel: "Toyota Hilux SRX 2.8 4x4 2023",
    vehicleKm: "85000",
    problem: "Revisão geral de suspensão reforçada, 4 amortecedores",
    items: [
      { id: "it-18", description: "Amortecedores Dianteiros Turbogás Cofap", quantity: 1, unitPrice: 920.00, type: "PART" },
      { id: "it-19", description: "Amortecedores Traseiros Reforçados Cofap", quantity: 1, unitPrice: 860.00, type: "PART" },
      { id: "it-20", description: "Pastilhas Dianteiras e Lonas Traseiras", quantity: 1, unitPrice: 680.00, type: "PART" },
      { id: "it-21", description: "Mão de Obra Suspensão Completa e Geometria 3D", quantity: 1, unitPrice: 1480.00, type: "SERVICE" }
    ],
    laborValue: 1480.00,
    discount: 0,
    totalValue: 3940.00,
    status: OSStatus.ENTREGUE,
    paymentStatus: PaymentStatus.ATRASADO,
    mechanicResponsible: "Thiago Rover",
    budgetApproved: true,
    createdAt: "2026-10-24T10:00:00.000Z",
    updatedAt: "2026-10-25T16:00:00.000Z"
  },
  {
    id: "os-1045",
    osNumber: "1045",
    clientId: "cli-04",
    clientName: "Fernando Alencar",
    clientPhone: "(13) 99805-6677",
    vehicleId: "veh-04",
    vehiclePlate: "JEP9H41",
    vehicleModel: "Jeep Compass Longitude Diesel 2022",
    vehicleKm: "68000",
    problem: "Troca preventiva da correia dentada e bomba d'água",
    items: [
      { id: "it-13", description: "Kit Correia Dentada + Tensor Gates", quantity: 1, unitPrice: 510.00, type: "PART" },
      { id: "it-14", description: "Bomba d'Água Indisa Metal", quantity: 1, unitPrice: 275.00, type: "PART" },
      { id: "it-15", description: "Aditivo Radiador Tirreno Orgânico (3L)", quantity: 3, unitPrice: 52.00, type: "PART" }
    ],
    laborValue: 1539.00,
    discount: 0,
    totalValue: 2480.00,
    status: OSStatus.EM_SERVICO,
    paymentStatus: PaymentStatus.PENDENTE,
    mechanicResponsible: "Eduardo Maciel",
    budgetApproved: true,
    createdAt: "2026-10-26T13:00:00.000Z",
    updatedAt: "2026-10-26T14:30:00.000Z"
  }
];

const DEFAULT_SEED_CLIENTS: Client[] = [
  {
    id: "cli-06",
    name: "Agropecuária Vale do Ribeira",
    phone: "(13) 99633-9900",
    document: "12.839.401/0001-92",
    address: "Estrada Rural Rio Bonito, S/N - Registro/SP",
    observations: "Frota de caminhonetes de campo, pagamento quinzenal",
    createdAt: "2024-01-15T08:00:00.000Z"
  },
  {
    id: "cli-04",
    name: "Fernando Alencar",
    phone: "(13) 99805-6677",
    document: "172.849.208-61",
    address: "Rodovia BR-116 Km 442 - Registro/SP",
    observations: "Uso rodoviário frequente",
    createdAt: "2024-05-18T16:20:00.000Z"
  }
];

const Billing: React.FC<{ session?: UserSession; syncData?: (key: string, data: any) => Promise<void> }> = ({ session, syncData }) => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [billingLevel, setBillingLevel] = useState<'mild' | 'formal' | 'final'>('mild');

  const loadData = () => {
    if (session) {
      let savedOrders = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_orders`) || '[]');
      let savedClients = JSON.parse(localStorage.getItem(`kaenpro_${session.username}_clients`) || '[]');
      
      if (!Array.isArray(savedOrders) || savedOrders.length === 0) {
        savedOrders = DEFAULT_SEED_ORDERS;
        localStorage.setItem(`kaenpro_${session.username}_orders`, JSON.stringify(DEFAULT_SEED_ORDERS));
      }
      if (!Array.isArray(savedClients) || savedClients.length === 0) {
        savedClients = DEFAULT_SEED_CLIENTS;
        localStorage.setItem(`kaenpro_${session.username}_clients`, JSON.stringify(DEFAULT_SEED_CLIENTS));
      }

      // Check for late payments automatically on load
      const today = new Date();
      const checkedOrders = savedOrders.map((os: ServiceOrder) => {
        if (os.paymentStatus !== PaymentStatus.PAGO) {
          const osDate = new Date(os.createdAt);
          const diffTime = Math.abs(today.getTime() - osDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays > 7 && os.paymentStatus === PaymentStatus.PENDENTE) {
            return { ...os, paymentStatus: PaymentStatus.ATRASADO };
          }
        }
        return os;
      });

      setOrders(checkedOrders);
      setClients(savedClients);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('kaen_storage_updated', loadData);
    return () => window.removeEventListener('kaen_storage_updated', loadData);
  }, [session]);

  const handleMarkAsPaid = async (id: string) => {
    if (!session) return;
    if (confirm("Confirmar recebimento deste pagamento?")) {
      const updated = orders.map(o => o.id === id ? { ...o, paymentStatus: PaymentStatus.PAGO, updatedAt: new Date().toISOString() } : o);
      setOrders(updated);
      if (syncData) {
        await syncData('orders', updated);
      } else {
        localStorage.setItem(`kaenpro_${session.username}_orders`, JSON.stringify(updated));
      }
      setSelectedOrder(null);
    }
  };

  const getDaysInArrears = (createdAt: string) => {
    const today = new Date();
    const osDate = new Date(createdAt);
    const diffTime = Math.abs(today.getTime() - osDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdueOrders = orders.filter(o => o.paymentStatus !== PaymentStatus.PAGO);
  
  const filtered = overdueOrders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.osNumber.includes(searchTerm) ||
    o.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInArrears = overdueOrders.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
  const debtorCount = new Set(overdueOrders.map(o => o.clientId)).size;

  const getBillingMessage = (os: ServiceOrder) => {
    const baseMessages = {
      mild: `Olá, ${os.clientName}! Passando da Auto Mecânica Kaen para lembrar da nota/OS #${os.osNumber} (R$ ${os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Precisando do link PIX ou código de barras? Estamos à disposição!`,
      formal: `AVISO FINANCEIRO KAEN: Prezado(a) ${os.clientName}, consta em aberto o serviço da OS #${os.osNumber} no valor de R$ ${os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Solicitamos a regularização ou envio do comprovante.`,
      final: `URGENTE: Notificação final de pendência financeira - OS #${os.osNumber}. Prezado(a) ${os.clientName}, pedimos contato urgente para regularização de pendência.`
    };

    return baseMessages[billingLevel];
  };

  const sendWhatsApp = async (os: ServiceOrder) => {
    const client = clients.find(c => c.id === os.clientId);
    const rawPhone = client?.phone || os.clientPhone || '13996892958';
    const phone = rawPhone.replace(/\D/g, '');
    const message = getBillingMessage(os);
    
    const historyEntry = {
      date: new Date().toISOString(),
      user: session?.realUsername || 'Financeiro Kaen',
      level: billingLevel
    };
    
    const updatedOrders = orders.map(o => o.id === os.id ? { 
      ...o, 
      billingHistory: [...(o.billingHistory || []), historyEntry] 
    } : o);
    
    setOrders(updatedOrders);
    if (session && syncData) {
      await syncData('orders', updatedOrders);
    } else {
      localStorage.setItem(`kaenpro_${session?.username || 'rafael'}_orders`, JSON.stringify(updatedOrders));
    }
    
    window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-28 px-2 sm:px-4 max-w-7xl mx-auto text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white italic uppercase tracking-tighter">
              Área de <span className="text-[#FF2D55]">Cobrança</span>
            </h1>
            <span className="bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {overdueOrders.length} Pendentes
            </span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center gap-1.5 mt-1">
            <AlertTriangle size={11} className="text-[#FF2D55]" />
            Gestão de pendências, prazos & notificações inteligentes via WhatsApp
          </p>
        </div>

        <div className="bg-[#FF2D55]/10 px-4 py-2 rounded-xl text-xs font-black text-[#FF2D55] border border-[#FF2D55]/20 self-start sm:self-auto uppercase tracking-wider">
          Relatório de Débitos
        </div>
      </div>

      {/* METRIC CARDS RESPONSIVE FOR MOBILE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/5 bg-zinc-900/60 relative overflow-hidden">
          <div className="absolute top-2 right-2 p-4 opacity-5 pointer-events-none">
            <DollarSign size={70} />
          </div>
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Total a Receber</p>
          <p className="text-2xl sm:text-3xl font-black text-white italic">
            R$ {totalInArrears.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1 block">Faturas em Aberto</span>
        </div>

        <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/5 bg-zinc-900/60">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Clientes Devedores</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 italic">{debtorCount}</p>
          <span className="text-[8px] text-amber-500/80 font-bold uppercase mt-1 block">Contatos Pendentes</span>
        </div>

        <div className="glass-card p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/5 bg-zinc-900/60">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-1">Ticket Médio Débito</p>
          <p className="text-2xl sm:text-3xl font-black text-white italic">
            R$ {overdueOrders.length > 0 ? (totalInArrears / overdueOrders.length).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : '0'}
          </p>
          <span className="text-[8px] text-zinc-500 font-bold uppercase mt-1 block">Média por Cobrança</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por cliente, OS ou placa..." 
          className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none focus:border-[#FF2D55] transition-all placeholder-zinc-600 font-medium" 
        />
      </div>

      {/* DEBTORS LIST (MOBILE TOUCH CARDS) */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 sm:p-16 text-center rounded-3xl border border-white/5">
          <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-zinc-200 font-black uppercase text-sm tracking-widest">Caixa em Dia!</p>
          <p className="text-zinc-500 text-xs mt-1">Nenhuma fatura com atraso pendente no momento.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(os => {
            const daysInArrears = getDaysInArrears(os.createdAt);
            return (
              <div 
                key={os.id} 
                className="glass-card p-4 sm:p-5 rounded-3xl border border-white/5 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col items-center justify-center text-red-400 shrink-0 font-black">
                    <span className="text-base leading-none italic">{daysInArrears}d</span>
                    <span className="text-[7.5px] uppercase tracking-wider text-red-500/80">atraso</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{os.clientName}</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5">
                      OS #{os.osNumber} • {os.vehicleModel} ({os.vehiclePlate})
                    </p>
                    <span className="text-[8.5px] font-mono text-zinc-500 block mt-0.5">
                      Desde {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-left sm:text-right">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider">Valor em Aberto</span>
                    <p className="text-base sm:text-lg font-black text-red-400 italic">
                      R$ {os.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[8.5px] font-black uppercase text-amber-500/90 tracking-wider">
                      {os.paymentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedOrder(os)}
                      className="px-3 py-2.5 bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-xl transition-all border border-[#25D366]/30 flex items-center gap-1.5 text-xs font-black uppercase italic"
                      title="Cobrança no WhatsApp"
                    >
                      <MessageCircle size={16} />
                      <span className="hidden sm:inline">Notificar</span>
                    </button>
                    
                    <button 
                      onClick={() => handleMarkAsPaid(os.id)}
                      className="px-3 py-2.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-500/30 flex items-center gap-1.5 text-xs font-black uppercase italic"
                      title="Dar baixa como Pago"
                    >
                      <CheckCircle2 size={16} />
                      <span className="hidden sm:inline">Baixa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BILLING MODAL (MOBILE FIT) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-3 sm:p-4 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-lg p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar text-left">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-5 right-5 text-zinc-500 hover:text-white p-2"
            >
              <X size={24}/>
            </button>
            
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tighter mb-1">
              Cobrança {selectedOrder.clientName}
            </h3>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-6">
              OS #{selectedOrder.osNumber} • R$ {selectedOrder.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-6">
              {(['mild', 'formal', 'final'] as const).map((lvl) => (
                <button 
                  key={lvl}
                  onClick={() => setBillingLevel(lvl)}
                  className={`py-3 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider border transition-all ${billingLevel === lvl ? 'bg-[#FF2D55] text-white border-[#FF2D55] shadow-lg' : 'bg-zinc-900 text-zinc-400 border-zinc-800'}`}
                >
                  {lvl === 'mild' ? 'Lembrete' : lvl === 'formal' ? 'Formal' : 'Urgente'}
                </button>
              ))}
            </div>

            <div className="bg-black border border-zinc-800 p-4 rounded-2xl mb-6 text-xs italic text-zinc-300 leading-relaxed font-sans">
              "{getBillingMessage(selectedOrder)}"
            </div>

            <button 
              onClick={() => sendWhatsApp(selectedOrder)}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-xl shadow-green-900/30 italic"
            >
              <MessageCircle size={18} />
              <span>Enviar via WhatsApp</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

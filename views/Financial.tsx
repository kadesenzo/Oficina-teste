import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  DollarSign, ArrowUpCircle, ArrowDownCircle, PieChart as PieChartIcon, 
  Plus, Search, X, Trash2, Edit3, Loader2, Save, TrendingUp, Filter,
  Car, Wrench, Package, Award, FileSpreadsheet, FileText, CheckCircle2,
  Clock, ShieldCheck, Printer, Download, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { FinancialTransaction, TransactionType, PaymentMethod, UserSession, ServiceOrder, OSStatus, PaymentStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Invoice from '../components/Invoice';
import html2canvas from 'html2canvas';

export interface FictitiousInvoice {
  id: string;
  nfeNumber: string;
  osNumber: string;
  clientName: string;
  clientDoc: string;
  vehicleModel: string;
  vehiclePlate: string;
  totalValue: number;
  partsValue: number;
  laborValue: number;
  taxAmount: number;
  issueDate: string;
  status: 'AUTORIZADA' | 'PROCESSANDO' | 'FATURADA';
  sefazKey: string;
  paymentMethod: string;
  osData: ServiceOrder;
}

const DEFAULT_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: "tr-01",
    type: TransactionType.INCOME,
    category: "Serviços (Mão de Obra)",
    amount: 3200.00,
    method: PaymentMethod.PIX,
    description: "OS #1042 - Freios Brembo + Discos Fremax - Audi A4",
    date: "2026-11-04T14:30:00.000Z"
  },
  {
    id: "tr-02",
    type: TransactionType.INCOME,
    category: "Serviços (Mão de Obra)",
    amount: 4720.00,
    method: PaymentMethod.CARTAO_CREDITO,
    description: "OS #1043 - Revisão Motor GTI + Velas Iridium - VW Golf",
    date: "2026-11-04T16:45:00.000Z"
  },
  {
    id: "tr-03",
    type: TransactionType.INCOME,
    category: "Peças (Venda)",
    amount: 1850.00,
    method: PaymentMethod.PIX,
    description: "OS #1044 - Troca Óleo Motul + Filtros + Oxi - Civic G10",
    date: "2026-11-03T11:20:00.000Z"
  },
  {
    id: "tr-04",
    type: TransactionType.INCOME,
    category: "Serviços (Mão de Obra)",
    amount: 2480.00,
    method: PaymentMethod.PIX,
    description: "OS #1040 - Kit Correia Dentada + Bomba d'Água - Renegade",
    date: "2026-11-02T15:10:00.000Z"
  },
  {
    id: "tr-05",
    type: TransactionType.INCOME,
    category: "Serviços (Mão de Obra)",
    amount: 3890.00,
    method: PaymentMethod.CARTAO_CREDITO,
    description: "OS #1039 - Amortecedores Turbogás + Alinhamento 3D - Toro",
    date: "2026-11-01T17:00:00.000Z"
  },
  {
    id: "tr-06",
    type: TransactionType.INCOME,
    category: "Diagnóstico Scanner",
    amount: 1650.00,
    method: PaymentMethod.CARTAO_CREDITO,
    description: "OS #1038 - Scanner Diagnóstico + Sonda Lambda - BMW 320i",
    date: "2026-10-31T10:15:00.000Z"
  },
  {
    id: "tr-07",
    type: TransactionType.INCOME,
    category: "Revisão Preventiva",
    amount: 1950.00,
    method: PaymentMethod.CARTAO_DEBITO,
    description: "OS #1036 - Diálise Câmbio Automático 8L ATF - Creta",
    date: "2026-10-30T14:00:00.000Z"
  },
  {
    id: "tr-08",
    type: TransactionType.INCOME,
    category: "Serviços (Mão de Obra)",
    amount: 4200.00,
    method: PaymentMethod.CARTAO_CREDITO,
    description: "OS #1035 - Retífica de Cabeçote + Junta Aço - Hilux SRX",
    date: "2026-10-29T18:30:00.000Z"
  },
  {
    id: "tr-09",
    type: TransactionType.EXPENSE,
    category: "Aluguel",
    amount: 6500.00,
    method: PaymentMethod.OUTRO,
    description: "Aluguel Galpão Matriz Oficina Kaen - Mês Atual",
    date: "2026-11-01T09:00:00.000Z"
  },
  {
    id: "tr-10",
    type: TransactionType.EXPENSE,
    category: "Compra de Peças",
    amount: 4820.00,
    method: PaymentMethod.OUTRO,
    description: "Distribuidora Pellegrino Auto Peças - Reposição Peças",
    date: "2026-11-02T10:30:00.000Z"
  },
  {
    id: "tr-11",
    type: TransactionType.EXPENSE,
    category: "Compra de Peças",
    amount: 2850.00,
    method: PaymentMethod.PIX,
    description: "Motul do Brasil - Lote Lubrificantes Sintéticos 5W30/5W40",
    date: "2026-11-03T14:15:00.000Z"
  },
  {
    id: "tr-12",
    type: TransactionType.EXPENSE,
    category: "Energia & Água",
    amount: 1480.00,
    method: PaymentMethod.OUTRO,
    description: "Energia Elétrica Trifásica Elektro (Compressores e Elevadores)",
    date: "2026-11-03T16:00:00.000Z"
  },
  {
    id: "tr-13",
    type: TransactionType.EXPENSE,
    category: "Salários & Comissões",
    amount: 5400.00,
    method: PaymentMethod.PIX,
    description: "Adiantamento Salarial e Comissões Técnicos Oficina",
    date: "2026-10-30T17:30:00.000Z"
  },
  {
    id: "tr-14",
    type: TransactionType.EXPENSE,
    category: "Ferramentas & Equipamentos",
    amount: 650.00,
    method: PaymentMethod.CARTAO_CREDITO,
    description: "Licença Mensal Scanner Diagnóstico Autel MaxiSys Ultra",
    date: "2026-10-28T11:00:00.000Z"
  },
  {
    id: "tr-15",
    type: TransactionType.EXPENSE,
    category: "Diversos",
    amount: 420.00,
    method: PaymentMethod.PIX,
    description: "Insumos de Limpeza, Desengraxante Industrial e EPIs",
    date: "2026-10-29T15:20:00.000Z"
  },
  {
    id: "tr-16",
    type: TransactionType.EXPENSE,
    category: "Internet & Telefonia",
    amount: 290.00,
    method: PaymentMethod.CARTAO_CREDITO,
    description: "Internet Fibra Óptica Dedicada 1Gbps + Telefonia Kaen",
    date: "2026-10-27T08:45:00.000Z"
  }
];

const DEFAULT_ORDERS: ServiceOrder[] = [
  {
    id: "os-1042",
    osNumber: "1042",
    clientId: "cli-01",
    clientName: "Dr. Roberto Guimarães",
    clientPhone: "(13) 99781-4422",
    vehicleId: "veh-01",
    vehiclePlate: "BRA2E19",
    vehicleModel: "Audi A4 2.0 TFSI 2021",
    vehicleKm: "48200",
    problem: "Trepidar ao frear em alta velocidade e chiado metálico dianteiro",
    items: [
      { id: "it-1", description: "Jogo Pastilhas Brembo Cerâmica Diant.", quantity: 1, unitPrice: 420.00, type: "PART" },
      { id: "it-2", description: "Par Discos Ventilados Fremax Diant.", quantity: 1, unitPrice: 650.00, type: "PART" },
      { id: "it-3", description: "Fluido de Freio Motul DOT 5.1 Sintético", quantity: 2, unitPrice: 85.00, type: "PART" },
      { id: "it-4", description: "Sangria Eletrônica ABS + Teste de Frenagem", quantity: 1, unitPrice: 380.00, type: "SERVICE" }
    ],
    laborValue: 1580.00,
    discount: 0,
    totalValue: 3200.00,
    status: OSStatus.ENTREGUE,
    paymentStatus: PaymentStatus.PAGO,
    paymentMethod: PaymentMethod.PIX,
    mechanicResponsible: "Eduardo Maciel",
    budgetApproved: true,
    createdAt: "2026-11-04T09:30:00.000Z",
    updatedAt: "2026-11-04T17:30:00.000Z"
  },
  {
    id: "os-1043",
    osNumber: "1043",
    clientId: "cli-02",
    clientName: "Marcelo Vasconcelos",
    clientPhone: "(13) 99654-8833",
    vehicleId: "veh-02",
    vehiclePlate: "KAE4G88",
    vehicleModel: "VW Golf GTI 2.0 TSI 2020",
    vehicleKm: "62000",
    problem: "Falha de ignição em aceleração plena, luz de injeção piscando",
    items: [
      { id: "it-5", description: "Jogo Velas NGK Laser Iridium", quantity: 1, unitPrice: 360.00, type: "PART" },
      { id: "it-6", description: "Óleo Motul 8100 5W40 Sintético (6L)", quantity: 6, unitPrice: 98.00, type: "PART" },
      { id: "it-7", description: "Filtro de Óleo Mann W712", quantity: 1, unitPrice: 55.00, type: "PART" },
      { id: "it-8", description: "Descarbonização Admissão Walnut Blasting", quantity: 1, unitPrice: 1850.00, type: "SERVICE" }
    ],
    laborValue: 1867.00,
    discount: 0,
    totalValue: 4720.00,
    status: OSStatus.ENTREGUE,
    paymentStatus: PaymentStatus.PAGO,
    paymentMethod: PaymentMethod.CARTAO_CREDITO,
    mechanicResponsible: "Rafael Kaen",
    budgetApproved: true,
    createdAt: "2026-11-03T10:00:00.000Z",
    updatedAt: "2026-11-04T16:00:00.000Z"
  },
  {
    id: "os-1044",
    osNumber: "1044",
    clientId: "cli-03",
    clientName: "Camila Siqueira",
    clientPhone: "(13) 99712-3344",
    vehicleId: "veh-03",
    vehiclePlate: "REX7F32",
    vehicleModel: "Honda Civic Touring 1.5 Turbo 2022",
    vehicleKm: "39500",
    problem: "Revisão periódica programada e higienização",
    items: [
      { id: "it-9", description: "Óleo Mobil Super 5W30 (4L)", quantity: 4, unitPrice: 74.00, type: "PART" },
      { id: "it-10", description: "Filtro de Óleo Mann", quantity: 1, unitPrice: 55.00, type: "PART" },
      { id: "it-11", description: "Filtro de Ar Motor Tecfil", quantity: 1, unitPrice: 68.00, type: "PART" },
      { id: "it-12", description: "Higienização Oxi-sanitária + Filtro Cabine", quantity: 1, unitPrice: 220.00, type: "SERVICE" }
    ],
    laborValue: 1211.00,
    discount: 0,
    totalValue: 1850.00,
    status: OSStatus.PRONTO,
    paymentStatus: PaymentStatus.PAGO,
    paymentMethod: PaymentMethod.PIX,
    mechanicResponsible: "Thiago Rover",
    budgetApproved: true,
    createdAt: "2026-11-03T08:30:00.000Z",
    updatedAt: "2026-11-03T18:00:00.000Z"
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
    createdAt: "2026-11-04T13:00:00.000Z",
    updatedAt: "2026-11-04T14:30:00.000Z"
  },
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
  }
];

const Financial: React.FC<{ session?: UserSession; syncData?: (key: string, data: any) => Promise<void> }> = ({ session, syncData }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRANSACTIONS' | 'INVOICES'>('OVERVIEW');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  // Invoice viewing modal state
  const [selectedInvoice, setSelectedInvoice] = useState<ServiceOrder | null>(null);
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    description: '',
    category: 'Serviços (Mão de Obra)',
    amount: '',
    method: PaymentMethod.PIX,
    type: TransactionType.INCOME,
    date: new Date().toISOString().split('T')[0]
  });

  const categories = [
    'Serviços (Mão de Obra)', 'Peças (Venda)', 'Diagnóstico Scanner', 'Revisão Preventiva',
    'Compra de Peças', 'Salários & Comissões', 'Aluguel', 'Energia & Água', 
    'Internet & Telefonia', 'Impostos & Taxas', 'Marketing & Tráfego', 'Ferramentas & Equipamentos', 'Diversos'
  ];

  useEffect(() => {
    if (session) {
      const load = () => {
        const savedTransRaw = localStorage.getItem(`kaenpro_${session.username}_transactions`);
        const savedOrdersRaw = localStorage.getItem(`kaenpro_${session.username}_orders`);
        
        let loadedTrans = DEFAULT_TRANSACTIONS;
        let loadedOrders = DEFAULT_ORDERS;

        if (savedTransRaw) {
          try {
            const parsed = JSON.parse(savedTransRaw);
            if (Array.isArray(parsed) && parsed.length > 0) loadedTrans = parsed;
          } catch (e) {}
        } else {
          localStorage.setItem(`kaenpro_${session.username}_transactions`, JSON.stringify(DEFAULT_TRANSACTIONS));
          localStorage.setItem(`kaenpro_rafael_transactions`, JSON.stringify(DEFAULT_TRANSACTIONS));
          if (syncData) syncData('transactions', DEFAULT_TRANSACTIONS).catch(() => {});
        }

        if (savedOrdersRaw) {
          try {
            const parsed = JSON.parse(savedOrdersRaw);
            if (Array.isArray(parsed) && parsed.length > 0) loadedOrders = parsed;
          } catch (e) {}
        } else {
          localStorage.setItem(`kaenpro_${session.username}_orders`, JSON.stringify(DEFAULT_ORDERS));
          localStorage.setItem(`kaenpro_rafael_orders`, JSON.stringify(DEFAULT_ORDERS));
          if (syncData) syncData('orders', DEFAULT_ORDERS).catch(() => {});
        }

        setTransactions(loadedTrans);
        setOrders(loadedOrders);
      };

      load();
      window.addEventListener('kaen_storage_updated', load);
      return () => window.removeEventListener('kaen_storage_updated', load);
    }
  }, [session]);

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount || !session) {
      alert("Preencha Descrição e Valor.");
      return;
    }

    const numericAmount = Math.abs(parseFloat(form.amount) || 0);
    let updated: FinancialTransaction[];

    if (editingId) {
      updated = transactions.map(t => t.id === editingId ? {
        ...t,
        description: form.description.trim(),
        category: form.category,
        amount: numericAmount,
        method: form.method,
        type: form.type,
        date: new Date(form.date).toISOString()
      } : t);
    } else {
      const newTransaction: FinancialTransaction = {
        id: 'tr-' + Math.random().toString(36).substr(2, 8),
        type: form.type,
        category: form.category,
        amount: numericAmount,
        method: form.method,
        description: form.description.trim(),
        date: new Date(form.date).toISOString()
      };
      updated = [newTransaction, ...transactions];
    }

    setTransactions(updated);
    if (syncData) {
      await syncData('transactions', updated);
    } else {
      localStorage.setItem(`kaenpro_${session?.username || 'rafael'}_transactions`, JSON.stringify(updated));
    }

    setShowModal(false);
    setEditingId(null);
    setForm({ 
      description: '', 
      category: 'Serviços (Mão de Obra)', 
      amount: '', 
      method: PaymentMethod.PIX, 
      type: TransactionType.INCOME, 
      date: new Date().toISOString().split('T')[0] 
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este lançamento financeiro?")) return;
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    if (syncData) {
      await syncData('transactions', updated);
    } else {
      localStorage.setItem(`kaenpro_${session?.username || 'rafael'}_transactions`, JSON.stringify(updated));
    }
  };

  const handleEdit = (t: FinancialTransaction) => {
    setEditingId(t.id);
    setForm({
      description: t.description,
      category: t.category,
      amount: t.amount.toString(),
      method: t.method,
      type: t.type,
      date: new Date(t.date).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  // Generate rich fictitious invoices based on orders
  const fictitiousInvoices: FictitiousInvoice[] = useMemo(() => {
    return orders.map((o, idx) => {
      const nfeNumber = String(1040 + idx).padStart(6, '0');
      const isPaid = o.paymentStatus === PaymentStatus.PAGO;
      const isOverdue = o.paymentStatus === PaymentStatus.ATRASADO;
      const status: 'AUTORIZADA' | 'PROCESSANDO' | 'FATURADA' = 
        isPaid ? 'AUTORIZADA' :
        isOverdue ? 'FATURADA' : 'PROCESSANDO';

      const partsVal = (o.items || [])
        .filter(i => i.type === 'PART')
        .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const laborVal = o.laborValue || Math.max(0, o.totalValue - partsVal);
      const taxAmount = o.totalValue * 0.055; // 5.5% aproximado simples nacional

      return {
        id: `nfe-${o.id}`,
        nfeNumber,
        osNumber: o.osNumber,
        clientName: o.clientName,
        clientDoc: `3${idx}1.8${idx}4.09${idx}-01`,
        vehicleModel: o.vehicleModel,
        vehiclePlate: o.vehiclePlate,
        totalValue: o.totalValue,
        partsValue: partsVal,
        laborValue: laborVal,
        taxAmount,
        issueDate: o.createdAt || new Date().toISOString(),
        status,
        sefazKey: `3526-1112-8394-0100-0192-5500-1000-${nfeNumber}-100`,
        paymentMethod: o.paymentMethod || 'PIX',
        osData: o
      };
    });
  }, [orders]);

  const indicators = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Entradas directas de OS
    const osRevenue = orders.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
    const osLabor = orders.reduce((acc, curr) => acc + (curr.laborValue || 0), 0);
    const osParts = Math.max(0, osRevenue - osLabor);

    // Transações manuais
    const transIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((a, b) => a + b.amount, 0);
    const transExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((a, b) => a + b.amount, 0);
    
    // Total Faturamento
    const totalRevenue = Math.max(transIncome, osRevenue);
    const totalExpenses = transExpense;
    const netProfit = totalRevenue - totalExpenses;
    
    // Total Carros Atendidos
    const totalCarsServed = orders.length || 6;

    // Ticket Médio
    const averageTicket = totalCarsServed > 0 ? (totalRevenue / totalCarsServed) : 2500;

    // Margem de Lucro (%)
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    // Serviço Mais Vendido
    const topService = 'Revisão & Freios Brembo';

    const chartData = [
      { name: 'Faturamento', value: totalRevenue, fill: '#10B981' },
      { name: 'Despesas', value: totalExpenses, fill: '#FF2D55' },
      { name: 'Lucro Líquido', value: Math.max(0, netProfit), fill: '#3B82F6' }
    ];

    return { 
      totalRevenue, 
      totalExpenses, 
      netProfit, 
      totalCarsServed, 
      averageTicket, 
      profitMargin, 
      topService, 
      chartData,
      osLabor,
      osParts
    };
  }, [transactions, orders]);

  const filtered = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.method.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = 
      typeFilter === 'ALL' ? true :
      typeFilter === 'INCOME' ? t.type === TransactionType.INCOME :
      t.type === TransactionType.EXPENSE;

    return matchesSearch && matchesType;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const downloadInvoicePng = async () => {
    if (!invoicePrintRef.current || !selectedInvoice) return;
    try {
      const canvas = await html2canvas(invoicePrintRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `KAEN_NOTA_FISCAL_${selectedInvoice.osNumber}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      alert("Erro ao exportar nota fiscal.");
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-28 px-2 sm:px-4 max-w-7xl mx-auto text-left">
      
      {/* HEADER SECTION - FULLY RESPONSIVE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white italic uppercase tracking-tighter">
              Financeiro <span className="text-[#FF2D55]">& DRE Kaen</span>
            </h1>
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              Fluxo Ativo
            </span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center gap-1.5 mt-1">
            <DollarSign size={11} className="text-emerald-400" />
            Demonstrativo de resultado • Fluxo de caixa • Notas Fiscais
          </p>
        </div>

        <button 
          onClick={() => {
            setEditingId(null);
            setForm({
              description: '',
              category: 'Serviços (Mão de Obra)',
              amount: '',
              method: PaymentMethod.PIX,
              type: TransactionType.EXPENSE,
              date: new Date().toISOString().split('T')[0]
            });
            setShowModal(true);
          }}
          className="w-full sm:w-auto bg-[#FF2D55] text-white px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 hover:bg-[#D11D40] transition-all transform active:scale-95 shadow-xl shadow-red-900/25 italic"
        >
          <Plus size={18} />
          <span>Lançar Entrada / Saída</span>
        </button>
      </div>

      {/* 6 INDICADORES CHAVE (RESPONSIVE GRID FOR PHONES & DESKTOPS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">1. Faturamento Total</p>
          <p className="text-base sm:text-2xl font-black text-emerald-400 italic truncate">
            R$ {indicators.totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-zinc-500 uppercase">Receita Bruta</span>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-500/20 bg-blue-500/5">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">2. Lucro Líquido</p>
          <p className={`text-base sm:text-2xl font-black italic truncate ${indicators.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
            R$ {indicators.netProfit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-zinc-500 uppercase">Saldo em Caixa</span>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-purple-500/20 bg-purple-500/5">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">3. Ticket Médio</p>
          <p className="text-base sm:text-2xl font-black text-purple-400 italic truncate">
            R$ {indicators.averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
          </p>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-zinc-500 uppercase">Média / OS</span>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">4. Margem Lucro</p>
          <p className="text-base sm:text-2xl font-black text-amber-400 italic truncate">
            {indicators.profitMargin.toFixed(1)}%
          </p>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-zinc-500 uppercase">Eficiência Líquida</span>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/10 bg-zinc-900/60">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">5. Carros Feitos</p>
          <p className="text-base sm:text-2xl font-black text-white italic">
            {indicators.totalCarsServed}
          </p>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-zinc-500 uppercase">OSs Concluídas</span>
        </div>

        <div className="glass-card p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#FF2D55]/20 bg-[#FF2D55]/5">
          <p className="text-zinc-500 text-[8px] sm:text-[9px] font-black uppercase tracking-widest mb-0.5 sm:mb-1">6. Líder de Vendas</p>
          <p className="text-xs sm:text-sm font-black text-[#FF2D55] italic truncate" title={indicators.topService}>
            {indicators.topService}
          </p>
          <span className="text-[7.5px] sm:text-[8px] font-bold text-zinc-500 uppercase">Mais Lucrativo</span>
        </div>
      </div>

      {/* TOP NAVIGATION TABS FOR MOBILE & DESKTOP */}
      <div className="flex gap-2 bg-zinc-950 p-1.5 border border-zinc-800 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-wider overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'OVERVIEW' ? 'bg-white text-black font-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          <TrendingUp size={15} />
          <span>Visão Geral & DRE</span>
        </button>

        <button
          onClick={() => setActiveTab('TRANSACTIONS')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'TRANSACTIONS' ? 'bg-[#FF2D55] text-white font-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          <DollarSign size={15} />
          <span>Lançamentos ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('INVOICES')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${activeTab === 'INVOICES' ? 'bg-blue-600 text-white font-black shadow-lg' : 'text-zinc-400 hover:text-white'}`}
        >
          <FileText size={15} />
          <span>Notas Fiscais / NF-e ({fictitiousInvoices.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DRE */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            
            {/* DRE Demonstrativo Sintético */}
            <div className="lg:col-span-5 glass-card p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-white/10 space-y-4 bg-zinc-950/40">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h3 className="text-xs sm:text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-[#FF2D55]"/> DRE SINTÉTICO DA OFICINA
                </h3>
                <span className="text-[8px] font-mono bg-white/5 text-zinc-400 px-2 py-0.5 rounded uppercase">MÊS ATUAL</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-zinc-300 py-1">
                  <span className="font-bold text-[11px] sm:text-xs">(+) Mão de Obra / Serviços</span>
                  <span className="font-mono text-emerald-400 font-bold">R$ {indicators.osLabor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-300 py-1">
                  <span className="font-bold text-[11px] sm:text-xs">(+) Venda de Peças & Insumos</span>
                  <span className="font-mono text-emerald-400 font-bold">R$ {indicators.osParts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-white font-black py-2.5 border-y border-white/10 bg-white/5 px-3 rounded-xl">
                  <span className="text-xs">(=) RECEITA BRUTA TOTAL</span>
                  <span className="font-mono text-emerald-400 text-sm">R$ {indicators.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400 py-1">
                  <span className="text-[11px] sm:text-xs">(-) Despesas Fixas & Variáveis</span>
                  <span className="font-mono text-[#FF2D55] font-bold">- R$ {indicators.totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-white font-black py-3 border-t border-white/10 text-sm">
                  <span className="text-blue-400">(=) RESULTADO LÍQUIDO</span>
                  <span className={`font-mono text-base ${indicators.netProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    R$ {indicators.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico Comparativo Adaptado para Mobile */}
            <div className="lg:col-span-7 glass-card p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-white/10 shadow-xl h-[280px] sm:h-[340px] bg-zinc-950/40">
              <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-3 italic text-zinc-400 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400"/> Faturamento vs Despesas vs Lucro Líquido
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={indicators.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#71717A" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '14px' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {indicators.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTIONS LIST (MOBILE CARDS + DESKTOP TABLE) */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-4">
          {/* Search & Filter Type */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por descrição, categoria ou método..." 
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none focus:border-[#FF2D55] transition-all placeholder-zinc-600 font-medium" 
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
              <button 
                onClick={() => setTypeFilter('ALL')}
                className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap ${typeFilter === 'ALL' ? 'bg-white text-black border-white shadow-md' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
              >
                Todos ({transactions.length})
              </button>
              <button 
                onClick={() => setTypeFilter('INCOME')}
                className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${typeFilter === 'INCOME' ? 'bg-emerald-500 text-black border-emerald-500 font-black shadow-md' : 'bg-zinc-900 text-emerald-400 border-zinc-800 hover:border-emerald-500/40'}`}
              >
                <ArrowUpCircle size={12} />
                Entradas ({transactions.filter(t => t.type === TransactionType.INCOME).length})
              </button>
              <button 
                onClick={() => setTypeFilter('EXPENSE')}
                className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${typeFilter === 'EXPENSE' ? 'bg-[#FF2D55] text-white border-[#FF2D55] font-black shadow-md' : 'bg-zinc-900 text-[#FF2D55] border-zinc-800 hover:border-red-500/40'}`}
              >
                <ArrowDownCircle size={12} />
                Saídas ({transactions.filter(t => t.type === TransactionType.EXPENSE).length})
              </button>
            </div>
          </div>

          {/* MOBILE VIEW FOR TRANSACTIONS (block on mobile screens, hidden on md+) */}
          <div className="block md:hidden space-y-3">
            {filtered.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-3xl border border-white/5">
                <DollarSign size={36} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-400 font-black uppercase text-xs tracking-widest">Nenhum lançamento encontrado</p>
                <p className="text-zinc-600 text-[10px] mt-1">Clique em "Lançar Entrada / Saída" para cadastrar.</p>
              </div>
            ) : (
              filtered.map(t => {
                const isIncome = t.type === TransactionType.INCOME;
                return (
                  <div 
                    key={t.id}
                    className="glass-card p-4 rounded-3xl border border-white/5 bg-zinc-900/60 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isIncome ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-[#FF2D55]/10 border-[#FF2D55]/25 text-[#FF2D55]'}`}>
                          {isIncome ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white uppercase italic leading-snug">
                            {t.description}
                          </h4>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mt-0.5">
                            {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 font-mono">
                          {t.method}
                        </span>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isIncome ? 'Receita' : 'Despesa'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-base font-black italic ${isIncome ? 'text-emerald-400' : 'text-[#FF2D55]'}`}>
                          {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEdit(t)} 
                            className="p-2 bg-white/5 text-zinc-400 hover:text-white rounded-lg transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(t.id)} 
                            className="p-2 bg-white/5 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP VIEW FOR TRANSACTIONS (hidden on mobile, block on md+) */}
          <div className="hidden md:block glass-card border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden bg-zinc-950/40 divide-y divide-white/5">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-zinc-600 text-xs font-black uppercase tracking-widest">
                Nenhum lançamento financeiro cadastrado.
              </div>
            ) : (
              filtered.map(t => {
                const isIncome = t.type === TransactionType.INCOME;
                return (
                  <div key={t.id} className="p-5 flex items-center justify-between gap-6 hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${isIncome ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-[#FF2D55]/10 border-[#FF2D55]/20 text-[#FF2D55]'}`}>
                        {isIncome ? <ArrowUpCircle size={22}/> : <ArrowDownCircle size={22}/>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase italic tracking-tight truncate max-w-md">{t.description}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                          {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`text-base font-black italic ${isIncome ? 'text-emerald-400' : 'text-[#FF2D55]'}`}>
                          {isIncome ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">{t.method}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={()=>handleEdit(t)} className="p-2.5 bg-white/5 text-zinc-400 hover:text-white rounded-xl border border-white/10 shadow-md transition-all"><Edit3 size={15}/></button>
                        <button onClick={()=>handleDelete(t.id)} className="p-2.5 bg-white/5 text-zinc-400 hover:text-red-400 rounded-xl border border-white/10 shadow-md transition-all"><Trash2 size={15}/></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NOTAS FISCAIS & FATURAMENTO */}
      {activeTab === 'INVOICES' && (
        <div className="space-y-4">
          <div className="bg-zinc-950/80 border border-blue-500/20 p-4 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-widest text-blue-400 block">MÓDULO DE NOTAS FISCAIS ELETRÔNICAS</span>
                <p className="text-xs text-zinc-200 font-bold">Simulação de emissão SEFAZ, DANFE e Recibo Kaen</p>
              </div>
            </div>
            <span className="text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-lg uppercase">
              Certificado A1 Ativo
            </span>
          </div>

          <div className="space-y-3">
            {fictitiousInvoices.map(inv => {
              const isAuth = inv.status === 'AUTORIZADA';
              const isProc = inv.status === 'PROCESSANDO';
              return (
                <div 
                  key={inv.id}
                  className="glass-card p-4 sm:p-5 rounded-3xl border border-white/5 bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-[#FF2D55] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                        NF-e #{inv.nfeNumber}
                      </span>
                      <span className="bg-zinc-950 text-zinc-400 border border-zinc-800 text-[9px] font-mono px-2 py-0.5 rounded">
                        OS #{inv.osNumber}
                      </span>
                      <span className="text-zinc-500 text-[9px] font-bold">
                        {new Date(inv.issueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic">
                        {inv.clientName}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase mt-0.5">
                        {inv.vehicleModel} • Placa: <span className="font-mono text-zinc-200">{inv.vehiclePlate}</span>
                      </p>
                      <span className="text-[8px] font-mono text-zinc-600 block mt-1 truncate max-w-sm sm:max-w-md">
                        Chave: {inv.sefazKey}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    <div className="text-left sm:text-right">
                      <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider">Valor Total</span>
                      <p className="text-base sm:text-lg font-black text-emerald-400 italic">
                        R$ {inv.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[8px] text-zinc-500 block">
                        Peças R$ {inv.partsValue.toLocaleString('pt-BR')} | Serv R$ {inv.laborValue.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`px-2.5 py-1 rounded-xl text-[8.5px] font-black uppercase tracking-wider border ${
                        isAuth ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                        isProc ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                        'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        {inv.status}
                      </div>

                      <button
                        onClick={() => setSelectedInvoice(inv.osData)}
                        className="p-3 bg-white/10 hover:bg-[#FF2D55] text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider italic"
                        title="Visualizar Nota Fiscal Completa"
                      >
                        <FileText size={15} />
                        <span className="hidden sm:inline">Ver Nota</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: NOVO LANÇAMENTO (MOBILE OPTIMIZED) */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md animate-in zoom-in duration-200">
          <div className="bg-[#0c0c0e] border border-white/10 w-full max-w-lg p-5 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative max-h-[92vh] overflow-y-auto no-scrollbar text-left">
            <button 
              onClick={() => { setShowModal(false); setEditingId(null); }} 
              className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-all p-2"
            >
              <X size={22} />
            </button>
            
            <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter mb-6">
              {editingId ? 'Editar Movimentação' : 'Novo Lançamento Financeiro'}
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2 p-1 bg-black rounded-2xl border border-white/10">
                <button 
                  onClick={()=>setForm({...form, type: TransactionType.INCOME})} 
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all italic tracking-widest ${form.type === TransactionType.INCOME ? 'bg-emerald-500 text-white shadow-lg' : 'text-zinc-500'}`}
                >
                  Entrada (Receita)
                </button>
                <button 
                  onClick={()=>setForm({...form, type: TransactionType.EXPENSE})} 
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all italic tracking-widest ${form.type === TransactionType.EXPENSE ? 'bg-[#FF2D55] text-white shadow-lg' : 'text-zinc-500'}`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <div>
                <label className="text-[9px] font-black text-zinc-400 uppercase mb-1.5 block italic tracking-widest">Descrição do Lançamento</label>
                <input 
                  type="text" 
                  value={form.description} 
                  onChange={(e)=>setForm({...form, description: e.target.value})} 
                  placeholder="Ex: OS #1048 - Troca de Pastilhas ou Aluguel" 
                  className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase mb-1.5 block italic tracking-widest">Valor (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={form.amount} 
                    onChange={(e)=>setForm({...form, amount: e.target.value})} 
                    placeholder="0,00" 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-black text-sm outline-none focus:border-[#FF2D55]"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase mb-1.5 block italic tracking-widest">Data</label>
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e)=>setForm({...form, date: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-[#FF2D55]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase mb-1.5 block italic tracking-widest">Categoria</label>
                  <select 
                    value={form.category} 
                    onChange={(e)=>setForm({...form, category: e.target.value})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-[#FF2D55]"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase mb-1.5 block italic tracking-widest">Método</label>
                  <select 
                    value={form.method} 
                    onChange={(e)=>setForm({...form, method: e.target.value as PaymentMethod})} 
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-xs outline-none focus:border-[#FF2D55]"
                  >
                    {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSave} 
                className="w-full bg-[#FF2D55] hover:bg-[#D11D40] py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl mt-3 active:scale-95 transition-all text-white italic"
              >
                Salvar Lançamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl animate-in zoom-in duration-200">
          <div className="bg-[#111] border border-white/20 w-full max-w-4xl p-4 sm:p-6 rounded-3xl shadow-2xl relative max-h-[96vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[#FF2D55]" />
                <h3 className="text-base font-black text-white uppercase italic">
                  Nota Fiscal OS #{selectedInvoice.osNumber}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={downloadInvoicePng}
                  className="bg-white text-black px-3.5 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  <Download size={14} />
                  Baixar Imagem
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-2 text-zinc-400 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex justify-center bg-zinc-950 p-2 sm:p-4 rounded-2xl border border-white/5">
              <div ref={invoicePrintRef} className="transform origin-top scale-[0.8] sm:scale-100 transition-transform">
                <Invoice os={selectedInvoice} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Financial;

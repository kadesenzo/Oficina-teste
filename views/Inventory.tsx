import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertCircle, 
  Trash2, 
  X, 
  ArrowUp, 
  ArrowDown, 
  Check,
  RefreshCw,
  Box,
  TrendingUp,
  AlertTriangle,
  Tag,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { Part, UserSession } from '../types';

const DEFAULT_PARTS: Part[] = [
  {
    id: 'part-01',
    name: 'Óleo Sintético Motul 8100 X-cess 5W40 (1L)',
    sku: 'MOT-5W40-1L',
    brand: 'Motul',
    category: 'Lubrificantes',
    costPrice: 58.00,
    salePrice: 98.00,
    stock: 28,
    minStock: 10
  },
  {
    id: 'part-02',
    name: 'Óleo Sintético Mobil Super 3000 5W30 (1L)',
    sku: 'MOB-5W30-1L',
    brand: 'Mobil',
    category: 'Lubrificantes',
    costPrice: 42.00,
    salePrice: 74.00,
    stock: 34,
    minStock: 12
  },
  {
    id: 'part-03',
    name: 'Filtro de Óleo Blindado Mann W712/52',
    sku: 'MAN-W712',
    brand: 'Mann Filter',
    category: 'Filtros',
    costPrice: 28.00,
    salePrice: 55.00,
    stock: 16,
    minStock: 6
  },
  {
    id: 'part-04',
    name: 'Filtro de Ar Motor Tecfil ARL-8830',
    sku: 'TEC-ARL8830',
    brand: 'Tecfil',
    category: 'Filtros',
    costPrice: 32.00,
    salePrice: 68.00,
    stock: 12,
    minStock: 5
  },
  {
    id: 'part-05',
    name: 'Jogo Pastilhas de Freio Dianteira Brembo P85020',
    sku: 'BRE-P85020',
    brand: 'Brembo',
    category: 'Freios',
    costPrice: 240.00,
    salePrice: 420.00,
    stock: 3,
    minStock: 5
  },
  {
    id: 'part-06',
    name: 'Disco de Freio Ventilado Fremax Diant. (Par)',
    sku: 'FRX-BD4750',
    brand: 'Fremax',
    category: 'Freios',
    costPrice: 380.00,
    salePrice: 650.00,
    stock: 2,
    minStock: 4
  },
  {
    id: 'part-07',
    name: 'Jogo Velas de Ignição NGK Laser Iridium ILZKR7B',
    sku: 'NGK-IRID-4X',
    brand: 'NGK',
    category: 'Ignição',
    costPrice: 195.00,
    salePrice: 360.00,
    stock: 9,
    minStock: 4
  },
  {
    id: 'part-08',
    name: 'Kit Correia Dentada + Tensor Gates PowerGrip',
    sku: 'GAT-K015500',
    brand: 'Gates',
    category: 'Correias',
    costPrice: 290.00,
    salePrice: 510.00,
    stock: 5,
    minStock: 3
  },
  {
    id: 'part-09',
    name: 'Fluido de Freio Motul DOT 5.1 Sintético (500ml)',
    sku: 'MOT-DOT51',
    brand: 'Motul',
    category: 'Fluidos',
    costPrice: 45.00,
    salePrice: 85.00,
    stock: 18,
    minStock: 6
  },
  {
    id: 'part-10',
    name: 'Aditivo Radiador Concentrado Orgânico Tirreno Rosa (1L)',
    sku: 'TIR-ORG-1L',
    brand: 'Tirreno',
    category: 'Arrefecimento',
    costPrice: 26.00,
    salePrice: 52.00,
    stock: 22,
    minStock: 8
  },
  {
    id: 'part-11',
    name: 'Amortecedor Dianteiro Turbogás Cofap (Par)',
    sku: 'COF-GP30120',
    brand: 'Cofap',
    category: 'Suspensão',
    costPrice: 540.00,
    salePrice: 920.00,
    stock: 2,
    minStock: 4
  },
  {
    id: 'part-12',
    name: 'Bomba d\'Água Indisa com Rotor Metálico',
    sku: 'IND-BA482',
    brand: 'Indisa',
    category: 'Arrefecimento',
    costPrice: 145.00,
    salePrice: 275.00,
    stock: 6,
    minStock: 3
  }
];

const Inventory: React.FC<{ session?: UserSession; syncData?: (key: string, data: any) => Promise<void> }> = ({ session, syncData }) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  
  const [newPart, setNewPart] = useState({
    name: '',
    sku: '',
    brand: '',
    category: 'Peças Gerais',
    stock: 0,
    minStock: 3,
    salePrice: 0,
    costPrice: 0
  });

  const loadData = () => {
    if (session) {
      const savedRaw = localStorage.getItem(`kaenpro_${session.username}_parts`);
      if (savedRaw) {
        try {
          const parsed = JSON.parse(savedRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setParts(parsed);
            return;
          }
        } catch (e) {
          console.warn("Error parsing saved parts, restoring default seed", e);
        }
      }
      // Populate defaults if empty
      setParts(DEFAULT_PARTS);
      localStorage.setItem(`kaenpro_${session.username}_parts`, JSON.stringify(DEFAULT_PARTS));
      localStorage.setItem(`kaenpro_rafael_parts`, JSON.stringify(DEFAULT_PARTS));
      if (syncData) {
        syncData('parts', DEFAULT_PARTS).catch(() => {});
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('kaen_storage_updated', loadData);
    return () => window.removeEventListener('kaen_storage_updated', loadData);
  }, [session]);

  const handleSave = async () => {
    if (!newPart.name || !session) return;
    const part: Part = {
      ...newPart,
      id: 'part-' + Math.random().toString(36).substr(2, 8)
    };
    const updated = [part, ...parts];
    setParts(updated);
    if (syncData) {
      await syncData('parts', updated);
    } else {
      localStorage.setItem(`kaenpro_${session.username}_parts`, JSON.stringify(updated));
    }
    setShowModal(false);
    setNewPart({ name: '', sku: '', brand: '', category: 'Peças Gerais', stock: 0, minStock: 3, salePrice: 0, costPrice: 0 });
  };

  const handleDelete = async (id: string) => {
    if (!session) return;
    if (confirm("Deseja remover permanentemente este item do estoque?")) {
      const updated = parts.filter(p => p.id !== id);
      setParts(updated);
      if (syncData) {
        await syncData('parts', updated);
      } else {
        localStorage.setItem(`kaenpro_${session.username}_parts`, JSON.stringify(updated));
      }
    }
  };

  const handleQuickAdjust = async (id: string, currentStock: number) => {
    const amount = adjustments[id] || 0;
    if (amount === 0 || !session) return;

    const newStock = currentStock + amount;
    if (newStock < 0) {
      alert("ERRO: O estoque não pode ficar negativo.");
      return;
    }

    const updated = parts.map(p => p.id === id ? { ...p, stock: newStock } : p);
    setParts(updated);
    if (syncData) {
      await syncData('parts', updated);
    } else {
      localStorage.setItem(`kaenpro_${session.username}_parts`, JSON.stringify(updated));
    }
    
    // Reset adjustment for this item
    const newAdjustments = { ...adjustments };
    delete newAdjustments[id];
    setAdjustments(newAdjustments);
  };

  const setItemAdjustment = (id: string, value: number) => {
    setAdjustments({ ...adjustments, [id]: value });
  };

  const categories = Array.from(new Set(parts.map(p => p.category || 'Peças Gerais'))).filter(Boolean);

  const filtered = parts.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const isCritical = p.stock <= p.minStock;
    const matchesStatus = 
      filterMode === 'ALL' ? true :
      filterMode === 'CRITICAL' ? isCritical : !isCritical;

    const matchesCategory = categoryFilter === 'ALL' ? true : p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalValue = parts.reduce((acc, curr) => acc + (curr.stock * curr.salePrice), 0);
  const criticalItems = parts.filter(p => p.stock <= p.minStock);

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-28 px-2 sm:px-4 max-w-7xl mx-auto text-left">
      
      {/* HEADER SECTION - RESPONSIVE FOR MOBILE & DESKTOP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 sm:mt-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">
              Estoque <span className="text-[#FF2D55]">Kaen</span>
            </h1>
            <span className="bg-[#FF2D55]/15 border border-[#FF2D55]/30 text-[#FF2D55] text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
              {parts.length} Itens
            </span>
          </div>
          <p className="text-zinc-500 font-bold uppercase text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center gap-1.5 mt-1">
            <RefreshCw size={11} className="text-[#FF2D55]" /> Gestão de peças & insumos em tempo real
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto bg-[#FF2D55] text-white px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2.5 hover:bg-[#D11D40] transition-all transform active:scale-95 shadow-xl shadow-red-900/25 italic"
        >
          <Plus size={18} />
          <span>Cadastrar Nova Peça</span>
        </button>
      </div>

      {/* STATS CARDS - COMPACT & RESPONSIVE FOR MOBILE VIEWPORTS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-6">
        <div className="glass-card p-4 sm:p-7 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden border border-white/5 bg-zinc-900/60">
          <div className="absolute top-2 right-2 sm:top-0 sm:right-0 p-4 opacity-5 pointer-events-none">
            <Box size={60} />
          </div>
          <p className="text-zinc-500 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Total de SKUs</p>
          <p className="text-2xl sm:text-4xl font-black text-white italic">{parts.length}</p>
          <span className="text-[8px] sm:text-[9px] text-zinc-500 font-bold uppercase mt-1 block">Catálogo Ativo</span>
        </div>
        
        <div className="glass-card p-4 sm:p-7 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden border border-amber-500/20 bg-amber-500/5">
          <div className="absolute top-2 right-2 sm:top-0 sm:right-0 p-4 opacity-5 pointer-events-none">
            <AlertTriangle size={60} />
          </div>
          <p className="text-zinc-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
            <AlertCircle size={10} className="text-amber-500" />
            Em Alerta
          </p>
          <p className={`text-2xl sm:text-4xl font-black italic ${criticalItems.length > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
            {criticalItems.length}
          </p>
          <span className="text-[8px] sm:text-[9px] text-amber-500/80 font-bold uppercase mt-1 block">Repor Urgente</span>
        </div>

        <div className="col-span-2 sm:col-span-1 glass-card p-4 sm:p-7 rounded-2xl sm:rounded-[2.5rem] relative overflow-hidden border border-emerald-500/20 bg-emerald-500/5">
          <div className="absolute top-2 right-2 sm:top-0 sm:right-0 p-4 opacity-5 pointer-events-none">
            <TrendingUp size={60} />
          </div>
          <p className="text-zinc-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1">Patrimônio em Peças</p>
          <p className="text-xl sm:text-3xl font-black text-emerald-400 italic truncate">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[8px] sm:text-[9px] text-emerald-500/80 font-bold uppercase mt-1 block">Valor Venda Estimado</span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH FOR MOBILE & DESKTOP */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por peça, código SKU ou marca..." 
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm text-white outline-none focus:border-[#FF2D55] transition-all placeholder-zinc-600 font-medium" 
            />
          </div>

          {/* Quick status filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[9px] sm:text-[10px] font-black uppercase tracking-wider">
            <button 
              onClick={() => setFilterMode('ALL')}
              className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap ${filterMode === 'ALL' ? 'bg-white text-black border-white shadow-md' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
            >
              Todos ({parts.length})
            </button>
            <button 
              onClick={() => setFilterMode('CRITICAL')}
              className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${filterMode === 'CRITICAL' ? 'bg-amber-500 text-black border-amber-500 font-black shadow-md' : 'bg-zinc-900 text-amber-500 border-zinc-800 hover:border-amber-500/40'}`}
            >
              <AlertTriangle size={12} />
              Críticos ({criticalItems.length})
            </button>
            <button 
              onClick={() => setFilterMode('NORMAL')}
              className={`px-3.5 py-2.5 rounded-xl border transition-all whitespace-nowrap ${filterMode === 'NORMAL' ? 'bg-emerald-500 text-black border-emerald-500 font-black shadow-md' : 'bg-zinc-900 text-emerald-400 border-zinc-800 hover:border-emerald-500/40'}`}
            >
              Normais ({parts.length - criticalItems.length})
            </button>
          </div>
        </div>

        {/* Category Filters Bar */}
        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${categoryFilter === 'ALL' ? 'bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/40' : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300'}`}
            >
              Todas Categorias
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-[#FF2D55]/20 text-[#FF2D55] border border-[#FF2D55]/40' : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE CARDS VIEW (block on mobile screens, hidden on md+) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-white/5">
            <Box size={36} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-black uppercase text-xs tracking-widest">Nenhuma peça encontrada</p>
            <p className="text-zinc-600 text-[10px] mt-1">Tente ajustar a busca ou filtros.</p>
          </div>
        ) : (
          filtered.map(p => {
            const isCritical = p.stock <= p.minStock;
            const adjustmentValue = adjustments[p.id] || 0;

            return (
              <div 
                key={p.id}
                className={`glass-card p-4 rounded-3xl border transition-all ${isCritical ? 'border-amber-500/30 bg-amber-500/[0.03]' : 'border-white/5 bg-zinc-900/60'}`}
              >
                {/* Top: SKU & Status */}
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[9px] font-black bg-zinc-950 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-md tracking-wider">
                      {p.sku || 'SEM SKU'}
                    </span>
                    {p.brand && (
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">
                        • {p.brand}
                      </span>
                    )}
                  </div>

                  {isCritical ? (
                    <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase">
                      <AlertCircle size={11} />
                      Crítico (Min: {p.minStock})
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase">
                      <Check size={11} />
                      OK
                    </div>
                  )}
                </div>

                {/* Middle: Name & Category */}
                <div className="py-3">
                  <h3 className="text-sm font-black text-white uppercase italic leading-tight">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase bg-white/5 px-2 py-0.5 rounded">
                      {p.category || 'Peças Gerais'}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-medium">
                      Custo: R$ {p.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Bottom: Stock Count, Price, and Quick Adjust */}
                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider">Saldo Atual</span>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-2xl font-black italic ${isCritical ? 'text-amber-400' : 'text-white'}`}>
                        {p.stock}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">un.</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase block tracking-wider">Preço Venda</span>
                    <span className="text-base font-black text-emerald-400 italic">
                      R$ {p.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Mobile Quick Adjustment Control */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2 bg-zinc-950/70 p-2 rounded-2xl border border-zinc-800/80">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-zinc-400 ml-1">
                    Ajustar Saldo:
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-black rounded-xl border border-zinc-800 p-0.5">
                      <button 
                        onClick={() => setItemAdjustment(p.id, adjustmentValue - 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-400 active:bg-zinc-900 rounded-lg transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <input 
                        type="number"
                        value={adjustmentValue === 0 ? '' : adjustmentValue}
                        onChange={(e) => setItemAdjustment(p.id, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-10 bg-transparent text-center text-xs font-black text-white outline-none"
                      />
                      <button 
                        onClick={() => setItemAdjustment(p.id, adjustmentValue + 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-emerald-400 active:bg-zinc-900 rounded-lg transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleQuickAdjust(p.id, p.stock)}
                      disabled={adjustmentValue === 0}
                      className={`h-8 px-3 rounded-xl text-xs font-black uppercase flex items-center gap-1 transition-all ${adjustmentValue !== 0 ? 'bg-[#FF2D55] text-white shadow-md active:scale-95' : 'bg-zinc-800 text-zinc-600 opacity-40 cursor-not-allowed'}`}
                    >
                      <Check size={14} />
                      <span>Salvar</span>
                    </button>

                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="w-8 h-8 flex items-center justify-center text-zinc-600 hover:text-red-400 active:bg-red-500/10 rounded-xl transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
              <tr className="bg-zinc-950 text-zinc-500 text-[9px] uppercase tracking-[0.2em] font-black border-b border-zinc-800">
                <th className="px-8 py-5">Identificação do Produto</th>
                <th className="px-6 py-5">Categoria / Marca</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-center">Saldo Atual</th>
                <th className="px-6 py-5 text-center bg-zinc-900/40">Ajuste Rápido (Entrada/Saída)</th>
                <th className="px-6 py-5 text-right">Preço Venda</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filtered.map(p => {
                const isCritical = p.stock <= p.minStock;
                const adjustmentValue = adjustments[p.id] || 0;
                
                return (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white group-hover:text-[#FF2D55] transition-colors uppercase italic">{p.name}</span>
                        <span className="text-[10px] font-mono text-zinc-500 mt-0.5 uppercase tracking-widest">{p.sku || 'SEM CÓDIGO'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                        {p.category || 'Geral'} {p.brand ? `• ${p.brand}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {isCritical ? (
                        <div className="flex items-center gap-1.5 text-amber-400">
                          <AlertCircle size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Crítico (Min: {p.minStock})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Check size={14} />
                          <span className="text-[10px] font-black uppercase tracking-wider">Normal</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`text-xl font-black italic ${isCritical ? 'text-amber-400' : 'text-zinc-100'}`}>
                        {p.stock}
                      </span>
                      <span className="text-[8px] block text-zinc-500 uppercase font-bold tracking-wider">unidades</span>
                    </td>
                    
                    {/* QUICK ADJUSTMENT COLUMN */}
                    <td className="px-6 py-5 bg-zinc-900/30">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center bg-zinc-950 rounded-xl border border-zinc-800 p-0.5 shadow-inner">
                          <button 
                            onClick={() => setItemAdjustment(p.id, adjustmentValue - 1)}
                            className="p-1.5 text-zinc-500 hover:text-red-500 transition-colors"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <input 
                            type="number"
                            value={adjustmentValue === 0 ? '' : adjustmentValue}
                            onChange={(e) => setItemAdjustment(p.id, parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="w-14 bg-transparent text-center text-xs font-black text-white outline-none placeholder-zinc-800"
                          />
                          <button 
                            onClick={() => setItemAdjustment(p.id, adjustmentValue + 1)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-500 transition-colors"
                          >
                            <ArrowUp size={14} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => handleQuickAdjust(p.id, p.stock)}
                          disabled={adjustmentValue === 0}
                          className={`p-2.5 rounded-xl transition-all shadow-md ${adjustmentValue !== 0 ? 'bg-[#FF2D55] text-white hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-600 opacity-30 cursor-not-allowed'}`}
                          title="Confirmar Ajuste"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <p className="text-sm font-black text-emerald-400 italic">R$ {p.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <span className="text-[8px] text-zinc-500 uppercase">Custo: R$ {p.costPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="p-2.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Excluir Item"
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
                      <Box size={40} className="opacity-20" />
                      <p className="font-bold uppercase text-xs tracking-widest italic">Nenhum produto cadastrado com estes critérios</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NEW PRODUCT (MOBILE OPTIMIZED WITH SCROLL & FIT) */}
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
                <Package size={24} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter">Novo Insumo / Peça</h2>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Cadastro Técnico no Estoque</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Descrição do Produto</label>
                <input 
                  type="text" 
                  value={newPart.name}
                  onChange={(e) => setNewPart({...newPart, name: e.target.value})}
                  placeholder="Ex: Óleo Motul 5W30 8100 X-cess"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-[#FF2D55] outline-none transition-all placeholder-zinc-700 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Código SKU</label>
                  <input 
                    type="text" 
                    value={newPart.sku}
                    onChange={(e) => setNewPart({...newPart, sku: e.target.value.toUpperCase()})}
                    placeholder="KP-8820"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Marca / Fabricante</label>
                  <input 
                    type="text" 
                    value={newPart.brand}
                    onChange={(e) => setNewPart({...newPart, brand: e.target.value})}
                    placeholder="Motul, Brembo..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Categoria</label>
                <select 
                  value={newPart.category}
                  onChange={(e) => setNewPart({...newPart, category: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:border-[#FF2D55] outline-none font-medium"
                >
                  <option value="Lubrificantes">Lubrificantes</option>
                  <option value="Filtros">Filtros</option>
                  <option value="Freios">Freios</option>
                  <option value="Suspensão">Suspensão</option>
                  <option value="Ignição">Ignição</option>
                  <option value="Correias">Correias</option>
                  <option value="Fluidos">Fluidos</option>
                  <option value="Arrefecimento">Arrefecimento</option>
                  <option value="Peças Gerais">Peças Gerais</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div>
                  <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Preço de Custo (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newPart.costPrice === 0 ? '' : newPart.costPrice}
                    onChange={(e) => setNewPart({...newPart, costPrice: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FF2D55] outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Preço de Venda (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newPart.salePrice === 0 ? '' : newPart.salePrice}
                    onChange={(e) => setNewPart({...newPart, salePrice: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 focus:border-emerald-500 outline-none font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-900/60 rounded-2xl border border-zinc-800">
                <div>
                  <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Qtd Inicial</label>
                  <input 
                    type="number" 
                    value={newPart.stock === 0 ? '' : newPart.stock}
                    onChange={(e) => setNewPart({...newPart, stock: parseInt(e.target.value) || 0})}
                    placeholder="0"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#FF2D55] outline-none font-black"
                  />
                </div>
                <div>
                  <label className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Estoque Mínimo (Alerta)</label>
                  <input 
                    type="number" 
                    value={newPart.minStock === 0 ? '' : newPart.minStock}
                    onChange={(e) => setNewPart({...newPart, minStock: parseInt(e.target.value) || 0})}
                    placeholder="Ex: 3"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-amber-400 focus:border-amber-500 outline-none font-black"
                  />
                </div>
              </div>

              <button 
                onClick={handleSave}
                disabled={!newPart.name}
                className="w-full bg-[#FF2D55] hover:bg-[#D11D40] py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white transition-all transform active:scale-95 shadow-xl shadow-red-900/30 flex items-center justify-center gap-2 mt-4 italic disabled:opacity-40"
              >
                <Check size={18} />
                <span>Salvar no Catálogo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

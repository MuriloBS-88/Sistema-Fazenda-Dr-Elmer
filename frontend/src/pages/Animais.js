import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Plus, Trash, Pencil, CopySimple, Funnel, CheckSquare, Square, Syringe } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import SelectEditavel from '../components/SelectEditavel';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TIPOS_ANIMAIS = ['Bovino', 'Suino', 'Ovino', 'Caprino', 'Equino', 'Aves', 'Outros'];
const SEXOS = [{ value: 'macho', label: 'Macho' }, { value: 'femea', label: 'Femea' }];
const TIPOS_EVENTOS = [
  { value: 'nascimento', label: 'Nascimento' },
  { value: 'desmame', label: 'Desmame' },
  { value: 'vacinacao', label: 'Vacinacao' },
  { value: 'pesagem', label: 'Pesagem' },
  { value: 'tratamento', label: 'Tratamento' }
];

function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let anos = hoje.getFullYear() - nasc.getFullYear();
  let meses = hoje.getMonth() - nasc.getMonth();
  if (meses < 0) { anos--; meses += 12; }
  if (hoje.getDate() < nasc.getDate()) { meses--; if (meses < 0) { anos--; meses += 12; } }
  return { anos, meses, totalMeses: anos * 12 + meses };
}

function formatarIdade(dataNascimento) {
  const idade = calcularIdade(dataNascimento);
  if (!idade) return '-';
  if (idade.anos === 0 && idade.meses === 0) return 'Recem nascido';
  if (idade.anos === 0) return `${idade.meses} ${idade.meses === 1 ? 'mes' : 'meses'}`;
  if (idade.meses === 0) return `${idade.anos} ${idade.anos === 1 ? 'ano' : 'anos'}`;
  return `${idade.anos}a ${idade.meses}m`;
}

export default function Animais() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogBulkOpen, setDialogBulkOpen] = useState(false);
  const [dialogEventoOpen, setDialogEventoOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [selecionados, setSelecionados] = useState(new Set());
  const [formData, setFormData] = useState({ tipo: '', tag: '', sexo: '', genitora_id: '', data_nascimento: '', peso_atual: '', observacoes: '' });
  const [formBulk, setFormBulk] = useState({ tipo: '', tag_inicial: '', quantidade: 2, sexo: '', data_nascimento: '', peso_atual: '', observacoes: '' });
  const [formEvento, setFormEvento] = useState({ tipo: '', data: new Date().toISOString().split('T')[0], detalhes: '', peso: '', vacina: '' });

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSexo, setFiltroSexo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroIdadeMin, setFiltroIdadeMin] = useState('');
  const [filtroIdadeMax, setFiltroIdadeMax] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => { carregarAnimais(); }, []);

  const carregarAnimais = async () => {
    try {
      const response = await axios.get(`${API}/animais`);
      setAnimais(response.data);
    } catch (error) { toast.error('Erro ao carregar animais'); }
    finally { setLoading(false); }
  };

  const animaisFiltrados = useMemo(() => {
    return animais.filter(a => {
      if (filtroTipo && a.tipo !== filtroTipo) return false;
      if (filtroSexo && a.sexo !== filtroSexo) return false;
      if (filtroStatus && a.status !== filtroStatus) return false;
      if (filtroIdadeMin || filtroIdadeMax) {
        const idade = calcularIdade(a.data_nascimento);
        if (!idade) return false;
        if (filtroIdadeMin && idade.totalMeses < parseInt(filtroIdadeMin)) return false;
        if (filtroIdadeMax && idade.totalMeses > parseInt(filtroIdadeMax)) return false;
      }
      return true;
    });
  }, [animais, filtroTipo, filtroSexo, filtroStatus, filtroIdadeMin, filtroIdadeMax]);

  const femeas = animais.filter(a => a.sexo === 'femea' && a.status === 'ativo');

  const todosSelec = animaisFiltrados.length > 0 && animaisFiltrados.every(a => selecionados.has(a.id));

  const toggleSelecionar = (id) => {
    const novo = new Set(selecionados);
    if (novo.has(id)) novo.delete(id); else novo.add(id);
    setSelecionados(novo);
  };

  const toggleSelecionarTodos = () => {
    if (todosSelec) { setSelecionados(new Set()); }
    else { setSelecionados(new Set(animaisFiltrados.map(a => a.id))); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tipo || !formData.tag) { toast.error('Preencha tipo e tag'); return; }
    const payload = {
      ...formData, peso_atual: formData.peso_atual ? parseFloat(formData.peso_atual) : null,
      data_nascimento: formData.data_nascimento || null, sexo: formData.sexo || null,
      genitora_id: formData.genitora_id && formData.genitora_id !== 'none' ? formData.genitora_id : null
    };
    try {
      if (editando) { await axios.put(`${API}/animais/${editando.id}`, payload); toast.success('Animal atualizado!'); }
      else { await axios.post(`${API}/animais`, payload); toast.success('Animal cadastrado!'); }
      setDialogOpen(false); resetForm(); carregarAnimais();
    } catch (error) { toast.error('Erro ao salvar animal'); }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!formBulk.tipo || !formBulk.tag_inicial || !formBulk.quantidade) { toast.error('Preencha tipo, tag inicial e quantidade'); return; }
    try {
      const payload = { ...formBulk, quantidade: parseInt(formBulk.quantidade), peso_atual: formBulk.peso_atual ? parseFloat(formBulk.peso_atual) : null, data_nascimento: formBulk.data_nascimento || null, sexo: formBulk.sexo || null };
      const response = await axios.post(`${API}/animais/bulk`, payload);
      toast.success(`${response.data.length} animais cadastrados!`);
      setDialogBulkOpen(false); resetBulkForm(); carregarAnimais();
    } catch (error) { const d = error.response?.data?.detail; toast.error(typeof d === 'string' ? d : 'Erro no cadastro em massa'); }
  };

  const handleEventoEmMassa = async (e) => {
    e.preventDefault();
    if (!formEvento.tipo) { toast.error('Selecione o tipo de evento'); return; }
    if (selecionados.size === 0) { toast.error('Selecione pelo menos um animal'); return; }
    let sucesso = 0;
    for (const animalId of selecionados) {
      try {
        const payload = {
          tipo: formEvento.tipo, animal_id: animalId, data: formEvento.data,
          detalhes: formEvento.detalhes || '', peso: formEvento.peso ? parseFloat(formEvento.peso) : null,
          vacina: formEvento.vacina || null
        };
        await axios.post(`${API}/eventos`, payload);
        sucesso++;
      } catch (error) { /* continua */ }
    }
    toast.success(`Evento registrado para ${sucesso} de ${selecionados.size} animais!`);
    setDialogEventoOpen(false); resetEventoForm(); setSelecionados(new Set()); carregarAnimais();
  };

  const handleDeleteEmMassa = async () => {
    if (selecionados.size === 0) { toast.error('Selecione pelo menos um animal'); return; }
    if (!window.confirm(`Excluir ${selecionados.size} animais selecionados?`)) return;
    let sucesso = 0;
    for (const id of selecionados) {
      try { await axios.delete(`${API}/animais/${id}`); sucesso++; } catch (error) { /* continua */ }
    }
    toast.success(`${sucesso} animais excluidos!`);
    setSelecionados(new Set()); carregarAnimais();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este animal?')) return;
    try { await axios.delete(`${API}/animais/${id}`); toast.success('Animal excluido!'); carregarAnimais(); }
    catch (error) { toast.error('Erro ao excluir'); }
  };

  const resetForm = () => { setFormData({ tipo: '', tag: '', sexo: '', genitora_id: '', data_nascimento: '', peso_atual: '', observacoes: '' }); setEditando(null); };
  const resetBulkForm = () => { setFormBulk({ tipo: '', tag_inicial: '', quantidade: 2, sexo: '', data_nascimento: '', peso_atual: '', observacoes: '' }); };
  const resetEventoForm = () => { setFormEvento({ tipo: '', data: new Date().toISOString().split('T')[0], detalhes: '', peso: '', vacina: '' }); };
  const limparFiltros = () => { setFiltroTipo(''); setFiltroSexo(''); setFiltroStatus(''); setFiltroIdadeMin(''); setFiltroIdadeMax(''); };

  const abrirEdicao = (animal) => {
    setEditando(animal);
    setFormData({ tipo: animal.tipo, tag: animal.tag, sexo: animal.sexo || '', genitora_id: animal.genitora_id || '', data_nascimento: animal.data_nascimento || '', peso_atual: animal.peso_atual || '', observacoes: animal.observacoes || '' });
    setDialogOpen(true);
  };

  const getStatusBadge = (s) => ({ ativo: 'bg-[#3B823E] text-white', venda: 'bg-[#2B6CB0] text-white', morte: 'bg-[#C25934] text-white', perda: 'bg-[#D99B29] text-white', inativo: 'bg-[#7A8780] text-white' }[s] || 'bg-[#3B823E] text-white');
  const getGenitoraTag = (id) => { const g = animais.find(a => a.id === id); return g ? g.tag : '-'; };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  return (
    <div className="fade-in" data-testid="animais-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]">Animais</h1>
          <p className="text-lg text-[#7A8780] mt-2">Gerencie o cadastro de animais ({animaisFiltrados.length} de {animais.length})</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={dialogBulkOpen} onOpenChange={(open) => { setDialogBulkOpen(open); if (!open) resetBulkForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#4A6741] text-[#4A6741] hover:bg-[#E8F0E6]" data-testid="bulk-animal-btn">
                <CopySimple size={20} className="mr-2" /> Em Massa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="bulk-animal-dialog">
              <DialogHeader><DialogTitle>Cadastro em Massa</DialogTitle></DialogHeader>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div><Label>Tipo *</Label><SelectEditavel campo="tipo_animal" value={formBulk.tipo} onValueChange={(v) => setFormBulk({...formBulk, tipo: v})} placeholder="Selecione o tipo" opcoesPadrao={TIPOS_ANIMAIS} /></div>
                <div><Label>Tag Inicial * (ex: BOV-001)</Label><Input value={formBulk.tag_inicial} onChange={(e) => setFormBulk({...formBulk, tag_inicial: e.target.value})} placeholder="BOV-001" required /><p className="text-xs text-[#7A8780] mt-1">Deve terminar com numero. Gera sequencialmente.</p></div>
                <div><Label>Quantidade *</Label><Input type="number" min="2" max="500" value={formBulk.quantidade} onChange={(e) => setFormBulk({...formBulk, quantidade: e.target.value})} required /></div>
                <div><Label>Sexo</Label><Select value={formBulk.sexo || 'none_sexo'} onValueChange={(v) => setFormBulk({...formBulk, sexo: v === 'none_sexo' ? '' : v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="none_sexo">Nao informado</SelectItem>{SEXOS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Data de Nascimento</Label><div className="flex items-center gap-3"><Input type="date" value={formBulk.data_nascimento} onChange={(e) => setFormBulk({...formBulk, data_nascimento: e.target.value})} className="flex-1" />{formBulk.data_nascimento && <span className="text-sm font-medium text-[#4A6741] whitespace-nowrap">{formatarIdade(formBulk.data_nascimento)}</span>}</div></div>
                <div><Label>Peso Medio Estimado (kg)</Label><Input type="number" step="0.01" value={formBulk.peso_atual} onChange={(e) => setFormBulk({...formBulk, peso_atual: e.target.value})} placeholder="Ex: 350" /><p className="text-xs text-[#D99B29] mt-1">* Este peso sera aplicado como estimativa para todos os animais do lote</p></div>
                <div><Label>Observacoes</Label><Input value={formBulk.observacoes} onChange={(e) => setFormBulk({...formBulk, observacoes: e.target.value})} /></div>
                <div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setDialogBulkOpen(false)}>Cancelar</Button><Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white">Cadastrar</Button></div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="add-animal-btn"><Plus size={20} className="mr-2" /> Novo Animal</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="animal-dialog">
              <DialogHeader><DialogTitle>{editando ? 'Editar Animal' : 'Novo Animal'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Tipo *</Label><SelectEditavel campo="tipo_animal" value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})} placeholder="Selecione o tipo" opcoesPadrao={TIPOS_ANIMAIS} /></div>
                <div><Label>Tag *</Label><Input value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} required /></div>
                <div><Label>Sexo</Label><Select value={formData.sexo || 'none_sexo'} onValueChange={(v) => setFormData({...formData, sexo: v === 'none_sexo' ? '' : v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="none_sexo">Nao informado</SelectItem>{SEXOS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Genitora (Mae)</Label><Select value={formData.genitora_id || 'none'} onValueChange={(v) => setFormData({...formData, genitora_id: v === 'none' ? '' : v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="none">Nenhuma</SelectItem>{femeas.map(a => <SelectItem key={a.id} value={a.id}>{a.tag} - {a.tipo}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Data de Nascimento</Label><div className="flex items-center gap-3"><Input type="date" value={formData.data_nascimento} onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})} className="flex-1" />{formData.data_nascimento && <span className="text-sm font-medium text-[#4A6741] whitespace-nowrap">{formatarIdade(formData.data_nascimento)}</span>}</div></div>
                <div><Label>Peso Atual (kg)</Label><Input type="number" step="0.01" value={formData.peso_atual} onChange={(e) => setFormData({...formData, peso_atual: e.target.value})} /></div>
                <div><Label>Observacoes</Label><Input value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} /></div>
                <div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white">{editando ? 'Atualizar' : 'Salvar'}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4">
        <Button variant="outline" onClick={() => setMostrarFiltros(!mostrarFiltros)} className="mb-3" data-testid="toggle-filtros-btn">
          <Funnel size={18} className="mr-2" /> {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </Button>
        {mostrarFiltros && (
          <div className="bg-white rounded-lg border border-[#E5E3DB] p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 fade-in">
            <div><Label className="text-xs">Tipo</Label><Select value={filtroTipo || 'todos_tipo'} onValueChange={(v) => setFiltroTipo(v === 'todos_tipo' ? '' : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos_tipo">Todos</SelectItem>{TIPOS_ANIMAIS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Sexo</Label><Select value={filtroSexo || 'todos_sexo'} onValueChange={(v) => setFiltroSexo(v === 'todos_sexo' ? '' : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos_sexo">Todos</SelectItem>{SEXOS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
            <div><Label className="text-xs">Status</Label><Select value={filtroStatus || 'todos_status'} onValueChange={(v) => setFiltroStatus(v === 'todos_status' ? '' : v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="todos_status">Todos</SelectItem><SelectItem value="ativo">Ativo</SelectItem><SelectItem value="venda">Vendido</SelectItem><SelectItem value="morte">Morto</SelectItem><SelectItem value="perda">Perdido</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs">Idade minima (meses)</Label><Input type="number" min="0" value={filtroIdadeMin} onChange={(e) => setFiltroIdadeMin(e.target.value)} placeholder="0" /></div>
            <div><Label className="text-xs">Idade maxima (meses)</Label><Input type="number" min="0" value={filtroIdadeMax} onChange={(e) => setFiltroIdadeMax(e.target.value)} placeholder="999" /></div>
            <div className="flex items-end"><Button variant="outline" onClick={limparFiltros} className="w-full">Limpar</Button></div>
          </div>
        )}
      </div>

      {/* Acoes em massa */}
      {selecionados.size > 0 && (
        <div className="bg-[#E8F0E6] border border-[#4A6741]/30 rounded-lg p-4 mb-4 flex flex-wrap items-center gap-3 fade-in" data-testid="acoes-massa">
          <span className="text-[#1B2620] font-medium">{selecionados.size} selecionado(s)</span>
          <Dialog open={dialogEventoOpen} onOpenChange={(open) => { setDialogEventoOpen(open); if (!open) resetEventoForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="evento-massa-btn">
                <Syringe size={18} className="mr-2" /> Registrar Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="evento-massa-dialog">
              <DialogHeader><DialogTitle>Evento em Massa ({selecionados.size} animais)</DialogTitle></DialogHeader>
              <form onSubmit={handleEventoEmMassa} className="space-y-4">
                <div><Label>Tipo de Evento *</Label><Select value={formEvento.tipo} onValueChange={(v) => setFormEvento({...formEvento, tipo: v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent>{TIPOS_EVENTOS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Data *</Label><Input type="date" value={formEvento.data} onChange={(e) => setFormEvento({...formEvento, data: e.target.value})} required /></div>
                {formEvento.tipo === 'pesagem' && <div><Label>Peso (kg)</Label><Input type="number" step="0.01" value={formEvento.peso} onChange={(e) => setFormEvento({...formEvento, peso: e.target.value})} /></div>}
                {formEvento.tipo === 'vacinacao' && <div><Label>Vacina</Label><Input value={formEvento.vacina} onChange={(e) => setFormEvento({...formEvento, vacina: e.target.value})} /></div>}
                <div><Label>Detalhes</Label><Input value={formEvento.detalhes} onChange={(e) => setFormEvento({...formEvento, detalhes: e.target.value})} /></div>
                <div className="flex gap-2 justify-end"><Button type="button" variant="outline" onClick={() => setDialogEventoOpen(false)}>Cancelar</Button><Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white">Aplicar a {selecionados.size} animais</Button></div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="border-[#C25934] text-[#C25934] hover:bg-red-50" onClick={handleDeleteEmMassa} data-testid="delete-massa-btn">
            <Trash size={18} className="mr-2" /> Excluir Selecionados
          </Button>
          <Button variant="outline" onClick={() => setSelecionados(new Set())}>Limpar Selecao</Button>
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden" data-testid="animais-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F3F0] border-b border-[#E5E3DB]">
              <tr>
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleSelecionarTodos} className="text-[#4A6741]" data-testid="select-all-btn">
                    {todosSelec ? <CheckSquare size={20} weight="fill" /> : <Square size={20} />}
                  </button>
                </th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Tag</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Tipo</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Sexo</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Idade</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Genitora</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Peso</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Status</th>
                <th className="px-4 py-4 font-semibold text-[#1B2620]">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {animaisFiltrados.length === 0 ? (
                <tr><td colSpan="9" className="px-6 py-12 text-center text-[#7A8780]">Nenhum animal encontrado</td></tr>
              ) : animaisFiltrados.map((animal) => (
                <tr key={animal.id} className={`table-row border-b border-[#E5E3DB] hover:bg-[#FDFCFB] ${selecionados.has(animal.id) ? 'bg-[#E8F0E6]' : ''}`}>
                  <td className="px-4 py-4">
                    <button onClick={() => toggleSelecionar(animal.id)} className="text-[#4A6741]">
                      {selecionados.has(animal.id) ? <CheckSquare size={20} weight="fill" /> : <Square size={20} />}
                    </button>
                  </td>
                  <td className="px-4 py-4 font-medium text-[#1B2620]">{animal.tag}</td>
                  <td className="px-4 py-4 text-[#3A453F]">{animal.tipo}</td>
                  <td className="px-4 py-4 text-[#3A453F]">{animal.sexo === 'macho' ? 'Macho' : animal.sexo === 'femea' ? 'Femea' : '-'}</td>
                  <td className="px-4 py-4 text-[#3A453F]">{formatarIdade(animal.data_nascimento)}</td>
                  <td className="px-4 py-4 text-[#3A453F]">{animal.genitora_id ? getGenitoraTag(animal.genitora_id) : '-'}</td>
                  <td className="px-4 py-4 text-[#3A453F]">{animal.peso_atual ? `${animal.peso_atual} kg` : '-'}</td>
                  <td className="px-4 py-4"><span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(animal.status)}`}>{animal.status}</span></td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEdicao(animal)} className="text-[#4A6741] hover:text-[#3B5334]"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(animal.id)} className="text-[#C25934] hover:text-[#A64B2B]"><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

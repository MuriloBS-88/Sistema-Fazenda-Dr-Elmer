import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash, Pencil, CopySimple } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const TIPOS_ANIMAIS = ['Bovino', 'Suino', 'Ovino', 'Caprino', 'Equino', 'Aves', 'Outros'];
const SEXOS = [{ value: 'macho', label: 'Macho' }, { value: 'femea', label: 'Femea' }];

export default function Animais() {
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogBulkOpen, setDialogBulkOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ tipo: '', tag: '', sexo: '', genitora_id: '', data_nascimento: '', peso_atual: '', observacoes: '' });
  const [formBulk, setFormBulk] = useState({ tipo: '', tag_inicial: '', quantidade: 2, sexo: '', data_nascimento: '', peso_atual: '', observacoes: '' });

  useEffect(() => { carregarAnimais(); }, []);

  const carregarAnimais = async () => {
    try {
      const response = await axios.get(`${API}/animais`);
      setAnimais(response.data);
    } catch (error) { toast.error('Erro ao carregar animais'); }
    finally { setLoading(false); }
  };

  const femeas = animais.filter(a => a.sexo === 'femea' && a.status === 'ativo');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tipo || !formData.tag) { toast.error('Preencha tipo e tag'); return; }
    const payload = {
      ...formData,
      peso_atual: formData.peso_atual ? parseFloat(formData.peso_atual) : null,
      data_nascimento: formData.data_nascimento || null,
      sexo: formData.sexo || null,
      genitora_id: formData.genitora_id && formData.genitora_id !== 'none' ? formData.genitora_id : null
    };
    try {
      if (editando) {
        await axios.put(`${API}/animais/${editando.id}`, payload);
        toast.success('Animal atualizado!');
      } else {
        await axios.post(`${API}/animais`, payload);
        toast.success('Animal cadastrado!');
      }
      setDialogOpen(false); resetForm(); carregarAnimais();
    } catch (error) { toast.error('Erro ao salvar animal'); }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!formBulk.tipo || !formBulk.tag_inicial || !formBulk.quantidade) {
      toast.error('Preencha tipo, tag inicial e quantidade'); return;
    }
    try {
      const payload = {
        ...formBulk,
        quantidade: parseInt(formBulk.quantidade),
        peso_atual: formBulk.peso_atual ? parseFloat(formBulk.peso_atual) : null,
        data_nascimento: formBulk.data_nascimento || null,
        sexo: formBulk.sexo || null
      };
      const response = await axios.post(`${API}/animais/bulk`, payload);
      toast.success(`${response.data.length} animais cadastrados com sucesso!`);
      setDialogBulkOpen(false); resetBulkForm(); carregarAnimais();
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Erro ao cadastrar em massa');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este animal?')) return;
    try { await axios.delete(`${API}/animais/${id}`); toast.success('Animal excluido!'); carregarAnimais(); }
    catch (error) { toast.error('Erro ao excluir animal'); }
  };

  const resetForm = () => { setFormData({ tipo: '', tag: '', sexo: '', genitora_id: '', data_nascimento: '', peso_atual: '', observacoes: '' }); setEditando(null); };
  const resetBulkForm = () => { setFormBulk({ tipo: '', tag_inicial: '', quantidade: 2, sexo: '', data_nascimento: '', peso_atual: '', observacoes: '' }); };

  const abrirEdicao = (animal) => {
    setEditando(animal);
    setFormData({
      tipo: animal.tipo, tag: animal.tag, sexo: animal.sexo || '',
      genitora_id: animal.genitora_id || '', data_nascimento: animal.data_nascimento || '',
      peso_atual: animal.peso_atual || '', observacoes: animal.observacoes || ''
    });
    setDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const badges = { ativo: 'bg-[#3B823E] text-white', venda: 'bg-[#2B6CB0] text-white', morte: 'bg-[#C25934] text-white', perda: 'bg-[#D99B29] text-white', inativo: 'bg-[#7A8780] text-white' };
    return badges[status] || badges.ativo;
  };

  const getGenitoraTag = (id) => {
    const genitora = animais.find(a => a.id === id);
    return genitora ? genitora.tag : '-';
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  return (
    <div className="fade-in" data-testid="animais-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]">Animais</h1>
          <p className="text-lg text-[#7A8780] mt-2">Gerencie o cadastro de animais</p>
        </div>
        <div className="flex gap-2">
          {/* Cadastro em massa */}
          <Dialog open={dialogBulkOpen} onOpenChange={(open) => { setDialogBulkOpen(open); if (!open) resetBulkForm(); }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#4A6741] text-[#4A6741] hover:bg-[#E8F0E6]" data-testid="bulk-animal-btn">
                <CopySimple size={20} className="mr-2" /> Cadastro em Massa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="bulk-animal-dialog">
              <DialogHeader><DialogTitle>Cadastro em Massa</DialogTitle></DialogHeader>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={formBulk.tipo} onValueChange={(v) => setFormBulk({...formBulk, tipo: v})}>
                    <SelectTrigger data-testid="bulk-tipo-select"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_ANIMAIS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tag Inicial * (ex: BOV-001)</Label>
                  <Input value={formBulk.tag_inicial} onChange={(e) => setFormBulk({...formBulk, tag_inicial: e.target.value})} placeholder="BOV-001" required data-testid="bulk-tag-input" />
                  <p className="text-xs text-[#7A8780] mt-1">A tag deve terminar com numero. O sistema gera sequencialmente a partir dela.</p>
                </div>
                <div>
                  <Label>Quantidade *</Label>
                  <Input type="number" min="2" max="500" value={formBulk.quantidade} onChange={(e) => setFormBulk({...formBulk, quantidade: e.target.value})} required data-testid="bulk-quantidade-input" />
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select value={formBulk.sexo || 'none_sexo'} onValueChange={(v) => setFormBulk({...formBulk, sexo: v === 'none_sexo' ? '' : v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none_sexo">Nao informado</SelectItem>
                      {SEXOS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={formBulk.data_nascimento} onChange={(e) => setFormBulk({...formBulk, data_nascimento: e.target.value})} />
                </div>
                <div>
                  <Label>Peso Atual (kg)</Label>
                  <Input type="number" step="0.01" value={formBulk.peso_atual} onChange={(e) => setFormBulk({...formBulk, peso_atual: e.target.value})} />
                </div>
                <div>
                  <Label>Observacoes</Label>
                  <Input value={formBulk.observacoes} onChange={(e) => setFormBulk({...formBulk, observacoes: e.target.value})} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogBulkOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-bulk-btn">Cadastrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Cadastro individual */}
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="add-animal-btn">
                <Plus size={20} className="mr-2" /> Novo Animal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="animal-dialog">
              <DialogHeader><DialogTitle>{editando ? 'Editar Animal' : 'Novo Animal'}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v})}>
                    <SelectTrigger data-testid="tipo-select"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                    <SelectContent>
                      {TIPOS_ANIMAIS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tag/Identificacao *</Label>
                  <Input value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} required data-testid="tag-input" />
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select value={formData.sexo || 'none_sexo'} onValueChange={(v) => setFormData({...formData, sexo: v === 'none_sexo' ? '' : v})}>
                    <SelectTrigger data-testid="sexo-select"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none_sexo">Nao informado</SelectItem>
                      {SEXOS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Genitora (Mae)</Label>
                  <Select value={formData.genitora_id || 'none'} onValueChange={(v) => setFormData({...formData, genitora_id: v === 'none' ? '' : v})}>
                    <SelectTrigger data-testid="genitora-select"><SelectValue placeholder="Selecione a genitora" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {femeas.map(a => <SelectItem key={a.id} value={a.id}>{a.tag} - {a.tipo}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <Input type="date" value={formData.data_nascimento} onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})} data-testid="birth-date-input" />
                </div>
                <div>
                  <Label>Peso Atual (kg)</Label>
                  <Input type="number" step="0.01" value={formData.peso_atual} onChange={(e) => setFormData({...formData, peso_atual: e.target.value})} data-testid="weight-input" />
                </div>
                <div>
                  <Label>Observacoes</Label>
                  <Input value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} data-testid="notes-input" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-animal-btn">{editando ? 'Atualizar' : 'Salvar'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden" data-testid="animais-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F3F0] border-b border-[#E5E3DB]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Tag</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Tipo</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Sexo</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Genitora</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Peso (kg)</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Status</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {animais.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-[#7A8780]">Nenhum animal cadastrado</td></tr>
              ) : animais.map((animal) => (
                <tr key={animal.id} className="table-row border-b border-[#E5E3DB] hover:bg-[#FDFCFB]">
                  <td className="px-6 py-4 font-medium text-[#1B2620]">{animal.tag}</td>
                  <td className="px-6 py-4 text-[#3A453F]">{animal.tipo}</td>
                  <td className="px-6 py-4 text-[#3A453F]">{animal.sexo === 'macho' ? 'Macho' : animal.sexo === 'femea' ? 'Femea' : '-'}</td>
                  <td className="px-6 py-4 text-[#3A453F]">{animal.genitora_id ? getGenitoraTag(animal.genitora_id) : '-'}</td>
                  <td className="px-6 py-4 text-[#3A453F]">{animal.peso_atual || '-'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadge(animal.status)}`}>{animal.status}</span></td>
                  <td className="px-6 py-4">
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

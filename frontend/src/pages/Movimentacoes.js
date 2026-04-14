import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash, Pencil } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIPOS_MOVIMENTACAO = [
  { value: 'entrada', label: 'Entrada de Animal', motivos: ['compra', 'nascimento', 'doacao', 'transferencia'] },
  { value: 'saida', label: 'Saida de Animal', motivos: ['venda', 'morte', 'perda', 'doacao', 'transferencia'] },
  { value: 'producao', label: 'Producao / Servico', motivos: ['leite', 'ovos', 'la', 'mel', 'aluguel_pasto', 'servico_reproducao', 'adubo', 'couro', 'outros'] }
];

const MOTIVO_LABELS = {
  compra: 'Compra', nascimento: 'Nascimento', doacao: 'Doacao', transferencia: 'Transferencia',
  venda: 'Venda', morte: 'Morte', perda: 'Perda',
  leite: 'Leite', ovos: 'Ovos', la: 'La', mel: 'Mel',
  aluguel_pasto: 'Aluguel de Pasto', servico_reproducao: 'Servico de Reproducao',
  adubo: 'Adubo/Esterco', couro: 'Couro', outros: 'Outros'
};

const UNIDADES = [
  { value: 'litros', label: 'Litros' },
  { value: 'kg', label: 'Quilos (kg)' },
  { value: 'unidades', label: 'Unidades' },
  { value: 'duzias', label: 'Duzias' },
  { value: 'toneladas', label: 'Toneladas' },
  { value: 'dias', label: 'Dias' },
  { value: 'meses', label: 'Meses' },
  { value: 'cabecas', label: 'Cabecas' }
];

const TIPOS_ANIMAIS = ['Bovino', 'Suino', 'Ovino', 'Caprino', 'Equino', 'Aves', 'Outros'];

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    tipo: '', motivo: '', animal_id: '', data: new Date().toISOString().split('T')[0],
    valor: '', quantidade: 1, unidade: '', tipo_animal: '', observacoes: ''
  });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [movRes, animaisRes] = await Promise.all([
        axios.get(`${API}/movimentacoes`), axios.get(`${API}/animais?status=ativo`)
      ]);
      setMovimentacoes(movRes.data); setAnimais(animaisRes.data);
    } catch (error) { toast.error('Erro ao carregar dados'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tipo || !formData.motivo) { toast.error('Preencha tipo e motivo'); return; }
    const payload = {
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      quantidade: parseFloat(formData.quantidade) || 1,
      animal_id: formData.animal_id && formData.animal_id !== 'none' ? formData.animal_id : null,
      tipo_animal: formData.tipo_animal || null,
      unidade: formData.unidade && formData.unidade !== 'none_unidade' ? formData.unidade : null
    };
    try {
      if (editando) {
        await axios.delete(`${API}/movimentacoes/${editando.id}`);
        await axios.post(`${API}/movimentacoes`, payload);
        toast.success('Movimentacao atualizada!');
      } else {
        await axios.post(`${API}/movimentacoes`, payload);
        toast.success('Movimentacao registrada!');
      }
      setDialogOpen(false); resetForm(); carregarDados();
    } catch (error) { toast.error('Erro ao salvar movimentacao'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir esta movimentacao?')) return;
    try { await axios.delete(`${API}/movimentacoes/${id}`); toast.success('Movimentacao excluida!'); carregarDados(); }
    catch (error) { toast.error('Erro ao excluir'); }
  };

  const resetForm = () => {
    setFormData({ tipo: '', motivo: '', animal_id: '', data: new Date().toISOString().split('T')[0], valor: '', quantidade: 1, unidade: '', tipo_animal: '', observacoes: '' });
    setEditando(null);
  };

  const abrirEdicao = (mov) => {
    setEditando(mov);
    setFormData({
      tipo: mov.tipo, motivo: mov.motivo, animal_id: mov.animal_id || 'none',
      data: mov.data, valor: mov.valor || '', quantidade: mov.quantidade || 1,
      unidade: mov.unidade || '', tipo_animal: mov.tipo_animal || '', observacoes: mov.observacoes || ''
    });
    setDialogOpen(true);
  };

  const getTipoInfo = () => TIPOS_MOVIMENTACAO.find(t => t.value === formData.tipo);
  const isProducao = formData.tipo === 'producao';
  const isAnimal = formData.tipo === 'entrada' || formData.tipo === 'saida';

  const getTipoBadge = (tipo) => {
    if (tipo === 'entrada') return 'bg-[#3B823E] text-white';
    if (tipo === 'saida') return 'bg-[#C25934] text-white';
    return 'bg-[#2B6CB0] text-white';
  };

  const getTipoLabel = (tipo) => {
    if (tipo === 'entrada') return 'Entrada';
    if (tipo === 'saida') return 'Saida';
    return 'Producao';
  };

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  return (
    <div className="fade-in" data-testid="movimentacoes-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]">Movimentacoes</h1>
          <p className="text-lg text-[#7A8780] mt-2">Registre entradas, saidas e producoes da fazenda</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="add-movimentacao-btn">
              <Plus size={20} className="mr-2" /> Nova Movimentacao
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto" data-testid="movimentacao-dialog">
            <DialogHeader><DialogTitle>{editando ? 'Editar Movimentacao' : 'Nova Movimentacao'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v, motivo: '', animal_id: '', unidade: ''})}>
                  <SelectTrigger data-testid="tipo-select"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_MOVIMENTACAO.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo && (
                <div>
                  <Label>Motivo *</Label>
                  <Select value={formData.motivo} onValueChange={(v) => setFormData({...formData, motivo: v})}>
                    <SelectTrigger data-testid="motivo-select"><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
                    <SelectContent>
                      {getTipoInfo()?.motivos.map(m => <SelectItem key={m} value={m}>{MOTIVO_LABELS[m] || m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isAnimal && (
                <>
                  <div>
                    <Label>Animal (opcional)</Label>
                    <Select value={formData.animal_id || 'none'} onValueChange={(v) => setFormData({...formData, animal_id: v === 'none' ? '' : v})}>
                      <SelectTrigger data-testid="animal-select"><SelectValue placeholder="Selecione um animal" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {animais.map(a => <SelectItem key={a.id} value={a.id}>{a.tag} - {a.tipo}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {(!formData.animal_id || formData.animal_id === 'none') && (
                    <div>
                      <Label>Tipo de Animal</Label>
                      <Select value={formData.tipo_animal || 'none_tipo'} onValueChange={(v) => setFormData({...formData, tipo_animal: v === 'none_tipo' ? '' : v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none_tipo">Nenhum</SelectItem>
                          {TIPOS_ANIMAIS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div>
                <Label>Data *</Label>
                <Input type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required data-testid="data-input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" step="0.01" min="0" value={formData.quantidade} onChange={(e) => setFormData({...formData, quantidade: e.target.value})} data-testid="quantidade-input" />
                </div>
                {isProducao && (
                  <div>
                    <Label>Unidade</Label>
                    <Select value={formData.unidade || 'none_unidade'} onValueChange={(v) => setFormData({...formData, unidade: v === 'none_unidade' ? '' : v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none_unidade">Nenhuma</SelectItem>
                        {UNIDADES.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div>
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={formData.valor} onChange={(e) => setFormData({...formData, valor: e.target.value})} data-testid="valor-input" />
              </div>

              <div>
                <Label>Observacoes</Label>
                <Input value={formData.observacoes} onChange={(e) => setFormData({...formData, observacoes: e.target.value})} data-testid="observacoes-input" />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-movimentacao-btn">{editando ? 'Atualizar' : 'Salvar'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden" data-testid="movimentacoes-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F3F0] border-b border-[#E5E3DB]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Data</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Tipo</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Motivo</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Detalhe</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Qtd</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Valor</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-[#7A8780]">Nenhuma movimentacao registrada</td></tr>
              ) : movimentacoes.map((mov) => {
                const animal = animais.find(a => a.id === mov.animal_id);
                let detalhe = '-';
                if (animal) detalhe = `${animal.tag} (${animal.tipo})`;
                else if (mov.tipo_animal) detalhe = mov.tipo_animal;
                else if (mov.tipo === 'producao') detalhe = MOTIVO_LABELS[mov.motivo] || mov.motivo;

                const qtdLabel = mov.quantidade ? `${mov.quantidade}${mov.unidade ? ' ' + mov.unidade : ''}` : '-';

                return (
                  <tr key={mov.id} className="table-row border-b border-[#E5E3DB] hover:bg-[#FDFCFB]">
                    <td className="px-6 py-4 text-[#3A453F]">{new Date(mov.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-md text-xs font-medium ${getTipoBadge(mov.tipo)}`}>{getTipoLabel(mov.tipo)}</span></td>
                    <td className="px-6 py-4 text-[#3A453F]">{MOTIVO_LABELS[mov.motivo] || mov.motivo}</td>
                    <td className="px-6 py-4 text-[#3A453F]">{detalhe}</td>
                    <td className="px-6 py-4 text-[#3A453F]">{qtdLabel}</td>
                    <td className="px-6 py-4 text-[#3A453F]">{mov.valor ? `R$ ${mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => abrirEdicao(mov)} className="text-[#4A6741] hover:text-[#3B5334]"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(mov.id)} className="text-[#C25934] hover:text-[#A64B2B]"><Trash size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

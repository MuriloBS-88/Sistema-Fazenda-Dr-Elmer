import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TIPOS_MOVIMENTACAO = [
  { value: 'entrada', label: 'Entrada', motivos: ['compra', 'nascimento', 'doação'] },
  { value: 'saida', label: 'Saída', motivos: ['venda', 'morte', 'perda', 'doação'] }
];

const TIPOS_ANIMAIS = ['Bovino', 'Suíno', 'Ovino', 'Caprino', 'Equino', 'Aves', 'Outros'];

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '',
    motivo: '',
    animal_id: '',
    data: new Date().toISOString().split('T')[0],
    valor: '',
    quantidade: 1,
    tipo_animal: '',
    observacoes: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [movRes, animaisRes] = await Promise.all([
        axios.get(`${API}/movimentacoes`),
        axios.get(`${API}/animais?status=ativo`)
      ]);
      setMovimentacoes(movRes.data);
      setAnimais(animaisRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.tipo || !formData.motivo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    const payload = {
      ...formData,
      valor: formData.valor ? parseFloat(formData.valor) : null,
      quantidade: parseInt(formData.quantidade),
      animal_id: formData.animal_id && formData.animal_id !== "none" ? formData.animal_id : null,
      tipo_animal: formData.tipo_animal || null
    };

    try {
      await axios.post(`${API}/movimentacoes`, payload);
      toast.success('Movimentação registrada com sucesso!');
      setDialogOpen(false);
      resetForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
      toast.error('Erro ao salvar movimentação');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta movimentação?')) return;
    
    try {
      await axios.delete(`${API}/movimentacoes/${id}`);
      toast.success('Movimentação excluída com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      toast.error('Erro ao excluir movimentação');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      motivo: '',
      animal_id: '',
      data: new Date().toISOString().split('T')[0],
      valor: '',
      quantidade: 1,
      tipo_animal: '',
      observacoes: ''
    });
  };

  const getTipoInfo = () => {
    return TIPOS_MOVIMENTACAO.find(t => t.value === formData.tipo);
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'entrada' 
      ? 'bg-[#3B823E] text-white' 
      : 'bg-[#C25934] text-white';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="fade-in" data-testid="movimentacoes-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]" data-testid="movimentacoes-title">
            Movimentações
          </h1>
          <p className="text-lg text-[#7A8780] mt-2">Registre entradas e saídas de animais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="add-movimentacao-btn">
              <Plus size={20} className="mr-2" />
              Nova Movimentação
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="movimentacao-dialog">
            <DialogHeader>
              <DialogTitle>Nova Movimentação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value, motivo: ''})} required>
                  <SelectTrigger data-testid="tipo-select">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_MOVIMENTACAO.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.tipo && (
                <div>
                  <Label htmlFor="motivo">Motivo *</Label>
                  <Select value={formData.motivo} onValueChange={(value) => setFormData({...formData, motivo: value})} required>
                    <SelectTrigger data-testid="motivo-select">
                      <SelectValue placeholder="Selecione o motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {getTipoInfo()?.motivos.map(motivo => (
                        <SelectItem key={motivo} value={motivo}>{motivo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="animal_id">Animal (opcional)</Label>
                <Select value={formData.animal_id || "none"} onValueChange={(value) => setFormData({...formData, animal_id: value === "none" ? "" : value})}>
                  <SelectTrigger data-testid="animal-select">
                    <SelectValue placeholder="Selecione um animal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {animais.map(animal => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.tag} - {animal.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!formData.animal_id || formData.animal_id === "none") && (
                <>
                  <div>
                    <Label htmlFor="tipo_animal">Tipo de Animal</Label>
                    <Select value={formData.tipo_animal} onValueChange={(value) => setFormData({...formData, tipo_animal: value})}>
                      <SelectTrigger data-testid="tipo-animal-select">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_ANIMAIS.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      min="1"
                      value={formData.quantidade}
                      onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                      data-testid="quantidade-input"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({...formData, data: e.target.value})}
                  required
                  data-testid="data-input"
                />
              </div>
              
              <div>
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  data-testid="valor-input"
                />
              </div>
              
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  data-testid="observacoes-input"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="cancel-btn">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-movimentacao-btn">
                  Salvar
                </Button>
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
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Animal/Tipo</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Qtd</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Valor</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#7A8780]">
                    Nenhuma movimentação registrada
                  </td>
                </tr>
              ) : (
                movimentacoes.map((mov) => {
                  const animal = animais.find(a => a.id === mov.animal_id);
                  return (
                    <tr key={mov.id} className="table-row border-b border-[#E5E3DB] hover:bg-[#FDFCFB]" data-testid={`movimentacao-row-${mov.id}`}>
                      <td className="px-6 py-4 text-[#3A453F]">
                        {new Date(mov.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTipoBadge(mov.tipo)}`}>
                          {mov.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#3A453F]">{mov.motivo}</td>
                      <td className="px-6 py-4 text-[#3A453F]">
                        {animal ? `${animal.tag} (${animal.tipo})` : mov.tipo_animal || '-'}
                      </td>
                      <td className="px-6 py-4 text-[#3A453F]">{mov.quantidade}</td>
                      <td className="px-6 py-4 text-[#3A453F]">
                        {mov.valor ? `R$ ${mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(mov.id)}
                          className="text-[#C25934] hover:text-[#A64B2B]"
                          data-testid={`delete-movimentacao-${mov.id}`}
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

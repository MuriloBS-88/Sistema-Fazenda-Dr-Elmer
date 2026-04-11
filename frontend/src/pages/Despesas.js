import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash, Tag } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Despesas() {
  const [despesas, setDespesas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogDespesaOpen, setDialogDespesaOpen] = useState(false);
  const [dialogCategoriaOpen, setDialogCategoriaOpen] = useState(false);
  const [formDespesa, setFormDespesa] = useState({
    categoria_id: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });
  const [formCategoria, setFormCategoria] = useState({
    nome: '',
    cor: '#4A6741'
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [despesasRes, categoriasRes] = await Promise.all([
        axios.get(`${API}/despesas`),
        axios.get(`${API}/categorias`)
      ]);
      setDespesas(despesasRes.data);
      setCategorias(categoriasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDespesa = async (e) => {
    e.preventDefault();
    
    if (!formDespesa.categoria_id || !formDespesa.valor) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    const payload = {
      ...formDespesa,
      valor: parseFloat(formDespesa.valor)
    };

    try {
      await axios.post(`${API}/despesas`, payload);
      toast.success('Despesa registrada com sucesso!');
      setDialogDespesaOpen(false);
      resetFormDespesa();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast.error('Erro ao salvar despesa');
    }
  };

  const handleSubmitCategoria = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post(`${API}/categorias`, formCategoria);
      toast.success('Categoria criada com sucesso!');
      setDialogCategoriaOpen(false);
      resetFormCategoria();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDeleteDespesa = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      await axios.delete(`${API}/despesas/${id}`);
      toast.success('Despesa excluída com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa');
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      await axios.delete(`${API}/categorias/${id}`);
      toast.success('Categoria excluída com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const resetFormDespesa = () => {
    setFormDespesa({
      categoria_id: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      descricao: ''
    });
  };

  const resetFormCategoria = () => {
    setFormCategoria({
      nome: '',
      cor: '#4A6741'
    });
  };

  const getCategoriaById = (id) => {
    return categorias.find(c => c.id === id);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="fade-in" data-testid="despesas-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]" data-testid="despesas-title">
            Despesas
          </h1>
          <p className="text-lg text-[#7A8780] mt-2">Controle os custos da fazenda</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogCategoriaOpen} onOpenChange={(open) => {
            setDialogCategoriaOpen(open);
            if (!open) resetFormCategoria();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#4A6741] text-[#4A6741] hover:bg-[#E8F0E6]" data-testid="add-categoria-btn">
                <Tag size={20} className="mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="categoria-dialog">
              <DialogHeader>
                <DialogTitle>Nova Categoria</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitCategoria} className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formCategoria.nome}
                    onChange={(e) => setFormCategoria({...formCategoria, nome: e.target.value})}
                    required
                    data-testid="categoria-nome-input"
                  />
                </div>
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="cor"
                      type="color"
                      value={formCategoria.cor}
                      onChange={(e) => setFormCategoria({...formCategoria, cor: e.target.value})}
                      className="w-20 h-10"
                      data-testid="categoria-cor-input"
                    />
                    <span className="text-sm text-[#7A8780]">{formCategoria.cor}</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogCategoriaOpen(false)} data-testid="cancel-categoria-btn">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-categoria-btn">
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogDespesaOpen} onOpenChange={(open) => {
            setDialogDespesaOpen(open);
            if (!open) resetFormDespesa();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="add-despesa-btn">
                <Plus size={20} className="mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent data-testid="despesa-dialog">
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitDespesa} className="space-y-4">
                <div>
                  <Label htmlFor="categoria_id">Categoria *</Label>
                  <Select value={formDespesa.categoria_id} onValueChange={(value) => setFormDespesa({...formDespesa, categoria_id: value})} required>
                    <SelectTrigger data-testid="categoria-select">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formDespesa.valor}
                    onChange={(e) => setFormDespesa({...formDespesa, valor: e.target.value})}
                    required
                    data-testid="valor-input"
                  />
                </div>
                <div>
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formDespesa.data}
                    onChange={(e) => setFormDespesa({...formDespesa, data: e.target.value})}
                    required
                    data-testid="data-input"
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formDespesa.descricao}
                    onChange={(e) => setFormDespesa({...formDespesa, descricao: e.target.value})}
                    data-testid="descricao-input"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogDespesaOpen(false)} data-testid="cancel-despesa-btn">
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-despesa-btn">
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="despesas" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="despesas" data-testid="tab-despesas">Despesas</TabsTrigger>
          <TabsTrigger value="categorias" data-testid="tab-categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="despesas">
          <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden" data-testid="despesas-table">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F4F3F0] border-b border-[#E5E3DB]">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-[#1B2620]">Data</th>
                    <th className="px-6 py-4 font-semibold text-[#1B2620]">Categoria</th>
                    <th className="px-6 py-4 font-semibold text-[#1B2620]">Descrição</th>
                    <th className="px-6 py-4 font-semibold text-[#1B2620]">Valor</th>
                    <th className="px-6 py-4 font-semibold text-[#1B2620]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-[#7A8780]">
                        Nenhuma despesa registrada
                      </td>
                    </tr>
                  ) : (
                    despesas.map((despesa) => {
                      const categoria = getCategoriaById(despesa.categoria_id);
                      return (
                        <tr key={despesa.id} className="table-row border-b border-[#E5E3DB] hover:bg-[#FDFCFB]" data-testid={`despesa-row-${despesa.id}`}>
                          <td className="px-6 py-4 text-[#3A453F]">
                            {new Date(despesa.data).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4">
                            {categoria && (
                              <span 
                                className="px-2 py-1 rounded-md text-xs font-medium text-white"
                                style={{ backgroundColor: categoria.cor }}
                              >
                                {categoria.nome}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[#3A453F]">{despesa.descricao || '-'}</td>
                          <td className="px-6 py-4 text-[#3A453F] font-medium">
                            R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteDespesa(despesa.id)}
                              className="text-[#C25934] hover:text-[#A64B2B]"
                              data-testid={`delete-despesa-${despesa.id}`}
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
        </TabsContent>

        <TabsContent value="categorias">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="categorias-grid">
            {categorias.length === 0 ? (
              <div className="col-span-full text-center py-12 text-[#7A8780]">
                Nenhuma categoria cadastrada
              </div>
            ) : (
              categorias.map((categoria) => (
                <div 
                  key={categoria.id} 
                  className="bg-white rounded-lg border border-[#E5E3DB] p-6 flex items-center justify-between hover:shadow-lg transition-shadow"
                  data-testid={`categoria-card-${categoria.nome}`}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg"
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <span className="text-[#1B2620] font-medium">{categoria.nome}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategoria(categoria.id)}
                    className="text-[#C25934] hover:text-[#A64B2B]"
                    data-testid={`delete-categoria-${categoria.nome}`}
                  >
                    <Trash size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

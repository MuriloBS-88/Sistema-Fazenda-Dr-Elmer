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

const TIPOS_EVENTOS = [
  { value: 'nascimento', label: 'Nascimento' },
  { value: 'desmame', label: 'Desmame' },
  { value: 'vacinacao', label: 'Vacinação' },
  { value: 'pesagem', label: 'Pesagem' },
  { value: 'tratamento', label: 'Tratamento' }
];

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tipo: '',
    animal_id: '',
    data: new Date().toISOString().split('T')[0],
    detalhes: '',
    peso: '',
    vacina: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [eventosRes, animaisRes] = await Promise.all([
        axios.get(`${API}/eventos`),
        axios.get(`${API}/animais?status=ativo`)
      ]);
      setEventos(eventosRes.data);
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
    
    if (!formData.tipo || !formData.animal_id) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    
    const payload = {
      ...formData,
      peso: formData.peso ? parseFloat(formData.peso) : null,
      vacina: formData.vacina || null,
      detalhes: formData.detalhes || ''
    };

    try {
      await axios.post(`${API}/eventos`, payload);
      toast.success('Evento registrado com sucesso!');
      setDialogOpen(false);
      resetForm();
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error('Erro ao salvar evento');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    
    try {
      await axios.delete(`${API}/eventos/${id}`);
      toast.success('Evento excluído com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: '',
      animal_id: '',
      data: new Date().toISOString().split('T')[0],
      detalhes: '',
      peso: '',
      vacina: ''
    });
  };

  const getTipoBadge = (tipo) => {
    const badges = {
      nascimento: 'bg-[#3B823E] text-white',
      desmame: 'bg-[#2B6CB0] text-white',
      vacinacao: 'bg-[#D99B29] text-white',
      pesagem: 'bg-[#4A6741] text-white',
      tratamento: 'bg-[#C25934] text-white'
    };
    return badges[tipo] || 'bg-[#7A8780] text-white';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="fade-in" data-testid="eventos-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]" data-testid="eventos-title">
            Eventos
          </h1>
          <p className="text-lg text-[#7A8780] mt-2">Registre nascimentos, vacinações, pesagens e mais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="add-evento-btn">
              <Plus size={20} className="mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent data-testid="evento-dialog">
            <DialogHeader>
              <DialogTitle>Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="tipo">Tipo de Evento *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})} required>
                  <SelectTrigger data-testid="tipo-select">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_EVENTOS.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="animal_id">Animal *</Label>
                <Select value={formData.animal_id} onValueChange={(value) => setFormData({...formData, animal_id: value})} required>
                  <SelectTrigger data-testid="animal-select">
                    <SelectValue placeholder="Selecione um animal" />
                  </SelectTrigger>
                  <SelectContent>
                    {animais.map(animal => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.tag} - {animal.tipo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

              {formData.tipo === 'pesagem' && (
                <div>
                  <Label htmlFor="peso">Peso (kg) *</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.01"
                    value={formData.peso}
                    onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    required
                    data-testid="peso-input"
                  />
                </div>
              )}

              {formData.tipo === 'vacinacao' && (
                <div>
                  <Label htmlFor="vacina">Vacina *</Label>
                  <Input
                    id="vacina"
                    value={formData.vacina}
                    onChange={(e) => setFormData({...formData, vacina: e.target.value})}
                    required
                    data-testid="vacina-input"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="detalhes">Detalhes</Label>
                <Input
                  id="detalhes"
                  value={formData.detalhes}
                  onChange={(e) => setFormData({...formData, detalhes: e.target.value})}
                  data-testid="detalhes-input"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="cancel-btn">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid="save-evento-btn">
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-[#E5E3DB] overflow-hidden" data-testid="eventos-table">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4F3F0] border-b border-[#E5E3DB]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Data</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Tipo</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Animal</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Detalhes</th>
                <th className="px-6 py-4 font-semibold text-[#1B2620]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#7A8780]">
                    Nenhum evento registrado
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => {
                  const animal = animais.find(a => a.id === evento.animal_id);
                  let detalhesTexto = evento.detalhes;
                  if (evento.tipo === 'pesagem' && evento.peso) {
                    detalhesTexto = `${evento.peso} kg${detalhesTexto ? ' - ' + detalhesTexto : ''}`;
                  } else if (evento.tipo === 'vacinacao' && evento.vacina) {
                    detalhesTexto = `${evento.vacina}${detalhesTexto ? ' - ' + detalhesTexto : ''}`;
                  }
                  
                  return (
                    <tr key={evento.id} className="table-row border-b border-[#E5E3DB] hover:bg-[#FDFCFB]" data-testid={`evento-row-${evento.id}`}>
                      <td className="px-6 py-4 text-[#3A453F]">
                        {new Date(evento.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTipoBadge(evento.tipo)}`}>
                          {TIPOS_EVENTOS.find(t => t.value === evento.tipo)?.label || evento.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#3A453F]">
                        {animal ? `${animal.tag} (${animal.tipo})` : '-'}
                      </td>
                      <td className="px-6 py-4 text-[#3A453F]">{detalhesTexto || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(evento.id)}
                          className="text-[#C25934] hover:text-[#A64B2B]"
                          data-testid={`delete-evento-${evento.id}`}
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

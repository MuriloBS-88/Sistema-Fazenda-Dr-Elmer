import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash, X, Check, ArrowLeft } from '@phosphor-icons/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SelectEditavel({ campo, value, onValueChange, placeholder, opcoesPadrao = [], allowNone = false, noneLabel = 'Nenhum' }) {
  const [opcoes, setOpcoes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaOpcao, setNovaOpcao] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoValor, setEditandoValor] = useState('');

  useEffect(() => { carregarOpcoes(); }, [campo]);

  const carregarOpcoes = async () => {
    try {
      const res = await axios.get(`${API}/opcoes?campo=${campo}`);
      setOpcoes(res.data);
    } catch (e) { /* silencioso */ }
  };

  const todasOpcoes = [...opcoesPadrao, ...opcoes.map(o => o.valor)];
  const opcoesUnicas = [...new Set(todasOpcoes)];

  const handleAdicionar = async () => {
    if (!novaOpcao.trim()) return;
    if (opcoesUnicas.includes(novaOpcao.trim())) { toast.error('Opcao ja existe'); return; }
    try {
      await axios.post(`${API}/opcoes`, { campo, valor: novaOpcao.trim() });
      setNovaOpcao(''); carregarOpcoes();
      toast.success('Opcao adicionada!');
    } catch (e) { toast.error('Erro ao adicionar'); }
  };

  const handleEditar = async (id) => {
    if (!editandoValor.trim()) return;
    try {
      await axios.put(`${API}/opcoes/${id}`, { campo, valor: editandoValor.trim() });
      setEditandoId(null); setEditandoValor(''); carregarOpcoes();
      toast.success('Opcao atualizada!');
    } catch (e) { toast.error('Erro ao editar'); }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm('Excluir esta opcao?')) return;
    try {
      await axios.delete(`${API}/opcoes/${id}`);
      carregarOpcoes(); toast.success('Opcao removida!');
    } catch (e) { toast.error('Erro ao remover'); }
  };

  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Select value={value || (allowNone ? `none_${campo}` : '')} onValueChange={(v) => onValueChange(v === `none_${campo}` ? '' : v)}>
            <SelectTrigger data-testid={`${campo}-select`}><SelectValue placeholder={placeholder} /></SelectTrigger>
            <SelectContent>
              {allowNone && <SelectItem value={`none_${campo}`}>{noneLabel}</SelectItem>}
              {opcoesUnicas.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="h-9 px-2 border-[#4A6741] text-[#4A6741] hover:bg-[#E8F0E6]" data-testid={`add-opcao-${campo}`}>
          <Plus size={16} />
        </Button>
      </div>

      {/* Dialog de gerenciamento de opcoes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-testid={`opcoes-dialog-${campo}`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <button onClick={() => setDialogOpen(false)} className="text-[#7A8780] hover:text-[#1B2620]"><ArrowLeft size={20} /></button>
              Gerenciar Opcoes
            </DialogTitle>
          </DialogHeader>

          {/* Adicionar nova */}
          <div className="flex gap-2">
            <Input
              value={novaOpcao}
              onChange={(e) => setNovaOpcao(e.target.value)}
              placeholder="Digite nova opcao..."
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionar(); } }}
              data-testid={`nova-opcao-input-${campo}`}
            />
            <Button type="button" onClick={handleAdicionar} className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid={`salvar-opcao-${campo}`}>
              <Plus size={18} className="mr-1" /> Adicionar
            </Button>
          </div>

          {/* Lista de opcoes */}
          <div className="border border-[#E5E3DB] rounded-lg divide-y divide-[#E5E3DB] max-h-64 overflow-y-auto">
            {/* Opcoes padrao (nao editaveis) */}
            {opcoesPadrao.map(op => (
              <div key={`padrao-${op}`} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-[#3A453F]">{op}</span>
                <span className="text-[10px] text-[#7A8780] uppercase tracking-wider bg-[#F4F3F0] px-2 py-0.5 rounded">padrao</span>
              </div>
            ))}

            {/* Opcoes personalizadas (editaveis) */}
            {opcoes.map(op => (
              <div key={op.id} className="flex items-center justify-between px-4 py-3">
                {editandoId === op.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editandoValor}
                      onChange={(e) => setEditandoValor(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditar(op.id); } }}
                      autoFocus
                    />
                    <button onClick={() => handleEditar(op.id)} className="text-[#3B823E] hover:text-[#2E6831] p-1"><Check size={18} /></button>
                    <button onClick={() => { setEditandoId(null); setEditandoValor(''); }} className="text-[#7A8780] p-1"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-[#1B2620] font-medium">{op.valor}</span>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditandoId(op.id); setEditandoValor(op.valor); }} className="text-[#4A6741] hover:text-[#3B5334] p-1"><Pencil size={16} /></button>
                      <button onClick={() => handleDeletar(op.id)} className="text-[#C25934] hover:text-[#A64B2B] p-1"><Trash size={16} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {opcoesPadrao.length === 0 && opcoes.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-[#7A8780]">Nenhuma opcao cadastrada</div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="button" onClick={() => setDialogOpen(false)} className="bg-[#4A6741] hover:bg-[#3B5334] text-white" data-testid={`fechar-opcoes-${campo}`}>
              Concluido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

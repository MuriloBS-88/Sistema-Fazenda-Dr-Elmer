import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash, X, Check } from '@phosphor-icons/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SelectEditavel({ campo, value, onValueChange, placeholder, opcoesPadrao = [], allowNone = false, noneLabel = 'Nenhum' }) {
  const [opcoes, setOpcoes] = useState([]);
  const [novaOpcao, setNovaOpcao] = useState('');
  const [adicionando, setAdicionando] = useState(false);
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
      setNovaOpcao(''); setAdicionando(false); carregarOpcoes();
      toast.success('Opcao adicionada!');
    } catch (e) { toast.error('Erro ao adicionar'); }
  };

  const handleEditar = async (id) => {
    if (!editandoValor.trim()) return;
    try {
      await axios.put(`${API}/opcoes/${id}`, { campo, valor: editandoValor.trim() });
      setEditandoId(null); carregarOpcoes();
      toast.success('Opcao atualizada!');
    } catch (e) { toast.error('Erro ao editar'); }
  };

  const handleDeletar = async (id) => {
    try {
      await axios.delete(`${API}/opcoes/${id}`);
      carregarOpcoes(); toast.success('Opcao removida!');
    } catch (e) { toast.error('Erro ao remover'); }
  };

  return (
    <div className="space-y-2">
      <Select value={value || (allowNone ? `none_${campo}` : '')} onValueChange={(v) => onValueChange(v === `none_${campo}` ? '' : v)}>
        <SelectTrigger data-testid={`${campo}-select`}><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {allowNone && <SelectItem value={`none_${campo}`}>{noneLabel}</SelectItem>}
          {opcoesUnicas.map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Adicionar nova opcao inline */}
      <div className="flex gap-1">
        {adicionando ? (
          <>
            <Input
              value={novaOpcao}
              onChange={(e) => setNovaOpcao(e.target.value)}
              placeholder="Nova opcao..."
              className="h-8 text-xs"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdicionar(); } }}
              autoFocus
            />
            <button onClick={handleAdicionar} className="text-[#3B823E] hover:text-[#2E6831] p-1"><Check size={16} /></button>
            <button onClick={() => { setAdicionando(false); setNovaOpcao(''); }} className="text-[#C25934] hover:text-[#A64B2B] p-1"><X size={16} /></button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setAdicionando(true)}
            className="text-xs text-[#4A6741] hover:text-[#3B5334] flex items-center gap-1"
            data-testid={`add-opcao-${campo}`}
          >
            <Plus size={14} /> Adicionar opcao
          </button>
        )}
      </div>

      {/* Lista de opcoes personalizadas para editar/remover */}
      {opcoes.length > 0 && (
        <div className="border border-[#E5E3DB] rounded p-2 space-y-1 max-h-32 overflow-y-auto">
          <p className="text-[10px] text-[#7A8780] uppercase tracking-wider">Opcoes personalizadas:</p>
          {opcoes.map(op => (
            <div key={op.id} className="flex items-center gap-1 text-xs">
              {editandoId === op.id ? (
                <>
                  <Input value={editandoValor} onChange={(e) => setEditandoValor(e.target.value)} className="h-6 text-xs flex-1" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditar(op.id); } }} autoFocus />
                  <button onClick={() => handleEditar(op.id)} className="text-[#3B823E] p-0.5"><Check size={14} /></button>
                  <button onClick={() => setEditandoId(null)} className="text-[#7A8780] p-0.5"><X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-[#3A453F]">{op.valor}</span>
                  <button onClick={() => { setEditandoId(op.id); setEditandoValor(op.valor); }} className="text-[#4A6741] p-0.5"><Pencil size={14} /></button>
                  <button onClick={() => handleDeletar(op.id)} className="text-[#C25934] p-0.5"><Trash size={14} /></button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

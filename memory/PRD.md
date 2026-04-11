# PRD - Sistema de Gestão de Fazenda

## Problem Statement
App para gestão de animais de fazenda e controle de despesas. Focado em manejo de gado, com cadastro e manejo. Registrar entrada e saída (compra, venda, perda). Registrar morte, desmame, parto, vacinação, pesagem. Ambiente dedicado para lançamentos de custo. Dashboard com total de animais, resumo do lucro e despesas.

## User Personas
- Fazendeiro / Produtor rural sem conhecimento técnico que precisa gerenciar o rebanho e finanças da fazenda pelo celular ou computador.

## Core Requirements
- Sem autenticação (acesso direto)
- Múltiplos tipos de animais (Bovino, Suíno, Ovino, Caprino, Equino, Aves)
- Categorias de despesas personalizadas
- Relatórios PDF e Excel
- Visual moderno, profissional e responsivo para gestão rural

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI + Phosphor Icons + Recharts
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Relatórios**: reportlab (PDF) + openpyxl (Excel)

## What's Been Implemented (2026-04-11)
- Dashboard com métricas (total animais, ativos, receitas, despesas, lucro) e gráficos
- CRUD completo de Animais (tipo, tag, nascimento, peso, status)
- Movimentações de entrada/saída (compra, venda, morte, perda, doação)
- Eventos (nascimento, desmame, vacinação, pesagem, tratamento)
- Despesas com categorias personalizadas
- Exportação de relatórios PDF e Excel
- Sidebar responsiva com menu hamburger para mobile
- Design com cores orgânicas/terrosas (#4A6741 primary)

## Prioritized Backlog
### P0 (Critical)
- Nenhum item pendente

### P1 (High)
- Filtros de data nas listagens
- Busca e pesquisa de animais por tag/tipo

### P2 (Medium)
- Gráficos de evolução de peso dos animais
- Relatórios por período específico
- Backup/restauração de dados

## Next Tasks
- Testar fluxo completo no mobile
- Adicionar filtros e paginação nas tabelas
- Melhorar relatórios com mais detalhes

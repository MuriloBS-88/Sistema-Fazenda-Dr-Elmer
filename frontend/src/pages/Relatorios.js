import React, { useState } from 'react';
import { FilePdf, FileXls, Download } from '@phosphor-icons/react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Relatorios() {
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const handleDownloadPdf = async () => {
    setLoadingPdf(true);
    try {
      const response = await fetch(`${API}/relatorios/pdf`);
      if (!response.ok) throw new Error('Erro ao gerar PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio_fazenda.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Relatório PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao gerar relatório PDF');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoadingExcel(true);
    try {
      const response = await fetch(`${API}/relatorios/excel`);
      if (!response.ok) throw new Error('Erro ao gerar Excel');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio_fazenda.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Relatório Excel gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar Excel:', error);
      toast.error('Erro ao gerar relatório Excel');
    } finally {
      setLoadingExcel(false);
    }
  };

  return (
    <div className="fade-in" data-testid="relatorios-page">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#1B2620]" data-testid="relatorios-title">
          Relatórios
        </h1>
        <p className="text-lg text-[#7A8780] mt-2">Exporte dados da fazenda em PDF ou Excel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Card PDF */}
        <div className="bg-white rounded-lg border border-[#E5E3DB] p-8" data-testid="pdf-export-card">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#C25934]/10 rounded-lg flex items-center justify-center mb-4">
              <FilePdf size={32} weight="duotone" className="text-[#C25934]" />
            </div>
            <h3 className="text-xl font-medium text-[#1B2620] mb-2">Relatório PDF</h3>
            <p className="text-[#7A8780] mb-6">
              Gere um relatório completo em formato PDF com estatísticas da fazenda, resumo de animais e resumo financeiro.
            </p>
            <Button
              onClick={handleDownloadPdf}
              disabled={loadingPdf}
              className="bg-[#C25934] hover:bg-[#A64B2B] text-white w-full"
              data-testid="download-pdf-btn"
            >
              {loadingPdf ? (
                'Gerando...'
              ) : (
                <>
                  <Download size={20} className="mr-2" />
                  Baixar PDF
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Card Excel */}
        <div className="bg-white rounded-lg border border-[#E5E3DB] p-8" data-testid="excel-export-card">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#3B823E]/10 rounded-lg flex items-center justify-center mb-4">
              <FileXls size={32} weight="duotone" className="text-[#3B823E]" />
            </div>
            <h3 className="text-xl font-medium text-[#1B2620] mb-2">Relatório Excel</h3>
            <p className="text-[#7A8780] mb-6">
              Exporte os dados em formato Excel (XLSX) com planilhas separadas para resumo e listagem de animais.
            </p>
            <Button
              onClick={handleDownloadExcel}
              disabled={loadingExcel}
              className="bg-[#3B823E] hover:bg-[#2E6831] text-white w-full"
              data-testid="download-excel-btn"
            >
              {loadingExcel ? (
                'Gerando...'
              ) : (
                <>
                  <Download size={20} className="mr-2" />
                  Baixar Excel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-[#E8F0E6] border border-[#4A6741]/20 rounded-lg p-6 max-w-4xl">
        <h4 className="text-lg font-medium text-[#1B2620] mb-2">Sobre os Relatórios</h4>
        <ul className="space-y-2 text-[#3A453F]">
          <li className="flex items-start gap-2">
            <span className="text-[#4A6741] mt-1">•</span>
            <span>Os relatórios incluem estatísticas atualizadas de animais, movimentações e finanças</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6741] mt-1">•</span>
            <span>O formato PDF é ideal para impressão e apresentação</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6741] mt-1">•</span>
            <span>O formato Excel permite análise detalhada e manipulação dos dados</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#4A6741] mt-1">•</span>
            <span>Os arquivos são gerados instantaneamente com os dados mais recentes</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

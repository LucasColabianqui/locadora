import { useState, useEffect } from 'react';
import { Download, Calendar } from 'tabler-icons-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import './Relatorios.css';

interface Locacao {
  id: number;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoEfetiva?: string;
  valorPrevisto: string;
  valorFinal?: string;
  status: string;
  cliente: any;
  veiculo: any;
}

interface Categoria {
  id: number;
  nome: string;
  tarifaDiaria: string;
}

const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981'];

interface RevenueData {
  month: string;
  revenue: number;
}

interface CategoryData {
  name: string;
  value: number;
}

export default function Relatorios() {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-06-30');
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<RevenueData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    carregarDados();
  }, [dateFrom, dateTo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [locacoesRes, categoriasRes] = await Promise.all([
        api.get('/locacoes'),
        api.get('/categorias')
      ]);

      setLocacoes(locacoesRes.data);
      setCategorias(categoriasRes.data);

      // Gerar dados de receita mensal
      gerarReceita(locacoesRes.data);
      
      // Gerar dados de categoria
      gerarCategoria(locacoesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setLocacoes([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const gerarReceita = (locacoesData: Locacao[]) => {
    const monthlyData: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Inicializar com 0
    monthNames.forEach(month => {
      monthlyData[month] = 0;
    });

    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Somar receita das locações finalizadas no período
    locacoesData.forEach(locacao => {
      if (locacao.status === 'FINALIZADA' && locacao.dataDevolucaoEfetiva) {
        try {
          const date = new Date(locacao.dataDevolucaoEfetiva);
          if (date >= fromDate && date <= toDate) {
            const month = monthNames[date.getMonth()];
            const valor = typeof locacao.valorFinal === 'string'
              ? parseFloat(locacao.valorFinal.replace('R$', '').replace(',', '.'))
              : parseFloat(String(locacao.valorFinal || 0));
            if (!isNaN(valor)) {
              monthlyData[month] += valor;
            }
          }
        } catch (e) {
          console.warn('Erro ao processar data:', e);
        }
      }
    });

    const resultado = monthNames.map(month => ({
      month,
      revenue: monthlyData[month]
    }));

    setMonthlyRevenueData(resultado);
  };

  const gerarCategoria = (locacoesData: Locacao[]) => {
    const categoryCount: { [key: string]: number } = {};
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    // Contar locações por categoria de veículo
    locacoesData.forEach(locacao => {
      if (locacao.status === 'FINALIZADA' && locacao.dataDevolucaoEfetiva) {
        try {
          const date = new Date(locacao.dataDevolucaoEfetiva);
          if (date >= fromDate && date <= toDate) {
            const categoryName = locacao.veiculo?.categoria?.nome || 'Sem categoria';
            categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
          }
        } catch (e) {
          console.warn('Erro ao processar categoria:', e);
        }
      }
    });

    const resultado = Object.entries(categoryCount).map(([name, value]) => ({
      name,
      value
    }));

    setCategoryData(resultado);
  };

  const exportToExcel = () => {
    const headers = ['Mês', 'Receita (R$)'];
    const rows = monthlyRevenueData.map(d => [d.month, d.revenue.toFixed(2)]);

    const categoryHeaders = ['Categoria', 'Locações'];
    const categoryRows = categoryData.map(d => [d.name, d.value]);

    let csvContent = 'Receita Mensal\n';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    csvContent += '\n\nLocações por Categoria\n';
    csvContent += categoryHeaders.join(',') + '\n';
    categoryRows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    const totalReceita = monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalLocacoes = categoryData.reduce((sum, d) => sum + d.value, 0);

    csvContent += '\n\nResumo\n';
    csvContent += `Total de Receita,${totalReceita.toFixed(2)}\n`;
    csvContent += `Total de Locações,${totalLocacoes}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_locadora_${dateFrom}_${dateTo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const totalReceita = monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0);
    const totalLocacoes = categoryData.reduce((sum, d) => sum + d.value, 0);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Locadora</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #3b82f6; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f0f9ff; color: #1e40af; }
          .summary { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .summary p { margin: 5px 0; font-size: 14px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>📊 Relatório de Locações da Locadora</h1>
        <div class="summary">
          <p><strong>Período:</strong> ${dateFrom} a ${dateTo}</p>
          <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <h2>Receita Mensal</h2>
        <table>
          <tr>
            <th>Mês</th>
            <th>Receita (R$)</th>
          </tr>
          ${monthlyRevenueData.map(d => `<tr><td>${d.month}</td><td>R$ ${d.revenue.toFixed(2)}</td></tr>`).join('')}
        </table>

        <h2>Locações por Categoria</h2>
        <table>
          <tr>
            <th>Categoria</th>
            <th>Quantidade de Locações</th>
          </tr>
          ${categoryData.map(d => `<tr><td>${d.name}</td><td>${d.value}</td></tr>`).join('')}
        </table>

        <div class="summary">
          <p><strong>Total de Receita:</strong> R$ ${totalReceita.toFixed(2)}</p>
          <p><strong>Total de Locações:</strong> ${totalLocacoes}</p>
        </div>

        <div class="footer">
          <p>Este é um relatório automático gerado pelo sistema de locação.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    }
  };

  if (loading) {
    return (
      <div className="relatorios-page">
        <div className="page-header">
          <h1>Relatórios</h1>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <h1>Relatórios</h1>
        <p>Analise o desempenho da sua locadora</p>
      </div>

      <div className="filters-section">
        <div className="date-filters">
          <div className="filter-group">
            <label><Calendar size={16} /> De</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label><Calendar size={16} /> Até</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Receita Mensal (R$)</h3>
          <p className="period-info">Período: {dateFrom} a {dateTo}</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip formatter={(value: number | undefined) => value ? `R$ ${value.toFixed(2)}` : 'R$ 0.00'} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Locações por Categoria</h3>
          <p className="period-info">Período: {dateFrom} a {dateTo}</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-box">
          <h4>Total de Receita</h4>
          <p className="stat-value">R$ {monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}</p>
        </div>
        <div className="stat-box">
          <h4>Total de Locações</h4>
          <p className="stat-value">{categoryData.reduce((sum, d) => sum + d.value, 0)}</p>
        </div>
        <div className="stat-box">
          <h4>Receita Média por Locação</h4>
          <p className="stat-value">
            R$ {categoryData.reduce((sum, d) => sum + d.value, 0) > 0 
              ? (monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0) / categoryData.reduce((sum, d) => sum + d.value, 0)).toFixed(2)
              : '0.00'}
          </p>
        </div>
      </div>

      <div className="export-section">
        <h3>Exportar Relatórios</h3>
        <div className="export-buttons">
          <button className="btn-export" onClick={exportToPDF}>
            <Download size={18} />
            Gerar PDF
          </button>
          <button className="btn-export" onClick={exportToExcel}>
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { ChevronRight, Trash, Check } from 'tabler-icons-react';
import './Locacoes.css';
import api from '../services/api';
import AvailabilitySearch, { Veiculo as VeiculoAvailability } from '../components/AvailabilitySearch';
import { getDaysDifference, formatDateBR } from '../utils/dateUtils';

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cnh: string;
}

interface Categoria {
  id: number;
  nome: string;
  tarifaDiaria?: number;
}

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: Categoria;
  status: 'DISPONIVEL' | 'ALUGADO' | 'EM_MANUTENCAO';
}

interface Funcionario {
  id: number;
  nome: string;
  email: string;
}

interface LocacaoAtiva {
  id: number;
  cliente: Cliente;
  veiculo: Veiculo;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoEfetiva: string | null;
  valorPrevisto: number;
  status: 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
}

interface SelectionData {
  clienteId: number | null;
  clienteNome: string;
  veiculoId: number | null;
  veiculoNome: string;
  funcionarioId: number | null;
  funcionarioNome: string;
  dataInicio: string;
  dataFim: string;
  total: number;
}

export default function Locacoes() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tab, setTab] = useState<'criar' | 'gerenciar'>('criar');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [locacoesAtivas, setLocacoesAtivas] = useState<LocacaoAtiva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<SelectionData>({
    clienteId: null,
    clienteNome: '',
    veiculoId: null,
    veiculoNome: '',
    funcionarioId: null,
    funcionarioNome: '',
    dataInicio: '',
    dataFim: '',
    total: 0,
  });
  const [finalizandoId, setFinalizandoId] = useState<number | null>(null);
  const [dataEntrega, setDataEntrega] = useState('');
  const [valorFinal, setValorFinal] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchVeiculos();
    fetchFuncionarios();
    fetchLocacoesAtivas();
  }, []);

  useEffect(() => {
    console.log('🔄 State locacoesAtivas atualizado:', locacoesAtivas.length, 'ativas');
  }, [locacoesAtivas]);

  useEffect(() => {
    // Atualizar locações ativas quando muda de tab
    if (tab === 'gerenciar') {
      fetchLocacoesAtivas();
    }
  }, [tab]);

  const fetchClientes = async () => {
    try {
      const res = await api.get<Cliente[]>('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
      setError('Erro ao buscar clientes');
    }
  };

  const fetchVeiculos = async () => {
    try {
      const res = await api.get<Veiculo[]>('/veiculos');
      const disponiveis = res.data.filter(v => v.status === 'DISPONIVEL');
      setVeiculos(disponiveis);
    } catch (err) {
      console.error('Erro ao buscar veículos', err);
      setError('Erro ao buscar veículos');
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const res = await api.get<Funcionario[]>('/funcionarios');
      setFuncionarios(res.data);
    } catch (err) {
      console.error('Erro ao buscar funcionários', err);
      setError('Erro ao buscar funcionários');
    }
  };

  const fetchLocacoesAtivas = async () => {
    try {
      const res = await api.get<LocacaoAtiva[]>('/locacoes');
      const ativas = res.data.filter(l => l.status === 'ATIVA');
      setLocacoesAtivas(ativas);
      console.log(`✅ Carregadas ${ativas.length} locação(ões) ativa(s)`);
    } catch (err) {
      console.error('❌ Erro ao buscar locações:', err);
      setError('Erro ao buscar locações ativas');
    }
  };

  const handleFinalizarLocacao = async (locacaoId: number) => {
    if (!dataEntrega || !valorFinal) {
      setError('Preencha a data de entrega e o valor final');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/locacoes/${locacaoId}/finalizar`, {
        valorFinal: parseFloat(valorFinal),
      });
      setLocacoesAtivas((prev) => prev.filter(l => l.id !== locacaoId));
      setFinalizandoId(null);
      setDataEntrega('');
      setValorFinal('');
      setError('');
      await fetchVeiculos();
      await fetchLocacoesAtivas();
    } catch (err: any) {
      console.error('Erro ao finalizar locação', err);
      setError(err?.response?.data?.message || 'Erro ao finalizar locação');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarLocacao = async (locacaoId: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta locação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/locacoes/${locacaoId}`);
      setLocacoesAtivas((prev) => prev.filter(l => l.id !== locacaoId));
      setError('');
      await fetchVeiculos();
      await fetchLocacoesAtivas();
    } catch (err: any) {
      console.error('Erro ao cancelar locação', err);
      setError(err?.response?.data?.message || 'Erro ao cancelar locação');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = (dataInicio: string, dataFim: string, veiculoId?: number): number => {
    if (!dataInicio || !dataFim) return 0;
    const dias = getDaysDifference(dataInicio, dataFim);
    
    const id = veiculoId || selection.veiculoId;
    const veiculo = veiculos.find(v => v.id === id);
    const tarifa = Number(veiculo?.categoria?.tarifaDiaria) || 150;
    return dias * tarifa;
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setSelection({
      ...selection,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
    });
    setError('');
    setStep(2);
  };

  const handleDateChange = (tipo: 'inicio' | 'fim', value: string) => {
    const newSelection = {
      ...selection,
      ...(tipo === 'inicio' ? { dataInicio: value } : { dataFim: value }),
    };
    const total = calcularTotal(newSelection.dataInicio, newSelection.dataFim);
    setSelection({ ...newSelection, total });
    setError('');
  };

  const handleConfirmLocacao = async () => {
    if (!selection.clienteId || !selection.veiculoId || !selection.dataInicio || !selection.dataFim || !selection.funcionarioId) {
      setError('Preencha todos os campos (cliente, veículo, funcionário e datas)');
      return;
    }

    // Debug: verificar valores antes de enviar
    const payload = {
      clienteId: selection.clienteId,
      veiculoId: selection.veiculoId,
      funcionarioId: selection.funcionarioId,
      dataRetirada: selection.dataInicio,
      dataDevolucaoPrevista: selection.dataFim,
      valorPrevisto: Math.max(0, parseFloat(String(selection.total)) || 0),
    };
    console.log('Enviando locação:', JSON.stringify(payload, null, 2));

    setLoading(true);
    try {
      await api.post('/locacoes', payload);
      setError('');
      alert('Locação criada com sucesso!');
      setSelection({
        clienteId: null,
        clienteNome: '',
        veiculoId: null,
        veiculoNome: '',
        funcionarioId: null,
        funcionarioNome: '',
        dataInicio: '',
        dataFim: '',
        total: 0,
      });
      setStep(1);
      await fetchVeiculos(); // Atualizar lista de veículos disponíveis
      await fetchLocacoesAtivas(); // Atualizar lista de locações ativas
    } catch (err: any) {
      console.error('Erro completo:', err.response?.data);
      console.error('Status:', err.response?.status);
      console.error('Erro stack:', err);
      const mensagem = err.response?.data?.message || err.message || `Erro ao criar locação (${err.response?.status})`;
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="locacoes-page">
      <div className="page-header">
        <h1>Locações</h1>
        <p>Gerenciar aluguel de veículos</p>
      </div>

      <div className="locacoes-tabs">
        <button 
          className={`tab ${tab === 'criar' ? 'active' : ''}`}
          onClick={() => setTab('criar')}
        >
          ➕ Nova Locação
        </button>
        <button 
          className={`tab ${tab === 'gerenciar' ? 'active' : ''}`}
          onClick={() => setTab('gerenciar')}
        >
          📋 Gerenciar Locações ({locacoesAtivas.length})
        </button>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      {tab === 'criar' ? (
        <div className="form-container">
        <div className="steps-header">
          <div className={`step ${step === 1 ? 'active' : 'done'}`}>
            <span>1</span>
            <p>Seleção de Cliente</p>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
            <span>2</span>
            <p>Seleção de Veículo</p>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Período da Locação</p>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">👤</span> 1. Seleção de Cliente
            </h3>
            <div className="clients-list">
              {clientes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Nenhum cliente cadastrado</p>
              ) : (
                clientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="client-item"
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{cliente.nome}</p>
                      <small style={{ color: '#666' }}>{cliente.cpf}</small>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">🚗</span> 2. Seleção de Veículo e Período
            </h3>
            <AvailabilitySearch
              onSelectVeiculo={(veiculo, dataRetirada, dataDevolucao) => {
                console.log('Veículo selecionado:', veiculo);
                console.log('Categoria:', veiculo.categoria);
                console.log('Tarifa Diária:', veiculo.categoria?.tarifaDiaria);
                const total = calcularTotal(dataRetirada, dataDevolucao, veiculo.id);
                console.log('Total calculado:', total);
                setSelection({
                  ...selection,
                  veiculoId: veiculo.id,
                  veiculoNome: `${veiculo.marca} ${veiculo.modelo}`,
                  dataInicio: dataRetirada,
                  dataFim: dataDevolucao,
                  total,
                });
                setError('');
                setStep(3);
              }}
            />
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{ marginTop: '1rem', background: '#999' }}
                className="btn-primary"
              >
                ← Voltar
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">📅</span> 3. Período da Locação
            </h3>
            <div className="date-inputs">
              <div className="form-group">
                <label>Data Inicial</label>
                <input
                  type="date"
                  value={selection.dataInicio}
                  onChange={(e) => handleDateChange('inicio', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Data Final</label>
                <input
                  type="date"
                  value={selection.dataFim}
                  onChange={(e) => handleDateChange('fim', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Funcionário Responsável *</label>
                <select
                  value={selection.funcionarioId || ''}
                  onChange={(e) => {
                    const func = funcionarios.find(f => f.id === Number(e.target.value));
                    setSelection({
                      ...selection,
                      funcionarioId: Number(e.target.value),
                      funcionarioNome: func?.nome || '',
                    });
                    setError('');
                  }}
                  required
                >
                  <option value="">Selecionar funcionário...</option>
                  {funcionarios.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="summary">
              <h3>Resumo da Locação</h3>
              <div className="summary-row">
                <span>CLIENTE</span>
                <p>{selection.clienteNome}</p>
              </div>
              <div className="summary-row">
                <span>VEÍCULO</span>
                <p>{selection.veiculoNome}</p>
              </div>
              <div className="summary-row">
                <span>FUNCIONÁRIO</span>
                <p>{selection.funcionarioNome || 'Não selecionado'}</p>
              </div>
              <div className="summary-row">
                <span>PERÍODO</span>
                <p>{selection.dataInicio ? formatDateBR(selection.dataInicio) : 'N/A'} até {selection.dataFim ? formatDateBR(selection.dataFim) : 'N/A'}</p>
              </div>
              <div className="summary-row total">
                <span>VALOR TOTAL</span>
                <h2>R$ {selection.total.toFixed(2).replace('.', ',')}</h2>
              </div>
              <button
                className="btn-confirm"
                onClick={handleConfirmLocacao}
                disabled={loading}
              >
                {loading ? 'Confirmando...' : 'Confirmar Locação'}
              </button>
              <button
                onClick={() => setStep(2)}
                style={{ marginTop: '0.5rem', background: '#999' }}
                className="btn-primary"
              >
                ← Voltar
              </button>
            </div>
          </div>
        )}
        </div>
      ) : (
        <div className="gerenciar-locacoes">
          <div className="locacoes-lista">
            {locacoesAtivas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <p>Nenhuma locação ativa no momento</p>
              </div>
            ) : (
              locacoesAtivas.map((locacao) => (
                <div key={locacao.id} className="locacao-card">
                  <div className="locacao-header">
                    <div>
                      <h3>{locacao.cliente.nome}</h3>
                      <p className="locacao-info">{locacao.veiculo.marca} {locacao.veiculo.modelo} - {locacao.veiculo.placa}</p>
                    </div>
                    <div className="locacao-dates">
                      <small>Retirada: {formatDateBR(locacao.dataRetirada)}</small>
                      <small>Devolução: {formatDateBR(locacao.dataDevolucaoPrevista)}</small>
                    </div>
                  </div>
                  
                  {finalizandoId === locacao.id ? (
                    <div className="locacao-finalizar">
                      <h4>Finalizar Locação</h4>
                      <div className="form-group">
                        <label>Data da Entrega</label>
                        <input
                          type="date"
                          value={dataEntrega}
                          onChange={(e) => {
                            setDataEntrega(e.target.value);
                            // Calcular valor automaticamente
                            if (e.target.value && locacao.dataRetirada) {
                              const dias = getDaysDifference(locacao.dataRetirada, e.target.value);
                              const diasFinal = Math.max(1, dias); // Mínimo 1 dia
                              const tarifa = Number(locacao.veiculo.categoria?.tarifaDiaria) || 150;
                              const valor = diasFinal * tarifa;
                              setValorFinal(valor.toFixed(2));
                            }
                          }}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="form-group">
                        <label>Valor Final (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={valorFinal}
                          onChange={(e) => setValorFinal(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn-confirm"
                          onClick={() => handleFinalizarLocacao(locacao.id)}
                          disabled={loading}
                        >
                          <Check size={16} /> Confirmar Entrega
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => { setFinalizandoId(null); setDataEntrega(''); setValorFinal(''); }}
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="locacao-actions">
                      <button
                        className="btn-finalizar"
                        onClick={() => setFinalizandoId(locacao.id)}
                        title="Registrar devolução e finalizar locação"
                      >
                        <Check size={16} /> Finalizar/Entregar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleCancelarLocacao(locacao.id)}
                        title="Cancelar locação"
                      >
                        <Trash size={16} /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

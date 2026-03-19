import React, { useState } from 'react';
import api from '../services/api';
import { isValidDateRange, getDaysDifference, formatDateBR } from '../utils/dateUtils';
import './AvailabilitySearch.css';

export interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria?: {
    id: number;
    nome: string;
    tarifaDiaria?: number;
  };
  status: string;
}

interface AvailabilitySearchProps {
  onSelectVeiculo: (veiculo: Veiculo, dataRetirada: string, dataDevolucao: string) => void;
}

export default function AvailabilitySearch({ onSelectVeiculo }: AvailabilitySearchProps) {
  const [dataRetirada, setDataRetirada] = useState('');
  const [dataDevolucao, setDataDevolucao] = useState('');
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!dataRetirada || !dataDevolucao) {
      setError('Selecione data de retirada e devolução');
      return;
    }

    if (!isValidDateRange(dataRetirada, dataDevolucao)) {
      setError('Data de devolução deve ser posterior à data de retirada');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get<Veiculo[]>('/veiculos/disponivel', {
        params: {
          dataRetirada,
          dataDevolucao,
        },
      });
      setVeiculos(response.data);
      setSearched(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Erro ao buscar veículos disponíveis. Tente novamente.',
      );
      setVeiculos([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const calcularDias = (): number => {
    if (!dataRetirada || !dataDevolucao) return 0;
    return getDaysDifference(dataRetirada, dataDevolucao);
  };

  const calcularTotal = (tarifa: number): number => {
    return calcularDias() * tarifa;
  };

  return (
    <div className="availability-search">
      <div className="search-form">
        <h3>🔍 Buscar Veículos Disponíveis</h3>
        <div className="date-inputs">
          <div className="form-group">
            <label>Data de Retirada</label>
            <input
              type="date"
              value={dataRetirada}
              onChange={(e) => {
                setDataRetirada(e.target.value);
                setSearched(false);
              }}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Data de Devolução</label>
            <input
              type="date"
              value={dataDevolucao}
              onChange={(e) => {
                setDataDevolucao(e.target.value);
                setSearched(false);
              }}
              min={dataRetirada || new Date().toISOString().split('T')[0]}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !dataRetirada || !dataDevolucao}
            className="btn-search"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {dataRetirada && dataDevolucao && (
          <div className="duration-info">
            <strong>{calcularDias()}</strong> dia(s) selecionado(s)
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {searched && (
        <div className="results">
          {veiculos.length === 0 ? (
            <div className="no-results">
              <p>Nenhum veículo disponível para o período selecionado.</p>
            </div>
          ) : (
            <div className="vehicles-grid">
              {veiculos.map((veiculo) => {
                const tarifa = Number(veiculo.categoria?.tarifaDiaria) || 150;
                const total = calcularTotal(tarifa);

                return (
                  <div
                    key={veiculo.id}
                    className="vehicle-card"
                    onClick={() => onSelectVeiculo(veiculo, dataRetirada, dataDevolucao)}
                  >
                    <div className="vehicle-header">
                      <h4>
                        {veiculo.marca} {veiculo.modelo}
                      </h4>
                      <p className="placa">{veiculo.placa}</p>
                    </div>

                    <div className="vehicle-details">
                      <p>
                        <strong>Ano:</strong> {veiculo.ano}
                      </p>
                      <p>
                        <strong>Categoria:</strong> {veiculo.categoria?.nome || 'N/A'}
                      </p>
                      <p>
                        <strong>Diária:</strong> R$ {tarifa.toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    <div className="vehicle-price">
                      <strong>Total:</strong>
                      <h3>R$ {total.toFixed(2).replace('.', ',')}</h3>
                    </div>

                    <button className="btn-select">Selecionar</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

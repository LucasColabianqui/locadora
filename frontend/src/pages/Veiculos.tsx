import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash, Calendar } from 'tabler-icons-react';
import Modal from '../components/Modal';
import './Veiculos.css';
import api from '../services/api';

type BackendStatus = 'DISPONIVEL' | 'ALUGADO' | 'EM_MANUTENCAO' | 'INATIVO' | 'VENDIDO';
type StatusLocacao = 'ATIVA' | 'FINALIZADA' | 'CANCELADA';

interface Categoria {
  id: number;
  nome: string;
  tarifaDiaria?: number;
}

interface Cliente {
  id: number;
  nome: string;
}

interface Locacao {
  id: number;
  veiculo: Veiculo;
  cliente: Cliente;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoEfetiva: string | null;
  valorPrevisto: number;
  status: StatusLocacao;
}

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: Categoria;
  status: BackendStatus;
}

interface VeiculoFormData {
  id?: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoriaId: number | '';
}

interface VeiculoFormProps {
  initialData?: VeiculoFormData;
  categorias: Categoria[];
  onSubmit: (data: VeiculoFormData) => void;
  onAddCategoria?: (categoria: Categoria) => void;
  onDeleteCategoria?: (categoriaId: number) => void;
  onSyncCategorias?: () => void;
  veiculos?: Veiculo[];
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<number | ''>('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);

  const statusColor: Record<BackendStatus, string> = {
    'DISPONIVEL': 'available',
    'ALUGADO': 'rented',
    'EM_MANUTENCAO': 'maintenance',
    'INATIVO': 'maintenance',
    'VENDIDO': 'maintenance',
  };

  const statusLabel: Record<BackendStatus, string> = {
    'DISPONIVEL': 'Disponível',
    'ALUGADO': 'Locado',
    'EM_MANUTENCAO': 'Em Manutenção',
    'INATIVO': 'Inativo',
    'VENDIDO': 'Vendido',
  };

  useEffect(() => {
    fetchVeiculos();
    fetchCategorias();
    fetchLocacoes();
  }, []);

  useEffect(() => {
    // Refrescar categorias quando abre modal de edição/criação
    if (isEditModalOpen) {
      console.log('📋 Modal de edição abriu - buscando categorias');
      fetchCategorias();
    } else if (isNewModalOpen) {
      console.log('📋 Modal de novo veículo abriu - buscando categorias');
      fetchCategorias();
    }
  }, [isEditModalOpen, isNewModalOpen]);

  const fetchCategorias = async () => {
    try {
      console.log('🔄 Buscando categorias...');
      const res = await api.get<Categoria[]>('/categorias');
      console.log('✅ Categorias carregadas:', res.data.length, 'categorias');
      setCategorias(res.data);
    } catch (err) {
      console.error('❌ Erro ao buscar categorias', err);
    }
  };

  const fetchLocacoes = async () => {
    try {
      const res = await api.get<Locacao[]>('/locacoes');
      setLocacoes(res.data);
    } catch (err) {
      console.error('Erro ao buscar locações', err);
    }
  };

  const getLogicalStatus = (veiculo: Veiculo): 'DISPONIVEL' | 'INDISPONIVEL' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Procura por locação ativa que inclua a data de hoje
    const activeLocacao = locacoes.find(
      l => l.veiculo.id === veiculo.id && l.status === 'ATIVA'
    );

    if (activeLocacao) {
      const dataRetirada = new Date(activeLocacao.dataRetirada);
      const dataDevolucao = new Date(activeLocacao.dataDevolucaoPrevista);
      dataRetirada.setHours(0, 0, 0, 0);
      dataDevolucao.setHours(0, 0, 0, 0);

      // Se hoje está entre a retirada e devolução, está indisponível
      if (today >= dataRetirada && today <= dataDevolucao) {
        return 'INDISPONIVEL';
      }
    }

    return 'DISPONIVEL';
  };

  const getAvailabilityInfo = (veiculo: Veiculo) => {
    const logicalStatus = getLogicalStatus(veiculo);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Se está indisponível, procura a locação ativa
    if (logicalStatus === 'INDISPONIVEL') {
      const activeLocacao = locacoes.find(
        l => l.veiculo.id === veiculo.id && l.status === 'ATIVA'
      );

      if (activeLocacao) {
        // Parse ISO date string avoiding timezone issues
        const dateString = activeLocacao.dataDevolucaoPrevista.split('T')[0];
        const [year, month, day] = dateString.split('-').map(Number);
        const dataDevolucao = new Date(year, month - 1, day);

        const daysRemaining = Math.floor((dataDevolucao.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const formattedDate = dataDevolucao.toLocaleDateString('pt-BR', options);

        return {
          text: `Disponível em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}`,
          daysRemaining,
          returnDate: formattedDate,
        };
      }
    }

    // Se está disponível
    return {
      text: 'Disponível agora',
      daysRemaining: 0,
      returnDate: null,
    };
  };

  const fetchVeiculos = async () => {
    try {
      const res = await api.get<Veiculo[]>('/veiculos');
      setVeiculos(res.data);
    } catch (err) {
      console.error('Erro ao buscar veículos', err);
    }
  };

  const handleNewVeiculo = async (data: VeiculoFormData) => {
    try {
      const payload = {
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        categoria: { id: data.categoriaId },
      };
      const res = await api.post<Veiculo>('/veiculos', payload);
      setVeiculos((prev) => [...prev, res.data]);
      setIsNewModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      console.error('Erro ao criar veículo', err);
      alert(err?.response?.data?.message || 'Erro ao criar veículo');
    }
  };

  const handleEditVeiculo = async (data: VeiculoFormData) => {
    if (!selectedVeiculo) return;
    try {
      const payload = {
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        categoria: { id: data.categoriaId },
      };
      await api.put(`/veiculos/${selectedVeiculo.id}`, payload);
      setVeiculos((prev) => prev.map(v => v.id === selectedVeiculo.id ? { ...v, ...payload } as Veiculo : v));
      setIsEditModalOpen(false);
      setSelectedVeiculo(null);
      window.location.reload();
    } catch (err: any) {
      console.error('Erro ao atualizar veículo', err);
      alert(err?.response?.data?.message || 'Erro ao atualizar veículo');
    }
  };

  const handleDeleteVeiculo = async () => {
    if (!selectedVeiculo) return;
    try {
      await api.delete(`/veiculos/${selectedVeiculo.id}`);
      setVeiculos((prev) => prev.filter(v => v.id !== selectedVeiculo.id));
      setIsDeleteModalOpen(false);
      setSelectedVeiculo(null);
    } catch (err) {
      console.error('Erro ao deletar veículo', err);
    }
  };

  const handleAddCategoria = (categoria: Categoria) => {
    setCategorias((prev) => [...prev, categoria]);
    console.log('✅ Categoria adicionada:', categoria.nome);
  };

  const handleSyncCategorias = async () => {
    console.log('🔄 Sincronizando veículos após edição de categoria...');
    await fetchVeiculos();
    console.log('✅ Veículos sincronizados');
  };

  const handleDeleteCategoria = async (categoriaId: number) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    if (!categoria) return;

    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${categoria.nome}"?`)) {
      return;
    }

    try {
      console.log('🗑️ Deletando categoria:', categoria.nome, '(ID:', categoriaId + ')');
      await api.delete(`/categorias/${categoriaId}`);
      setCategorias((prev) => prev.filter(c => c.id !== categoriaId));
      console.log('✅ Categoria deletada com sucesso');
      alert('Categoria deletada com sucesso!');
    } catch (err: any) {
      console.error('❌ Erro ao deletar categoria:', err);
      const mensagem = err?.response?.data?.message || err.message || 'Erro ao deletar categoria';
      alert(mensagem);
    }
  };

  const handleChangeStatus = async (veiculoId: number, newStatus: BackendStatus) => {
    try {
      await api.put(`/veiculos/${veiculoId}`, { status: newStatus });
      setVeiculos((prev) =>
        prev.map(v => v.id === veiculoId ? { ...v, status: newStatus } : v)
      );
    } catch (err: any) {
      console.error('Erro ao alterar status do veículo', err);
      alert(err?.response?.data?.message || 'Erro ao alterar status');
    }
  };

  const openEditModal = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsDeleteModalOpen(true);
  };

  const filteredVeiculos = veiculos.filter(v =>
    (v.marca.toLowerCase().includes(search.toLowerCase()) ||
    v.placa.toLowerCase().includes(search.toLowerCase())) &&
    (filterCategoria === '' || v.categoria?.id === filterCategoria)
  );

  return (
    <div className="veiculos-page">
      <div className="page-header">
        <h1>Veículos</h1>
        <p>Gerencie a frota da locadora</p>
      </div>

      <div className="page-actions">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por placa ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(Number(e.target.value) || '')}
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
            minWidth: '150px'
          }}
          title="Filtrar por categoria"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
        <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
          <Plus size={18} />
          Novo Veículo
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Próxima Disponibilidade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredVeiculos.map((veiculo) => (
              <tr key={veiculo.id}>
                <td><strong>{veiculo.placa}</strong></td>
                <td>{veiculo.marca} {veiculo.modelo}</td>
                <td>{veiculo.ano}</td>
                <td>{veiculo.categoria?.nome || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: 500,
                        backgroundColor: getLogicalStatus(veiculo) === 'DISPONIVEL' ? '#d4edda' : '#f8d7da',
                        color: getLogicalStatus(veiculo) === 'DISPONIVEL' ? '#155724' : '#721c24',
                      }}
                    >
                      {getLogicalStatus(veiculo) === 'DISPONIVEL' ? '✓ Disponível' : '⊖ Indisponível'}
                    </span>
                    <select
                      value={veiculo.status}
                      onChange={(e) => handleChangeStatus(veiculo.id, e.target.value as BackendStatus)}
                      className={`status-select ${statusColor[veiculo.status]}`}
                      title={getLogicalStatus(veiculo) === 'INDISPONIVEL' ? 'Bloqueado: Veículo em locação' : 'Marcar status adicional'}
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      disabled={getLogicalStatus(veiculo) === 'INDISPONIVEL'}
                    >
                      <option value="DISPONIVEL">Operacional</option>
                      <option value="EM_MANUTENCAO">Em Manutenção</option>
                      <option value="INATIVO">Inativo</option>
                      <option value="VENDIDO">Vendido</option>
                    </select>
                  </div>
                </td>
                <td>
                  <div className="availability-cell">
                    <Calendar size={16} />
                    <div>
                      <div className="availability-text">{getAvailabilityInfo(veiculo).text}</div>
                      {getAvailabilityInfo(veiculo).returnDate && (
                        <div className="availability-date">{getAvailabilityInfo(veiculo).returnDate}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="table-actions">
                  <button className="btn-icon" onClick={() => openEditModal(veiculo)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon delete" onClick={() => openDeleteModal(veiculo)}>
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isNewModalOpen}
        title="Novo Veículo"
        onClose={() => setIsNewModalOpen(false)}
        formId="veiculo-form"
        submitText="Criar Veículo"
      >
        {isNewModalOpen && (
          <VeiculoForm 
            key="new-veiculo"
            categorias={categorias}
            veiculos={veiculos}
            onSubmit={handleNewVeiculo}
            onAddCategoria={handleAddCategoria}
            onDeleteCategoria={handleDeleteCategoria}
            onSyncCategorias={handleSyncCategorias}
          />
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        title="Editar Veículo"
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVeiculo(null);
        }}
        formId="veiculo-form"
        submitText="Atualizar Veículo"
      >
        {selectedVeiculo && (
          <VeiculoForm
            key={`edit-${selectedVeiculo.id}`}
            categorias={categorias}
            veiculos={veiculos}
            initialData={{
              id: selectedVeiculo.id,
              placa: selectedVeiculo.placa,
              marca: selectedVeiculo.marca,
              modelo: selectedVeiculo.modelo,
              ano: selectedVeiculo.ano,
              categoriaId: selectedVeiculo.categoria?.id || ''
            }}
            onSubmit={handleEditVeiculo}
            onAddCategoria={handleAddCategoria}
            onDeleteCategoria={handleDeleteCategoria}
            onSyncCategorias={handleSyncCategorias}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirmar Exclusão"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedVeiculo(null);
        }}
        onConfirm={handleDeleteVeiculo}
        confirmText="Deletar"
        isDangerous
      >
        <p>Tem certeza que deseja deletar o veículo <strong>{selectedVeiculo?.marca} {selectedVeiculo?.modelo}</strong> ({selectedVeiculo?.placa})?</p>
        <p style={{ color: '#666', fontSize: '0.9em' }}>Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}

function VeiculoForm({ initialData, categorias, onSubmit, onAddCategoria, onDeleteCategoria, onSyncCategorias, veiculos = [] }: VeiculoFormProps) {
  const [formData, setFormData] = useState<VeiculoFormData>(
    initialData || {
      placa: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      categoriaId: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewCategoriaForm, setShowNewCategoriaForm] = useState(false);
  const [newCategoriaData, setNewCategoriaData] = useState({ nome: '', tarifaDiaria: '' });
  const [localCategorias, setLocalCategorias] = useState(categorias);
  const [showDeleteCategoriaForm, setShowDeleteCategoriaForm] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<number | ''>('');
  const [showEditCategoriaForm, setShowEditCategoriaForm] = useState(false);
  const [categoriaToEdit, setCategoriaToEdit] = useState<number | ''>('');
  const [editCategoriaData, setEditCategoriaData] = useState({ nome: '', tarifaDiaria: '' });

  useEffect(() => {
    setLocalCategorias(categorias);
    console.log('📝 Categorias sincronizadas:', categorias.length, 'categorias');
  }, [categorias]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.placa.trim()) newErrors.placa = 'Placa é obrigatória';
    if (!formData.marca.trim()) newErrors.marca = 'Marca é obrigatória';
    if (!formData.modelo.trim()) newErrors.modelo = 'Modelo é obrigatório';
    if (!formData.ano) newErrors.ano = 'Ano é obrigatório';
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoria é obrigatória';

    // Verificar se a placa já existe (validação local)
    const placaDuplicada = veiculos.some(v => 
      v.placa.toUpperCase() === formData.placa.toUpperCase() &&
      v.id !== initialData?.id // Excluir o próprio veículo se estiver editando
    );
    
    if (placaDuplicada) {
      newErrors.placa = `Erro: A placa ${formData.placa.toUpperCase()} já está cadastrada`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoriaData.nome.trim() || !newCategoriaData.tarifaDiaria) {
      alert('Preencha todos os campos da categoria');
      return;
    }

    try {
      console.log('🆕 Criando categoria:', newCategoriaData.nome);
      const res = await api.post<Categoria>('/categorias', {
        nome: newCategoriaData.nome,
        tarifaDiaria: parseFloat(newCategoriaData.tarifaDiaria),
      });
      
      const novaCategoria = res.data;
      console.log('✅ Categoria criada com sucesso:', novaCategoria);
      console.log('📝 Antes de adicionar - localCategorias:', localCategorias.length);
      
      setFormData({ ...formData, categoriaId: novaCategoria.id });
      setLocalCategorias([...localCategorias, novaCategoria]);
      onAddCategoria?.(novaCategoria);
      
      console.log('📝 Depois de adicionar - localCategorias será:', localCategorias.length + 1);
      
      setShowNewCategoriaForm(false);
      setNewCategoriaData({ nome: '', tarifaDiaria: '' });
      console.log('✅ Formulário de categoria limpo');
    } catch (err: any) {
      console.error('❌ Erro ao criar categoria', err);
      alert(err?.response?.data?.message || 'Erro ao criar categoria');
    }
  };

  const handleDeleteCategoriaLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoriaToDelete) {
      alert('Selecione uma categoria para deletar');
      return;
    }

    onDeleteCategoria?.(Number(categoriaToDelete));
    setCategoriaToDelete('');
    setShowDeleteCategoriaForm(false);
  };

  const handleEditCategoriaClick = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoriaToEdit) {
      alert('Selecione uma categoria para editar');
      return;
    }

    const categoria = localCategorias.find(c => c.id === Number(categoriaToEdit));
    if (categoria) {
      setEditCategoriaData({
        nome: categoria.nome,
        tarifaDiaria: String(categoria.tarifaDiaria || ''),
      });
    }
  };

  const handleUpdateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoriaToEdit) {
      alert('Selecione uma categoria para editar');
      return;
    }

    if (!editCategoriaData.nome.trim() || !editCategoriaData.tarifaDiaria) {
      alert('Preencha todos os campos da categoria');
      return;
    }

    try {
      console.log('✏️ Atualizando categoria ID:', categoriaToEdit);
      await api.put(`/categorias/${categoriaToEdit}`, {
        nome: editCategoriaData.nome,
        tarifaDiaria: parseFloat(editCategoriaData.tarifaDiaria),
      });
      
      console.log('✅ Categoria atualizada com sucesso');
      
      // Atualizar estado local
      setLocalCategorias((prev) =>
        prev.map(c =>
          c.id === Number(categoriaToEdit)
            ? { ...c, nome: editCategoriaData.nome, tarifaDiaria: parseFloat(editCategoriaData.tarifaDiaria) }
            : c
        )
      );
      
      // Também atualizar as categorias do pai chamando fetchCategorias novamente
      onAddCategoria?.({
        id: Number(categoriaToEdit),
        nome: editCategoriaData.nome,
        tarifaDiaria: parseFloat(editCategoriaData.tarifaDiaria),
      });
      
      // Sincronizar veículos para refletirem a mudança de categoria
      onSyncCategorias?.();
      
      setCategoriaToEdit('');
      setEditCategoriaData({ nome: '', tarifaDiaria: '' });
      setShowEditCategoriaForm(false);
      alert('Categoria atualizada com sucesso!');
      console.log('✅ Formulário de edição limpo');
    } catch (err: any) {
      console.error('❌ Erro ao atualizar categoria', err);
      alert(err?.response?.data?.message || 'Erro ao atualizar categoria');
    }
  };

  return (
    <form className="veiculo-form" onSubmit={handleSubmit} id="veiculo-form">
      <div className="form-group">
        <label>Placa *</label>
        <input
          type="text"
          value={formData.placa}
          onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
          placeholder="Ex: ABC1234"
        />
        {errors.placa && <span className="error">{errors.placa}</span>}
      </div>

      <div className="form-group">
        <label>Marca *</label>
        <input
          type="text"
          value={formData.marca}
          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
          placeholder="Ex: Toyota"
        />
        {errors.marca && <span className="error">{errors.marca}</span>}
      </div>

      <div className="form-group">
        <label>Modelo *</label>
        <input
          type="text"
          value={formData.modelo}
          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
          placeholder="Ex: Corolla"
        />
        {errors.modelo && <span className="error">{errors.modelo}</span>}
      </div>

      <div className="form-group">
        <label>Ano *</label>
        <input
          type="number"
          value={formData.ano}
          onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
          placeholder="Ex: 2023"
          min="1990"
          max={new Date().getFullYear()}
        />
        {errors.ano && <span className="error">{errors.ano}</span>}
      </div>

      <div className="form-group">
        <label>Categoria *</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <select
            value={formData.categoriaId}
            onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
            style={{ flex: 1 }}
          >
            <option value="">Selecione uma categoria</option>
            {localCategorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCategoriaForm(!showNewCategoriaForm)}
            className="btn-secondary"
            title="Adicionar nova categoria"
          >
            +
          </button>
        </div>
        {errors.categoriaId && <span className="error">{errors.categoriaId}</span>}
        
        {showNewCategoriaForm && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Nova Categoria</h4>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Nome *</label>
              <input
                type="text"
                value={newCategoriaData.nome}
                onChange={(e) => setNewCategoriaData({ ...newCategoriaData, nome: e.target.value })}
                placeholder="Ex: Sedan, SUV"
                style={{ fontSize: '13px', padding: '8px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Tarifa Diária (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newCategoriaData.tarifaDiaria}
                onChange={(e) => setNewCategoriaData({ ...newCategoriaData, tarifaDiaria: e.target.value })}
                placeholder="Ex: 150.00"
                style={{ fontSize: '13px', padding: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCreateCategoria}
                className="btn-primary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowNewCategoriaForm(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => {
            setShowEditCategoriaForm(!showEditCategoriaForm);
            if (showEditCategoriaForm) {
              setCategoriaToEdit('');
              setEditCategoriaData({ nome: '', tarifaDiaria: '' });
            }
          }}
          className="btn-secondary"
          title="Editar categoria existente"
          style={{ width: '100%', padding: '8px', fontSize: '13px' }}
        >
          ✏️ Editar Categoria
        </button>

        {showEditCategoriaForm && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '6px', border: '1px solid #90caf9' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Editar Categoria</h4>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Selecione a categoria *</label>
              <select
                value={categoriaToEdit}
                onChange={(e) => {
                  setCategoriaToEdit(Number(e.target.value) || '');
                  handleEditCategoriaClick(e as any);
                }}
                style={{ fontSize: '13px', padding: '8px' }}
              >
                <option value="">Selecione uma categoria</option>
                {localCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            {categoriaToEdit && (
              <>
                <div className="form-group">
                  <label style={{ fontSize: '12px' }}>Nome *</label>
                  <input
                    type="text"
                    value={editCategoriaData.nome}
                    onChange={(e) => setEditCategoriaData({ ...editCategoriaData, nome: e.target.value })}
                    placeholder="Ex: Sedan, SUV"
                    style={{ fontSize: '13px', padding: '8px' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '12px' }}>Tarifa Diária (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCategoriaData.tarifaDiaria}
                    onChange={(e) => setEditCategoriaData({ ...editCategoriaData, tarifaDiaria: e.target.value })}
                    placeholder="Ex: 150.00"
                    style={{ fontSize: '13px', padding: '8px' }}
                  />
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleUpdateCategoria}
                className="btn-primary"
                style={{ flex: 1, padding: '8px', fontSize: '13px', backgroundColor: '#1976d2' }}
                disabled={!categoriaToEdit}
              >
                Atualizar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditCategoriaForm(false);
                  setCategoriaToEdit('');
                  setEditCategoriaData({ nome: '', tarifaDiaria: '' });
                }}
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowDeleteCategoriaForm(!showDeleteCategoriaForm)}
          className="btn-secondary"
          title="Deletar categoria existente"
          style={{ width: '100%', padding: '8px', fontSize: '13px' }}
        >
          🗑️ Deletar Categoria
        </button>

        {showDeleteCategoriaForm && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#ffe6e6', borderRadius: '6px', border: '1px solid #ffcccc' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Deletar Categoria</h4>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Selecione a categoria *</label>
              <select
                value={categoriaToDelete}
                onChange={(e) => setCategoriaToDelete(Number(e.target.value) || '')}
                style={{ fontSize: '13px', padding: '8px' }}
              >
                <option value="">Selecione uma categoria</option>
                {localCategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleDeleteCategoriaLocal}
                className="btn-primary"
                style={{ flex: 1, padding: '8px', fontSize: '13px', backgroundColor: '#d32f2f' }}
              >
                Deletar
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteCategoriaForm(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}


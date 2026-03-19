import { useCallback, useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash } from 'tabler-icons-react';
import Modal from '../components/Modal';
import ClienteForm, { ClienteFormData } from '../components/ClienteForm';
import clientesService, { Cliente } from '../services/clientesService';
import { applyCpfMask } from '../utils/documentMasks';
import './Clientes.css';

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const normalizeCliente = (cliente: Cliente): Cliente => ({
    ...cliente,
    cpf: applyCpfMask(cliente.cpf),
  });

  const carregarClientes = useCallback(async () => {
    try {
      const data = await clientesService.getAll();
      setClientes(data.map(normalizeCliente));
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Nao foi possivel carregar os clientes. Tente novamente.');
    }
  }, []);

  useEffect(() => {
    carregarClientes();
  }, [carregarClientes]);

  const filteredClientes = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) || c.cpf.includes(search)
  );

  const handleNewCliente = async (data: ClienteFormData) => {
    try {
      const createdCliente = await clientesService.create(data);
      setClientes([...clientes, normalizeCliente(createdCliente)]);
      setIsNewModalOpen(false);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Dados invalidos. Revise CPF, CNH e email e tente novamente.');
    }
  };

  const handleEditCliente = async (data: ClienteFormData) => {
    if (!selectedCliente) return;
    try {
      await clientesService.update(selectedCliente.id, data);
      setClientes(
        clientes.map((c) =>
          c.id === selectedCliente.id
            ? normalizeCliente({ ...c, ...data })
            : c
        )
      );
      setIsEditModalOpen(false);
      setSelectedCliente(null);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Nao foi possivel atualizar o cliente. Verifique os dados e tente novamente.');
    }
  };

  const handleDeleteCliente = async () => {
    if (!selectedCliente) return;
    try {
      await clientesService.delete(selectedCliente.id);
      setClientes(clientes.filter((c) => c.id !== selectedCliente.id));
      setIsDeleteModalOpen(false);
      setSelectedCliente(null);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Nao foi possivel deletar o cliente. Tente novamente.');
    }
  };

  const openEditModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Gerencie a base de clientes cadastrados</p>
      </div>

      {errorMessage && <p className="clientes-error-message">{errorMessage}</p>}

      <div className="page-actions">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td className="table-actions">
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(cliente)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => openDeleteModal(cliente)}
                    title="Deletar"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para novo cliente */}
      <Modal
        isOpen={isNewModalOpen}
        title="Novo Cliente"
        onClose={() => setIsNewModalOpen(false)}
        cancelText="Cancelar"
      >
        <ClienteForm onSubmit={handleNewCliente} />
      </Modal>

      {/* Modal para editar cliente */}
      <Modal
        isOpen={isEditModalOpen}
        title="Editar Cliente"
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCliente(null);
        }}
        cancelText="Cancelar"
      >
        {selectedCliente && (
          <ClienteForm onSubmit={handleEditCliente} initialData={selectedCliente} />
        )}
      </Modal>

      {/* Modal para deletar cliente */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Deletar Cliente"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCliente(null);
        }}
        onConfirm={handleDeleteCliente}
        confirmText="Deletar"
        cancelText="Cancelar"
        isDangerous
      >
        <p>Tem certeza que deseja deletar o cliente <strong>{selectedCliente?.nome}</strong>?</p>
        <p style={{ color: '#666', fontSize: '14px' }}>Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}
import api from './api';

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cnh: string;
  endereco?: any;
}

class ClientesService {
  async getAll(): Promise<Cliente[]> {
    try {
      const response = await api.get<Cliente[]>('/clientes');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Cliente> {
    try {
      const response = await api.get<Cliente>(`/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  }

  async create(data: Partial<Cliente>): Promise<Cliente> {
    try {
      const response = await api.post<Cliente>('/clientes', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Cliente>): Promise<Cliente> {
    try {
      const response = await api.put<Cliente>(`/clientes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (error) {
      console.error(`Erro ao deletar cliente ${id}:`, error);
      throw error;
    }
  }
}

const clientesService = new ClientesService();

export default clientesService;

import React, { useEffect, useState } from 'react';
import './ClienteForm.css';
import { applyCpfMask, normalizeCnh, normalizeDigits } from '../utils/documentMasks';
import {
  isValidCnh,
  isValidCpf,
  isValidEmail,
} from '../utils/documentValidators';

interface ClienteFormProps {
  onSubmit: (data: ClienteFormData) => void;
  initialData?: ClienteFormData;
}

export interface ClienteFormData {
  id?: number;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email: string;
}

export default function ClienteForm({ onSubmit, initialData }: ClienteFormProps) {
  const [formData, setFormData] = useState<ClienteFormData>(
    initialData
      ? {
          ...initialData,
          cpf: applyCpfMask(initialData.cpf),
          cnh: normalizeCnh(initialData.cnh),
          email: initialData.email.trim(),
        }
      : {
      id: undefined,
      nome: '',
      cpf: '',
      cnh: '',
      telefone: '',
      email: '',
    }
  );

  const [errors, setErrors] = useState<Partial<ClienteFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!initialData) return;

    setFormData({
      ...initialData,
      cpf: applyCpfMask(initialData.cpf),
      cnh: normalizeCnh(initialData.cnh),
      email: initialData.email.trim(),
    });
    setErrors({});
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ClienteFormData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!isValidCpf(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.cnh.trim()) {
      newErrors.cnh = 'CNH é obrigatória';
    } else if (!isValidCnh(formData.cnh)) {
      newErrors.cnh = 'CNH inválida';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ClienteFormData, value: string) => {
    let normalizedValue = value;

    if (field === 'cpf') {
      normalizedValue = applyCpfMask(value);
    }

    if (field === 'cnh') {
      normalizedValue = normalizeCnh(value);
    }

    if (field === 'email') {
      normalizedValue = value.trimStart();
    }

    setFormData({ ...formData, [field]: normalizedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Envia documentos normalizados para garantir consistencia da API.
        const { id, ...dataToSend } = formData;
        const cleanedData = {
          ...dataToSend,
          cpf: normalizeDigits(dataToSend.cpf),
          cnh: normalizeDigits(dataToSend.cnh),
          email: dataToSend.email.trim().toLowerCase(),
        };
        await onSubmit(cleanedData as ClienteFormData);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cliente-form">
      <div className="form-field">
        <label>Nome *</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
          className={errors.nome ? 'error' : ''}
          placeholder="Digite o nome completo"
          aria-invalid={Boolean(errors.nome)}
        />
        {errors.nome && <span className="error-message">{errors.nome}</span>}
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>CPF *</label>
          <input
            type="text"
            value={formData.cpf}
            onChange={(e) => handleChange('cpf', e.target.value)}
            className={errors.cpf ? 'error' : ''}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            aria-invalid={Boolean(errors.cpf)}
          />
          {errors.cpf && <span className="error-message">{errors.cpf}</span>}
        </div>

        <div className="form-field">
          <label>CNH *</label>
          <input
            type="text"
            value={formData.cnh}
            onChange={(e) => handleChange('cnh', e.target.value)}
            className={errors.cnh ? 'error' : ''}
            placeholder="00000000000"
            inputMode="numeric"
            maxLength={11}
            aria-invalid={Boolean(errors.cnh)}
          />
          {errors.cnh && <span className="error-message">{errors.cnh}</span>}
        </div>
      </div>

      <div className="form-field">
        <label>Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={errors.email ? 'error' : ''}
          placeholder="nome@dominio.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-field">
        <label>Telefone *</label>
        <input
          type="tel"
          value={formData.telefone}
          onChange={(e) => handleChange('telefone', e.target.value)}
          className={errors.telefone ? 'error' : ''}
          placeholder="(00) 00000-0000"
          aria-invalid={Boolean(errors.telefone)}
        />
        {errors.telefone && <span className="error-message">{errors.telefone}</span>}
      </div>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
      </button>
    </form>
  );
}

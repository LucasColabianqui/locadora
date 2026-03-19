import React from 'react';
import { X } from 'tabler-icons-react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  formId?: string;
  submitText?: string;
}

export default function Modal({
  isOpen,
  title,
  onClose,
  onConfirm,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  formId,
  submitText,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer" style={{ gap: '12px' }}>
          {formId && submitText && (
            <button type="submit" form={formId} className="btn-primary" style={{ flex: 2, marginRight: 'auto' }}>
              {submitText}
            </button>
          )}
          {onConfirm && !formId && (
            <button
              className={`btn-confirm ${isDangerous ? 'dangerous' : ''}`}
              style={{ flex: 2, marginRight: 'auto' }}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
          <button className="btn-cancel" onClick={onClose} style={{ flex: 1 }}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

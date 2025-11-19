'use client';

import React from 'react';
import { ModalState } from '../hooks/useModal';

interface ModalProps {
  modal: ModalState;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ modal, onClose }) => {
  if (!modal.isOpen) return null;

  const getModalIcon = () => {
    switch (modal.type) {
      case 'success':
        return <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>;
      case 'error':
        return <i className="fas fa-times-circle text-danger" style={{ fontSize: '3rem' }}></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>;
      case 'info':
      default:
        return <i className="fas fa-info-circle text-info" style={{ fontSize: '3rem' }}></i>;
    }
  };

  const getModalClass = () => {
    switch (modal.type) {
      case 'success':
        return 'border-success';
      case 'error':
        return 'border-danger';
      case 'warning':
        return 'border-warning';
      case 'info':
      default:
        return 'border-info';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (modal.onConfirm) {
      modal.onConfirm();
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (modal.onCancel) {
      modal.onCancel();
    } else {
      onClose();
    }
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className={`modal-content ${getModalClass()}`}>
          <div className="modal-header border-0 pb-0">
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="إغلاق"
            ></button>
          </div>
          
          <div className="modal-body text-center">
            <div className="mb-3">
              {getModalIcon()}
            </div>
            
            {modal.title && (
              <h5 className="modal-title mb-3">{modal.title}</h5>
            )}
            
            {modal.message && (
              <p className="mb-4">{modal.message}</p>
            )}
          </div>
          
          <div className="modal-footer border-0 justify-content-center">
            {modal.showCancel ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2"
                  onClick={handleCancel}
                >
                  {modal.cancelText || 'إلغاء'}
                </button>
                <button
                  type="button"
                  className={`btn ${
                    modal.type === 'error' ? 'btn-danger' :
                    modal.type === 'success' ? 'btn-success' :
                    modal.type === 'warning' ? 'btn-warning' :
                    'btn-primary'
                  }`}
                  onClick={handleConfirm}
                >
                  {modal.confirmText || 'موافق'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className={`btn ${
                  modal.type === 'error' ? 'btn-danger' :
                  modal.type === 'success' ? 'btn-success' :
                  modal.type === 'warning' ? 'btn-warning' :
                  'btn-primary'
                }`}
                onClick={handleConfirm}
              >
                {modal.confirmText || 'موافق'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

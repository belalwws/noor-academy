import { useState, useCallback } from 'react';

export interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

interface UseModalReturn {
  modal: ModalState;
  showModal: (config: Partial<ModalState>) => void;
  hideModal: () => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const defaultModalState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
  confirmText: 'موافق',
  cancelText: 'إلغاء',
  showCancel: false,
};

export function useModal(): UseModalReturn {
  const [modal, setModal] = useState<ModalState>(defaultModalState);

  const showModal = useCallback((config: Partial<ModalState>) => {
    setModal(prev => ({
      ...prev,
      ...config,
      isOpen: true,
    }));
  }, []);

  const hideModal = useCallback(() => {
    setModal(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const showSuccess = useCallback((title: string, message: string) => {
    showModal({
      title,
      message,
      type: 'success',
      showCancel: false,
    });
  }, [showModal]);

  const showError = useCallback((title: string, message: string) => {
    showModal({
      title,
      message,
      type: 'error',
      showCancel: false,
    });
  }, [showModal]);

  const showInfo = useCallback((title: string, message: string) => {
    showModal({
      title,
      message,
      type: 'info',
      showCancel: false,
    });
  }, [showModal]);

  const showWarning = useCallback((title: string, message: string) => {
    showModal({
      title,
      message,
      type: 'warning',
      showCancel: false,
    });
  }, [showModal]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showModal({
      title,
      message,
      type: 'warning',
      showCancel: true,
      onConfirm: () => {
        onConfirm();
        hideModal();
      },
      onCancel: () => {
        if (onCancel) onCancel();
        hideModal();
      },
    });
  }, [showModal, hideModal]);

  return {
    modal,
    showModal,
    hideModal,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
  };
}

/**
 * Custom Hook for Barcode Scanner
 * Provides reusable barcode scanning functionality
 */

import { useState, useCallback } from 'react';

interface UseBarcodeScanner {
  isOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;
  handleScan: (callback: (barcode: string) => void) => (barcode: string) => void;
}

export const useBarcodeScanner = (): UseBarcodeScanner => {
  const [isOpen, setIsOpen] = useState(false);

  const openScanner = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeScanner = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleScan = useCallback(
    (callback: (barcode: string) => void) => {
      return (barcode: string) => {
        callback(barcode);
        closeScanner();
      };
    },
    [closeScanner]
  );

  return {
    isOpen,
    openScanner,
    closeScanner,
    handleScan,
  };
};

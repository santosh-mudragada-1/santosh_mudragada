'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ContactModalApi = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ContactModalContext = createContext<ContactModalApi | null>(null);

export function useContactModal(): ContactModalApi {
  const ctx = useContext(ContactModalContext);
  if (!ctx) {
    throw new Error(
      'useContactModal must be used inside <ContactModalProvider>',
    );
  }
  return ctx;
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);

  return (
    <ContactModalContext.Provider value={value}>
      {children}
    </ContactModalContext.Provider>
  );
}

import { useState, useCallback } from 'react';
import { HelpContext } from './helpContextValue';

export default function HelpProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const openHelp  = useCallback(() => setIsOpen(true), []);
  const closeHelp = useCallback(() => setIsOpen(false), []);
  return (
    <HelpContext.Provider value={{ isOpen, openHelp, closeHelp }}>
      {children}
    </HelpContext.Provider>
  );
}

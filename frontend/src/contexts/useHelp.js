import { useContext } from 'react';
import { HelpContext } from './helpContextValue';

export function useHelp() {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error('useHelp must be used inside HelpProvider');
  return ctx;
}

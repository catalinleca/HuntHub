import { createContext } from 'react';
import type { SessionState, SessionActions } from './types';

export const SessionStateContext = createContext<SessionState | null>(null);
export const SessionActionsContext = createContext<SessionActions | null>(null);

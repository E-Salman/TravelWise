import type { Timestamp } from 'firebase/firestore';

export interface Notificacion {
  type: 'friend_request' | 'friend_accepted';  // <— sin el ‘|’ final
  payload: {
    requestId?: string;   // para friend_request
    fromUid?: string;     // quién inició la acción
    byUid?: string;       // quién aceptó, en caso de friend_accepted
  };
  read: boolean;
  timestamp: Timestamp;
}
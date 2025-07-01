import type { Timestamp } from 'firebase/firestore';

// Interfaz para una solicitud de amistad
export interface FriendRequest {
  fromUid: string;           // quién envía la solicitud
  timestamp: Timestamp;      // cuándo se envió
  status: 'pending' 
        | 'accepted' 
        | 'rejected';       // estado de la solicitud
}
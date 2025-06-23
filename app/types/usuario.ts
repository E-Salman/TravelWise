import type { Timestamp } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';

export interface usuario {
  nombre: string;
  mail: string;
  ciudad: string;
  avatarUrl: string;
  visibilidad: string;   // para tu dropdown
  sugerencia: string;    // para tu dropdown
  notificaciones: string; // para el toggle
  preferencias: string;
  lastLogin?: Timestamp;
}

export class UsuarioClass implements usuario {
  nombre = '';
  mail = '';
  ciudad = '';
  avatarUrl = '';
  visibilidad = 'Cualquiera';
  sugerencia = 'Amigos primero';
  notificaciones = 'Activadas';
  preferencias = 'Personalizadas';
  lastLogin?: Timestamp;

  constructor(init?: Partial<usuario>) {
    Object.assign(this, init);
  }

  toFirestoreObject() {
  return {
    nombre: this.nombre,
    mail: this.mail,
    ciudad: this.ciudad,
    avatarUrl: this.avatarUrl,
    visibilidad: this.visibilidad,
    sugerencia: this.sugerencia,
    notificaciones: this.notificaciones,
    preferencias: this.preferencias,
    lastLogin: serverTimestamp(),
  };
}

}
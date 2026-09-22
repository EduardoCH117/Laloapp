import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  completada: boolean;
  creadaEn: string;
}

const STORAGE_KEY = 'tareas';

@Injectable({
  providedIn: 'root',
})
export class TareasService {
  // Estado reactivo en memoria, sincronizado con Preferences en cada operación.
  public tareas = signal<Tarea[]>([]);

  /**
   * Carga todas las tareas guardadas en el almacenamiento persistente del
   * dispositivo (Capacitor Preferences) y las coloca en el signal `tareas`.
   * Debe llamarse al iniciar la página para que los datos sigan
   * disponibles después de cerrar y volver a abrir la app.
   */
  async cargar(): Promise<void> {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    this.tareas.set(value ? (JSON.parse(value) as Tarea[]) : []);
  }

  private async guardar(lista: Tarea[]): Promise<void> {
    this.tareas.set(lista);
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(lista),
    });
  }

  /** Alta: crea una nueva tarea y la persiste. */
  async crear(titulo: string, descripcion: string): Promise<void> {
    const nueva: Tarea = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      completada: false,
      creadaEn: new Date().toISOString(),
    };
    await this.guardar([nueva, ...this.tareas()]);
  }

  /** Modificación: actualiza una tarea existente y persiste el cambio. */
  async actualizar(id: string, cambios: Partial<Omit<Tarea, 'id' | 'creadaEn'>>): Promise<void> {
    const lista = this.tareas().map((t) =>
      t.id === id ? { ...t, ...cambios } : t
    );
    await this.guardar(lista);
  }

  /** Eliminación: borra una tarea y persiste el resultado. */
  async eliminar(id: string): Promise<void> {
    const lista = this.tareas().filter((t) => t.id !== id);
    await this.guardar(lista);
  }

  /** Alterna el estado completada/pendiente de una tarea. */
  async alternarCompletada(id: string): Promise<void> {
    const tarea = this.tareas().find((t) => t.id === id);
    if (!tarea) return;
    await this.actualizar(id, { completada: !tarea.completada });
  }
}

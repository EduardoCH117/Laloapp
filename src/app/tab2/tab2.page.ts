import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  AlertController,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { add, trash, createOutline, checkmarkCircle } from 'ionicons/icons';
import { Tarea, TareasService } from '../services/tareas.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonCheckbox,
    IonInput,
    IonTextarea,
    IonButton,
    IonIcon,
    IonFab,
    IonFabButton,
    IonModal,
  ],
})
export class Tab2Page implements OnInit {
  public tareasService = inject(TareasService);
  private alertController = inject(AlertController);

  // Controla la visibilidad del modal de alta/edición.
  isModalOpen = false;

  // Tarea que se está editando; null cuando el formulario es para un alta nueva.
  tareaEnEdicion: Tarea | null = null;

  // Campos del formulario del modal.
  formTitulo = '';
  formDescripcion = '';

  constructor() {
    addIcons({ add, trash, createOutline, checkmarkCircle });
  }

  async ngOnInit(): Promise<void> {
    // Carga las tareas guardadas en Capacitor Preferences: por eso siguen
    // apareciendo aunque se cierre y se vuelva a abrir la app.
    await this.tareasService.cargar();
  }

  abrirModalNuevaTarea(): void {
    this.tareaEnEdicion = null;
    this.formTitulo = '';
    this.formDescripcion = '';
    this.isModalOpen = true;
  }

  abrirModalEditar(tarea: Tarea): void {
    this.tareaEnEdicion = tarea;
    this.formTitulo = tarea.titulo;
    this.formDescripcion = tarea.descripcion;
    this.isModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
  }

  async guardarTarea(): Promise<void> {
    if (!this.formTitulo.trim()) {
      return;
    }

    if (this.tareaEnEdicion) {
      // Modificación de una tarea existente.
      await this.tareasService.actualizar(this.tareaEnEdicion.id, {
        titulo: this.formTitulo,
        descripcion: this.formDescripcion,
      });
    } else {
      // Alta de una tarea nueva.
      await this.tareasService.crear(this.formTitulo, this.formDescripcion);
    }

    this.isModalOpen = false;
  }

  async alternarCompletada(tarea: Tarea): Promise<void> {
    await this.tareasService.alternarCompletada(tarea.id);
  }

  async confirmarEliminar(tarea: Tarea): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Eliminar tarea',
      message: `¿Seguro que quieres eliminar "${tarea.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.tareasService.eliminar(tarea.id);
          },
        },
      ],
    });
    await alert.present();
  }
}

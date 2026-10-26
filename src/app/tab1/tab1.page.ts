
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  UsuarioService,
  Usuario
} from '../services/usuario.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Tab1Page implements OnInit {

  // USUARIOS
  usuarios: Usuario[] = [];

  // ESTADO DE LAS PETICIONES
  loading = false;
  private solicitudesActivas = 0;
  mensaje = '';
  errorMessage = '';

  // BÚSQUEDA Y ORDENAMIENTO
  search = '';
  predicate: keyof Usuario = 'id';
  reverse = true;

  // PAGINACIÓN
  resultlimit = 5;
  currentPage = 1;

  // FORMULARIO
  id: number | null = null;
  username = '';
  nombre = '';
  correo = '';
  password = '';

  editing = false;
  showModal = false;

  constructor(
    private usuariosApi: UsuarioService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // CONTROL DE LOADING
  private iniciarSolicitud(): void {
    this.solicitudesActivas++;
    this.loading = true;
    this.errorMessage = '';
  }

  private terminarSolicitud(): void {
    this.solicitudesActivas = Math.max(
      0,
      this.solicitudesActivas - 1
    );
    this.loading = this.solicitudesActivas > 0;
  }

  private manejarError(error: unknown, mensaje: string): void {
    console.error(mensaje, error);
    this.errorMessage = mensaje;
  }

  // GET - LISTAR USUARIOS
  cargarUsuarios(): void {
    this.iniciarSolicitud();

    this.usuariosApi.listar()
      .pipe(finalize(() => this.terminarSolicitud()))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            this.usuarios = respuesta.usuarios || [];
          } else {
            this.errorMessage =
              respuesta.message ||
              'No se pudieron cargar los usuarios.';
          }
        },
        error: (error) => {
          this.manejarError(
            error,
            'No se pudo conectar con el servidor PHP.'
          );
        }
      });
  }

  // ABRIR FORMULARIO DE CREACIÓN
  showCreateForm(): void {
    this.clearForm();
    this.editing = false;
    this.showModal = true;
  }

  // LIMPIAR FORMULARIO
  clearForm(): void {
    this.id = null;
    this.username = '';
    this.nombre = '';
    this.correo = '';
    this.password = '';
  }

  // POST - CREAR USUARIO
  createUsuario(): void {
    if (this.loading) return;

    if (
      !this.username.trim() ||
      !this.nombre.trim() ||
      !this.correo.trim() ||
      !this.password.trim()
    ) {
      alert('Completa todos los campos');
      return;
    }

    if (!this.correo.includes('@')) {
      alert('Ingresa un correo válido');
      return;
    }

    const datos = {
      username: this.username.trim(),
      nombre: this.nombre.trim(),
      correo: this.correo.trim(),
      password: this.password
    };

    this.iniciarSolicitud();

    this.usuariosApi.crear(datos)
      .pipe(finalize(() => this.terminarSolicitud()))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            this.mensaje = 'Usuario creado correctamente';
            this.clearForm();
            this.showModal = false;
            this.currentPage = 1;
            this.cargarUsuarios();
          } else {
            this.errorMessage =
              respuesta.message ||
              'No se pudo crear el usuario';
          }
        },
        error: (error) => {
          this.manejarError(
            error,
            'No se pudo conectar con el servidor PHP.'
          );
        }
      });
  }

  // SELECCIONAR USUARIO PARA EDITAR
  readOne(id: number): void {
    const usuario = this.usuarios.find(
      item => item.id === id
    );

    if (!usuario) {
      alert('No se encontró el usuario');
      return;
    }

    this.id = usuario.id;
    this.username = usuario.username;
    this.nombre = usuario.nombre;
    this.correo = usuario.correo;
    this.password = '';

    this.editing = true;
    this.showModal = true;
  }

  // PUT - ACTUALIZAR USUARIO
  updateUsuario(): void {
    if (this.loading) return;

    if (this.id === null) {
      alert('No se encontró el ID del usuario.');
      return;
    }

    if (
      !this.username.trim() ||
      !this.nombre.trim() ||
      !this.correo.trim()
    ) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    if (!this.correo.includes('@')) {
      alert('Ingresa un correo válido');
      return;
    }

    const datos: {
      id: number;
      username: string;
      nombre: string;
      correo: string;
      password?: string;
    } = {
      id: this.id,
      username: this.username.trim(),
      nombre: this.nombre.trim(),
      correo: this.correo.trim()
    };

    // Contraseña opcional al editar
    if (this.password.trim() !== '') {
      datos.password = this.password;
    }

    this.iniciarSolicitud();

    this.usuariosApi.actualizar(datos)
      .pipe(finalize(() => this.terminarSolicitud()))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            this.mensaje =
              respuesta.message ||
              'Usuario actualizado correctamente';

            this.clearForm();
            this.editing = false;
            this.showModal = false;
            this.cargarUsuarios();
          } else {
            this.errorMessage =
              respuesta.message ||
              'No se pudo actualizar el usuario';
          }
        },
        error: (error) => {
          this.manejarError(
            error,
            'No se pudo actualizar el usuario.'
          );
        }
      });
  }

  // DELETE - ELIMINAR USUARIO
  deleteUsuario(id: number): void {
    if (this.loading) return;

    if (!confirm('¿Seguro que quieres eliminar este usuario?')) {
      return;
    }

    this.iniciarSolicitud();

    this.usuariosApi.eliminar(id)
      .pipe(finalize(() => this.terminarSolicitud()))
      .subscribe({
        next: (respuesta) => {
          if (respuesta.success) {
            this.usuarios = this.usuarios.filter(
              usuario => usuario.id !== id
            );

            if (this.currentPage > this.totalPages) {
              this.currentPage = this.totalPages;
            }

            this.mensaje =
              respuesta.message ||
              'Usuario eliminado correctamente';
          } else {
            this.errorMessage =
              respuesta.message ||
              'No se pudo eliminar el usuario';
          }
        },
        error: (error) => {
          this.manejarError(
            error,
            'No se pudo eliminar el usuario.'
          );
        }
      });
  }

  // ORDENAMIENTO
  sortBy(field: keyof Usuario): void {
    if (this.predicate === field) {
      this.reverse = !this.reverse;
    } else {
      this.predicate = field;
      this.reverse = false;
    }
  }

  // FILTRADO Y ORDENAMIENTO
  get filteredUsuarios(): Usuario[] {
    let result = [...this.usuarios];

    if (this.search.trim() !== '') {
      const search = this.search.toLowerCase().trim();

      result = result.filter(
        item =>
          item.username.toLowerCase().includes(search) ||
          item.nombre.toLowerCase().includes(search) ||
          item.correo.toLowerCase().includes(search)
      );
    }

    result.sort((a, b) => {
      const valueA = a[this.predicate];
      const valueB = b[this.predicate];

      if (valueA === valueB) return 0;

      const comparison = valueA < valueB ? -1 : 1;
      return this.reverse ? -comparison : comparison;
    });

    return result;
  }

  // USUARIOS DE LA PÁGINA ACTUAL
  get pagedUsuarios(): Usuario[] {
    const start =
      (this.currentPage - 1) * Number(this.resultlimit);

    return this.filteredUsuarios.slice(
      start,
      start + Number(this.resultlimit)
    );
  }

  // TOTAL DE PÁGINAS
  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(
        this.filteredUsuarios.length /
        Number(this.resultlimit)
      )
    );
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  changePageLimit(): void {
    this.currentPage = 1;
  }

  // CERRAR MODAL
  closeModal(): void {
    if (this.loading) return;

    this.showModal = false;
    this.editing = false;
    this.clearForm();
  }

  // FORMATO DE FECHA
  formatFecha(fecha: string): string {
    if (!fecha) return '';

    const date = new Date(fecha.replace(' ', 'T'));

    if (isNaN(date.getTime())) {
      return fecha;
    }

    return (
      date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) +
      ' ' +
      date.toLocaleTimeString('es-MX', {
        hour: 'numeric',
        minute: '2-digit'
      })
    );
  }

  // LISTA DE CORREOS
  get emailList(): Usuario[] {
    return this.filteredUsuarios;
  }

  get emailAddresses(): string {
    return this.emailList
      .map(usuario => usuario.correo)
      .join(', ');
  }

  get mailtoAll(): string {
    return 'mailto:' + this.emailAddresses;
  }
}

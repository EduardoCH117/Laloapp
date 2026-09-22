import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  correo: string;
  fecha_registro: string;
}

export interface UsuarioNuevo {
  username: string;
  nombre: string;
  correo: string;
  password: string;
}

export interface UsuarioActualizado {
  id: number;
  username: string;
  nombre: string;
  correo: string;
  password?: string; // opcional: si no se manda, el backend no cambia la contraseña
}

export interface RespuestaApi {
  success: boolean;
  message?: string;
}

export interface RespuestaListarUsuarios extends RespuestaApi {
  usuarios: Usuario[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiListar = 'http://localhost/laloapi/usuarios_listar.php';
  private apiCrear = 'http://localhost/laloapi/usuarios_crear.php';
  private apiActualizar = 'http://localhost/laloapi/usuarios_actualizar.php';
  private apiEliminar = 'http://localhost/laloapi/usuarios_eliminar.php';

  constructor(private http: HttpClient) {}

  listar(): Observable<RespuestaListarUsuarios> {

    return this.http.get<RespuestaListarUsuarios>(this.apiListar);

  }

  crear(usuario: UsuarioNuevo): Observable<RespuestaApi> {

    return this.http.post<RespuestaApi>(this.apiCrear, usuario);

  }

  actualizar(usuario: UsuarioActualizado): Observable<RespuestaApi> {

    return this.http.post<RespuestaApi>(this.apiActualizar, usuario);

  }

  eliminar(id: number): Observable<RespuestaApi> {

    return this.http.post<RespuestaApi>(this.apiEliminar, { id });

  }

}
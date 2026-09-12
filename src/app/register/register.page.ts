import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class RegisterPage {

  username: string = '';
  nombre: string = '';
  correo: string = '';
  password: string = '';
  confirmarPassword: string = '';

  private apiUrl = 'http://localhost/laloapi/registrar.php';

  constructor(private http: HttpClient, private router: Router) {}


  registrarse(): void {

    if (!this.username || !this.nombre || !this.correo || !this.password || !this.confirmarPassword) {

      alert('Completa todos los campos');

      return;
    }

    if (this.password !== this.confirmarPassword) {

      alert('Las contraseñas no coinciden');

      return;
    }


    const datos = {

      username: this.username,
      nombre: this.nombre,
      correo: this.correo,
      password: this.password

    };


    this.http.post<any>(this.apiUrl, datos)
      .subscribe({

        next: (respuesta) => {

          console.log('Respuesta PHP:', respuesta);

          if (respuesta.success) {

            alert('Cuenta creada correctamente, ahora inicia sesión');

            this.router.navigate(['/login']);

          } else {

            alert(respuesta.message);

          }

        },


        error: (error) => {

          console.error('Error de conexión:', error);

          alert('No se pudo conectar con el servidor PHP');

        }

      });

  }


  irALogin(): void {

    this.router.navigate(['/login']);

  }

}
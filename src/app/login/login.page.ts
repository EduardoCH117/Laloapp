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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class LoginPage {

  isStyleSec: boolean = false;
  isStyleThird: boolean = false;

  username: string = '';
  password: string = '';

  private apiUrl = 'http://localhost/laloapi/login.php';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  numberOne(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.isStyleSec = false;
    this.isStyleThird = false;
  }

  numberTwo(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.isStyleSec = true;
    this.isStyleThird = false;
  }

  numberThree(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.isStyleSec = false;
    this.isStyleThird = true;
  }

  iniciarSesion(): void {

    if (!this.username || !this.password) {
      alert('Please enter username and password');
      return;
    }

    const datos = {
      username: this.username,
      password: this.password
    };

    this.http.post<any>(this.apiUrl, datos)
      .subscribe({

        next: (respuesta) => {

          console.log('Respuesta PHP:', respuesta);

          if (respuesta.success) {

            console.log('Usuario:', respuesta.usuario);

            // Guardar los datos del usuario que inició sesión
            localStorage.setItem(
              'usuario',
              JSON.stringify(respuesta.usuario)
            );

            // Limpiar contraseña del formulario
            this.password = '';

            // Ir a la aplicación
            this.router.navigate(['/tabs/tab1']);

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

  irARegistro(): void {
    this.router.navigate(['/register']);
  }
}
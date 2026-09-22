
import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent
  ],
})
export class Tab3Page {

  xboxConnected: boolean = false;

  gamertag: string = 'Xbox no conectado';

  gamerscore: number = 0;

  achievements: any[] = [];

  loadingAchievements: boolean = false;

  achievementsLoaded: boolean = false;


  constructor(
    private http: HttpClient
  ) {}


  ngOnInit(): void {

    this.cargarPerfilXbox();

  }


  // ==========================================
  // CONECTAR XBOX
  // ==========================================

  conectarXbox(): void {

    console.log('Iniciando conexión con Xbox...');

    window.location.href =
      'http://localhost/laloapi/xbox/login.php';

  }


  // ==========================================
  // CARGAR PERFIL XBOX
  // ==========================================

  cargarPerfilXbox(): void {

    console.log('Consultando perfil de Xbox...');

    this.http.get<any>(
      'http://localhost/laloapi/xbox/profile.php',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (datos) => {

        console.log('PERFIL XBOX:');
        console.log(datos);


        if (datos.success) {

          this.xboxConnected = true;

          this.gamertag =
            datos.gamertag || 'Xbox conectado';

          this.gamerscore =
            Number(datos.gamerscore) || 0;


          console.log(
            'Gamertag:',
            this.gamertag
          );

          console.log(
            'Gamerscore:',
            this.gamerscore
          );

        } else {

          this.xboxConnected = false;

          this.gamertag = 'Xbox no conectado';

          this.gamerscore = 0;

          console.error(
            'No hay sesión Xbox:',
            datos
          );

        }

      },

      error: (error) => {

        this.xboxConnected = false;

        console.error(
          'Error consultando perfil de Xbox:',
          error
        );

      }

    });

  }


  // ==========================================
  // VER LOGROS
  // ==========================================

  verLogros(): void {

    console.log('Consultando logros de Xbox...');

    this.loadingAchievements = true;


    this.http.get<any>(
      'http://localhost/laloapi/xbox/achievements.php',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (datos) => {

        console.log('JSON RECIBIDO:');

        console.log(datos);


        this.loadingAchievements = false;


        if (datos.success) {

          this.xboxConnected = true;


          if (
            datos.achievements &&
            Array.isArray(
              datos.achievements.achievements
            )
          ) {

            this.achievements =
              datos.achievements.achievements;

          } else {

            this.achievements = [];

          }


          this.achievementsLoaded = true;


          console.log(
            'Logros encontrados:',
            this.achievements.length
          );


        } else {

          this.xboxConnected = false;

          console.error(
            'Xbox devolvió un error:',
            datos
          );


          alert(
            datos.message ||
            'Xbox devolvió un error.'
          );

        }

      },


      error: (error) => {

        console.error(
          'Error consultando logros:',
          error
        );


        this.loadingAchievements = false;


        alert(
          'No se pudieron consultar los logros de Xbox.'
        );

      }

    });

  }

}


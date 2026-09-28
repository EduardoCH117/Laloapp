
import { Component, ChangeDetectorRef } from '@angular/core';
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

  // ==============================
  // XBOX
  // ==============================

  xboxConnected: boolean = false;

  gamertag: string = 'Xbox no conectado';

  gamerscore: number = 0;


  // ==============================
  // JUEGOS
  // ==============================

  games: any[] = [];

  loadingGames: boolean = false;

  gamesLoaded: boolean = false;

  selectedGame: any = null;


  // ==============================
  // IMÁGENES
  // ==============================

  loadingImages: boolean = false;


  // ==============================
  // LOGROS
  // ==============================

  achievements: any[] = [];

  loadingAchievements: boolean = false;

  achievementsLoaded: boolean = false;


  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {

    const xboxGuardado =
      localStorage.getItem('xboxConnected');

    const gamertagGuardado =
      localStorage.getItem('xboxGamertag');

    const gamerscoreGuardado =
      localStorage.getItem('xboxGamerscore');


    if (xboxGuardado === 'true') {
      this.xboxConnected = true;
    }


    if (gamertagGuardado) {
      this.gamertag = gamertagGuardado;
    }


    if (gamerscoreGuardado) {
      this.gamerscore =
        Number(gamerscoreGuardado);
    }

  }


  // ==============================
  // INICIO
  // ==============================

  ngOnInit(): void {

    console.log('================================');
    console.log('TAB 3 INICIADA');
    console.log('================================');

  }


  ionViewWillEnter(): void {

    console.log('================================');
    console.log('🎮 TAB 3 ENTRANDO EN PANTALLA');
    console.log('================================');

    this.cargarPerfilXbox();

  }


  // ==============================
  // CONECTAR XBOX
  // ==============================

  conectarXbox(): void {

    console.log(
      'Iniciando conexión con Xbox...'
    );

    window.location.href =
      'http://localhost/laloapi/xbox/login.php';

  }


  // ==============================
  // PERFIL XBOX
  // ==============================

  cargarPerfilXbox(): void {

    console.log(
      'Consultando perfil de Xbox...'
    );


    this.http.get<any>(
      'http://localhost/laloapi/xbox/profile.php',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (datos) => {

        console.log('================================');
        console.log('PERFIL XBOX:');
        console.log('================================');

        console.log(datos);


        if (datos.success) {

          this.xboxConnected = true;


          this.gamertag =
            datos.gamertag ||
            'Xbox conectado';


          this.gamerscore =
            Number(datos.gamerscore) || 0;


          localStorage.setItem(
            'xboxConnected',
            'true'
          );


          localStorage.setItem(
            'xboxGamertag',
            this.gamertag
          );


          localStorage.setItem(
            'xboxGamerscore',
            this.gamerscore.toString()
          );


          console.log(
            'Gamertag:',
            this.gamertag
          );


          console.log(
            'Gamerscore:',
            this.gamerscore
          );


          console.log(
            'Sesión Xbox confirmada.'
          );


          // ==============================
          // CARGAR JUEGOS
          // ==============================

          this.cargarJuegos();


          this.cdr.detectChanges();

        } else {

          console.error(
            'No hay sesión Xbox:',
            datos
          );


          this.xboxConnected = false;

          this.gamertag =
            'Xbox no conectado';

          this.gamerscore = 0;


          this.games = [];

          this.gamesLoaded = false;

          this.selectedGame = null;


          this.achievements = [];

          this.achievementsLoaded = false;


          localStorage.removeItem(
            'xboxConnected'
          );

          localStorage.removeItem(
            'xboxGamertag'
          );

          localStorage.removeItem(
            'xboxGamerscore'
          );


          this.cdr.detectChanges();

        }

      },


      error: (error) => {

        console.error(
          'Error consultando perfil de Xbox:',
          error
        );


        if (
          localStorage.getItem(
            'xboxConnected'
          ) === 'true'
        ) {

          this.xboxConnected = true;

          this.cargarJuegos();

        }


        this.cdr.detectChanges();

      }

    });

  }


  // ==============================
  // CARGAR JUEGOS
  // ==============================

  cargarJuegos(): void {

    console.log('================================');
    console.log('🎮 CONSULTANDO JUEGOS DE XBOX');
    console.log('================================');


    this.loadingGames = true;

    this.gamesLoaded = false;


    this.http.get<any>(
      'http://localhost/laloapi/xbox/games.php',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (datos) => {

        console.log('================================');
        console.log('🎮 JSON RECIBIDO DE JUEGOS');
        console.log('================================');


        console.log(
          'DATOS COMPLETOS:',
          datos
        );


        console.log(
          'games:',
          datos.games
        );


        console.log(
          'titles:',
          datos.games?.titles
        );


        console.log(
          'Cantidad recibida:',
          datos.games?.titles?.length
        );


        // ==============================
        // COMPROBAR RESPUESTA
        // ==============================

        if (!datos.success) {

          console.error(
            'Xbox devolvió un error:',
            datos
          );


          this.games = [];

          this.gamesLoaded = false;

          this.loadingGames = false;


          this.cdr.detectChanges();


          alert(
            datos.message ||
            'No se pudieron obtener los juegos de Xbox.'
          );


          return;

        }


        // ==============================
        // OBTENER JUEGOS
        // ==============================

        if (
          datos.games &&
          Array.isArray(
            datos.games.titles
          )
        ) {

          this.games =
            datos.games.titles;


          console.log(
            'Cantidad de juegos:',
            this.games.length
          );


          // ==============================
          // ORDENAR POR GAMERSCORE
          // ==============================

          this.games.sort(
            (
              a: any,
              b: any
            ) => {

              return (
                Number(
                  b.currentGamerscore || 0
                ) -
                Number(
                  a.currentGamerscore || 0
                )
              );

            }
          );


        } else {

          console.error(
            '❌ NO SE ENCONTRÓ EL ARRAY DE JUEGOS'
          );


          this.games = [];

        }


        // ==============================
        // TERMINAR CARGA DE JUEGOS
        // ==============================

        this.gamesLoaded = true;

        this.loadingGames = false;


        this.cdr.detectChanges();


        console.log(
          'Cantidad final de juegos:',
          this.games.length
        );


        // ==============================
        // CARGAR IMÁGENES
        // ==============================

        this.cargarImagenes();


        console.log('================================');
        console.log(
          '🎮 CARGA DE JUEGOS TERMINADA'
        );
        console.log('================================');

      },


      error: (error) => {

        console.error('================================');
        console.error(
          '❌ ERROR CONSULTANDO JUEGOS'
        );
        console.error('================================');


        console.error(
          'Error completo:',
          error
        );


        console.error(
          'Status:',
          error.status
        );


        console.error(
          'Mensaje:',
          error.message
        );


        console.error(
          'Error:',
          error.error
        );


        this.loadingGames = false;

        this.gamesLoaded = false;

        this.games = [];


        this.cdr.detectChanges();


        alert(
          'No se pudieron consultar los juegos de Xbox.'
        );

      }

    });

  }


  // ==============================
  // CARGAR IMÁGENES RAWG
  // ==============================

  cargarImagenes(): void {

    if (
      !this.games ||
      this.games.length === 0
    ) {

      return;

    }


    console.log('================================');
    console.log('🖼️ CARGANDO IMÁGENES DE RAWG');
    console.log('================================');


    this.loadingImages = true;


    // ==========================================
    // CARGAR UNA IMAGEN POR JUEGO
    // ==========================================

    this.games.forEach(
      (game: any, index: number) => {

        if (!game.name) {

          return;

        }


        console.log(
          `Buscando imagen ${index + 1}/${this.games.length}:`,
          game.name
        );


        this.http.get<any>(
          'http://localhost/laloapi/xbox/game_image.php',
          {
            params: {
              name: game.name
            }
          }
        ).subscribe({

          next: (datos) => {

            if (
              datos.success &&
              datos.image
            ) {

              game.image =
                datos.image;


              console.log(
                '🖼️ Imagen encontrada:',
                game.name
              );

            } else {

              game.image = null;


              console.log(
                '⚠️ RAWG no encontró imagen:',
                game.name
              );

            }


            this.cdr.detectChanges();

          },


          error: (error) => {

            console.error(
              '❌ Error obteniendo imagen:',
              game.name,
              error
            );


            game.image = null;


            this.cdr.detectChanges();

          }

        });

      }
    );


    this.loadingImages = false;

  }


  // ==============================
  // SELECCIONAR JUEGO
  // ==============================

  seleccionarJuego(game: any): void {

    console.log('================================');
    console.log('🎮 JUEGO SELECCIONADO');
    console.log('================================');


    console.log(
      'Nombre:',
      game.name
    );


    console.log(
      'Title ID:',
      game.titleId
    );


    console.log(
      'Gamerscore:',
      game.currentGamerscore
    );


    console.log(
      'Imagen:',
      game.image
    );


    this.selectedGame = game;


    this.achievements = [];

    this.achievementsLoaded = false;

    this.loadingAchievements = false;


    this.cdr.detectChanges();

  }


  // ==============================
  // CERRAR JUEGO
  // ==============================

  cerrarJuego(): void {

    console.log(
      'Cerrando juego seleccionado.'
    );


    this.selectedGame = null;


    this.achievements = [];

    this.achievementsLoaded = false;

    this.loadingAchievements = false;


    this.cdr.detectChanges();

  }


  // ==============================
  // VER LOGROS DEL JUEGO
  // ==============================

  verLogros(): void {

    console.log('================================');
    console.log('🏆 CONSULTANDO LOGROS DEL JUEGO');
    console.log('================================');


    if (!this.selectedGame) {

      console.error(
        '❌ No hay ningún juego seleccionado.'
      );


      alert(
        'Primero selecciona un juego.'
      );


      return;

    }


    const titleId =
      this.selectedGame.titleId;


    console.log(
      'Juego:',
      this.selectedGame.name
    );


    console.log(
      'Title ID:',
      titleId
    );


    this.loadingAchievements = true;

    this.achievementsLoaded = false;

    this.achievements = [];


    this.cdr.detectChanges();


    this.http.get<any>(
      'http://localhost/laloapi/xbox/game_achievements.php',
      {
        params: {
          titleId:
            titleId.toString()
        },

        withCredentials: true
      }
    ).subscribe({

      next: (datos) => {

        console.log('================================');
        console.log(
          '🏆 LOGROS DEL JUEGO RECIBIDOS'
        );
        console.log('================================');


        console.log(
          'DATOS COMPLETOS:',
          datos
        );


        if (!datos.success) {

          console.error(
            'Xbox devolvió un error:',
            datos
          );


          this.achievements = [];

          this.achievementsLoaded = false;

          this.loadingAchievements = false;


          this.cdr.detectChanges();


          alert(
            datos.message ||
            'No se pudieron obtener los logros de este juego.'
          );


          return;

        }


        if (
          datos.achievements &&
          Array.isArray(
            datos.achievements.achievements
          )
        ) {

          this.achievements =
            datos.achievements.achievements;


          console.log(
            'Juego:',
            this.selectedGame.name
          );


          console.log(
            'Cantidad:',
            this.achievements.length
          );


          if (
            this.achievements.length > 0
          ) {

            console.log(
              'PRIMER LOGRO:',
              this.achievements[0]
            );

          }

        } else {

          console.error(
            '❌ NO SE ENCONTRÓ EL ARRAY DE LOGROS'
          );


          this.achievements = [];

        }


        this.achievementsLoaded = true;

        this.loadingAchievements = false;


        this.cdr.detectChanges();


        console.log(
          'Cantidad final:',
          this.achievements.length
        );

      },


      error: (error) => {

        console.error('================================');
        console.error(
          '❌ ERROR CONSULTANDO LOGROS DEL JUEGO'
        );
        console.error('================================');


        console.error(
          'Error completo:',
          error
        );


        console.error(
          'Status:',
          error.status
        );


        console.error(
          'Mensaje:',
          error.message
        );


        console.error(
          'Error:',
          error.error
        );


        this.loadingAchievements = false;

        this.achievementsLoaded = false;

        this.achievements = [];


        this.cdr.detectChanges();


        alert(
          'No se pudieron consultar los logros de este juego.'
        );

      }

    });

  }

}


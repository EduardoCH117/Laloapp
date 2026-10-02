import {
  Component,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';

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
export class Tab3Page implements OnDestroy {

  // ==============================
  // CONEXIÓN
  // ==============================

  isOnline: boolean = navigator.onLine;
  connectionMessage: string = '';
  showConnectionMessage: boolean = false;

  private onlineListener: () => void;
  private offlineListener: () => void;

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

  // ==============================
  // MENSAJES
  // ==============================

  errorMessage: string = '';

  // ==============================
  // CLAVES DE CACHÉ
  // ==============================

  private readonly CACHE_PROFILE =
    'xboxCacheProfile';

  private readonly CACHE_GAMES =
    'xboxCacheGames';

  private readonly CACHE_ACHIEVEMENTS =
    'xboxCacheAchievements';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {

    // ==============================
    // RECUPERAR PERFIL GUARDADO
    // ==============================

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

    // ==============================
    // DETECTAR CONEXIÓN
    // ==============================

    this.onlineListener = () => {
      this.isOnline = true;

      console.log(
        '================================'
      );

      console.log(
        '🌐 CONEXIÓN RESTAURADA'
      );

      console.log(
        '================================'
      );

      this.mostrarMensajeConexion(
        'Conexión restaurada. Actualizando datos...'
      );

      this.cargarPerfilXbox();
    };

    this.offlineListener = () => {
      this.isOnline = false;

      console.log(
        '================================'
      );

      console.log(
        '📴 CONEXIÓN PERDIDA'
      );

      console.log(
        '================================'
      );

      this.mostrarMensajeConexion(
        'Sin conexión. Se mostrarán los últimos datos guardados.'
      );

      this.cargarDatosCache();
    };

    window.addEventListener(
      'online',
      this.onlineListener
    );

    window.addEventListener(
      'offline',
      this.offlineListener
    );
  }

  // ==============================
  // DESTRUIR COMPONENTE
  // ==============================

  ngOnDestroy(): void {

    window.removeEventListener(
      'online',
      this.onlineListener
    );

    window.removeEventListener(
      'offline',
      this.offlineListener
    );
  }

  // ==============================
  // INICIO
  // ==============================

  ngOnInit(): void {

    console.log(
      '================================'
    );

    console.log(
      'TAB 3 INICIADA'
    );

    console.log(
      'Estado de conexión:',
      this.isOnline
    );

    console.log(
      '================================'
    );
  }

  // ==============================
  // ENTRAR A LA PANTALLA
  // ==============================

  ionViewWillEnter(): void {

    console.log(
      '================================'
    );

    console.log(
      '🎮 TAB 3 ENTRANDO EN PANTALLA'
    );

    console.log(
      '================================'
    );

    if (this.isOnline) {
      this.cargarPerfilXbox();
    } else {
      this.mostrarMensajeConexion(
        'Estás sin conexión. Mostrando datos guardados.'
      );

      this.cargarDatosCache();
    }
  }

  // ==============================
  // MOSTRAR MENSAJE
  // ==============================

  mostrarMensajeConexion(
    mensaje: string
  ): void {

    this.connectionMessage = mensaje;
    this.showConnectionMessage = true;

    this.cdr.detectChanges();

    setTimeout(() => {

      this.showConnectionMessage = false;

      this.cdr.detectChanges();

    }, 5000);
  }

  // ==============================
  // MOSTRAR ERROR
  // ==============================

  mostrarError(
    mensaje: string
  ): void {

    this.errorMessage = mensaje;

    this.cdr.detectChanges();

    setTimeout(() => {

      this.errorMessage = '';

      this.cdr.detectChanges();

    }, 6000);
  }

  // ==============================
  // CONECTAR XBOX
  // ==============================

  conectarXbox(): void {

    if (!this.isOnline) {

      this.mostrarError(
        'No puedes conectar tu cuenta de Xbox sin conexión a Internet.'
      );

      return;
    }

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

    if (!this.isOnline) {

      console.log(
        'Sin conexión. Usando perfil guardado.'
      );

      this.cargarPerfilCache();

      return;
    }

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

        console.log(
          '================================'
        );

        console.log(
          'PERFIL XBOX:'
        );

        console.log(
          '================================'
        );

        console.log(datos);

        if (datos.success) {

          this.xboxConnected = true;

          this.gamertag =
            datos.gamertag ||
            'Xbox conectado';

          this.gamerscore =
            Number(datos.gamerscore) || 0;

          // ==============================
          // GUARDAR PERFIL
          // ==============================

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

          this.guardarPerfilCache();

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

          this.mostrarError(
            datos.message ||
            'La sesión de Xbox no está disponible.'
          );

          this.cdr.detectChanges();
        }
      },

      error: (error) => {

        console.error(
          'Error consultando perfil de Xbox:',
          error
        );

        this.mostrarError(
          'No se pudo conectar con el servidor de Xbox. Se intentarán mostrar los últimos datos guardados.'
        );

        this.cargarDatosCache();

        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // GUARDAR PERFIL EN CACHÉ
  // ==============================

  guardarPerfilCache(): void {

    const perfil = {
      gamertag: this.gamertag,
      gamerscore: this.gamerscore,
      xboxConnected: this.xboxConnected
    };

    localStorage.setItem(
      this.CACHE_PROFILE,
      JSON.stringify(perfil)
    );

    console.log(
      '💾 Perfil guardado en caché.'
    );
  }

  // ==============================
  // CARGAR PERFIL DE CACHÉ
  // ==============================

  cargarPerfilCache(): boolean {

    const perfilGuardado =
      localStorage.getItem(
        this.CACHE_PROFILE
      );

    if (!perfilGuardado) {
      return false;
    }

    try {

      const perfil =
        JSON.parse(perfilGuardado);

      this.xboxConnected =
        perfil.xboxConnected === true;

      this.gamertag =
        perfil.gamertag ||
        'Xbox conectado';

      this.gamerscore =
        Number(perfil.gamerscore) || 0;

      console.log(
        '💾 Perfil recuperado desde caché.'
      );

      return true;

    } catch (error) {

      console.error(
        'Error leyendo caché del perfil:',
        error
      );

      return false;
    }
  }

  // ==============================
  // CARGAR DATOS DE CACHÉ
  // ==============================

  cargarDatosCache(): void {

    console.log(
      '================================'
    );

    console.log(
      '💾 CARGANDO DATOS DESDE CACHÉ'
    );

    console.log(
      '================================'
    );

    const perfilDisponible =
      this.cargarPerfilCache();

    const juegosDisponibles =
      this.cargarJuegosCache();

    if (!perfilDisponible &&
        !juegosDisponibles) {

      this.mostrarError(
        'No hay datos guardados disponibles. Conéctate a Internet para consultar Xbox.'
      );
    }

    this.cdr.detectChanges();
  }

  // ==============================
  // CARGAR JUEGOS
  // ==============================

  cargarJuegos(): void {

    if (!this.isOnline) {

      console.log(
        'Sin conexión. Cargando juegos desde caché.'
      );

      this.cargarJuegosCache();

      return;
    }

    console.log(
      '================================'
    );

    console.log(
      '🎮 CONSULTANDO JUEGOS DE XBOX'
    );

    console.log(
      '================================'
    );

    this.loadingGames = true;
    this.gamesLoaded = false;

    this.http.get<any>(
      'http://localhost/laloapi/xbox/games.php',
      {
        withCredentials: true
      }
    ).subscribe({

      next: (datos) => {

        console.log(
          '================================'
        );

        console.log(
          '🎮 JSON RECIBIDO DE JUEGOS'
        );

        console.log(
          '================================'
        );

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

          this.loadingGames = false;

          this.gamesLoaded = false;

          // Intentar caché

          if (!this.cargarJuegosCache()) {

            this.mostrarError(
              datos.message ||
              'No se pudieron obtener los juegos de Xbox.'
            );
          }

          this.cdr.detectChanges();

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
        // GUARDAR CACHÉ
        // ==============================

        this.guardarJuegosCache();

        // ==============================
        // TERMINAR CARGA
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

        console.log(
          '================================'
        );

        console.log(
          '🎮 CARGA DE JUEGOS TERMINADA'
        );

        console.log(
          '================================'
        );
      },

      error: (error) => {

        console.error(
          '================================'
        );

        console.error(
          '❌ ERROR CONSULTANDO JUEGOS'
        );

        console.error(
          '================================'
        );

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

        // Intentar utilizar caché

        if (this.cargarJuegosCache()) {

          this.mostrarMensajeConexion(
            'No se pudo actualizar la lista. Mostrando juegos guardados.'
          );

        } else {

          this.games = [];

          this.mostrarError(
            'No se pudieron consultar los juegos de Xbox y no hay datos guardados.'
          );
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // GUARDAR JUEGOS EN CACHÉ
  // ==============================

  guardarJuegosCache(): void {

    try {

      localStorage.setItem(
        this.CACHE_GAMES,
        JSON.stringify(this.games)
      );

      console.log(
        '💾 Juegos guardados en caché.'
      );

    } catch (error) {

      console.error(
        'Error guardando juegos en caché:',
        error
      );
    }
  }

  // ==============================
  // CARGAR JUEGOS DE CACHÉ
  // ==============================

  cargarJuegosCache(): boolean {

    const juegosGuardados =
      localStorage.getItem(
        this.CACHE_GAMES
      );

    if (!juegosGuardados) {

      console.log(
        'No existe caché de juegos.'
      );

      return false;
    }

    try {

      this.games =
        JSON.parse(juegosGuardados);

      if (!Array.isArray(this.games)) {

        this.games = [];

        return false;
      }

      this.gamesLoaded = true;
      this.loadingGames = false;

      console.log(
        '💾 Juegos recuperados desde caché:',
        this.games.length
      );

      this.cdr.detectChanges();

      return true;

    } catch (error) {

      console.error(
        'Error leyendo caché de juegos:',
        error
      );

      this.games = [];

      return false;
    }
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

    if (!this.isOnline) {

      console.log(
        'Sin conexión. Se mantienen las imágenes guardadas.'
      );

      return;
    }

    console.log(
      '================================'
    );

    console.log(
      '🖼️ CARGANDO IMÁGENES DE RAWG'
    );

    console.log(
      '================================'
    );

    this.loadingImages = true;

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

            // Guardar juegos con imágenes
            this.guardarJuegosCache();

            this.cdr.detectChanges();
          },

          error: (error) => {

            console.error(
              '❌ Error obteniendo imagen:',
              game.name,
              error
            );

            // No borramos una imagen que ya
            // estaba guardada anteriormente.

            if (!game.image) {
              game.image = null;
            }

            this.guardarJuegosCache();

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

  seleccionarJuego(
    game: any
  ): void {

    console.log(
      '================================'
    );

    console.log(
      '🎮 JUEGO SELECCIONADO'
    );

    console.log(
      '================================'
    );

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

    console.log(
      '================================'
    );

    console.log(
      '🏆 CONSULTANDO LOGROS DEL JUEGO'
    );

    console.log(
      '================================'
    );

    if (!this.selectedGame) {

      console.error(
        '❌ No hay ningún juego seleccionado.'
      );

      this.mostrarError(
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

    // ==============================
    // SI ESTAMOS OFFLINE
    // ==============================

    if (!this.isOnline) {

      console.log(
        '📴 Sin conexión. Buscando logros en caché.'
      );

      if (
        this.cargarLogrosCache(
          titleId.toString()
        )
      ) {

        this.mostrarMensajeConexion(
          'Mostrando los logros guardados anteriormente.'
        );

      } else {

        this.mostrarError(
          'No hay logros guardados para este juego. Conéctate a Internet para consultarlos.'
        );
      }

      return;
    }

    // ==============================
    // PREPARAR CONSULTA
    // ==============================

    this.loadingAchievements = true;

    this.achievementsLoaded = false;

    this.achievements = [];

    this.cdr.detectChanges();

    // ==============================
    // CONSULTAR BACKEND
    // ==============================

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

        console.log(
          '================================'
        );

        console.log(
          '🏆 LOGROS DEL JUEGO RECIBIDOS'
        );

        console.log(
          '================================'
        );

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

          // Intentar caché

          if (
            !this.cargarLogrosCache(
              titleId.toString()
            )
          ) {

            this.mostrarError(
              datos.message ||
              'No se pudieron obtener los logros de este juego.'
            );
          }

          this.cdr.detectChanges();

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

          // ==============================
          // GUARDAR LOGROS EN CACHÉ
          // ==============================

          this.guardarLogrosCache(
            titleId.toString()
          );

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

        console.error(
          '================================'
        );

        console.error(
          '❌ ERROR CONSULTANDO LOGROS DEL JUEGO'
        );

        console.error(
          '================================'
        );

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

        // ==============================
        // USAR CACHÉ
        // ==============================

        if (
          this.cargarLogrosCache(
            titleId.toString()
          )
        ) {

          this.mostrarMensajeConexion(
            'No se pudieron actualizar los logros. Mostrando los últimos guardados.'
          );

        } else {

          this.achievements = [];

          this.mostrarError(
            'No se pudieron consultar los logros y no hay datos guardados.'
          );
        }

        this.cdr.detectChanges();
      }
    });
  }

  // ==============================
  // GUARDAR LOGROS EN CACHÉ
  // ==============================

  guardarLogrosCache(
    titleId: string
  ): void {

    try {

      const cacheActual =
        localStorage.getItem(
          this.CACHE_ACHIEVEMENTS
        );

      let cache: any = {};

      if (cacheActual) {

        cache =
          JSON.parse(cacheActual);
      }

      cache[titleId] =
        this.achievements;

      localStorage.setItem(
        this.CACHE_ACHIEVEMENTS,
        JSON.stringify(cache)
      );

      console.log(
        '💾 Logros guardados en caché:',
        titleId
      );

    } catch (error) {

      console.error(
        'Error guardando logros en caché:',
        error
      );
    }
  }

  // ==============================
  // CARGAR LOGROS DE CACHÉ
  // ==============================

  cargarLogrosCache(
    titleId: string
  ): boolean {

    try {

      const cacheGuardado =
        localStorage.getItem(
          this.CACHE_ACHIEVEMENTS
        );

      if (!cacheGuardado) {

        return false;
      }

      const cache =
        JSON.parse(cacheGuardado);

      if (
        !cache[titleId] ||
        !Array.isArray(
          cache[titleId]
        )
      ) {

        return false;
      }

      this.achievements =
        cache[titleId];

      this.achievementsLoaded = true;

      this.loadingAchievements = false;

      console.log(
        '💾 Logros recuperados desde caché:',
        titleId
      );

      this.cdr.detectChanges();

      return true;

    } catch (error) {

      console.error(
        'Error leyendo caché de logros:',
        error
      );

      return false;
    }
  }

  // ==============================
  // LIMPIAR CACHÉ
  // ==============================

  limpiarCache(): void {

    localStorage.removeItem(
      this.CACHE_PROFILE
    );

    localStorage.removeItem(
      this.CACHE_GAMES
    );

    localStorage.removeItem(
      this.CACHE_ACHIEVEMENTS
    );

    console.log(
      '🗑️ Caché de Xbox eliminada.'
    );
  }
}
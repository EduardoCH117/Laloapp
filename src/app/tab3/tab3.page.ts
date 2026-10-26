import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  ElementRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent
} from '@ionic/angular';

import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';

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

  // ==============================
  // GALERÍA MULTIMEDIA INTERACTIVA
  // ==============================

  mostrarGaleria: boolean = false;
  indicePortada: number = -1;

  get juegoEnVisor(): any | null {
    return this.indicePortada >= 0 && this.indicePortada < this.games.length
      ? this.games[this.indicePortada]
      : null;
  }

  abrirGaleria(): void {
    this.mostrarGaleria = true;
  }

  cerrarGaleria(): void {
    this.cerrarVisor();
    this.mostrarGaleria = false;
  }

  abrirVisor(index: number): void {
    if (index < 0 || index >= this.games.length) return;
    this.indicePortada = index;
  }

  cerrarVisor(): void {
    this.indicePortada = -1;
  }

  cambiarPortada(direccion: number): void {
    if (this.indicePortada < 0 || this.games.length === 0) return;
    this.indicePortada =
      (this.indicePortada + direccion + this.games.length) % this.games.length;
  }

  // ==============================
  // ESTADÍSTICAS INTERACTIVAS D3
  // ==============================
  @ViewChild('graficaMensual') graficaMensual?: ElementRef<HTMLDivElement>;
  @ViewChild('graficaJuegos') graficaJuegos?: ElementRef<HTMLDivElement>;

  mostrarEstadisticas = false;
  cargandoEstadisticas = false;
  errorEstadisticas = '';
  avisoEstadisticas = '';
  anioEstadisticas = new Date().getFullYear();
  aniosDisponibles: number[] = [];
  logrosConFecha: any[] = [];
  totalLogrosFechados = 0;
  totalLogrosAnio = 0;
  mesMasActivo = 'Sin datos';
  trimestreEstadisticas = 0; // 0 = todo el año
  limiteJuegosEstadisticas = 8;
  metricaJuegosEstadisticas: 'logros' | 'gamerscore' = 'logros';
  filtroJuegoEstadisticas = '';
  get juegosFiltrablesEstadisticas(): any[] {
    return this.games.filter((j: any) => j?.name);
  }
  cambiarFiltroEstadisticas(event: Event, filtro: 'trimestre' | 'limite' | 'metrica' | 'juego'): void {
    const valor = (event.target as HTMLSelectElement).value;
    if (filtro === 'trimestre') this.trimestreEstadisticas = Number(valor);
    else if (filtro === 'limite') this.limiteJuegosEstadisticas = Number(valor);
    else if (filtro === 'metrica') this.metricaJuegosEstadisticas = valor === 'gamerscore' ? 'gamerscore' : 'logros';
    else this.filtroJuegoEstadisticas = valor;
    this.programarGraficas();
  }
  restablecerFiltrosEstadisticas(): void {
    this.anioEstadisticas = this.aniosDisponibles[0] ?? new Date().getFullYear();
    this.trimestreEstadisticas = 0;
    this.limiteJuegosEstadisticas = 8;
    this.metricaJuegosEstadisticas = 'logros';
    this.filtroJuegoEstadisticas = '';
    this.programarGraficas();
  }
  private estadisticasRenderPendiente = false;

  alternarEstadisticas(): void {
    this.mostrarEstadisticas = !this.mostrarEstadisticas;
    if (this.mostrarEstadisticas) {
      if (this.mostrarGaleria) this.cerrarGaleria();
      if (!this.logrosConFecha.length && !this.errorEstadisticas) {
        this.cargarEstadisticas();
      } else {
        this.programarGraficas();
      }
    }
  }

  seleccionarAnioEstadisticas(event: Event): void {
    const valor = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(valor)) return;
    this.anioEstadisticas = valor;
    this.programarGraficas();
  }

  cargarEstadisticas(): void {
    if (!this.isOnline) {
      this.errorEstadisticas = 'Para obtener las fechas de logros necesitas conexión a Xbox.';
      this.programarGraficas();
      return;
    }
    this.cargandoEstadisticas = true;
    this.errorEstadisticas = '';
    this.avisoEstadisticas = '';
    this.http.get<any>('http://localhost/laloapi/xbox/achievements.php', {
      withCredentials: true
    }).subscribe({
      next: (respuesta) => {
        this.cargandoEstadisticas = false;
        if (!respuesta?.success) {
          this.errorEstadisticas = respuesta?.message || 'No se pudieron consultar los logros.';
          this.programarGraficas();
          return;
        }
        // achievements.php conserva la respuesta original de Xbox dentro de achievements.
        const datos = respuesta.achievements;
        const lista = Array.isArray(datos) ? datos :
          Array.isArray(datos?.achievements) ? datos.achievements : [];
        const deduplicados = new Set<string>();
        this.logrosConFecha = lista.filter((logro: any) => {
          if (logro?.progressState !== 'Achieved') return false;
          const fecha = logro?.progression?.timeUnlocked || logro?.timeUnlocked;
          if (!fecha || Number.isNaN(new Date(fecha).getTime())) return false;
          const id = [logro?.serviceConfigId || '', logro?.titleId || '', logro?.id || logro?.name || '', fecha].join('|');
          if (deduplicados.has(id)) return false;
          deduplicados.add(id);
          return true;
        });
        this.totalLogrosFechados = this.logrosConFecha.length;
        const anios = [...new Set(this.logrosConFecha.map((a: any) =>
          new Date(a.progression?.timeUnlocked || a.timeUnlocked).getFullYear()
        ))].sort((a,b) => b-a);
        this.aniosDisponibles = anios;
        if (anios.length && !anios.includes(this.anioEstadisticas)) this.anioEstadisticas = anios[0];
        if (lista.length >= 100 || datos?.pagingInfo?.continuationToken || datos?.continuationToken) {
          this.avisoEstadisticas = 'La API consulta hasta 100 logros. Esta gráfica puede representar solamente una parte del historial.';
        } else if (lista.length && !this.logrosConFecha.length) {
          this.avisoEstadisticas = 'Los logros recibidos no incluyen fechas de desbloqueo válidas.';
        }
        this.cdr.detectChanges();
        this.programarGraficas();
      },
      error: () => {
        this.cargandoEstadisticas = false;
        this.errorEstadisticas = 'No se pudieron cargar las estadísticas. Revisa tu sesión Xbox y la conexión con PHP.';
        this.programarGraficas();
      }
    });
  }

  private programarGraficas(): void {
    // Esperar a que Angular cree los contenedores *ngIf.
    this.cdr.detectChanges();
    setTimeout(() => this.dibujarGraficas(), 0);
  }

  private dibujarGraficas(): void {
    if (!this.mostrarEstadisticas) return;
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const cantidades = meses.map((mes, numero) => ({ mes, total: this.logrosConFecha.filter((a: any) => {
      const fecha = new Date(a.progression?.timeUnlocked || a.timeUnlocked);
      return fecha.getFullYear() === this.anioEstadisticas && fecha.getMonth() === numero && (this.trimestreEstadisticas === 0 || Math.floor(numero / 3) + 1 === this.trimestreEstadisticas);
    }).length }));
    this.totalLogrosAnio = d3.sum(cantidades, d => d.total);
    const mayor = d3.max(cantidades, d => d.total) || 0;
    this.mesMasActivo = mayor ? cantidades.find(d => d.total === mayor)!.mes : 'Sin datos';
    if (this.graficaMensual) {
      this.dibujarBarras(this.graficaMensual.nativeElement, cantidades.map(d => ({ etiqueta: d.mes, valor: d.total })), 'Logros');
    }
    if (this.graficaJuegos) {
      const mejores = this.games
        .filter((g: any) => !this.filtroJuegoEstadisticas || String(g.titleId ?? g.name) === this.filtroJuegoEstadisticas)
        .map((g: any) => ({
          etiqueta: String(g.name || 'Juego'),
          valor: Number(this.metricaJuegosEstadisticas === 'gamerscore'
            ? g.currentGamerscore ?? 0 : g.earnedAchievements ?? 0)
        }))
        .filter(x => Number.isFinite(x.valor) && x.valor > 0)
        .sort((a,b) => b.valor - a.valor)
        .slice(0, this.limiteJuegosEstadisticas);
      this.dibujarBarras(this.graficaJuegos.nativeElement, mejores,
        this.metricaJuegosEstadisticas === 'gamerscore' ? 'Gamerscore por juego' : 'Logros por juego');
    }
    this.cdr.detectChanges();
  }

  private dibujarBarras(
    host: HTMLDivElement,
    datos: {etiqueta: string; valor: number}[],
    titulo: string
  ): void {
    d3.select(host).selectAll('*').remove();
    if (!datos.length || !datos.some(d => d.valor > 0)) {
      d3.select(host).append('p').attr('class','xbox-stats-empty')
        .text('No hay datos disponibles para esta gráfica.');
      return;
    }
    const ancho = Math.max(320, host.clientWidth || 360);
    const alto = 280;
    const margen = { top: 22, right: 15, bottom: 80, left: 38 };
    const svg = d3.select(host).append('svg')
      .attr('viewBox', `0 0 ${ancho} ${alto}`)
      .attr('role','img').attr('aria-label', titulo)
      .style('width','100%').style('height','auto');
    const x = d3.scaleBand<string>()
      .domain(datos.map(d => d.etiqueta)).range([margen.left, ancho-margen.right]).padding(0.25);
    const y = d3.scaleLinear()
      .domain([0, d3.max(datos, d => d.valor) || 1]).nice()
      .range([alto-margen.bottom, margen.top]);
    svg.append('g').attr('transform',`translate(0,${alto-margen.bottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll('text').attr('fill','#eee').attr('font-size','11px')
      .attr('transform', datos.length > 8 ? 'rotate(-30)' : 'rotate(-20)')
      .style('text-anchor','end');
    svg.append('g').attr('transform',`translate(${margen.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill','#eee');
    svg.selectAll('.barra').data(datos).enter().append('rect')
      .attr('class','barra').attr('x',d => x(d.etiqueta) || 0)
      .attr('width',x.bandwidth()).attr('y',y(0)).attr('height',0)
      .attr('rx',4).attr('fill','#37b24d')
      .append('title').text(d => `${d.etiqueta}: ${d.valor} ${titulo.toLowerCase().includes('gamerscore') ? 'GS' : 'logros'}`);
    svg.selectAll<SVGRectElement, {etiqueta:string;valor:number}>('.barra')
      .transition().duration(550).attr('y',d => y(d.valor))
      .attr('height',d => Math.max(0,y(0)-y(d.valor)));
  }

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
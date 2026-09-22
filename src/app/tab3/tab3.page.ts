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
) {


// ==========================================
// RECUPERAR ESTADO GUARDADO
// ==========================================

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

// ==========================================
// INICIALIZAR PÁGINA
// ==========================================

ngOnInit(): void {


console.log('================================');
console.log('TAB 3 INICIADA');
console.log('================================');


}

// ==========================================
// ENTRAR A TAB 3
// ==========================================

ionViewWillEnter(): void {


console.log('================================');
console.log('🚨 TAB 3 ENTRANDO EN PANTALLA');
console.log('================================');

this.cargarPerfilXbox();


}

// ==========================================
// CONECTAR XBOX
// ==========================================

conectarXbox(): void {


console.log(
  'Iniciando conexión con Xbox...'
);

window.location.href =
  'http://localhost/laloapi/xbox/login.php';


}

// ==========================================
// CARGAR PERFIL XBOX
// ==========================================

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

  // ========================================
  // RESPUESTA
  // ========================================

  next: (datos) => {

    console.log(
      'PERFIL XBOX:'
    );

    console.log(datos);


    // ======================================
    // SESIÓN ACTIVA
    // ======================================

    if (datos.success) {

      this.xboxConnected = true;


      this.gamertag =
        datos.gamertag ||
        'Xbox conectado';


      this.gamerscore =
        Number(datos.gamerscore) || 0;


      // ======================================
      // GUARDAR ESTADO EN EL NAVEGADOR
      // ======================================

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


      // ====================================
      // CARGAR LOGROS
      // ====================================

      console.log(
        'Cargando logros automáticamente...'
      );


      this.verLogros();

    }


    // ======================================
    // SESIÓN NO ACTIVA
    // ======================================

    else {

      console.error(
        'No hay sesión Xbox:',
        datos
      );


      this.xboxConnected = false;


      this.gamertag =
        'Xbox no conectado';


      this.gamerscore = 0;


      this.achievements = [];

      this.achievementsLoaded = false;


      // ======================================
      // BORRAR ESTADO GUARDADO
      // ======================================

      localStorage.removeItem(
        'xboxConnected'
      );

      localStorage.removeItem(
        'xboxGamertag'
      );

      localStorage.removeItem(
        'xboxGamerscore'
      );

    }

  },


  // ========================================
  // ERROR DE CONEXIÓN
  // ========================================

  error: (error) => {

    console.error(
      'Error consultando perfil de Xbox:',
      error
    );


    /*
     * IMPORTANTE:
     *
     * NO ponemos xboxConnected = false
     * aquí.
     *
     * Si hubo un error temporal de red,
     * conservamos el estado anterior.
     */

    if (
      localStorage.getItem(
        'xboxConnected'
      ) === 'true'
    ) {

      this.xboxConnected = true;

    }

  }

});


}

// ==========================================
// OBTENER LOGROS
// ==========================================

verLogros(): void {


console.log(
  'Consultando logros de Xbox...'
);


this.loadingAchievements = true;


this.http.get<any>(
  'http://localhost/laloapi/xbox/achievements.php',
  {
    withCredentials: true
  }
).subscribe({

  // ========================================
  // RESPUESTA
  // ========================================

  next: (datos) => {

    console.log(
      'JSON RECIBIDO DE LOGROS:'
    );

    console.log(datos);


    this.loadingAchievements = false;


    // ======================================
    // LOGROS OBTENIDOS
    // ======================================

    if (datos.success) {

      /*
       * No modificamos xboxConnected.
       *
       * profile.php ya confirmó que
       * la sesión está activa.
       */

      if (
        datos.achievements &&
        Array.isArray(
          datos.achievements.achievements
        )
      ) {

        this.achievements =
          datos.achievements.achievements;

      }

      else {

        this.achievements = [];

      }


      this.achievementsLoaded = true;


      console.log(
        'Logros encontrados:',
        this.achievements.length
      );

    }


    // ======================================
    // ERROR DEVUELTO POR PHP
    // ======================================

    else {

      console.error(
        'Xbox devolvió un error:',
        datos
      );


      this.achievements = [];

      this.achievementsLoaded = false;


      /*
       * No desconectamos Xbox.
       *
       * El perfil sigue conectado aunque
       * la consulta de logros falle.
       */

      alert(
        datos.message ||
        'No se pudieron obtener los logros de Xbox.'
      );

    }

  },


  // ========================================
  // ERROR HTTP
  // ========================================

  error: (error) => {

    console.error(
      'Error consultando logros:',
      error
    );


    this.loadingAchievements = false;

    this.achievementsLoaded = false;


    /*
     * No modificamos xboxConnected.
     */

    alert(
      'No se pudieron consultar los logros de Xbox.'
    );

  }

});


}

}

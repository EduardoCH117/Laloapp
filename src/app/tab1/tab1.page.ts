import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Usuario {
id: number;
username: string;
nombre: string;
correo: string;
fecha_registro: string;
}

@Component({
selector: 'app-tab1',
templateUrl: 'tab1.page.html',
styleUrls: ['tab1.page.scss'],
standalone: true,
imports: [
CommonModule,
FormsModule
]
})
export class Tab1Page implements OnInit {

// ==============================
// USUARIOS
// ==============================

usuarios: Usuario[] = [];

private apiListar =
'http://localhost/laloapi/usuarios_listar.php';

private apiCrear =
'http://localhost/laloapi/usuarios_crear.php';

private apiActualizar =
'http://localhost/laloapi/usuarios_actualizar.php';

private apiEliminar =
'http://localhost/laloapi/usuarios_eliminar.php';

// ==============================
// SEARCH
// ==============================

search = '';

// ==============================
// SORTING
// ==============================

predicate: keyof Usuario = 'id';

reverse = true;

// ==============================
// PAGINATION
// ==============================

resultlimit = 5;

currentPage = 1;

// ==============================
// FORM
// ==============================

id: number | null = null;

username = '';

nombre = '';

correo = '';

password = '';

editing = false;

showModal = false;

// ==============================
// CONSTRUCTOR
// ==============================

constructor(
private http: HttpClient
) {}

// ==============================
// INIT
// ==============================

ngOnInit(): void {
this.cargarUsuarios();
}

// ==============================
// LISTAR
// ==============================

cargarUsuarios(): void {


this.http.get<any>(
  this.apiListar
).subscribe({

  next: (respuesta) => {

    console.log(
      'Respuesta listar usuarios:',
      respuesta
    );

    if (respuesta.success) {

      this.usuarios =
        respuesta.usuarios || [];

    } else {

      alert(
        respuesta.message ||
        'No se pudieron cargar los usuarios.'
      );

    }

  },

  error: (error) => {

    console.error(
      'Error de conexión al listar:',
      error
    );

    alert(
      'No se pudo conectar con el servidor PHP'
    );

  }

});


}

// ==============================
// CREATE FORM
// ==============================

showCreateForm(): void {


this.clearForm();

this.editing = false;

this.showModal = true;


}

// ==============================
// CLEAR FORM
// ==============================

clearForm(): void {


this.id = null;

this.username = '';

this.nombre = '';

this.correo = '';

this.password = '';


}

// ==============================
// CREATE USUARIO
// ==============================

createUsuario(): void {


if (
  !this.username ||
  !this.nombre ||
  !this.correo ||
  !this.password
) {

  alert(
    'Completa todos los campos'
  );

  return;

}

const datos = {

  username: this.username,

  nombre: this.nombre,

  correo: this.correo,

  password: this.password

};

console.log(
  'Datos para crear:',
  datos
);

this.http.post<any>(
  this.apiCrear,
  datos
).subscribe({

  next: (respuesta) => {

    console.log(
      'Respuesta crear:',
      respuesta
    );

    if (respuesta.success) {

      alert(
        'Usuario creado correctamente'
      );

      this.clearForm();

      this.showModal = false;

      this.currentPage = 1;

      this.cargarUsuarios();

    } else {

      alert(
        respuesta.message ||
        'No se pudo crear el usuario'
      );

    }

  },

  error: (error) => {

    console.error(
      'Error creando usuario:',
      error
    );

    alert(
      'No se pudo conectar con el servidor PHP'
    );

  }

});


}

// ==============================
// READ / EDIT
// ==============================

readOne(id: number): void {


const usuario =
  this.usuarios.find(
    item => item.id === id
  );

if (!usuario) {

  alert(
    'No se encontró el usuario'
  );

  return;

}

this.id = usuario.id;

this.username = usuario.username;

this.nombre = usuario.nombre;

this.correo = usuario.correo;

this.password = '';

this.editing = true;

this.showModal = true;

console.log(
  'Usuario seleccionado para editar:',
  usuario
);


}

// ==============================
// UPDATE USUARIO
// ==============================

updateUsuario(): void {


console.log(
  'Iniciando actualización...'
);

// Validar ID

if (this.id === null) {

  alert(
    'No se encontró el ID del usuario.'
  );

  return;

}

// Validar campos

if (
  !this.username.trim() ||
  !this.nombre.trim() ||
  !this.correo.trim()
) {

  alert(
    'Completa todos los campos obligatorios'
  );

  return;

}

// Validar correo

if (
  !this.correo.includes('@')
) {

  alert(
    'Ingresa un correo válido'
  );

  return;

}

// Datos que enviaremos

const datos: any = {

  id: this.id,

  username: this.username.trim(),

  nombre: this.nombre.trim(),

  correo: this.correo.trim()

};

// Solo enviar password
// si el usuario escribió una nueva

if (
  this.password.trim() !== ''
) {

  datos.password =
    this.password.trim();

}

console.log(
  'URL actualización:',
  this.apiActualizar
);

console.log(
  'Datos enviados para actualizar:',
  datos
);

// Petición PHP

this.http.post<any>(
  this.apiActualizar,
  datos
).subscribe({

  next: (respuesta) => {

    console.log(
      'Respuesta del servidor al actualizar:',
      respuesta
    );

    if (respuesta.success) {

      alert(
        respuesta.message ||
        'Usuario actualizado correctamente'
      );

      this.clearForm();

      this.editing = false;

      this.showModal = false;

      this.cargarUsuarios();

    } else {

      alert(
        respuesta.message ||
        'No se pudo actualizar el usuario'
      );

    }

  },

  error: (error) => {

    console.error(
      'ERROR AL ACTUALIZAR USUARIO:',
      error
    );

    console.error(
      'URL:',
      this.apiActualizar
    );

    console.error(
      'Datos enviados:',
      datos
    );

    alert(
      'No se pudo conectar con el servidor PHP'
    );

  }

});


}

// ==============================
// DELETE
// ==============================

deleteUsuario(id: number): void {


if (
  !confirm(
    '¿Seguro que quieres eliminar este usuario?'
  )
) {

  return;

}

this.http.post<any>(
  this.apiEliminar,
  { id }
).subscribe({

  next: (respuesta) => {

    console.log(
      'Respuesta eliminar:',
      respuesta
    );

    if (respuesta.success) {

      this.usuarios =
        this.usuarios.filter(
          u => u.id !== id
        );

      if (
        this.currentPage >
        this.totalPages
      ) {

        this.currentPage =
          this.totalPages;

      }

    } else {

      alert(
        respuesta.message
      );

    }

  },

  error: (error) => {

    console.error(
      'Error eliminando usuario:',
      error
    );

    alert(
      'No se pudo conectar con el servidor PHP'
    );

  }

});


}

// ==============================
// SORT
// ==============================

sortBy(
field: keyof Usuario
): void {


if (
  this.predicate === field
) {

  this.reverse =
    !this.reverse;

} else {

  this.predicate =
    field;

  this.reverse = false;

}


}

// ==============================
// FILTERED USUARIOS
// ==============================

get filteredUsuarios(): Usuario[] {


let result =
  [...this.usuarios];

if (
  this.search.trim() !== ''
) {

  const search =
    this.search
      .toLowerCase()
      .trim();

  result =
    result.filter(
      item =>
        item.username
          .toLowerCase()
          .includes(search) ||

        item.nombre
          .toLowerCase()
          .includes(search) ||

        item.correo
          .toLowerCase()
          .includes(search)
    );

}

result.sort(
  (a, b) => {

    const valueA =
      a[this.predicate];

    const valueB =
      b[this.predicate];

    if (
      valueA === valueB
    ) {

      return 0;

    }

    const comparison =
      valueA! < valueB!
        ? -1
        : 1;

    return this.reverse
      ? -comparison
      : comparison;

  }
);

return result;


}

// ==============================
// PAGED USUARIOS
// ==============================

get pagedUsuarios(): Usuario[] {


const start =
  (this.currentPage - 1) *
  Number(this.resultlimit);

return this.filteredUsuarios.slice(
  start,
  start + Number(this.resultlimit)
);


}

// ==============================
// TOTAL PAGES
// ==============================

get totalPages(): number {


return Math.max(
  1,
  Math.ceil(
    this.filteredUsuarios.length /
    Number(this.resultlimit)
  )
);


}

// ==============================
// NEXT PAGE
// ==============================

nextPage(): void {


if (
  this.currentPage <
  this.totalPages
) {

  this.currentPage++;

}


}

// ==============================
// PREVIOUS PAGE
// ==============================

previousPage(): void {


if (
  this.currentPage > 1
) {

  this.currentPage--;

}


}

// ==============================
// CHANGE PAGE LIMIT
// ==============================

changePageLimit(): void {


this.currentPage = 1;


}

// ==============================
// CLOSE MODAL
// ==============================

closeModal(): void {


this.showModal = false;

this.editing = false;

this.clearForm();


}

// ==============================
// FORMAT FECHA
// ==============================

formatFecha(
fecha: string
): string {


if (!fecha) {

  return '';

}

const date =
  new Date(
    fecha.replace(
      ' ',
      'T'
    )
  );

if (
  isNaN(
    date.getTime()
  )
) {

  return fecha;

}

return (
  date.toLocaleDateString(
    'es-MX',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  )
  + ' ' +
  date.toLocaleTimeString(
    'es-MX',
    {
      hour: 'numeric',
      minute: '2-digit'
    }
  )
);


}

// ==============================
// EMAIL LIST
// ==============================

get emailList(): Usuario[] {


return this.filteredUsuarios;


}

// ==============================
// EMAIL ADDRESSES
// ==============================

get emailAddresses(): string {


return this.emailList
  .map(
    usuario => usuario.correo
  )
  .join(', ');


}

// ==============================
// MAILTO
// ==============================

get mailtoAll(): string {


return 'mailto:' +
  this.emailAddresses;


}

}

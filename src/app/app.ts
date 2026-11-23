import { Component, computed, signal } from '@angular/core';

interface Contacto {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  grupo: string;
  favorito: boolean;
}

const CLAVE_FAVORITOS = 'miagenda-favoritos';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  // Estado (signals)
  contactos = signal<Contacto[]>([]);
  busqueda = signal('');
  grupo = signal('Todos'); // reto 1

  // Reto 1: botones de grupo
  grupos = ['Todos', 'Clase', 'Familia', 'Trabajo'];

  // Datos derivados
  numFavoritos = computed(() => this.contactos().filter((c) => c.favorito).length);

  filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const grupo = this.grupo();
    return this.contactos().filter(
      (c) =>
        c.nombre.toLowerCase().includes(texto) &&
        (grupo === 'Todos' || c.grupo === grupo),
    );
  });

  constructor() {
    this.cargar();
  }

  async cargar() {
    const respuesta = await fetch('/contactos.json');
    const datos: Contacto[] = await respuesta.json();

    // Reto 2: si hay favoritos guardados en localStorage, mandan sobre el JSON
    const guardados = this.leerFavoritos();
    const lista = guardados
      ? datos.map((c) => ({ ...c, favorito: guardados.includes(c.id) }))
      : datos;

    this.contactos.set(lista);
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter((palabra) => palabra.length > 0)
      .slice(0, 2)
      .map((palabra) => palabra[0])
      .join('')
      .toUpperCase();
  }

  cambiarFavorito(id: number) {
    // Se devuelve una lista NUEVA (map + spread) para que el signal lo detecte
    this.contactos.update((lista) =>
      lista.map((c) => (c.id === id ? { ...c, favorito: !c.favorito } : c)),
    );
    this.guardarFavoritos();
  }

  // ---- Reto 2: persistencia ----
  private guardarFavoritos() {
    const ids = this.contactos()
      .filter((c) => c.favorito)
      .map((c) => c.id);
    try {
      localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(ids));
    } catch {
      // si localStorage no está disponible, la app sigue funcionando sin persistir
    }
  }

  private leerFavoritos(): number[] | null {
    try {
      const texto = localStorage.getItem(CLAVE_FAVORITOS);
      return texto ? (JSON.parse(texto) as number[]) : null;
    } catch {
      return null;
    }
  }
}

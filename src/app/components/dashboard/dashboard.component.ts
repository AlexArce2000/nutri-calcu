import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, collectionData, collection, query, where, doc, deleteDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  perfilesBasicos$: Observable<any[]> = of([]);
  perfilesIncap$: Observable<any[]> = of([]);
  perfilesCombinados$: Observable<any[]> = of([]); // Nueva lista

  sortSettings$ = new BehaviorSubject<{ criterio: 'fecha' | 'nombre', direction: 'asc' | 'desc' }>({
    criterio: 'fecha',
    direction: 'desc'
  });

  constructor(
    public authService: AuthService,
    private firestore: Firestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        // Referencias a las 3 colecciones
        const basicData$ = collectionData(query(collection(this.firestore, 'perfiles'), where('uid', '==', user.uid)), { idField: 'id' });
        const incapData$ = collectionData(query(collection(this.firestore, 'perfiles_incap'), where('uid', '==', user.uid)), { idField: 'id' });
        const combinedData$ = collectionData(query(collection(this.firestore, 'perfiles_combinados'), where('uid', '==', user.uid)), { idField: 'id' });

        // Aplicamos el ordenamiento a las 3 listas
        this.perfilesBasicos$ = combineLatest([basicData$, this.sortSettings$]).pipe(
          map(([lista, settings]) => this.ordenarLista(lista, settings, 'basica'))
        );

        this.perfilesIncap$ = combineLatest([incapData$, this.sortSettings$]).pipe(
          map(([lista, settings]) => this.ordenarLista(lista, settings, 'incap'))
        );

        this.perfilesCombinados$ = combineLatest([combinedData$, this.sortSettings$]).pipe(
          map(([lista, settings]) => this.ordenarLista(lista, settings, 'combinada'))
        );
      }
    });
  }

  private ordenarLista(lista: any[], settings: any, tipo: string): any[] {
    const { criterio, direction } = settings;
    return [...lista].sort((a, b) => {
      let valA: any, valB: any;
      if (criterio === 'fecha') {
        valA = new Date(a.fecha).getTime();
        valB = new Date(b.fecha).getTime();
      } else {
        // Manejo de nombres según la colección (algunas usan nombrePerfil, otras perfilNombre)
        valA = (tipo === 'basica' ? a.nombrePerfil : a.perfilNombre).toLowerCase();
        valB = (tipo === 'basica' ? b.nombrePerfil : b.perfilNombre).toLowerCase();
      }
      let comp = valA < valB ? -1 : (valA > valB ? 1 : 0);
      return direction === 'asc' ? comp : comp * -1;
    });
  }

  cambiarOrden(nuevoCriterio: 'fecha' | 'nombre') {
    const current = this.sortSettings$.value;
    if (current.criterio === nuevoCriterio) {
      this.sortSettings$.next({ criterio: nuevoCriterio, direction: current.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      this.sortSettings$.next({ criterio: nuevoCriterio, direction: 'asc' });
    }
  }

  // Funciones de carga
  cargarBasico(perfil: any) {
    localStorage.setItem('nutriHistorial', JSON.stringify(perfil.alimentos));
    this.router.navigate(['/']);
  }

  cargarIncap(perfil: any) {
    localStorage.setItem('incapHistorial', JSON.stringify(perfil.items));
    this.router.navigate(['/incap']);
  }

  cargarCombinado(perfil: any) {
    localStorage.setItem('combinedHistorial', JSON.stringify(perfil.items));

    // Si el perfil guardado tiene información de las columnas, las guardamos en LocalStorage
    if (perfil.nutrientesActivos) {
      localStorage.setItem('combinedColumns', JSON.stringify(perfil.nutrientesActivos));
    }

    this.router.navigate(['/combinada']);
  }
  // Borrado genérico con SweetAlert
  async eliminar(id: string, coleccion: string) {
    const res = await Swal.fire({
      title: '¿Eliminar perfil?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      confirmButtonText: 'Sí, borrar'
    });
    if (res.isConfirmed) {
      await deleteDoc(doc(this.firestore, `${coleccion}/${id}`));
      Swal.fire('Eliminado', '', 'success');
    }
  }
}
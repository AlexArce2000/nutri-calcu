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
  // Dos observables independientes
  perfilesBasicos$: Observable<any[]> = of([]);
  perfilesIncap$: Observable<any[]> = of([]);
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
        const basicData$ = collectionData(query(collection(this.firestore, 'perfiles'), where('uid', '==', user.uid)), { idField: 'id' });
        const incapData$ = collectionData(query(collection(this.firestore, 'perfiles_incap'), where('uid', '==', user.uid)), { idField: 'id' });

        // Combinamos datos con los ajustes de orden
        this.perfilesBasicos$ = combineLatest([basicData$, this.sortSettings$]).pipe(
          map(([lista, settings]) => this.ordenarLista(lista, settings, 'basica'))
        );

        this.perfilesIncap$ = combineLatest([incapData$, this.sortSettings$]).pipe(
          map(([lista, settings]) => this.ordenarLista(lista, settings, 'incap'))
        );
      }
    });
  }

  private ordenarLista(lista: any[], settings: any, tipo: 'basica' | 'incap'): any[] {
    const { criterio, direction } = settings;

    return [...lista].sort((a, b) => {
      let valA: any, valB: any;

      if (criterio === 'fecha') {
        valA = new Date(a.fecha).getTime();
        valB = new Date(b.fecha).getTime();
      } else {
        valA = (tipo === 'basica' ? a.nombrePerfil : a.perfilNombre).toLowerCase();
        valB = (tipo === 'basica' ? b.nombrePerfil : b.perfilNombre).toLowerCase();
      }

      let comparison = 0;
      if (valA < valB) comparison = -1;
      if (valA > valB) comparison = 1;

      // Si es descendente, invertimos el resultado
      return direction === 'asc' ? comparison : comparison * -1;
    });
  }

  cambiarOrden(nuevoCriterio: 'fecha' | 'nombre') {
    const current = this.sortSettings$.value;
    if (current.criterio === nuevoCriterio) {
      this.sortSettings$.next({
        criterio: nuevoCriterio,
        direction: current.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      this.sortSettings$.next({ criterio: nuevoCriterio, direction: 'asc' });
    }
  }
  async eliminarBasico(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#666',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(this.firestore, `perfiles/${id}`));
        Swal.fire('Eliminado', 'El perfil ha sido borrado.', 'success');
      }
    });
  }

  async eliminarIncap(id: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#666',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deleteDoc(doc(this.firestore, `perfiles_incap/${id}`));
        Swal.fire('Eliminado', 'El perfil ha sido borrado.', 'success');
      }
    });
  }

  cargarBasico(perfil: any) {
    localStorage.setItem('nutriHistorial', JSON.stringify(perfil.alimentos));
    this.router.navigate(['/']);
  }

  cargarIncap(perfil: any) {
    localStorage.setItem('incapHistorial', JSON.stringify(perfil.items));
    this.router.navigate(['/incap']);
  }
}
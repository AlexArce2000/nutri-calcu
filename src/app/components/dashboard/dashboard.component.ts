import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Firestore, collectionData, collection, query, where, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Dos observables independientes
  perfilesBasicos$: Observable<any[]> = of([]);
  perfilesIncap$: Observable<any[]> = of([]);

  constructor(
    public authService: AuthService,
    private firestore: Firestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        // 1Cargar Perfiles Básicos
        const basicCol = collection(this.firestore, 'perfiles');
        const basicQuery = query(basicCol, where('uid', '==', user.uid));
        this.perfilesBasicos$ = collectionData(basicQuery, { idField: 'id' });

        // 2Cargar Perfiles INCAP
        const incapCol = collection(this.firestore, 'perfiles_incap');
        const incapQuery = query(incapCol, where('uid', '==', user.uid));
        this.perfilesIncap$ = collectionData(incapQuery, { idField: 'id' });
      }
    });
  }

  async eliminarBasico(id: string) {
    if (confirm("¿Eliminar este perfil básico?")) {
      await deleteDoc(doc(this.firestore, `perfiles/${id}`));
    }
  }

  async eliminarIncap(id: string) {
    if (confirm("¿Eliminar este perfil INCAP?")) {
      await deleteDoc(doc(this.firestore, `perfiles_incap/${id}`));
    }
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
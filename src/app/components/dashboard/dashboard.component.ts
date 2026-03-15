import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { 
  Firestore, 
  collectionData, 
  collection, 
  query, 
  where, 
  doc, 
  deleteDoc 
} from '@angular/fire/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  perfiles$: Observable<any[]> = of([]);

  constructor(
    public authService: AuthService,
    private firestore: Firestore,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.perfiles$ = this.authService.user$.pipe(
      switchMap(user => {
        if (user) {
          // 1. Creamos la referencia a la colección
          const pCollection = collection(this.firestore, 'perfiles');
          
          // 2. Creamos la consulta
          const pQuery = query(pCollection, where('uid', '==', user.uid));
          
          // 3. Obtenemos los datos (añadimos el tipo explícito)
          return collectionData(pQuery, { idField: 'id' }) as Observable<any[]>;
        } else {
          return of([]);
        }
      })
    );
  }

  async eliminarPerfil(id: string) {
    if (confirm("¿Eliminar este perfil permanentemente?")) {
      const docRef = doc(this.firestore, `perfiles/${id}`);
      await deleteDoc(docRef);
    }
  }

  cargarPerfil(perfil: any) {
    // Guardamos los datos en LocalStorage y volvemos a la calculadora
    localStorage.setItem('nutriHistorial', JSON.stringify(perfil.alimentos));
    this.router.navigate(['/']);
    // Al volver, la calculadora leerá el LocalStorage automáticamente
  }
}
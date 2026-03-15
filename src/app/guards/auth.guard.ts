import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.user$.pipe(
      take(1), 
      map(user => {
        if (user) {
          return true;
        } else {
          alert('Debes iniciar sesión para acceder a tus perfiles');
          return this.router.parseUrl('/login');
        }
      })
    );
  }
}
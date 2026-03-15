import { Injectable } from '@angular/core';
import { 
  Auth, 
  authState, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User 
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  userSnapshot: any;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth as any);
  }

  registrar({ email, password }: any) {
    return createUserWithEmailAndPassword(this.auth as any, email, password);
  }

  login({ email, password }: any) {
    return signInWithEmailAndPassword(this.auth as any, email, password);
  }

  logout() {
    return signOut(this.auth as any);
  }
}
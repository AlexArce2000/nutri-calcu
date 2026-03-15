import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = { email: '', password: '' };
  modoRegistro = false;
  showPassword = false;
  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    if (!this.form.email || !this.form.password) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      if (this.modoRegistro) {
        await this.authService.registrar(this.form);
        alert("¡Cuenta creada con éxito!");
      } else {
        await this.authService.login(this.form);
      }
      this.router.navigate(['/']); // Redirigir a la calculadora
    } catch (error: any) {
      console.error(error);
      alert("Error: " + this.obtenerMensajeError(error.code));
    }
  }

  // Opcional: Para mostrar mensajes más amigables
  obtenerMensajeError(code: string) {
    switch (code) {
      case 'auth/email-already-in-use': return 'El correo ya está registrado.';
      case 'auth/weak-password': return 'La contraseña es muy débil.';
      case 'auth/user-not-found': return 'El usuario no existe.';
      case 'auth/wrong-password': return 'Contraseña incorrecta.';
      default: return 'Ocurrió un error inesperado.';
    }
  }
}
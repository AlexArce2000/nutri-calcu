import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
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
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos.',
        confirmButtonColor: '#d32f2f'
      });

      return;
    }

    try {
      if (this.modoRegistro) {
        await this.authService.registrar(this.form);
        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          confirmButtonColor: '#4caf50'
        });
      } else {
        await this.authService.login(this.form);
      }
      this.router.navigate(['/']); // Redirigir a la calculadora
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: this.obtenerMensajeError(error.code),
        confirmButtonColor: '#d32f2f'
      });

    }
  }
async onRecuperarPassword() {
  const { value: email } = await Swal.fire({
    title: 'Recuperar contraseña',
    input: 'email',
    inputLabel: 'Ingresa tu correo electrónico',
    inputPlaceholder: 'ejemplo@correo.com',
    showCancelButton: true,
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#666',
    confirmButtonText: 'Enviar enlace',
    cancelButtonText: 'Cancelar'
  });

if (email) {
  try {
    await this.authService.recuperarPassword(email);
    Swal.fire({
      icon: 'info',
      title: 'Proceso iniciado',
      text: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en unos minutos. Si no lo ves en tu bandeja de entrada, revisa la carpeta de Spam o Correo no deseado.',
      confirmButtonColor: '#4caf50'
    });
  } catch (error: any) {
    // Solo entrará aquí si el formato es inválido o hay error de red
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo procesar la solicitud.' });
  }
}
}

  // Opcional: Para mostrar mensajes más amigables
  obtenerMensajeError(code: string) {
    switch (code) {
      case 'auth/user-not-found': return 'No existe un usuario con este correo.';
      case 'auth/invalid-email': return 'El formato del correo es inválido.';      
      case 'auth/email-already-in-use': return 'El correo ya está registrado.';
      case 'auth/weak-password': return 'La contraseña es muy débil.';
      case 'auth/user-not-found': return 'El usuario no existe.';
      case 'auth/wrong-password': return 'Contraseña incorrecta.';
      default: return 'Ocurrió un error inesperado.';
    }
  }
}
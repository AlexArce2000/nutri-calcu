# 🍎 NutriCalcu - Calculadora Nutricional Profesional

**NutriCalcu** es una aplicación web robusta desarrollada con **Angular 13** y **Firebase**, diseñada para nutricionistas y usuarios interesados en el seguimiento preciso de macronutrientes y micronutrientes. Permite realizar cálculos dinámicos basados en una base de datos de alimentos, gestionar perfiles de pacientes en la nube y exportar reportes a Excel.

![Angular](https://img.shields.io/badge/Angular-13-DD0031?style=for-the-badge&logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-9-FFCA28?style=for-the-badge&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-4.6-3178C6?style=for-the-badge&logo=typescript)

## Características Principales

### Calculadora Inteligente
*   **Buscador Difuso (Fuzzy Search):** Localización instantánea de alimentos entre miles de registros.
*   **Cálculo en Tiempo Real:** Los valores de 13 nutrientes se actualizan automáticamente al cambiar la cantidad (g/ml).
*   **Soporte de Datos Incompletos:** Manejo elegante de valores no disponibles (`-`) para evitar errores matemáticos.
*   **Regla de Tres Simple:** Cálculos basados en el peso neto del alimento registrado en el CSV.

### Gestión de Usuarios y Nube (Firebase)
*   **Autenticación:** Sistema de registro e inicio de sesión seguro con Firebase Auth.
*   **Multi-perfiles:** Los usuarios logueados pueden guardar historiales completos bajo nombres de perfiles (ej: "Plan Lunes - Juan").
*   **Sincronización:** Acceso a tus perfiles guardados desde cualquier dispositivo.
*   **Modo Invitado:** Funcionalidad completa de cálculo y exportación usando `LocalStorage` para usuarios no registrados.

### Herramientas de Datos
*   **Exportación:** Genera archivos CSV compatibles con Excel que incluyen filas de **TOTALES** y cálculo de **Kcals por Macros**.
*   **Importación Inteligente:** Capacidad de re-subir tablas descargadas previamente para continuar el trabajo.
*   **Totales Automáticos:** Sumatoria constante de Hidratos, Proteínas, Grasas, Fibra, Sodio, Calcio, y más.

---

## Stack Tecnológico

*   **Framework:** Angular 13.3.11
*   **Lenguaje:** TypeScript 4.6
*   **Base de Datos & Auth:** Firebase 9.23.0 (Cloud Firestore)
*   **Entorno:** Node.js 14.20.0
*   **Estilos:** CSS3 con metodología de diseño responsivo y temática carmesí.


---

## 🚀 Instalación y Configuración

### 1. Requisitos Previos
Asegúrate de tener instalada la versión correcta de Node:
```bash
node -v # Debería ser 14.x.x
npm -v  # Debería ser 6.x.x
```

### 2. Clonar e Instalar
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/nutri-calcu.git
cd nutri-calcu

# Instalar dependencias (usar legacy-peer-deps por compatibilidad de versiones)
npm install --legacy-peer-deps
```

### 3. Configurar Firebase
Edita el archivo `src/environments/environment.ts` con tus credenciales de [Firebase Console](https://console.firebase.google.com/):

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "TU_API_KEY",
    authDomain: "tu-app.firebaseapp.com",
    projectId: "tu-app",
    storageBucket: "tu-app.appspot.com",
    messagingSenderId: "...",
    appId: "..."
  }
};
```


---

## Estructura del Proyecto

```text
src/app/
├── components/
│   ├── calculator/    # Lógica principal y tablas de resultados
│   ├── dashboard/     # Gestión de perfiles en la nube
│   ├── login/         # Formularios de acceso y registro
│   └── navbar/        # Navegación dinámica (Auth/Guest)
├── guards/
│   └── auth.guard.ts  # Protección de rutas privadas
├── services/
│   ├── nutri.service.ts # Parsing de CSV y cálculos matemáticos
│   └── auth.service.ts  # Comunicación con Firebase Auth
└── app-routing.module.ts # Definición de rutas protegidas
```

---

## Seguridad
*   **Auth Guard:** Protege la ruta `/dashboard`, redirigiendo a usuarios no autorizados al login.
*   **Firestore Rules:** Configurado inicialmente en modo prueba y producción.
*   **Password Persistence:** Formulario optimizado para que los navegadores modernos sugieran el guardado de contraseñas de forma segura.



---

## 📜 Licencia
Este proyecto es de código abierto bajo la licencia MIT.
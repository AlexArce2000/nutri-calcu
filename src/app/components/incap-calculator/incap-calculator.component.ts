import { Component, OnInit } from '@angular/core';
import { NutriService } from '../../services/nutri.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incap-calculator',
  templateUrl: './incap-calculator.component.html',
  styleUrls: ['./incap-calculator.component.css']
})
export class IncapCalculatorComponent implements OnInit {
  baseDatos: any[] = [];
  filteredAlimentos: any[] = [];
  seleccionado: any = null;
  searchTerm: string = '';
  cantidad: number = 100;
  historial: any[] = JSON.parse(localStorage.getItem('incapHistorial') || '[]');
  userName: string = 'Invitado';
  totales: number[] = new Array(28).fill(0);

  constructor(
    private nutriService: NutriService,
    public authService: AuthService,
    private firestore: Firestore
  ) {
        this.authService.user$.subscribe(user => {
      if (user?.email) {
        this.userName = user.email.split('@')[0];
      } else {
        this.userName = 'Invitado';
      }
    });
   }

  ngOnInit(): void {
    this.nutriService.getIncapAlimentos().subscribe(data => {
      this.baseDatos = data;
      this.authService.user$.subscribe(user => {
        if (user) {
          this.nutriService.getCustomFoods(user.uid, 'incap').subscribe((customFoods: any[]) => {
            this.baseDatos = [...customFoods, ...data];
          });
        }
      });      
    });
    this.actualizarTotales();
  }
  nutriHeaders = [
    "Agua (%)", "Energía (Kcal)", "Prot. (g)", "Grasa (g)", "HC (g)", "Fibra (g)",
    "Ceniza (g)", "Calcio (mg)", "Fósforo (mg)", "Hierro (mg)", "Tiamina (mg)",
    "Ribofla. (mg)", "Niacina (mg)", "Vit. C (mg)", "Vit. A (mcg)",
    "Monoinsat. (g)", "Poliinsat. (g)", "Saturados (g)", "Colest. (mg)",
    "Potasio (mg)", "Sodio (mg)", "Zinc (mg)", "Magnesio (mg)", "Vit. B6 (mg)",
    "Vit. B12 (mcg)", "Ac. Fólico (mcg)", "Folato (mcg)", "Frac. Comest. (%)"
  ];
  // --- LÓGICA DE BÚSQUEDA ---
  buscar() {
    const term = this.searchTerm.toLowerCase();
    if (term.length < 2) {
      this.filteredAlimentos = [];
      return;
    }
    this.filteredAlimentos = this.baseDatos.filter(a =>
      a.nombre.toLowerCase().includes(term)
    ).slice(0, 10);
  }

  seleccionar(item: any) {
    this.seleccionado = item;
    this.searchTerm = item.nombre;
    this.filteredAlimentos = [];
  }

  // --- CÁLCULOS ---
  calcularNutriente(vStr: string): number {
    if (!vStr || vStr.trim() === "" || vStr === "-") return 0;
    const numBase = parseFloat(vStr.replace(',', '.')) || 0;
    return (this.cantidad * numBase) / 100; // Siempre base 100g
  }

  guardar() {
    if (!this.seleccionado) return;

    const nuevoItem: any = {
      id: Date.now(),
      nombre: this.seleccionado.nombre,
      cantidad: this.cantidad + "g",
      nutrientesValores: this.seleccionado.nutrientes.map((n: any) => this.calcularNutriente(n.v))
    };

    this.historial.push(nuevoItem);
    this.actualizarTotales();
  }

  actualizarTotales() {
    localStorage.setItem('incapHistorial', JSON.stringify(this.historial));
    this.totales = new Array(28).fill(0);

    this.historial.forEach(item => {
      item.nutrientesValores.forEach((val: number, index: number) => {
        this.totales[index] += val;
      });
    });
  }

  eliminar(id: number) {
    this.historial = this.historial.filter(i => i.id !== id);
    this.actualizarTotales();
  }

  borrarTodo() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#666',
      confirmButtonText: 'Sí, borrar todo',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.historial = [];
        this.actualizarTotales();
        Swal.fire('Borrado', 'Todo el historial ha sido borrado.', 'success');
      }
    });
  }

  // --- EXPORTAR A EXCEL (CSV COMPLETO) ---
  exportar():void {
    if (this.historial.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Sin datos', 
        text: 'No hay datos para exportar',
        confirmButtonColor: '#E63946',
        width: '300px',
      });
      return;
    }

    const nombresNutrientes = this.baseDatos[0].nutrientes.map((n: any) => `${n.n} (${n.u})`);
    let csv = "\uFEFFAlimento;Cantidad;" + nombresNutrientes.join(";") + "\n";

    this.historial.forEach(item => {
      const valores = item.nutrientesValores.map((v: number) => v.toFixed(2).replace('.', ','));
      csv += `${item.nombre};${item.cantidad};${valores.join(";")}\n`;
    });

    const valoresTotales = this.totales.map(v => v.toFixed(2).replace('.', ','));
    csv += `TOTALES;-;${valoresTotales.join(";")}\n`;

    // Descarga
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_INCAP_${new Date().getTime()}.csv`;
    link.click();
  }

  importar(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const lineas = e.target.result.replace(/^\uFEFF/, "").split(/\r?\n/);
      const importados: any[] = [];

      for (let i = 1; i < lineas.length; i++) {
        const f = lineas[i].split(';');
        if (f.length < 10 || f[0].toUpperCase() === "TOTALES" || !f[0]) continue;

        const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;
        
        const nutrientesImportados = [];
        for (let j = 2; j < f.length; j++) {
            if(nutrientesImportados.length < 28) {
                nutrientesImportados.push(num(f[j]));
            }
        }

        importados.push({
          id: Date.now() + i,
          nombre: f[0],
          cantidad: f[1],
          nutrientesValores: nutrientesImportados
        });
      }
      this.historial = [...this.historial, ...importados];
      this.actualizarTotales();
      Swal.fire({
        icon: 'success',
        title: 'Importación INCAP exitosa',
        text: `${importados.length} alimentos importados correctamente.`,
        timer: 2000,
        showConfirmButton: false
      });
    };
    reader.readAsText(file, "UTF-8");
  }

  
  async guardarEnNube() {
    this.authService.user$.pipe(take(1)).subscribe(async (user) => {
      if (!user) {
        Swal.fire({
          icon: 'error',
          title: 'No has iniciado sesión',
          text: 'Debes estar logueado para guardar en la nube.',
          confirmButtonColor: '#d32f2f'
        });
        return;
      }
      
      const { value: nombre } = await Swal.fire({
        title: 'Guardar Perfil',
        input: 'text',
        inputLabel: 'Nombre del perfil/paciente INCAP:',
        inputPlaceholder: 'Ej: Dieta de Juan - Lunes',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#666',
        confirmButtonText: 'Guardar ahora',
        cancelButtonText: 'Cancelar'
      });

      if (!nombre) return;
      if (nombre) {
        try {
          const col = collection(this.firestore, 'perfiles_incap');
          await addDoc(col, {
            uid: (user as any).uid,
            perfilNombre: nombre,
            fecha: new Date().toISOString(),
            items: this.historial,
            totales: this.totales
          });

          Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: `El perfil "${nombre}" se guardó correctamente.`,
            timer: 2000,
            showConfirmButton: false
          });

        } catch (e) {
          Swal.fire({ icon: 'error', title: 'Error al guardar', confirmButtonColor: '#d32f2f' });
        }
      }

    });
  }
}
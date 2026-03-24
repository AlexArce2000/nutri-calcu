import { Component, OnInit } from '@angular/core';
import { NutriService } from '../../services/nutri.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent implements OnInit {
  baseDatos: any[] = [];
  filteredAlimentos: any[] = [];
  seleccionado: any = null;
  searchTerm: string = '';
  cantidad: number = 100;
  historial: any[] = JSON.parse(localStorage.getItem('nutriHistorial') || '[]');
  userName: string = 'Invitado';

  totals: any = { hc: 0, prot: 0, grasa: 0, fibra: 0, na: 0, k: 0, p: 0, ca: 0, fe: 0, colest: 0, purinas: 0, agua: 0, kcal: 0 };
  totalKcalsMacros: number = 0;

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
    this.nutriService.getAlimentos().subscribe(data => {
      this.baseDatos = data;
      this.authService.user$.subscribe(user => {
        if (user) {
          this.nutriService.getCustomFoods(user.uid, 'basica').subscribe((customFoods: any[]) => {
            this.baseDatos = [...customFoods, ...data];
          });
        }
      });
    });
    this.actualizarTotales();
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

      if (this.historial.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Tabla vacía',
          text: 'La tabla está vacía. Agrega alimentos antes de guardar.',
          confirmButtonColor: '#d32f2f'
        });
        return;
      }

      const { value: nombrePerfil } = await Swal.fire({
        title: 'Guardar Perfil',
        input: 'text',
        inputLabel: 'Dale un nombre a este perfil/paciente:',
        inputPlaceholder: 'Ej: Dieta de Juan - Lunes',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#666',
        confirmButtonText: 'Guardar ahora',
        cancelButtonText: 'Cancelar'
      });

      if (!nombrePerfil) return;
      if (nombrePerfil) {
        try {
          const col = collection(this.firestore, 'perfiles');
          await addDoc(col, {
            uid: (user as any).uid,
            nombrePerfil: nombrePerfil,
            fecha: new Date().toISOString(),
            alimentos: this.historial,
            totales: this.totals
          });

          Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: `El perfil "${nombrePerfil}" se guardó correctamente.`,
            timer: 2000,
            showConfirmButton: false
          });

        } catch (e) {
          Swal.fire({ icon: 'error', title: 'Error al guardar', confirmButtonColor: '#d32f2f' });
        }
      }
    });
  }
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

  calcularDisplay(vStr: string): string {
    if (!this.seleccionado) return '-';
    const v = vStr.trim();
    if (v === "-" || v === "" || v === "*") return "-";
    const numBase = parseFloat(v.replace(',', '.')) || 0;
    return this.seleccionado.pesoBase > 0 ? ((this.cantidad * numBase) / this.seleccionado.pesoBase).toFixed(2) : "0.00";
  }

  guardar() {
    if (!this.seleccionado) return;

    const calcular = (idx: number) => {
      let v = this.seleccionado.nutrientes[idx].v.trim();
      if (v === "-" || v === "" || v === "*") return 0;
      let numBase = parseFloat(v.replace(',', '.')) || 0;
      return this.seleccionado.pesoBase > 0 ? (this.cantidad * numBase) / this.seleccionado.pesoBase : 0;
    };

    const nuevoItem = {
      id: Date.now(),
      nombre: this.seleccionado.nombre,
      cantidad: this.cantidad + (this.seleccionado.nombre.toLowerCase().includes("aceite") ? "ml" : "g"),
      hc: calcular(0), prot: calcular(1), grasa: calcular(2),
      na: calcular(3), k: calcular(4), p: calcular(5),
      ca: calcular(6), fe: calcular(7), colest: calcular(8),
      purinas: calcular(9), fibra: calcular(10), agua: calcular(11),
      kcal: calcular(12)
    };

    this.historial.push(nuevoItem);
    this.actualizarTotales();
  }

  actualizarTotales() {
    localStorage.setItem('nutriHistorial', JSON.stringify(this.historial));
    Object.keys(this.totals).forEach(k => this.totals[k] = 0);

    this.historial.forEach(item => {
      Object.keys(this.totals).forEach(key => {
        this.totals[key] += parseFloat(item[key]) || 0;
      });
    });

    this.totalKcalsMacros = (this.totals.hc * 4) + (this.totals.prot * 4) + (this.totals.grasa * 9);
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
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.historial = [];
        this.actualizarTotales();
      }
    });
  }

  exportar(): void {
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
    let csv = "\uFEFFAlimento;Cantidad;HC;Prot;Grasa;Fibra;Na;K;P;Ca;Fe;Colest;Purinas;Agua;Kcal\n";
    this.historial.forEach(i => {
      csv += `${i.nombre};${i.cantidad};${i.hc.toFixed(2).replace('.', ',')};${i.prot.toFixed(2).replace('.', ',')};${i.grasa.toFixed(2).replace('.', ',')};${i.fibra.toFixed(2).replace('.', ',')};${i.na.toFixed(2).replace('.', ',')};${i.k.toFixed(2).replace('.', ',')};${i.p.toFixed(2).replace('.', ',')};${i.ca.toFixed(2).replace('.', ',')};${i.fe.toFixed(2).replace('.', ',')};${i.colest.toFixed(2).replace('.', ',')};${i.purinas.toFixed(2).replace('.', ',')};${i.agua.toFixed(2).replace('.', ',')};${i.kcal.toFixed(2).replace('.', ',')}\n`;
    });
    // Fila Totales
    csv += `TOTALES;-;${this.totals.hc.toFixed(2).replace('.', ',')};${this.totals.prot.toFixed(2).replace('.', ',')};${this.totals.grasa.toFixed(2).replace('.', ',')};${this.totals.fibra.toFixed(2).replace('.', ',')};${this.totals.na.toFixed(2).replace('.', ',')};${this.totals.k.toFixed(2).replace('.', ',')};${this.totals.p.toFixed(2).replace('.', ',')};${this.totals.ca.toFixed(2).replace('.', ',')};${this.totals.fe.toFixed(2).replace('.', ',')};${this.totals.colest.toFixed(2).replace('.', ',')};${this.totals.purinas.toFixed(2).replace('.', ',')};${this.totals.agua.toFixed(2).replace('.', ',')};${this.totals.kcal.toFixed(2).replace('.', ',')}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Planilla_Nutri.csv";
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
        importados.push({
          id: Date.now() + i, nombre: f[0], cantidad: f[1],
          hc: num(f[2]), prot: num(f[3]), grasa: num(f[4]), fibra: num(f[5]),
          na: num(f[6]), k: num(f[7]), p: num(f[8]), ca: num(f[9]), fe: num(f[10]),
          colest: num(f[11]), purinas: num(f[12]), agua: num(f[13]), kcal: num(f[14])
        });
      }
      this.historial = [...this.historial, ...importados];
      this.actualizarTotales();
      Swal.fire({
        icon: 'success',
        title: 'Importación exitosa',
        text: `${importados.length} alimentos importados correctamente.`,
        timer: 2000,
        showConfirmButton: false
      });
    };
    reader.readAsText(file, "UTF-8");
  }
}
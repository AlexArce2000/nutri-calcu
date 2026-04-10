import { Component, OnInit } from '@angular/core';
import { NutriService } from '../../services/nutri.service';
import { AuthService } from '../../services/auth.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import { take } from 'rxjs';

@Component({
  selector: 'app-combined-calculator',
  templateUrl: './combined-calculator.component.html',
  styleUrls: ['./combined-calculator.component.css']
})
export class CombinedCalculatorComponent implements OnInit {
  baseIncap: any[] = [];
  baseLaura: any[] = [];
  searchIncap = '';
  searchLaura = '';
  filteredIncap: any[] = [];
  filteredLaura: any[] = [];
  cantidadIncap = 100;
  cantidadLaura = 100;
  historialCombinado: any[] = JSON.parse(localStorage.getItem('combinedHistorial') || '[]');
  editandoId: number | null = null;

  // Alimentos seleccionados en espera de fusión
  draftIncap: any = null;
  draftLaura: any = null;
  fuentesConfig: any = {};
  nombreElegido: 'incap' | 'laura' = 'incap';

  mapaNutrientes: any = {
    'Energía (kcal)': ['Calorías', 'Energía'],
    'Proteína (g)': ['Prot', 'Proteína'],
    'Grasa Total (g)': ['Grasa', 'Grasa Total'],
    'Carbohidratos (g)': ['HC', 'Carbohidratos'],
    'Fibra (g)': ['Fibra', 'Fibra Dietética'],
    'Sodio (mg)': ['Na', 'Sodio'],
    'Potasio (mg)': ['K', 'Potasio'],
    'Fósforo (mg)': ['P', 'Fósforo'],
    'Calcio (mg)': ['Ca', 'Calcio'],
    'Hierro (mg)': ['Fe', 'Hierro'],
    'Agua (g/%)': ['Agua', 'Agua'],
    'Colesterol (mg)': ['Colest', 'Colesterol'],
    'Zinc (mg)': [null, 'Zinc'],
    'Magnesio (mg)': [null, 'Magnesio'],
    'Vit. C (mg)': [null, 'Vit. C'],
    'Vit. A (mcg)': [null, 'Vit. A'],
    'Tiamina (mg)': [null, 'Tiamina'],
    'Riboflavina (mg)': [null, 'Riboflavina'],
    'Niacina (mg)': [null, 'Niacina'],
    'Vit. B6 (mg)': [null, 'Vit. B6'],
    'Vit. B12 (mcg)': [null, 'Vit. B12'],
    'Ác. Fólico (mcg)': [null, 'Ac. Fólico'],
    'Folato (mcg)': [null, 'Folato'],
    'Grasa Saturada (g)': [null, 'Ác. Grasos Saturados'],
    'Grasa Mono (g)': [null, 'Ác. grasos mono-insat.'],
    'Grasa Poli (g)': [null, 'Ác. grasos poli-insat.'],
    'Ceniza (g)': [null, 'Ceniza'],
    'Frac. Comestible (%)': [null, 'Fracción Comestible'],
    'Purinas (mg)': ['Purinas', null]
  };

  nutrientesSeleccionados: string[] = JSON.parse(localStorage.getItem('combinedColumns') || '["Energía (kcal)", "Proteína (g)", "Carbohidratos (g)", "Grasa Total (g)"]');

  constructor(private nutriService: NutriService, public authService: AuthService,
    private firestore: Firestore) { }

  ngOnInit(): void {
    this.nutriService.getIncapAlimentos().subscribe(data => this.baseIncap = data);
    this.nutriService.getAlimentos().subscribe(data => this.baseLaura = data);
    const savedColumns = localStorage.getItem('combinedColumns');
    if (savedColumns) {
      this.nutrientesSeleccionados = JSON.parse(savedColumns);
    }
  }
  // --- PERSISTENCIA LOCAL ---
  actualizarLocalStorage() {
    localStorage.setItem('combinedHistorial', JSON.stringify(this.historialCombinado));
  }

  // --- LÓGICA DE SELECCIÓN ---
  seleccionarIncap(alimento: any) {
    this.draftIncap = alimento;
    this.searchIncap = alimento.nombre;
    this.filteredIncap = [];
    this.inicializarFuentes();
  }

  seleccionarLaura(alimento: any) {
    this.draftLaura = alimento;
    this.searchLaura = alimento.nombre;
    this.filteredLaura = [];
    this.inicializarFuentes();
  }

  inicializarFuentes() {
    this.totalKeys.forEach(key => {
      if (!this.fuentesConfig[key]) this.fuentesConfig[key] = 'incap';
    });
  }
  // --- AGREGAR ALIMENTO SIMPLE ---
  // Esta función permite guardar si solo elegiste uno de los dos lados
  agregarSimple(origen: 'incap' | 'laura') {
    const alimento = origen === 'incap' ? this.draftIncap : this.draftLaura;
    const cantidad = origen === 'incap' ? this.cantidadIncap : this.cantidadLaura;

    if (!alimento) return;

    const nuevoItem = {
      id: this.editandoId || Date.now(),
      nombre: alimento.nombre,
      cantidad: cantidad + 'g',
      origen: origen,
      // Guardamos los objetos originales para poder editarlos después
      originalIncap: origen === 'incap' ? alimento : null,
      originalLaura: origen === 'laura' ? alimento : null,
      cantIncap: origen === 'incap' ? cantidad : 0,
      cantLaura: origen === 'laura' ? cantidad : 0,
      valores: {} as any
    };

    // Calculamos los valores (usando la misma lógica de normalización)
    this.procesarValores(nuevoItem, { [origen]: true });

    this.finalizarGuardado(nuevoItem);
  }

  confirmarFusion() {
    const nuevoItem = {
      id: this.editandoId || Date.now(),
      nombre: this.nombreElegido === 'incap' ? this.draftIncap.nombre : this.draftLaura.nombre,
      cantidad: `Mix (${this.cantidadIncap}g / ${this.cantidadLaura}g)`,
      origen: 'hibrido',
      originalIncap: this.draftIncap,
      originalLaura: this.draftLaura,
      cantIncap: this.cantidadIncap,
      cantLaura: this.cantidadLaura,
      fuentesConfig: { ...this.fuentesConfig }, // Guardamos la config de radios
      nombreElegido: this.nombreElegido,
      valores: {} as any
    };

    this.procesarValores(nuevoItem);
    this.finalizarGuardado(nuevoItem);
  }
  private procesarValores(item: any, forzarFuente?: any) {
    Object.keys(this.mapaNutrientes).forEach(keyComun => {
      const fuente = forzarFuente ? (forzarFuente.incap ? 'incap' : 'laura') : (this.fuentesConfig[keyComun] || 'incap');
      const alimentoFuente = fuente === 'incap' ? item.originalIncap : item.originalLaura;
      const cantidadFuente = fuente === 'incap' ? item.cantIncap : item.cantLaura;

      if (alimentoFuente) {
        const nombresPosibles = this.mapaNutrientes[keyComun];
        const nombreEnTabla = (fuente === 'laura') ? nombresPosibles[0] : nombresPosibles[1];
        const nut = alimentoFuente.nutrientes.find((n: any) => n.n.includes(nombreEnTabla));

        if (nut && nut.v !== '-' && nut.v !== '') {
          const numBase = parseFloat(nut.v.replace(',', '.')) || 0;
          item.valores[keyComun] = (cantidadFuente * numBase) / alimentoFuente.pesoBase;
        } else { item.valores[keyComun] = 0; }
      } else { item.valores[keyComun] = 0; }
    });
  }

  private finalizarGuardado(item: any) {
    if (this.editandoId) {
      const index = this.historialCombinado.findIndex(i => i.id === this.editandoId);
      this.historialCombinado[index] = item;
    } else {
      this.historialCombinado.push(item);
    }
    this.actualizarLocalStorage();
    this.cancelarFusion(); // Limpia todo
    this.editandoId = null;
  }

  // --- FUNCIÓN DE EDICIÓN ---
  prepararEdicion(item: any) {
    this.editandoId = item.id;

    // Cargamos los alimentos originales de nuevo en los borradores
    this.draftIncap = item.originalIncap;
    this.draftLaura = item.originalLaura;

    this.searchIncap = item.originalIncap ? item.originalIncap.nombre : '';
    this.searchLaura = item.originalLaura ? item.originalLaura.nombre : '';

    this.cantidadIncap = item.cantIncap || 100;
    this.cantidadLaura = item.cantLaura || 100;

    if (item.origen === 'hibrido') {
      this.fuentesConfig = { ...item.fuentesConfig };
      this.nombreElegido = item.nombreElegido;
    }

    setTimeout(() => {
      const el = document.getElementById('fusionPanel');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  cancelarFusion() {
    this.draftIncap = null;
    this.draftLaura = null;
    this.searchIncap = '';
    this.searchLaura = '';
    this.filteredIncap = [];
    this.filteredLaura = [];
    this.editandoId = null;
    this.fuentesConfig = {};
  }

  // --- BUSCADORES ---
  buscarIncap() {
    // 1. Si el texto está vacío, limpiamos el borrador y cerramos sugerencias
    if (this.searchIncap.trim() === '') {
      this.draftIncap = null;
      this.filteredIncap = [];
      return;
    }

    // 2. Si el usuario escribe algo distinto al nombre seleccionado, 
    // también limpiamos el borrador para que aparezca el botón "Solo este"
    if (this.draftIncap && this.searchIncap !== this.draftIncap.nombre) {
      this.draftIncap = null;
    }

    // 3. Filtrado normal
    this.filteredIncap = this.baseIncap.filter(a =>
      a.nombre.toLowerCase().includes(this.searchIncap.toLowerCase())
    );
  }

  buscarLaura() {
    // 1. Si el texto está vacío, limpiamos el borrador y cerramos sugerencias
    if (this.searchLaura.trim() === '') {
      this.draftLaura = null;
      this.filteredLaura = [];
      return;
    }

    // 2. Si el usuario escribe algo distinto al nombre seleccionado, 
    // también limpiamos el borrador
    if (this.draftLaura && this.searchLaura !== this.draftLaura.nombre) {
      this.draftLaura = null;
    }

    // 3. Filtrado normal
    this.filteredLaura = this.baseLaura.filter(a =>
      a.nombre.toLowerCase().includes(this.searchLaura.toLowerCase())
    );
  }

  // --- OTROS ---
  eliminar(id: number) {
    this.historialCombinado = this.historialCombinado.filter(i => i.id !== id);
    this.actualizarLocalStorage();
  }
  borrarTodo() {
    Swal.fire({
      title: '¿Borrar todo el análisis?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      confirmButtonText: 'Sí, borrar'
    }).then(r => {
      if (r.isConfirmed) {
        this.historialCombinado = [];
        this.actualizarLocalStorage();
      }
    });
  }
  // --- EXPORTAR A EXCEL (Dinámico) ---
  exportar() {
    if (this.historialCombinado.length === 0) {
      Swal.fire("Sin datos", "Agrega alimentos a la tabla antes de exportar", "warning");
      return;
    }

    // 1. Cabeceras: Deben coincidir exactamente con el orden de los datos
    // Usamos el BOM (\uFEFF) para que Excel reconozca tildes y caracteres especiales
    let csv = "\uFEFF";
    csv += "Alimento;Cantidad;Origen;" + this.nutrientesSeleccionados.join(";") + "\n";

    // 2. Filas de datos
    this.historialCombinado.forEach(item => {
      // IMPORTANTE: Incluimos nombre, cantidad y origen antes de los nutrientes
      let fila = `${item.nombre};${item.cantidad};${item.origen.toUpperCase()};`;

      // Mapeamos los valores de los nutrientes seleccionados en orden
      const valoresNutrientes = this.nutrientesSeleccionados.map(nutKey => {
        const valor = item.valores[nutKey] || 0;
        // Convertimos punto decimal a coma para Excel en español
        return valor.toFixed(2).replace('.', ',');
      });

      csv += fila + valoresNutrientes.join(";") + "\n";
    });

    // 3. Fila de Totales
    // Ponemos guiones en Cantidad y Origen para que los totales queden bajo sus columnas
    csv += `TOTALES COMBINADOS;-;-;`;

    const valoresTotales = this.nutrientesSeleccionados.map(nutKey => {
      const total = this.calcularTotal(nutKey) || 0;
      return total.toFixed(2).replace('.', ',');
    });

    csv += valoresTotales.join(";") + "\n";

    // 4. Crear y disparar la descarga
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const fecha = new Date().toLocaleDateString().replace(/\//g, '-');
    link.href = url;
    link.download = `Analisis_Combinado_${fecha}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // --- GUARDAR EN NUBE (FIREBASE) ---
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
        title: 'Guardar Dieta Combinada',
        input: 'text',
        inputLabel: 'Nombre del perfil:',
        showCancelButton: true,
        confirmButtonColor: '#E63946'
      });

      if (nombre) {
        try {
          await addDoc(collection(this.firestore, 'perfiles_combinados'), {
            uid: user.uid,
            perfilNombre: nombre,
            fecha: new Date().toISOString(),
            items: this.historialCombinado,
            nutrientesActivos: this.nutrientesSeleccionados // Guardamos qué columnas estaban activas
          });
          Swal.fire("¡Éxito!", "Perfil guardado en Firebase", "success");
        } catch (err) {
          Swal.fire("Error", "No se pudo guardar", "error");
        }
      }
    });
  }


  get totalKeys() { return Object.keys(this.mapaNutrientes); }

  calcularTotal(key: string): number {
    return this.historialCombinado.reduce((acc, item) => acc + (item.valores[key] || 0), 0);
  }

  toggleNutriente(nut: string) {
    const idx = this.nutrientesSeleccionados.indexOf(nut);
    if (idx > -1) this.nutrientesSeleccionados.splice(idx, 1);
    else this.nutrientesSeleccionados.push(nut);
    localStorage.setItem('combinedColumns', JSON.stringify(this.nutrientesSeleccionados));

  }
}
import { Component, OnInit } from '@angular/core';
import { NutriService } from '../../services/nutri.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { take } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-add-food',
  templateUrl: './add-food.component.html',
  styleUrls: ['./add-food.component.css']
})
export class AddFoodComponent implements OnInit {
  tipoSeleccionado: 'basica' | 'incap' = 'basica';
  nombre: string = '';
  medida: string = '1 porción';
  pesoBase: number = 100;

  // Estructura para los nutrientes
  nutrientesInputs: any[] = [];
  misAlimentos$: Observable<any[]> = of([]);
  editandoId: string | null = null

  constructor(private nutriService: NutriService, private authService: AuthService) {
    this.cambiarTipo();
  }
  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        // Cargamos la lista de alimentos del usuario actual
        this.misAlimentos$ = this.nutriService.getCustomFoods(user.uid, this.tipoSeleccionado);
      }
    });
  }
  cambiarTipo() {
    this.editandoId = null;
    this.nombre = '';
    // Definimos qué nutrientes pedir según la tabla
    const basica = ["HC", "Prot", "Grasa", "Na", "K", "P", "Ca", "Fe", "Colest", "Purinas", "Fibra", "Agua", "Calorías"];
    const incap = [
      "Agua", "Energía", "Proteína", "Grasa Total", "Carbohidratos", "Fibra Dietética",
      "Ceniza", "Calcio", "Fósforo", "Hierro", "Tiamina", "Riboflavina", "Niacina",
      "Vit. C", "Vit. A (Retinol)", "Ác. Grasos Monoinsat.", "Ác. Grasos Poliinsat.", "Ác. Grasos Saturados", "Colesterol",
      "Potasio", "Sodio", "Zinc", "Magnesio", "Vit. B6", "Vit. B12", "Ac. Fólico", "Folato Equiv.", "Fracción Comestible"
    ];

    const seleccion = this.tipoSeleccionado === 'basica' ? basica : incap;
    this.nutrientesInputs = seleccion.map(n => ({ nombre: n, valor: 0 }));
    this.ngOnInit();
  }

  async guardarProducto() {
    const user = await new Promise(resolve => this.authService.user$.pipe(take(1)).subscribe(resolve));
    if (!user) return;

    const productoData = {
      userId: (user as any).uid,
      tipoBase: this.tipoSeleccionado,
      nombre: this.nombre,
      medida: this.medida,
      pesoBase: this.pesoBase,
      nutrientes: this.nutrientesInputs.map(ni => ({ n: ni.nombre, v: ni.valor.toString() }))
    };

    try {
      if (this.editandoId) {
        await this.nutriService.updateCustomFood(this.editandoId, productoData);
        Swal.fire("Actualizado", "El producto ha sido modificado", "success");
      } else {
        await this.nutriService.addCustomFood(productoData);
        Swal.fire("Guardado", "Producto añadido a tu base personal", "success");
      }
      this.cancelarEdicion();
    } catch (e) {
      Swal.fire("Error", "No se pudo procesar la solicitud", "error");
    }
  }
  prepararEdicion(alimento: any) {
    console.log("Editando alimento:", alimento);
    if (!alimento.id) {
      alert("Este alimento no tiene un ID válido");
      return;
    }

    this.editandoId = alimento.id;
    this.nombre = alimento.nombre;
    this.medida = alimento.medida;
    this.pesoBase = alimento.pesoBase;

    // Rellenar los nutrientes
    this.nutrientesInputs.forEach(ni => {
      const encontrado = alimento.nutrientes.find((n: any) => n.n === ni.nombre);
      ni.valor = encontrado ? parseFloat(encontrado.v) : 0;
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  cancelarEdicion() {
    this.editandoId = null;
    this.nombre = '';
    this.medida = '1 porción';
    this.pesoBase = 100;
    this.cambiarTipo();
  }

  async eliminar(id: string) {
    console.log("Intentando eliminar ID:", id); // Mira esto en la consola (F12)
    if (!id) {
      Swal.fire("Error", "No se encontró el ID del producto", "error");
      return;
    }

    const result = await Swal.fire({
      title: '¿Eliminar alimento?',
      text: "Esta acción no se puede deshacer",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E63946',
      confirmButtonText: 'Sí, borrar'
    });

    if (result.isConfirmed) {
      try {
        await this.nutriService.deleteCustomFood(id);
        Swal.fire("Borrado", "El alimento ha sido eliminado", "success");
      } catch (error) {
        console.error(error);
        Swal.fire("Error", "No tienes permisos para borrar", "error");
      }
    }
  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class NutriService {

  constructor(private http: HttpClient) { }

  // 1. Leer el archivo CSV
  getAlimentos() {
    return this.http.get('assets/data/baseAlimentos.csv', { responseType: 'text' }).pipe(
      map(data => this.parsearCSV(data))
    );
  }

  // 2. Tu lógica de parsing adaptada a TS
  private parsearCSV(texto: string) {
    const lineas = texto.split(/\r?\n/);
    return lineas.slice(1).map(linea => {
      const col = linea.split(';');
      if (col.length < 15 || !col[1]) return null;
      return {
        nombre: col[0],
        medida: col[1],
        pesoBase: parseFloat(col[2].replace(',', '.')) || 0,
        nutrientes: [
          { n: "HC", v: col[3] }, { n: "Prot", v: col[4] }, { n: "Grasa", v: col[5] },
          { n: "Na", v: col[6] }, { n: "K", v: col[7] }, { n: "P", v: col[8] },
          { n: "Ca", v: col[9] }, { n: "Fe", v: col[10] }, { n: "Colest", v: col[11] },
          { n: "Purinas", v: col[12] }, { n: "Fibra", v: col[13] }, { n: "Agua", v: col[14] },
          { n: "Calorías", v: col[15] }
        ]
      };
    }).filter(item => item !== null);
  }

  // 3. Función auxiliar para cálculos
  calcularNutriente(qty: number, pesoBase: number, valorBaseStr: string): string {
    const v = valorBaseStr.trim();
    if (v === "-" || v === "" || v === "*") return "-";
    const numBase = parseFloat(v.replace(',', '.')) || 0;
    return pesoBase > 0 ? ((qty * numBase) / pesoBase).toFixed(2) : "0.00";
  }
}
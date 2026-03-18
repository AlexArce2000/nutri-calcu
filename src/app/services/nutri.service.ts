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

  getIncapAlimentos() {
    return this.http.get('assets/data/TCAincap.csv', { responseType: 'text' }).pipe(
      map(data => {
        const lineas = data.split(/\r?\n/);
        return lineas.slice(1).map(linea => {
          const col = linea.split(';');
          if (col.length < 25 || !col[1] || col[1].includes('PRODUCTOS')) return null;

          return {
            codigo: col[0],
            nombre: col[1],
            pesoBase: 100, 
            nutrientes: [
              { n: "Agua", u: "%", v: col[2] },
              { n: "Energía", u: "Kcal", v: col[3] },
              { n: "Proteína", u: "g", v: col[4] },
              { n: "Grasa Total", u: "g", v: col[5] },
              { n: "Carbohidratos", u: "g", v: col[6] },
              { n: "Fibra Dietética", u: "g", v: col[7] },
              { n: "Ceniza", u: "g", v: col[8] },
              { n: "Calcio", u: "mg", v: col[9] },
              { n: "Fósforo", u: "mg", v: col[10] },
              { n: "Hierro", u: "mg", v: col[11] },
              { n: "Tiamina", u: "mg", v: col[12] },
              { n: "Riboflavina", u: "mg", v: col[13] },
              { n: "Niacina", u: "mg", v: col[14] },
              { n: "Vit. C", u: "mg", v: col[15] },
              { n: "Vit. A (Retinol)", u: "mcg", v: col[16] },
              { n: "Ác. Grasos Monoinsat.", u: "g", v: col[17] },
              { n: "Ác. Grasos Poliinsat.", u: "g", v: col[18] },
              { n: "Ác. Grasos Saturados", u: "g", v: col[19] },
              { n: "Colesterol", u: "mg", v: col[20] },
              { n: "Potasio", u: "mg", v: col[21] },
              { n: "Sodio", u: "mg", v: col[22] },
              { n: "Zinc", u: "mg", v: col[23] },
              { n: "Magnesio", u: "mg", v: col[24] },
              { n: "Vit. B6", u: "mg", v: col[25] },
              { n: "Vit. B12", u: "mcg", v: col[26] },
              { n: "Ác. Fólico", u: "mcg", v: col[27] },
              { n: "Folato Equiv.", u: "mcg", v: col[28] },
              { n: "Fracción Comestible", u: "%", v: col[29] }
            ]
          };
        }).filter(item => item !== null);
      })
    );
  }
}
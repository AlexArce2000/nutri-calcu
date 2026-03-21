import { Component } from '@angular/core';

@Component({
  selector: 'app-harris-benedict',
  templateUrl: './harris-benedict.component.html',
  styleUrls: ['./harris-benedict.component.css']
})
export class HarrisBenedictComponent {
  peso: number = 70;
  talla: number = 170;
  edad: number = 25;
  genero: string = 'hombre';
  resultadoGMR: number = 0;

  constructor() {
    this.calcularGMR();
  }

  calcularGMR() {
    if (this.genero === 'hombre') {
      // Fórmula: 66,47 + (13,75 x P) + (5 x T) – (6,75 x E)
      this.resultadoGMR = 66.47 + (13.75 * this.peso) + (5 * this.talla) - (6.75 * this.edad);
    } else {
      // Fórmula: 655,1 + (9,56 x P) + (1,85 x T) – (4,68 x E)
      this.resultadoGMR = 655.1 + (9.56 * this.peso) + (1.85 * this.talla) - (4.68 * this.edad);
    }
  }
}
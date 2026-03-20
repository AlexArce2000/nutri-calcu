import { Component } from '@angular/core';

@Component({
  selector: 'app-macro-distribution',
  templateUrl: './macro-distribution.component.html',
  styleUrls: ['./macro-distribution.component.css']
})
export class MacroDistributionComponent {
  peso: number = 70;
  vctSeleccionado: number = 0;
  objetivo: string = 'mantener';

  // Porcentajes (Inputs de usuario)
  hcPct: number = 50;
  prPct: number = 20;
  lipPct: number = 30;

  constructor() {
    this.calcularTodo();
  }

  get totalPct() { return this.hcPct + this.prPct + this.lipPct; }

  calcularTodo() {
    // Factores según imagen Excel: 1975/79=25, 2370/79=30, 2765/79=35
    const factores: any = { 'disminuir': 25, 'mantener': 30, 'aumentar': 35 };
    this.vctSeleccionado = this.peso * factores[this.objetivo];
  }

  // Cálculos dinámicos para la tabla
  get hcKcal() { return this.vctSeleccionado * (this.hcPct / 100); }
  get prKcal() { return this.vctSeleccionado * (this.prPct / 100); }
  get lipKcal() { return this.vctSeleccionado * (this.lipPct / 100); }

  get hcGram() { return this.hcKcal / 4; }
  get prGram() { return this.prKcal / 4; }
  get lipGram() { return this.lipKcal / 9; }

  // Proteína específica
  get pavb() { return this.prGram * 0.7; }
  get protPorKilo() { return this.peso > 0 ? (this.prGram / this.peso) : 0; }
}
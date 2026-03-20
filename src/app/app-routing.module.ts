import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorComponent } from './components/calculator/calculator.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { IncapCalculatorComponent } from './components/incap-calculator/incap-calculator.component';
import { MacroDistributionComponent } from './components/macro-distribution/macro-distribution.component';

const routes: Routes = [
  { path: '', component: CalculatorComponent },
  { path: 'incap', component: IncapCalculatorComponent },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { path: 'macros', component: MacroDistributionComponent},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
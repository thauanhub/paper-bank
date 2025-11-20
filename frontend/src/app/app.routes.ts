import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';         // Importa a Home
import { Carteira } from './carteira/carteira'; // Importa a Carteira

export const routes: Routes = [
    // Rota padrão (quando entra no site, vai para Home)
    { path: '', component: HomeComponent },
    
    // Rota da Carteira
    { path: 'carteira', component: Carteira }
];
import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';         // Importa a Home
import { Carteira } from './carteira/carteira'; // Importa a Carteira
import { Configuracoes } from './configuracoes/configuracoes';
import { Atividades } from './atividades/atividades';
import { Ajuda } from './ajuda/ajuda';


export const routes: Routes = [
    // Rota padrão (quando entra no site, vai para Home)
    { path: '', component: HomeComponent },
    
    // Rota da Carteira
    { path: 'carteira', component: Carteira },

    { path: 'configuracoes', component: Configuracoes},

    { path: 'atividades', component: Atividades},

    { path: 'ajuda', component: Ajuda}

];
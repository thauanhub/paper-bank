import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';         // Importa a Home
import { Carteira } from './carteira/carteira'; // Importa a Carteira
import { Atividades } from './atividades/atividades';
import { Ajuda } from './ajuda/ajuda';
import { Login } from './login/login';
import { Register } from './register/register';


export const routes: Routes = [

    // Rota padrão (quando entra no site, vai para Home)
    { path: '', component: Login },

    { path: 'home', component: HomeComponent },
    
    // Rota da Carteira
    { path: 'carteira', component: Carteira },

    { path: 'atividades', component: Atividades},

    { path: 'ajuda', component: Ajuda},

    { path: 'register', component: Register}

];
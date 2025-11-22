import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';         // Importa a Home
import { Carteira } from './carteira/carteira'; // Importa a Carteira
<<<<<<< HEAD
=======
import { Configuracoes } from './configuracoes/configuracoes';
import { Atividades } from './atividades/atividades';
import { Ajuda } from './ajuda/ajuda';

>>>>>>> 4298f068 (Alterações no diretório e criação de componentes)

export const routes: Routes = [
    // Rota padrão (quando entra no site, vai para Home)
    { path: '', component: HomeComponent },
    
    // Rota da Carteira
<<<<<<< HEAD
    { path: 'carteira', component: Carteira }
=======
    { path: 'carteira', component: Carteira },

    { path: 'configuracoes', component: Configuracoes},

    { path: 'atividades', component: Atividades},

    { path: 'ajuda', component: Ajuda}

>>>>>>> 4298f068 (Alterações no diretório e criação de componentes)
];
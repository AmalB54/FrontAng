import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      { path: '', component: Dashboard }, // ✅ tableau de bord par défaut
      { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
      { path: 'documentation', component: Documentation },
      { path: 'patients', loadChildren: () => import('./app/pages/patients/patients.routes') },
      { path: 'rooms', loadChildren: () => import('./app/pages/room/rooms/rooms.routes') },


      { 
        path: 'doctors', 
        loadComponent: () => import('./app/doctor/doctor.component').then(m => m.DoctorListComponent) 
      },
      {
        path: 'nurses',
        loadComponent: () => import('./app/nurse/nurse.component').then(m => m.NursesComponent)
      },
      
      
      { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
    ]
  },
  { path: 'landing', component: Landing },
  { path: 'notfound', component: Notfound },
  { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },

  // ✅ Redirection des pages inconnues
  { path: '**', redirectTo: '/notfound' }
];

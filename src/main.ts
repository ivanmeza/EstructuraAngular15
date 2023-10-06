import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { Route, Routes, provideRouter } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { PanelComponent } from './app/modulos/panel/panel.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { IconsProviderModule } from './app/icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { ApiInterceptor } from './app/interceptor/api.interceptor';
import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';
import { provideAnimations } from '@angular/platform-browser/animations';
import { LoginGuard } from './app/guards/login.guard';
import { PanelGuard } from './app/guards/panel.guard';
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
} from '@ant-design/icons-angular/icons';
import { NZ_ICONS } from 'ng-zorro-antd/icon';

export const ROUTES: Route[] = [];

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
];
const rutas: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./app/modulos/login/login.component').then(
        (mod) => mod.LoginComponent
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'panel',
    component: PanelComponent,
    canActivate: [PanelGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'firma',
      },
      {
        path: 'firma',
        loadComponent: () =>
          import('./app/modulos/panel/firma/firma.component').then(
            (m) => m.FirmaComponent
          ),
      },
      // {
      //   path: 'usuarios',
      //   loadComponent: () =>
      //     import('./app/modulos/panel/usuarios/usuarios.component').then(
      //       (m) => m.UsuariosComponent
      //     ),
      // },
    ],
  },
];

bootstrapApplication(AppComponent, {
  providers: [
    { provide: NZ_ICONS, useValue: icons },
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      // IconsProviderModule,
      NzLayoutModule,
      NzMenuModule,
      ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' })
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    { provide: NZ_I18N, useValue: es_ES },

    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    provideRouter(rutas),
  ],
}).catch((err) => console.error(err));

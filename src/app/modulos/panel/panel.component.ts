import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import jwt_decode from 'jwt-decode';
import { NzModalService } from 'ng-zorro-antd/modal';


import { NgZorroAntdModule } from 'src/app/shared/ng-zorro';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panel',
  standalone: true,
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  imports: [
    CommonModule,
    NgZorroAntdModule,
    ReactiveFormsModule,
    RouterOutlet,
    RouterLink,
  ],
})
export class PanelComponent implements OnInit {
  // --------------------------------------------------
  private http = inject(HttpClient);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);
  // --------------------------------------------------
  token: any;
  usuario: any = '';
  isCollapsed = true;
  width: any;
  nombre: any;

  idleState = 'NOT_STARTED';
  countdown?: any = null;
  lastPing?: any = null;

  ruta: string = '';
  constructor() {

  }

  ngOnInit(): void {
    this.decoded();
    this.resolucionresponsiv();
    this.pantalla();
    this.ruta = this.router.url;
  }

  async decoded() {
    this.token = await localStorage.getItem('token');
    const decoded: any = await jwt_decode(this.token);
    this.usuario = decoded.nombre;
  }
  async resolucionresponsiv() {
    const width = await window.innerWidth;
    if (width < 768) {
      this.width = '575';
    } else if (width > 768) {
      this.width = '992';
    }
  }
  async pantalla() {
    window.onresize = () => {
      this.width = window.innerWidth;
    };
  }
  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  async logout() {
    try {
      // await this.http.get(`auth/cerrar_login`).toPromise();
      // this.idle.clearInterrupts();
      // this.idle.ngOnDestroy();
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
    } catch (error) {
      console.log('error logout', error);
    }
  }
  async home() {
    this.router.navigate(['/panel/firma']);
    // this.adminrole == 1
    //   ? this.router.navigate(['/panel/expedientes-admin'])
    //   : this.router.navigate(['/panel/expedientes']);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'src/app/shared/ng-zorro';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import jwt_decode from 'jwt-decode';
import { LoginClass } from 'src/app/clases/login/login';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, NgZorroAntdModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  // -----------------------------------------------------------
  private formBuilder = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private modal = inject(NzModalService);
  // -----------------------------------------------------------
  validateForm!: FormGroup;
  loginModel: LoginClass = new LoginClass();
  passwordVisible: boolean = false;
  btnLoading: boolean = false;
  ngOnInit(): void {
    this.validateForm = this.formBuilder.group({
      usrname: [null, [Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  async submitForm() {
    for (const i in this.validateForm.controls) {
      this.validateForm.controls[i].markAsDirty();
      this.validateForm.controls[i].updateValueAndValidity();
    }
    if (this.validateForm.valid) {
      if (this.btnLoading) return;
      this.btnLoading = true;
      try {
        const res: any = await this.http
          .post('login_firma', this.loginModel)
          .toPromise();
        // localStorage.removeItem('sesion');
        localStorage.setItem('token', res.mensaje);
        const token = localStorage.getItem('token') ?? '';
        const decoded: any = jwt_decode(token);
        this.router.navigate(['/panel']);
        // if (decoded.rol_usuario === '4') {
        //   this.router.navigate(['/panel/notificaciones']);
        // } else if (decoded.adminrole === '1') {
        //   this.router.navigate(['/panel/expedientes-admin']);
        // } else {
        //   console.log('ok');
        //   // this.router.navigate(['/panel']);
        // }
      } catch (error: any) {
        switch (error.status) {
          case 0:
            this.modal.error({
              nzTitle: 'Fallo',
              nzContent: 'No hay conexión con el servidor',
            });
            break;
          case 401:
            this.modal.error({
              nzTitle: 'Credenciales inválidas',
              nzContent:
                'No se encuentran registros asociados al correo proporcionado',
            });
            break;
          case 409:
            this.modal.error({
              nzTitle: 'Credenciales inválidas',
              nzContent: 'Existe una sesión activa',
            });
            break;
        }
      }
      this.btnLoading = false;
    }
  }
}

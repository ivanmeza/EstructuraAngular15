import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  //PRUEBAS LOCALES
  //baseUrl = 'http://localhost/pruebas/api_penal_back/';
  //baseUrl = 'http://10.25.70.150/php_c/api_penal_back/';

  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let apiReq: any;
    if (request.url.startsWith('http')) {
      apiReq = request.clone({
        url: `${request.url}`,
      });
    } else {
      const token = localStorage.getItem('token');
      apiReq = request.clone({
        url: `${environment.baseUrl}${request.url}`,
        setHeaders: {
          token: `${token}`,
        },
      });
    }

    return next.handle(apiReq);
  }
}

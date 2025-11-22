import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private apiBase = 'http://localhost:8000';

  constructor(private router: Router, private http: HttpClient) {}

  canActivate(): Observable<boolean | UrlTree> {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (!token) {
      return of(this.router.parseUrl('/'));
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // valida token chamando /auth/minha-conta
    return this.http.get<any>(`${this.apiBase}/auth/minha-conta`, { headers }).pipe(
      map(() => true),
      catchError(err => {
        console.warn('AuthGuard: token inválido ou erro ao validar:', err);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        return of(this.router.parseUrl('/'));
      })
    );
  }
}

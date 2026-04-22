import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthResponse } from '../interfaces/auth-response.interfaces';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { rxResource } from '@angular/core/rxjs-interop';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  user = computed<User | null>(() => this._user());
  token = computed<string | null>(() => this._token());
  isAdmin = computed(() => this._user()?.roles.includes('admin') ?? false);

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) return 'authenticated';

    return 'not-authenticated';
  });

  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  });

  private handleAuthSucess(resp: AuthResponse) {
    this._user.set(resp.user);
    this._authStatus.set('authenticated');
    this._token.set(resp.token);

    localStorage.setItem('token', resp.token);

    return true;
  }

  private handleAuthError(error: any) {
    this.logout();
    return of(false);
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/login`, {
        email: email,
        password: password,
      })
      .pipe(
        map((resp) => this.handleAuthSucess(resp)),
        catchError((error: any) => this.handleAuthError(error)),
      );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return of(false);
    }

    return this.http
      .get<AuthResponse>(`${baseUrl}/auth/check-status`, {
        /*         headers: {
          Authorization: `Bearer ${token}`,
        }, */
      })
      .pipe(
        map((resp) => this.handleAuthSucess(resp)),
        catchError((error: any) => this.handleAuthError(error)),
      );
  }

  logout() {
    this._user.set(null);
    this._authStatus.set('not-authenticated');
    this._token.set(null);

    //localStorage.removeItem('token');
  }
}

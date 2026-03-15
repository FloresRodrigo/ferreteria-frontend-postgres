import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private url = API_CONFIG.baseUrl+'/'+API_CONFIG.endpoints.auth;

  constructor(private _http: HttpClient) {};

  public register(nombre_completo:string, username:string, email:string, password:string): Observable<any> {
    return this._http.post(this.url+'/register', {nombre_completo: nombre_completo, username: username, email: email, password: password});
  };

  public login(login:string, password:string): Observable<any> {
    return this._http.post(this.url+'/login', {login: login, password: password});
  };

  public forgotPassword(email:string): Observable<any> {
    return this._http.post(this.url+'/forgot-password', { email: email });
  };

  public resetPassword(token:string | null, password:string): Observable<any> {
    return this._http.post(this.url+'/reset-password'+'?token='+token, { password: password });
  };

  public persistirSesion(usuario:any) {
    localStorage.setItem('nombre_completo', usuario.nombre_completo);
    localStorage.setItem('username', usuario.username);
    localStorage.setItem('email', usuario.email);
    localStorage.setItem('token', usuario.token)
  };

  public getToken(): string | null {
    return localStorage.getItem('token');
  };

  public isLogged(): boolean {
    return this.getToken() !== null && this.getToken() !== undefined;
  };

  private loggedUsername(): string | null {
    return localStorage.getItem('username');
  };

  private loggedEmail(): string | null {
    return localStorage.getItem('email');
  };

  private loggedNombre(): string | null {
    return localStorage.getItem('nombre_completo');
  };

  public userLogged() {
    return {
      nombre: this.loggedNombre(),
      username: this.loggedUsername(),
      email: this.loggedEmail()
    };
  };

  public logout(): void {
    localStorage.removeItem('nombre_completo');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    sessionStorage.removeItem('carrito');
    window.dispatchEvent(new Event('carritoActualizado'));
  };

  private decodeToken(): any | null {
    const token = this.getToken();
    if(!token) {
      return null;
    };
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    };
  };

  public isAdmin(): boolean {
    const payload = this.decodeToken();
    return payload?.rol === 'ADMIN';
  };

  loginGoogle(idToken:string): Observable<any> {
    return this._http.post(this.url+'/login-google', { idToken: idToken });
  };

  setPasswordGoogle(password:string): Observable<any> {
    return this._http.post(this.url+'/set-password-google', { password });
  };
}
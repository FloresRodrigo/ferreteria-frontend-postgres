import { Injectable } from '@angular/core';
import { API_CONFIG } from '../api.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Usuario {
  private url = API_CONFIG.baseUrl+'/'+API_CONFIG.endpoints.usuario;

  constructor(private _http: HttpClient) {};

  public getMyProfile(): Observable<any> {
    return this._http.get(this.url+'/perfil');
  };

  public updateMyProfile(body: { nombre_completo?:string, username?:string, email?:string }): Observable<any> {
    return this._http.put(this.url+'/perfil', body);
  };

  public changeMyPassword(actualPassword:string, newPassword:string, repeatNewPassword:string): Observable<any> {
    return this._http.put(this.url+'/perfil/password', { actualPassword: actualPassword, newPassword: newPassword, repeatNewPassword: repeatNewPassword });
  };

  public getUsuarios(params?:any): Observable<any> {
    return this._http.get(this.url, { params: params || {} });
  };

  public getUsuario(id:number): Observable<any> {
    return this._http.get(this.url+'/'+id);
  };

  public updateUsuario(id:number, body: { nombre_completo?:string, username?:string, email?:string, password?:string, estado?:string }): Observable<any> {
    return this._http.put(this.url+'/'+id, body);
  };

  public deleteUsuario(id:number): Observable<any> {
    return this._http.delete(this.url+'/'+id);
  };
}

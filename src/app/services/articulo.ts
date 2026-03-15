import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../api.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Articulo {
  private url = API_CONFIG.baseUrl+'/'+API_CONFIG.endpoints.articulo;

  constructor(private _http: HttpClient) {};

  public top10Articulos(): Observable<any> {
    return this._http.get(this.url+'/top10');
  };

  public getArticulos(params?:any): Observable<any> {
    return this._http.get(this.url, { params: params || {} });
  };

  public getInventario(params:any):Observable<any> {
    return this._http.get(this.url+'/inventario', { params });
  };

  public createArticulo(articulo:FormData): Observable<any> {
    return this._http.post(this.url+'/inventario', articulo);
  };

  public getArticuloAdmin(id:number): Observable<any> {
    return this._http.get(this.url+'/inventario/'+id);
  };

  public updateArticulo(id:number, articulo:FormData): Observable<any> {
    return this._http.put(this.url+'/inventario/'+id, articulo);
  };

  public deleteArticulo(id:number): Observable<any> {
    return this._http.delete(this.url+'/inventario/'+id);
  };

  public getArticuloPublic(id:number): Observable<any> {
    return this._http.get(this.url+'/'+id);
  };
}

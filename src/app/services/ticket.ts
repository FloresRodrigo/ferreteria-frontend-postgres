import { Injectable } from '@angular/core';
import { API_CONFIG } from '../api.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Ticket {
  private url = API_CONFIG.baseUrl+'/'+API_CONFIG.endpoints.ticket;

  constructor(private _http: HttpClient) {};

  public createTicket(carrito:any): Observable<any> {
    return this._http.post(this.url, { carrito });
  };

  public pagarTicket(id:number): Observable<any> {
    return this._http.post(this.url+'/'+id+'/pagar', {});
  };

  public getMyTickets(): Observable<any> {
    return this._http.get(this.url+'/my-tickets');
  };

  public getMyTicket(id:number): Observable<any> {
    return this._http.get(this.url+'/my-tickets/'+id);
  };

  public cancelarTicket(id:number): Observable<any> {
    return this._http.put(this.url+'/cancelar/'+id, {});
  };

  public getTickets(params?:any): Observable<any> {
    return this._http.get(this.url, { params: params || {} });
  };

  public getTicket(id:number): Observable<any> {
    return this._http.get(this.url+'/'+id);
  };
}

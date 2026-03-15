import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Articulo as ArticuloModel } from '../../models/articulo';
import { Articulo as ArticuloService} from '../../services/articulo';
import { API_CONFIG } from '../../api.config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-compra',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './compra.html',
  styleUrl: './compra.css',
})
export class Compra implements OnInit, OnDestroy {
  API_CONFIG = API_CONFIG;
  articulos = signal<ArticuloModel[]>([]);
  loading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  filters: any = {
    nombre: '',
    descripcion: '',
    page: 1
  };
  carrito = signal<any[]>([]);
  vista = 'grid';

  constructor(private articuloService: ArticuloService) {};

  ngOnInit(): void {
    this.cargarCarrito();
    this.getArticulos(true);
    window.addEventListener('scroll', this.onScrollHandler);
    window.addEventListener('carritoActualizado', this.carritoHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScrollHandler);
    window.removeEventListener('carritoActualizado', this.carritoHandler);
  }

  getArticulos(reset:boolean = false) {
    if(reset) {
      this.filters.page = 1;
      this.hasMore.set(true);
      this.articulos.set([]);
    };
    if(this.loading() || !this.hasMore()) {
      return;
    };
    this.loading.set(true);
    const params:any = { ...this.filters };
    Object.keys(params).forEach(key => {
      if(params[key] === null || params[key] === '') {
        delete params[key];
      };
    });
    this.articuloService.getArticulos(params).subscribe(
      (result:any) => {
        const articulosNuevos = result.data.articulos.map((element:any) => {
          return Object.assign(new ArticuloModel(), element);
        });
        this.articulos.update(actual => [...actual, ...articulosNuevos]);
        this.hasMore.set(result.data.pagination.hasMore);
        this.filters.page++;
        this.loading.set(false);
      },
      (error:any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  onFilterChange() {
    this.getArticulos(true);
  };

  onSortChange(value:string) {
    if(!value) {
      this.filters.sortBy = null;
      this.filters.order = null;
    } else {
      const [sortBy, order] = value.split(':');
      this.filters.sortBy = sortBy;
      this.filters.order = order;
    };
    this.getArticulos(true);
  };

  cargarCarrito() {
    const carro = sessionStorage.getItem('carrito');
    this.carrito.set(carro ? JSON.parse(carro) : ([]));
  };

  guardarCarrito() {
    sessionStorage.setItem('carrito', JSON.stringify(this.carrito()));
    window.dispatchEvent(new Event('carritoActualizado'));
  };

  getCantidadCarrito(id:number): number {
    const articulo = this.carrito().find(item  => item.id === id);
    return articulo ? articulo.cantidad : 0;
  };

  sumar(id:number) {
    const carrito = [...this.carrito()];
    const item = carrito.find(item => item.id === id);
    if(item) {
      item.cantidad++;
    } else {
      carrito.push({ id: id, cantidad: 1 });
    };
    this.carrito.set(carrito);
    this.guardarCarrito();
  };

  restar(id:number) {
    let carrito = [...this.carrito()];
    const item = carrito.find(item => item.id === id);
    if(!item) {
      return;
    };
    item.cantidad--;
    if(item.cantidad <= 0) {
      carrito = carrito.filter(item => item.id !== id);
    };
    this.carrito.set(carrito);
    this.guardarCarrito();
  };

  onScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if(scrollTop + windowHeight >= documentHeight - 200) {
      this.getArticulos();
    };
  };

  onScrollHandler = () => {
    this.onScroll();
  };

  carritoHandler = () => {
    this.cargarCarrito();
  };
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Articulo as ArticuloService} from '../../services/articulo';
import { Articulo as ArticuloModel} from '../../models/articulo';
import { API_CONFIG } from '../../api.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventario',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit{
  API_CONFIG = API_CONFIG;
  inventario = signal<ArticuloModel[]>([]);
  pagination = signal<any>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  filters: any = {
    nombre: '',
    descripcion: '',
    estado: 'TODOS',
    page: 1,
    limit: 9
  };
  showFilters = false;

  constructor(private articuloService: ArticuloService,
              private router: Router
  ) {};
  
  ngOnInit(): void {
    this.getInventario();
  }

  getInventario() {
    const params: any = { ...this.filters };
    if(params.estado === 'TODOS') {
      delete params.estado;
    }
    this.articuloService.getInventario(params).subscribe(
      (result:any) => {
        this.inventario.set(result.data.articulos.map((element:any) => {
          return Object.assign(new ArticuloModel(), element);
        }));
        this.pagination.set(result.data.pagination);
      }, (error:any) => {
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  onFilterChange() {
    this.filters.page = 1;
    this.getInventario();
  };

  onEstadoChange() {
    this.filters.page = 1;
    this.getInventario();
  };

  onPrecioMinInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filters.page = 1;
    if(value === '') {
      delete this.filters.precioMin;
    } else {
      this.filters.precioMin = Number(value);
    };
    this.getInventario();
  };

  onPrecioMaxInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filters.page = 1;
    if (value === '') {
      delete this.filters.precioMax;
    } else {
      this.filters.precioMax = Number(value);
    };
    this.getInventario();
  };

  onSortChange(value:string) {
    this.filters.page = 1;
    if(!value) {
      delete this.filters.sortBy;
      delete this.filters.order;
    } else {
      const [sortBy, order] = value.split(':');
      this.filters.sortBy = sortBy;
      this.filters.order = order;
    };
    this.getInventario();
  };

  onLimitChange(value: string) {
    this.filters.page = 1;
    this.filters.limit = Number(value);
    this.getInventario();
  };

  toggleFilters() {
    this.showFilters = !this.showFilters;
  };

  prevPage() {
    if(this.filters.page <= 1) {
      return;
    };
    this.filters.page--;
    this.getInventario();
  };

  nextPage() {
    if(!this.pagination().hasMore) {
      return;
    };
    this.filters.page++;
    this.getInventario();
  };

  createArticulo() {
    if(!confirm('¿Crear articulo?')) {
      return;
    };
    this.router.navigateByUrl('/inventario-form');
  };

  updateArticulo(id:number) {
    if(!confirm('¿Editar articulo?')) {
      return;
    };
    this.router.navigate(['inventario-form', id]);
  };

  deleteArticulo(id:number) {
    if(!confirm('¿Eliminar articulo?')) {
      return;
    };
    this.articuloService.deleteArticulo(id).subscribe(
      (result:any) => {
        this.getInventario();
        alert(result.msg);
      },
      (error:any) => {
        alert(error.error.msg || "Error del servidor");
      }
    );
  };
}
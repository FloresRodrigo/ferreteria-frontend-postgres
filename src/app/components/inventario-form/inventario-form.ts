import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { API_CONFIG } from '../../api.config';
import { Articulo as ArticuloService} from '../../services/articulo';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-inventario-form',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './inventario-form.html',
  styleUrl: './inventario-form.css',
})
export class InventarioForm implements OnInit{
  API_CONFIG = API_CONFIG;
  articuloId: number | null = null;
  articulo: any = {
    nombre: '',
    descripcion: '',
    precio: null,
    stock: null,
    estado: ''
  };
  isEdit = signal<boolean>(false);
  loading = signal<boolean>(false);
  imagenFile: File | null = null;
  
  constructor(private articuloService: ArticuloService,
              private router: Router,
              private route: ActivatedRoute
  ) {};

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.articuloId = id && !isNaN(Number(id)) ? Number(id) : null;
    if(this.articuloId) {
      this.isEdit.set(true);
      this.getArticulo();
    };
  };

  getArticulo() {
    this.loading.set(true);
    this.articuloService.getArticuloAdmin(this.articuloId!).subscribe(
      (result:any) => {
        this.articulo = result.data;
        this.loading.set(false);
      },
      (error:any) => {
        alert(error.error.msg || "Error del servidor");
        this.router.navigateByUrl('/inventario');
      }
    );
  };

  onFileChange(event:any) {
    const file = event.target.files[0];
    if(file) {
      this.imagenFile = file;
    };
  };

  submit() {
    const formData = new FormData();
    Object.keys(this.articulo).forEach(key => {
      if(this.articulo[key] !== null && this.articulo[key] !== undefined && this.articulo[key] !== '') {
        formData.append(key, this.articulo[key]);
      };
    });
    if(this.imagenFile) {
      formData.append('imagen', this.imagenFile);
    };
    this.loading.set(true);
    if(this.isEdit()) {
      this.articuloService.updateArticulo(this.articuloId!, formData).subscribe(
        (result:any) => {
          alert(result.msg);
          this.router.navigateByUrl('/inventario');
        },
        (error:any) => {
          this.loading.set(false);
          alert(error.error.msg || "Error del servidor");
        }
      );
    } else {
      this.articuloService.createArticulo(formData).subscribe(
        (result:any) => {
          alert(result.msg);
          this.router.navigateByUrl('/inventario');
        },
        (error:any) => {
          this.loading.set(false);
          alert(error.error.msg || "Error del servidor");
        }
      );
    };
  };

  cancelar() {
    this.router.navigateByUrl('/inventario');
  };
}
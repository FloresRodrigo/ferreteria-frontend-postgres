export class Articulo {
    id!: number;
    nombre: string;
    descripcion: string;
    imagen: string;
    precio: number;
    stock: number;
    estado: string;
    total_vendido: number;

    constructor() {
        this.nombre = "";
        this.descripcion = "";
        this.imagen = "";
        this.precio = 0;
        this.stock = 0;
        this.estado = "";
        this.total_vendido = 0;
    };
}

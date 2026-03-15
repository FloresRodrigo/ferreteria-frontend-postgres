import { DetalleTicket } from "./detalle-ticket";

export class Ticket {
    id!: number;
    id_cliente!: number;
    fecha_compra!: Date;
    total!: number;
    estado!: string;
    detalles_ticket!: DetalleTicket[];
}

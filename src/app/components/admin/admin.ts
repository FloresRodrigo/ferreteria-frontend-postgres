import { Component, signal } from '@angular/core';
import { Usuario as UsuarioService } from '../../services/usuario';
import { Ticket as TicketService } from '../../services/ticket';
import { Usuario as UsuarioModel } from '../../models/usuario';
import { Ticket as TicketModel } from '../../models/ticket';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  pestanaActiva = signal<'perfil' | 'tickets' | 'usuarios' | 'estadisticas'>('perfil');
  loading = signal<boolean>(false);
  usuario = signal<UsuarioModel>(new UsuarioModel());
  editNombre = signal<boolean>(false);
  editEmail = signal<boolean>(false);
  editUsername = signal<boolean>(false);
  nombre_completo = signal<string>('');
  email = signal<string>('');
  username = signal<string>('');
  actualPassword = signal<string>('');
  newPassword = signal<string>('');
  repeatNewPassword = signal<string>('');
  tickets = signal<TicketModel[]>([]);
  ticket = signal<TicketModel | null>(null);
  mostrarModal = signal<boolean>(false);
  mostrarPassword = signal<boolean>(false);
  usuarios = signal<UsuarioModel[]>([]);
  usuarioSelect = signal<string>('');
  usuarioSeleccionado = signal<UsuarioModel | null>(null);
  usuarioTemporal = signal<UsuarioModel | null>(null);
  passwordTemporal = signal<string>('');
  mostrarModalUsuario = signal<boolean>(false);
  mostrarModalEditar = signal<boolean>(false);
  filters: any = {
    nombre_completo: '',
    username: '',
    email: '',
    estado: 'TODOS'
  };
  allUsuarios = signal<UsuarioModel[]>([]);
  totalUsuarios = signal<number>(0);
  usuariosActivos = signal<number>(0);
  usuariosPorMes = signal<Array<any>>([]);
  allTickets = signal<TicketModel[]>([]);
  articulosVendidos = signal<Array<any>>([]);
  totalTickets = signal<number>(0);
  ticketsPagados = signal<number>(0);
  ticketsPendientes = signal<number>(0);
  ticketsCancelados = signal<number>(0);
  private chartUsuariosPie?: Chart;
  private chartUsuariosMes?: Chart;
  private chartArticulos?: Chart;
  private chartTicketsPie?: Chart;

  constructor(private usuarioService: UsuarioService,
    private ticketService: TicketService
  ) { };

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarTickets();
    this.cargarUsuarios();
  }

  cargarPerfil() {
    this.loading.set(true);
    this.usuarioService.getMyProfile().subscribe(
      (result: any) => {
        this.usuario.set(result.data);
        this.nombre_completo.set(result.data.nombre_completo);
        this.email.set(result.data.email);
        this.username.set(result.data.username);
        this.loading.set(false);
      },
      (error: any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  guardarNombre() {
    this.actualizarPerfil({ nombre_completo: this.nombre_completo() }, () => {
      this.editNombre.set(false);
    });
  };

  guardarEmail() {
    this.actualizarPerfil({ email: this.email() }, () => {
      this.editEmail.set(false);
    });
  };

  guardarUsername() {
    this.actualizarPerfil({ username: this.username() }, () => {
      this.editUsername.set(false);
    });
  };

  private actualizarPerfil(body: any, cb?: () => void): void {
    this.loading.set(true);
    this.usuarioService.updateMyProfile(body).subscribe(
      (result: any) => {
        alert(result.msg);
        this.cargarPerfil();
        cb?.();
      },
      (error: any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  cancelarNombre() {
    this.nombre_completo.set(this.usuario().nombre_completo);
    this.editNombre.set(false);
  };

  cancelarEmail() {
    this.email.set(this.usuario().email);
    this.editEmail.set(false);
  };

  cancelarUsername() {
    this.username.set(this.usuario().username);
    this.editUsername.set(false);
  };

  cambiarPassword() {
    this.loading.set(true);
    this.usuarioService.changeMyPassword(this.actualPassword(), this.newPassword(), this.repeatNewPassword()).subscribe(
      (result: any) => {
        alert(result.msg);
        this.actualPassword.set('');
        this.newPassword.set('');
        this.repeatNewPassword.set('');
        this.loading.set(false);
      },
      (error: any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  cargarTickets() {
    this.loading.set(true);
    const params: any = {};
    if (this.usuarioSelect()) {
      params.id = this.usuarioSelect();
    };
    this.ticketService.getTickets(params).subscribe(
      (result: any) => {
        this.tickets.set(result.data.map((element: any) => {
          return Object.assign(new TicketModel(), element);
        }));
        this.loading.set(false);
      },
      (error: any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
    this.ticketService.getTickets().subscribe(
      (result: any) => {
        this.allTickets.set(result.data.map((element: any) => {
          return Object.assign(new TicketModel(), element);
        }));
        this.calcularVendidos();
        this.calcularTickets();
        if (this.pestanaActiva() === 'estadisticas') {
          this.crearGraficos();
        };
      },
      (error: any) => {
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  verTicket(ticket: TicketModel) {
    this.ticket.set(ticket);
    this.mostrarModal.set(true);
  };

  cerrarTicket() {
    this.mostrarModal.set(false);
    this.ticket.set(null);
  };

  cambiarPestana(pestaña: 'perfil' | 'tickets' | 'usuarios' | 'estadisticas'): void {
    this.pestanaActiva.set(pestaña);
    if (pestaña === 'tickets' && this.allTickets().length === 0) {
      this.cargarTickets();
    };
    if (pestaña === 'usuarios' && this.allUsuarios().length === 0) {
      this.cargarUsuarios();
    };
    if (pestaña === 'estadisticas') {
      this.crearGraficos();
    };
  };

  cargarUsuarios() {
    const params: any = { ...this.filters };
    if (params.estado === 'TODOS') {
      delete params.estado;
    };
    this.usuarioService.getUsuarios(params).subscribe(
      (result: any) => {
        this.usuarios.set(result.data.map((element: any) => {
          return Object.assign(new UsuarioModel(), element);
        }));
      },
      (error: any) => {
        alert(error.error.msg || "Error del servidor");
      }
    );
    this.usuarioService.getUsuarios().subscribe(
      (result: any) => {
        this.allUsuarios.set(result.data.map((element: any) => {
          return Object.assign(new UsuarioModel(), element);
        }));
        this.calcularUsuarios();
        if (this.pestanaActiva() === 'estadisticas') {
          this.crearGraficos();
        };
      },
      (error: any) => {
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  onUsuarioFilterChange() {
    this.cargarUsuarios();
  };

  mostrarUsuario(usuario: UsuarioModel) {
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModalUsuario.set(true);
    this.mostrarModalEditar.set(false);
  };

  cerrarUsuario() {
    this.usuarioSeleccionado.set(null);
    this.mostrarModalUsuario.set(false);
    this.mostrarModalEditar.set(false);
  };

  mostrarEditarUsuario(usuario: UsuarioModel) {
    if (!confirm('¿Editar usuario?')) {
      return;
    };
    this.usuarioTemporal.set(Object.assign(new UsuarioModel(), usuario));
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModalUsuario.set(true);
    this.mostrarModalEditar.set(true);
  };

  editarUsuario(body: any) {
    const usuario = this.usuarioSeleccionado();
    if (!usuario) {
      return;
    };
    this.loading.set(true);
    this.usuarioService.updateUsuario(usuario.id, body).subscribe(
      (result: any) => {
        alert(result.msg);
        this.loading.set(false);
        this.cerrarUsuario();
        this.cargarUsuarios();
      },
      (error: any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  eliminarUsuario(id: number) {
    if (!confirm('¿Eliminar usuario?')) {
      return;
    };
    this.loading.set(true);
    this.usuarioService.deleteUsuario(id).subscribe(
      (result: any) => {
        alert(result.msg);
        this.loading.set(false);
        this.cargarUsuarios();
      },
      (error: any) => {
        this.loading.set(false);
        alert(error.error.msg || "Error del servidor");
      }
    );
  };

  private calcularUsuarios() {
    this.totalUsuarios.set(this.allUsuarios().length);
    this.usuariosActivos.set(this.allUsuarios().filter(u => u.estado === 'ACTIVO').length);
    const contador: { [key: string]: number } = {};
    this.allUsuarios().forEach(usuario => {
      const fecha = new Date(usuario.createdAt);
      const anio = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      const clave = `${anio}-${mes.toString().padStart(2, '0')}`;
      contador[clave] = (contador[clave] || 0) + 1;
    });
    this.usuariosPorMes.set(
      Object.entries(contador)
        .map(([mes, cantidad]) => ({ mes, cantidad }))
        .sort((a, b) => a.mes.localeCompare(b.mes))
    );
  };

  private calcularVendidos() {
    const ticketsPagados = this.allTickets().filter(t => t.estado === 'PAGADO');
    const contador: { [key: string]: number } = {};
    ticketsPagados.forEach(ticket => {
      ticket.detalles_ticket.forEach(detalle => {
        const nombre = detalle.nombre_articulo;
        contador[nombre] = (contador[nombre] || 0) + detalle.cantidad;
      });
    });
    this.articulosVendidos.set(Object.entries(contador)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10));
  };

  private calcularTickets() {
    this.totalTickets.set(this.allTickets().length);
    this.ticketsPagados.set(this.allTickets().filter(t => t.estado === 'PAGADO').length);
    this.ticketsPendientes.set(this.allTickets().filter(t => t.estado === 'PENDIENTE').length);
    this.ticketsCancelados.set(this.allTickets().filter(t => t.estado === 'CANCELADO').length);
  };

  crearGraficoUsuariosPie() {
    this.chartUsuariosPie?.destroy();
    const activos = this.usuariosActivos();
    const total = this.totalUsuarios();
    this.chartUsuariosPie = new Chart('usuariosPie', {
      type: 'pie',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [activos, total - activos],
          backgroundColor: ['#008eff', '#ff4d4f']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };

  crearGraficoUsuariosPorMes() {
    this.chartUsuariosMes?.destroy();
    const data = this.usuariosPorMes();
    this.chartUsuariosMes = new Chart('usuariosMes', {
      type: 'bar',
      data: {
        labels: data.map(d => d.mes),
        datasets: [{
          label: 'Usuarios registrados',
          data: data.map(d => d.cantidad),
          backgroundColor: '#008eff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  crearGraficoArticulosVendidos() {
    this.chartArticulos?.destroy();
    const data = this.articulosVendidos();
    this.chartArticulos = new Chart('articulosVendidos', {
      type: 'bar',
      data: {
        labels: data.map(a => a.nombre),
        datasets: [{
          label: 'Cantidad vendida',
          data: data.map(a => a.cantidad),
          backgroundColor: '#00bcff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  };

  crearGraficoTicketsPie() {
    this.chartTicketsPie?.destroy();
    const pagados = this.ticketsPagados();
    const pendientes = this.ticketsPendientes();
    const cancelados = this.ticketsCancelados();
    this.chartTicketsPie = new Chart('ticketsPie', {
      type: 'pie',
      data: {
        labels: ['Pagados', 'Pendientes', 'Cancelados'],
        datasets: [{
          data: [pagados, pendientes, cancelados],
          backgroundColor: [
            '#28a745',
            '#ffc107',
            '#dc3545'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };

  crearGraficos() {
    setTimeout(() => {
      this.crearGraficoUsuariosPie();
      this.crearGraficoUsuariosPorMes();
      this.crearGraficoArticulosVendidos();
      this.crearGraficoTicketsPie();
    });
  };
}
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { Auth as AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy{
  user: any;
  returnUrl: string = '';
  currentRoute: string = '';
  hoverRoute: string | null = null;
  cantidadCarrito = signal<number>(0);

  constructor(public authService: AuthService,
              private router: Router,
              private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot?.queryParams?.['returnUrl'] || '/';
    router.events.subscribe(event => {
      if(event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      };
    });
  };

  ngOnInit(): void {
    this.actualizarCarrito();
    window.addEventListener('carritoActualizado', this.carritoHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('carritoActualizado', this.carritoHandler);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  };

  isLogged(): boolean {
    return this.authService.isLogged();
  };

  userLogged() {
    this.user = this.authService.userLogged();
  };

  logout() {
    this.authService.logout();
    this.user = null;
    this.router.navigateByUrl('');
  };

  isActive(route: string): boolean {
    if(this.hoverRoute === route) {
      return true;
    }
    if(this.hoverRoute === null) {
      if(route === '/') {
        return this.currentRoute === '/';
      } else {
        return this.currentRoute.startsWith(route);
      };
    };
    return false;
  }

  onMouseEnter(route: string) {
    this.hoverRoute = route;
  };

  onMouseLeave() {
    this.hoverRoute = null;
  };

  actualizarCarrito() {
    const carrito = JSON.parse(sessionStorage.getItem('carrito') || '[]');
    this.cantidadCarrito.set(carrito.reduce(
      (total: number, articulo: any) => total + (articulo.cantidad || 0),
      0
    ));
  };

  carritoHandler = () => {
    this.actualizarCarrito();
  };
}

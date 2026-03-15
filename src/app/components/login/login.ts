import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth as AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Usuario as UsuarioModel} from '../../models/usuario';
import { API_CONFIG } from '../../api.config';

declare const google:any;

@Component({
  selector: 'app-login',
  imports: [ CommonModule, FormsModule, RouterLink ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  API_CONFIG = API_CONFIG;
  login = "";
  password = "";
  msgLogin = signal<string>("");
  loading = signal<boolean>(false);

  constructor(private authService: AuthService,
              private router: Router
  ) {};

  ngAfterViewInit(): void {
    if (!(window as any).google) {
      console.error('Google no cargado');
      return;
    };
    if(!(window as any)._googleInitialized) {
      google.accounts.id.initialize({
        client_id: API_CONFIG.googleClientId,
        callback: (response: any) => {
          this.loginGoogle(response.credential);
        }
      });
      (window as any)._googleInitialized = true;
    };
    google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with'
      }
    );
  };

  loginGoogle(token: string) {
    this.loading.set(true);
    this.authService.loginGoogle(token)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(
        (result: any) => {
          const usuario = Object.assign(new UsuarioModel(), result.data);
          this.authService.persistirSesion(usuario);
          if(usuario.isGoogle) {
            this.router.navigateByUrl('/set-password');
          } else {
            this.router.navigateByUrl('');
          };
        },
        (error: any) => {
          this.msgLogin.set(error.error.msg || "Error del servidor");
        }
      );
  };

  loginUsuario() {
    this.msgLogin.set("");
    if(!this.login || !this.password) {
      this.msgLogin.set("Debe ingresar todos los campos");
      return;
    };
    this.loading.set(true);
    this.authService.login(this.login, this.password)
    .pipe(finalize(() => this.loading.set(false)))
    .subscribe(
      (result:any) => {
        const usuario = Object.assign(new UsuarioModel, result.data);
        this.authService.persistirSesion(usuario);
        this.router.navigateByUrl('');
      },
      (error:any) => {
        this.msgLogin.set(error.error.msg || "Error del servidor");
      }
    );
  };

}

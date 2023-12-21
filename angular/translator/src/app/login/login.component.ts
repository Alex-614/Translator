import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <main>
      <p>Please fill out:</p>
      <p>Email: <input id="ip_email" type="email" class="ip_main" value="Email Address"></p>
      <p>Password: <input id="ip_password" type="password" class="ip_main" value="Password"></p>
      <button id="btn_Login" class="btn_main" [routerLink]="['/login/account']">Log In</button>

      <p>If you do not have a account: <a [routerLink] = "['/login/register']">Register</a></p>
    </main>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {

}

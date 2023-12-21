import { Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  template: `
    <main>
      <p>Please fill out:</p>
      <p>Username: <input id="ip_regUsername" type="username" class="ip_main"></p>
      <p>Email: <input id="ip_regEmail" type="email" class="ip_main"></p>
      <p>Password: <input id="ip_regPassword" type="password" class="ip_main"></p>
      <p>Password (Repeat): <input id="ip_regPasswordRepeat" type="password" class="ip_main"></p>
      <button id="btn_register" class="btn_main">Register now</button>
    </main>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {

}

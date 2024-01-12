import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <main>
      <img src="assets/Icon.png" alt="Icon">
      <p>Welcome to the</p>
      <p>Translator Apllication!</p>
      <button id="btn_goLogin" class="btn_main" [routerLink]="['/login']">Log In</button>
      <p>or</p>
      <button id="btn_goLogin" class="btn_main" [routerLink]="['/session']">Join a Session</button>
    </main>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(){}
}

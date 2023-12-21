import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LANGUAGES } from '../languages'; 
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DropdownModule],
  template: `
    <main>
      <p>Choose your speaking language:</p>
      <p-dropdown 
          [options]="languages"
          placeholder="Select a language"
          optionLabel="name">
          <ng-template let-language pTemplate="item">
            <div class="bg-template">
              <div class="dropdown_list">
                  <img src="{{ language.icon }}">  
                  {{ language.name }}
              </div>
            </div>
          </ng-template>
        </p-dropdown>
      <button id="btn_sessionHost" class="btn_main" [routerLink]="['/login/account/sessionhost']">Host a new session</button>
    </main>
  `,
  styleUrl: './account.component.css'
})
export class AccountComponent {
  languages = LANGUAGES;
}

import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { LANGUAGES } from '../languages';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [NgFor, DropdownModule],
  template: `
    <main>
      <div class="flex-row">
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
        <button id="btn_reloadSession" class="btn_main">Reload</button>
      </div>
      <textarea readonly id="ip_textOutput"></textarea>
    </main>
  `,
  styleUrl: './session.component.css'
})
export class SessionComponent {
  languages = LANGUAGES;
}

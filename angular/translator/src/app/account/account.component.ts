import { Component, Renderer2, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { LANGUAGES } from '../languages'; 
import { DropdownModule } from 'primeng/dropdown';
import { SessionService } from '../session.service';

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
      <button id="btn_sessionHost" class="btn_main" (click)=createSession()>Host a new session</button>
    </main>
  `,
  styleUrl: './account.component.css'
})
export class AccountComponent {
  constructor(
    private router: Router,
    private renderer: Renderer2
  ){
  }
  languages = LANGUAGES;
  sessionService: SessionService = inject(SessionService);
  async createSession(): Promise<boolean> {
    const idValid = await this.sessionService.createSession();
    if (idValid){
      this.router.navigate(['/login/account/sessionhost', { }]);
    }
    console.log(idValid);
    return true;
  }
}

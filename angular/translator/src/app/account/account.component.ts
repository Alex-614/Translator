import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LANGUAGES } from '../languages';
import { DropdownModule } from 'primeng/dropdown';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { Language } from '../language';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DropdownModule, FormsModule],
  template: `
    <main>
      <p>Choose your speaking language:</p>
      <p-dropdown 
          [options]="languages"
          placeholder="Select a language"
          optionLabel="name"
          [(ngModel)]="selectedLanguage">
          <ng-template let-language pTemplate="item">
            <div class="bg-template">
              <div class="dropdown_list">
                  <img src="{{ language.icon }}">  
                  {{ language.name }}
              </div>
            </div>
          </ng-template>
        </p-dropdown>
      <button id="btn_sessionHost" class="btn_main" (click)=checkForSession()>Host a new session</button>
    </main>
  `,
  styleUrl: './account.component.css'
})
export class AccountComponent {
  userId: string;
  selectedLanguage: Language;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.userId = this.activatedRoute.snapshot.queryParamMap.get('userId')!;
  }
  languages = LANGUAGES;
  sessionService: SessionService = inject(SessionService);

  checkForSession(){
    if (this.selectedLanguage){
      this.createSession();
    }
  }

  async createSession(): Promise<boolean> {
    const idValid = await this.sessionService.createSession();
    if (idValid) {
      this.router.navigate(['/login/account/sessionhost'], { queryParams: { userId: this.userId, lang: this.selectedLanguage.short } });
    }
    console.log(idValid);
    return true;
  }
}

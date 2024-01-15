import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { LANGUAGES } from '../languages';
import { Language } from '../language';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-joinsession',
  standalone: true,
  imports: [CommonModule, DropdownModule, FormsModule],
  template: `
    <main>
      <input type="text" placeholder="Session ID" id="ip_sessionId" #ip_sessionId>
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
      <button id="btn_join" class="btn_main" (click)=join() #btn_join>Join Session</button>
    </main>
  `,
  styleUrl: './joinsession.component.css'
})
export class JoinsessionComponent {
  languages = LANGUAGES;
  selectedLanguage: Language;

  constructor(
    private router: Router
  ){}
  
  @ViewChild('ip_sessionId') ip_sessionId: ElementRef<HTMLInputElement>;

  //navigate to session component with id and language parameters
  join(){
    this.router.navigate(['/joinsession/session'], { queryParams: { sessionId: this.ip_sessionId.nativeElement.value, lang: this.selectedLanguage.short } });
  }

}

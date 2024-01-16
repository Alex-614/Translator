import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LANGUAGES } from '../languages';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Language } from '../language';
import { TextService } from '../text.service';
import { Session } from '../session';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DropdownModule, FormsModule],
  template: `
    <main>
      <p class="p_big">Create a new session:</p>
      <p class="p_small">Choose your speaking language:</p>
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
      <p class="p_small">or</p>
      <p class="p_small">Load recent session transcriptions (click id to download):</p>
      <div id="div_sessionList" #div_sessionList>
        <p #p_noTexts class="p_textDownload"></p>
      </div>
      <p class="p_small">or</p>
      <p class="p_small">Translate a recent session transcription:</p>
      <p class="p_small">Choose the target language:</p>
      <p-dropdown 
        [options]="languages"
        placeholder="Select a language"
        optionLabel="name"
        [(ngModel)]="selectedTargetLanguage">
        <ng-template let-language pTemplate="item">
          <div class="bg-template">
            <div class="dropdown_list">
                <img src="{{ language.icon }}">
                {{ language.name }}
            </div>
          </div>
        </ng-template>
      </p-dropdown>
      <input type="text" placeholder="Session ID" id="ip_sessionId" #ip_sessionId>
      <button id="btn_translateSession" class="btn_main" (click)=translateSession()>Translate Session</button>
    </main>
  `,
  styleUrl: './account.component.css'
})
export class AccountComponent {
  userId: string;
  selectedLanguage: Language;
  selectedTargetLanguage: Language;
  private sessionArray: Session[];
  private textService: TextService = inject(TextService);
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.userId = this.activatedRoute.snapshot.queryParamMap.get('userId')!;
  }
  languages = LANGUAGES;

  @ViewChild('div_sessionList') div_sessionList: ElementRef<HTMLDivElement>;
  @ViewChild('ip_sessionId') ip_sessionId: ElementRef<HTMLInputElement>;

  //after view is initialized get all recent texts of this user
  ngAfterViewInit() {
    const innerThis = this;
    this.textService.getAllTexts(this.userId).subscribe(
      data => {
        console.log(data);
        this.sessionArray = data;
        for (let i = 0; i < data.length; i++) {
          var textElement = document.createElement('textElement' + i);
          textElement.innerHTML = "<p>ID: " + data[i].id + "</p>";
          textElement.addEventListener('click', function () {
            innerThis.downloadText(data[i].sessionUUID);
          });
          this.div_sessionList.nativeElement.appendChild(textElement);
        }
      }
    );
  }

  //If language is selected start sessionhost component with parameters
  checkForSession() {
    if (this.selectedLanguage) {
      this.router.navigate(['/login/account/sessionhost'], { queryParams: { userId: this.userId, lang: this.selectedLanguage.short } });
    }
  }


  //pull a text from the rest service and create a download txt file with it
  downloadText(sessionUUID: string) {
    console.log("downloadText" + sessionUUID);
    this.textService.getTextBySessionUUID(sessionUUID).subscribe(data => {
      console.log(data);
      var completeText: string = "";
      for (let i = 0; i < data.length; i++) {
        completeText += " " + data[i].textLine;
      }
      var filename = "Transkription.txt";
      var downloadEle = document.createElement('a');
      downloadEle.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(completeText));
      downloadEle.setAttribute('download', filename);
      downloadEle.style.display = 'none';
      document.body.appendChild(downloadEle);
      downloadEle.click();
      document.body.removeChild(downloadEle);
    });
  }

  //translate a old session transcription
  async translateSession() {
    var id = Number(this.ip_sessionId.nativeElement.value);
    var uuid = this.sessionArray[id - 1].sessionUUID;
    var lan = this.sessionArray[id -1].sessionLanguage;
    var completeText: string = "";
    this.textService.getTextBySessionUUID(uuid).subscribe(async data => {
      console.log(data);
      for (let i = 0; i < data.length; i++) {
        completeText += " " + data[i].textLine;
      }
      this.textService.getTranslatedText(completeText, lan, this.selectedTargetLanguage.short);
    });
  }
}
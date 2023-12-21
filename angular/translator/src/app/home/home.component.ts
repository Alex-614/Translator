import { Component, ViewChild, ElementRef, Renderer2, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { SessionService } from '../session.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <main>
      <p>Welcome to the</p>
      <p>Translator Apllication!</p>
      <button id="btn_goLogin" class="btn_main" [routerLink]="['/login']">Log In</button>
      <p>or</p>
      <button id="btn_goLogin" class="btn_main" (click)=joinSession(sessionId.value)>Join Session</button>
      <input id="ip_sessionId" value="Session ID" #sessionId>
      <p ngModel #p_error></p>
    </main>
  `,
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(
    private router: Router,
    private renderer: Renderer2
  ){
  }
  @ViewChild('p_error') p_error: ElementRef<HTMLParagraphElement>;
  sessionService: SessionService = inject(SessionService);
  async joinSession(sessionId: String): Promise<boolean> {
    const idValid = await this.sessionService.joinSession(sessionId);
    if (idValid){
      this.router.navigate(['/session', { }]);
    }else {
      this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "Error: Wrong Session ID!");
    }
    console.log(idValid);
    return true;
  }
}

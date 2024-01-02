import { Component, ViewChild, ElementRef, Renderer2, inject } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [],
  template: `
    <main>
      <p>Please fill out:</p>
      <p>Username: <input id="ip_regUsername" type="username" class="ip_main" #username></p>
      <p>Email: <input id="ip_regEmail" type="email" class="ip_main" #email></p>
      <p>Password: <input id="ip_regPassword" type="password" class="ip_main" #password></p>
      <p>Password (Repeat): <input id="ip_regPasswordRepeat" type="password" class="ip_main" #passwordRepeat></p>
      <button id="btn_register" class="btn_main" (click)=callRegister(username.value,email.value,password.value,passwordRepeat.value)>Register now</button>
      <p ngModel #p_error></p>
    </main>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  constructor(private renderer: Renderer2){}
  @ViewChild('p_error') p_error: ElementRef<HTMLParagraphElement>;
  userService: UserService = inject(UserService);
  async callRegister(username: String, email: String, password: String, passwordRepeat: String): Promise<boolean> {
    /** const answer = await this.userService.register(username, email, password);*/
    if (password == passwordRepeat){
      this.userService.register(username, email, password).subscribe(
        data => {console.log(data.createdAt);},
        error => {console.log(error);}
      )
    }else {
      this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "Error: Passwords do not match!");
    }
    return true;
  }
}
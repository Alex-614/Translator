import { Component, ViewChild, ElementRef, Renderer2, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user';

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
      <p #p_error></p>
    </main>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private user: User;
  private userService: UserService = inject(UserService);
  constructor(
    private router: Router,
    private renderer: Renderer2
  ) { }
  @ViewChild('p_error') p_error: ElementRef<HTMLParagraphElement>;
  async callRegister(username: string, email: string, password: string, passwordRepeat: string): Promise<boolean> {
    if (password == passwordRepeat) {
      this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "");
      this.user = new User();
      this.user.name = username;
      this.user.email = email;
      this.user.password = password;
      this.userService.register(this.user).subscribe(
        data => {
          console.log(data);
          /**TODO.... nicer if statement and look if username already exists?? in Rest!!!*/
          if (data.name == username && data.email == email && data.password == password) {
            this.router.navigate(['/login', {}]);
          }
        }
      );
    } else {
      this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "Error: Passwords do not match!");
    }
    return true;
  }
}
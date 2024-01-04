import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { User } from '../user';
import { UserService } from '../user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <main>
      <p>Please fill out:</p>
      <p>Email: <input id="ip_email" type="email" class="ip_main" value="Email Address" #email></p>
      <p>Password: <input id="ip_password" type="password" class="ip_main" value="Password" #password></p>
      <button id="btn_Login" class="btn_main" (click)=login(email.value,password.value)>Log In</button>

      <p>If you do not have a account: <a [routerLink] = "['/login/register']">Register</a></p>
    </main>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private user: User;
  private userService: UserService;
  constructor(private router: Router){}
  async login(email: string, password: string): Promise<boolean>{
    this.userService.getByMail(email).subscribe(
      data => {
        console.log(data);
        this.user = data;
        if (this.user.email == email && this.user.password == password){
          this.router.navigate(['/login/account', {}]);
        }
      }
    );
    return true;
  }
}

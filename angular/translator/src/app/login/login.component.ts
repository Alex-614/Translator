import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { User } from '../user';
import { UserService } from '../user.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ReactiveFormsModule],
  template: `
    <main>
      <form [formGroup]="form">
        <fieldset>
          <p>Please fill out:</p>
          <p>Email: <input id="ip_email" name="email" class="ip_main" formControlName="email"></p>
          <p>Password: <input id="ip_password" name="password" class="ip_main" formControlName="password" type="password"></p>
          <button id="btn_Login" class="btn_main" (click)=login()>Log In</button>

          <p>If you do not have a account: <a [routerLink] = "['/login/register']">Register</a></p>
        </fieldset>
      </form>
    </main>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form:FormGroup;
  private user: User;
  private userService: UserService;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router){
      this.form = this.fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required]
      });
    }
  login(){
    const val = this.form.value;
    if (val.email && val.password){
      this.authService.login(val.email, val.password).subscribe(
        () => {
          console.log("User is logged in");
          this.router.navigate(['/login/account', {}]);
        }
      )
    }
  }
}

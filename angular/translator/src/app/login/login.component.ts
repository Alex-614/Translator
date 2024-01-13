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
          <p class="item1">Please fill out:</p>
          <p class="item2">Email: <input id="ip_email" name="email" class="ip_main item2" formControlName="email"></p>
          <p class="item2">Password: <input id="ip_password" name="password" class="ip_main item2" formControlName="password" type="password"></p>
          <button id="btn_Login" class="btn_main item1" (click)=login()>Log In</button>

          <div><p>If you do not have a account: <a [routerLink] = "['/login/register']">Register</a></p></div>
        </fieldset>
      </form>
    </main>
  `,
  styleUrl: './login.component.css'
})
export class LoginComponent {
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    /*private authService: AuthService,*/
    private userService: UserService,
    private router: Router) {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }
  login() {
    const val = this.form.value;
    if (val.email && val.password) {
      this.userService.login(val.email).subscribe(
        data => {
          if (data[0].password == val.password){
            console.log("User is logged in");
            console.log(data[0].id);
            this.router.navigate(['/login/account'], {queryParams: { userId: data[0].id }});
          }
        }
      );
    }
  }
}

import { Component, ViewChild, ElementRef, Renderer2, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../user';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <main>
      <form [formGroup]="form">
        <fieldset>
          <p class="item1">Please fill out:</p>
          <p class="item2">Username: <input id="ip_regUsername" name="username" class="ip_main item2" formControlName="username"></p>
          <p class="item2">Email: <input id="ip_regEmail" name="email" class="ip_main item2" formControlName="email"></p>
          <p class="item2">Password: <input id="ip_regPassword" type="password" name="password" class="ip_main item2" formControlName="password"></p>
          <p class="item2">Password (Repeat): <input id="ip_regPasswordRepeat" type="password" name="passwordRepeat" class="ip_main item2" formControlName="passwordRepeat"></p>
          <button id="btn_register" class="btn_main item1" (click)=callRegister()>Register now</button>
          <p #p_error></p>
        </fieldset>
      </form>
    </main>
  `,
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  private user: User;
  private userService: UserService = inject(UserService);
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      passwordRepeat: ['', Validators.required],
    });
  }

  @ViewChild('p_error') p_error: ElementRef<HTMLParagraphElement>;

  /**
   * register method
   * checks all form fields and calls register function in userService
   * afterwards checks if the answered user data from the rest server is correct 
   */
  callRegister() {
    const val = this.form.value;
    if (val.username != "" && val.email != "" && val.password != "" && val.passwordRepeat != "") {
      if (val.password == val.passwordRepeat) {
        this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "");
        this.user = new User();
        this.user.name = val.username;
        this.user.email = val.email;
        this.user.password = val.password;
        this.userService.register(this.user).subscribe(
          data => {
            console.log(data);
            if (data.name == val.username && data.email == val.email && data.password == val.password) {
              this.router.navigate(['/login', {}]);
            }
          }
        );
      } 
      
      //Error printouts according registration form
      else {
        this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "Error: Passwords do not match!");
      }
    } else {
      this.renderer.setProperty(this.p_error.nativeElement, 'innerHTML', "Error: Please fill every field!");
    }
  }
}
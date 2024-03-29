import { Routes, CanActivate } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SessionComponent } from './session/session.component';
import { SessionhostComponent } from './sessionhost/sessionhost.component';
import { JoinsessionComponent } from './joinsession/joinsession.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        title: 'Home page'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
    },
    {
        path: 'joinsession',
        component: JoinsessionComponent,
        title: 'Join Session'
    },
    {
        path: 'joinsession/session',
        component: SessionComponent,
        title: 'Session'
    },
    {
        path: 'login/account',
        component: AccountComponent,
        title: 'Account',
    },
    {
        path: 'login/register',
        component: RegisterComponent,
        title: 'Register'
    },
    {
        path: 'login/account/sessionhost',
        component: SessionhostComponent,
        title: 'Session Host',
    },
    {
        path: '**', redirectTo:''
    }
];

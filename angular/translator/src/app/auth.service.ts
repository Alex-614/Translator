import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url: string;
  constructor(
    public jwtHelper: JwtHelperService,
    private http: HttpClient) { 
      this.url = 'http://127.0.0.1:8080/user'
    }

  public isAuthenticated(): boolean{
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  public login(email:string, password:string){
    return this.http.post<User>(this.url, {email, password})/*.shareReplay()*/;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private url: string;
  constructor(private http: HttpClient) {
    this.url = 'http://127.0.0.1:8080/user';
  }

  /**Get HTTP Requests */
  public findAll(): Observable<User[]>{
    return this.http.get<User[]>(this.url);
  }

  public getByMail(email: string): Observable<User>{
    return this.http.get<User>(this.url + "/" + email);
  }

  /**POST HTTP Requests*/
  public register(user: User) {
    return this.http.post<User>(this.url, user);
  }
}

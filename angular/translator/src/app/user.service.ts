import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}
  url = 'http://127.0.0.1:5432/postgres/user';

  /**POST HTTP Request */
  register(name: String, email: String, password: String){
    return this.http.post<any>('https://reqres.in/api/posts', { title: 'Angular POST Request Example' });
  }
}

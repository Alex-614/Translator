import { Injectable } from '@angular/core';
import { User } from './user';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TextService {
  private url: string;
  constructor(private http: HttpClient) {
    this.url = 'http://' + window.location.host + '/text';
  }

  public getAllTexts(userId: string): Observable<string[]> {
    console.log("getAllTexts" + userId);
    return this.http.get<string[]>(this.url);
  }

  public getTextBySessionId(sessionId: string): Observable<string[]> {
    console.log("getTextBySessionId" + sessionId);
    return this.http.get<string[]>(this.url + "/" + sessionId);
  }


}

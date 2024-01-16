import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from './session';
import { Textpart } from './textpart';

@Injectable({
  providedIn: 'root'
})
export class TextService {
  private url: string;
  constructor(private http: HttpClient) {
    this.url = 'http://' + window.location.host;
  }

  public getAllTexts(userId: string): Observable<Session[]> {
    console.log("getAllTexts " + userId);
    return this.http.get<Session[]>(this.url + "/user_session/" + userId);
  }

  public getTextBySessionUUID(sessionId: string): Observable<Textpart[]> {
    console.log("getTextBySessionId " + sessionId);
    return this.http.get<Textpart[]>(this.url + "/text/" + sessionId);
  }

  public getTranslatedText(text: string, origLan: string, targetLan: string) {
    console.log("getTranslatedText " + text + " " + origLan + " " + targetLan + " ");

    return "";
    /*var formdata = new FormData();
    formdata.append("q", "test 123 rest hallo hallo weihnachten");
    formdata.append("source", "de");
    formdata.append("target", "en");

    var requestOptions: RequestInit = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(this.url + "/translate", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));*/
  }
}
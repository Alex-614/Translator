import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

    var formdata = new FormData();
    formdata.append("q", text);
    formdata.append("source", origLan);
    formdata.append("target", targetLan);

    var requestOptions: RequestInit = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    fetch(this.url + "/translate", requestOptions)
      .then(async response => {
        var filename = "Transkription.txt";
        var downloadEle = document.createElement('a');
        downloadEle.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent((await response.text()).slice(19, -3)));
        downloadEle.setAttribute('download', filename);
        downloadEle.style.display = 'none';
        document.body.appendChild(downloadEle);
        downloadEle.click();
        document.body.removeChild(downloadEle);
      })
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }
}
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  url = 'http://localhost:3000/sessions';

  async joinSession(sessionId: String): Promise<boolean> {
    const data = await fetch(this.url);
    const dataArray = await data.json() ?? [];
    const idValid = dataArray.includes(sessionId);
    return idValid;
  }

  constructor() { }
}

import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NgFor } from '@angular/common';
import { LANGUAGES } from '../languages';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [NgFor, DropdownModule],
  template: `
    <main>
      <div class="flex-row">
        <input type="text" placeholder="Session ID" id="ip_sessionId" #ip_sessionId>
        <p-dropdown 
          [options]="languages"
          optionLabel="name">
          <ng-template let-language pTemplate="item">
            <div class="bg-template">
              <div class="dropdown_list">
                  <img src="{{ language.icon }}">  
                  {{ language.name }}
              </div>
            </div>
          </ng-template>
        </p-dropdown>
        <button id="btn_join" class="btn_main" (click)=join() #btn_join>Join</button>
      </div>
      <p id="p_status" #p_status></p>
      <div id="textarea">
            <p #p_text></p>
            <p #p_partial>></p>
      </div>
      <p id="p_partial" #p_partial></p>
    </main>
  `,
  styleUrl: './session.component.css'
})
export class SessionComponent {
  constructor(private renderer: Renderer2){}
  languages = LANGUAGES;
  private pc: any;
  private dc: any;
  private dcInterval: any;
  @ViewChild('ip_sessionId') ip_sessionId: ElementRef<HTMLInputElement>;
  @ViewChild('btn_join') btn_join: ElementRef<HTMLButtonElement>;
  @ViewChild('p_text') p_text: ElementRef<HTMLTextAreaElement>;
  @ViewChild('p_partial') p_partial: ElementRef<HTMLParagraphElement>;
  @ViewChild('p_status') p_status: ElementRef<HTMLParagraphElement>;



  // send a webRTC connection offer and additional information to the sfu
  negotiate(uri_append: string, language: string) { // setup connection
    const innerThis = this;
    return this.pc.createOffer().then((offer: string) => {
      return innerThis.pc.setLocalDescription(offer);
    }).then(() => {
      return new Promise<void>((resolve) => {
        if (innerThis.pc.iceGatheringState === 'complete') {
          resolve();
        } else {
          const checkState = () => {
            if (innerThis.pc.iceGatheringState === 'complete') {
              innerThis.pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          }

          innerThis.pc.addEventListener('icegatheringstatechange', checkState);
        }
      });
    }).then(() => {
      var offer = innerThis.pc.localDescription;
      console.log(offer.sdp);
      console.log(uri_append);
      return fetch('http://127.0.0.1:2700/' + uri_append, { // fetch request offer from server [url here]
        body: JSON.stringify({
          sdp: offer.sdp,
          type: offer.type,
          language: language
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      });
    }).then(function (response: any) {
      return response.json();
    }).then((answer: any) => {
      innerThis.renderer.setValue(innerThis.ip_sessionId.nativeElement, answer.roomid);
      console.log(answer.sdp);
      return innerThis.pc.setRemoteDescription(answer);
    }).catch((e: any) => {
      console.log(e);
    });
  }

  performRecvText(str: string) {
    var htmlStr = this.p_text.nativeElement.innerHTML;
    htmlStr += '<div>' + str + '</div>\n';
    this.renderer.setProperty(this.p_text.nativeElement, 'innerHTML', htmlStr);
    this.renderer.setProperty(this.p_partial.nativeElement, 'innerHTML', "> ");
  }

  performRecvPartial(str: string) {
    this.renderer.setProperty(this.p_partial.nativeElement, 'innerHTML', "> " + str);
  }

  // send a join request to the sfu
  join() {
    const innerThis = this;
    this.renderer.setProperty(this.p_status.nativeElement, 'innerHTML', "Connecting...");

    this.pc = new RTCPeerConnection();

    this.dc = this.pc.createDataChannel('result');
    this.dc.onclose = function () {
      clearInterval(innerThis.dcInterval);
      console.log('Closed data channel');
    };
    this.dc.onopen = function () {
      console.log('Opened data channel');
    };
    this.dc.onmessage = function (messageEvent: { data: string; }) {
      innerThis.renderer.setProperty(innerThis.p_status.nativeElement, 'innerHTML', "Receiving...");

      if (!messageEvent.data) {
        return;
      }

      let voskResult;
      try {
        voskResult = JSON.parse(messageEvent.data);
      } catch (error) {
        console.error(`ERROR: ${this.error.message}`);
        return;
      }
      if ((voskResult.text?.length || 0) > 0) {
        innerThis.performRecvText(voskResult.text);
      } else if ((voskResult.partial?.length || 0) > 0) {
        innerThis.performRecvPartial(voskResult.partial);
      }
    };
    this.pc.oniceconnectionstatechange = function () {
      if (innerThis.pc.iceConnectionState == 'disconnected') {
        console.log('Disconnected');
      }
    }
    this.negotiate("join?room=" + this.ip_sessionId.nativeElement.value, "en");
  }
}

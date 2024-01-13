import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [],
  template: `
    <main>
      <div class="flex-row">
        <p>Session ID: </p><p id="p_sessionId" #p_sessionId></p>
      </div>
      <div class="flex-row">
        <p>Status: </p><p id="p_status" #p_status></p>
      </div>
      <button #btn_back class="btn_main" (click)=goBack()>Go Back</button>
      <div id="textarea">
            <p #p_text></p>
            <p #p_partial>></p>
      </div>
    </main>
  `,
  styleUrl: './session.component.css'
})
export class SessionComponent {
  sessionId: string;
  language: string;
  constructor(
    private renderer: Renderer2,
    private activatedroute: ActivatedRoute,
    private router: Router){
    this.activatedroute.queryParams.subscribe(params => {
      this.sessionId = params['sessionId'];
      this.language = params['lang'];
  });
  }
  private pc: any;
  private dc: any;
  private dcInterval: any;
  @ViewChild('p_text') p_text: ElementRef<HTMLParagraphElement>;
  @ViewChild('p_partial') p_partial: ElementRef<HTMLParagraphElement>;
  @ViewChild('p_status') p_status: ElementRef<HTMLParagraphElement>;
  @ViewChild('p_sessionId') p_sessionId: ElementRef<HTMLParagraphElement>;


  ngOnDestroy(){
    console.log("onDestroy");
    this.stop();
  }

  ngAfterViewInit(){
    console.log("onInit");
    this.join();
  }

  goBack(){
    this.stop();
    this.router.navigate(['/joinSession']);
  }

  // send a webRTC connection offer and additional information to the sfu
  negotiate(uri_append: any, language: any) { // setup connection
    const innerThis = this;
    return this.pc.createOffer().then((offer: any) => {
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
      innerThis.renderer.setValue(innerThis.p_sessionId, answer.roomid);
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
    this.renderer.setProperty(this.p_sessionId.nativeElement, 'innerHTML', this.sessionId);

    this.pc = new RTCPeerConnection();

    this.dc = this.pc.createDataChannel('result');
    this.dc.onclose = function () {
      clearInterval(innerThis.dcInterval);
      console.log('Closed data channel');
    };
    this.dc.onopen = function () {
      console.log('Opened data channel');
    };
    this.dc.onmessage = function (messageEvent: { data: any; }) {
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
    this.negotiate("join?room=" + this.sessionId, this.language);
  }

  // stop all streams and close the connection
  stop() {
    const innerThis = this;
    // close data channel
    if (this.dc) {
        this.dc.close();
    }

    // close transceivers
    if (this.pc.getTransceivers) {
        this.pc.getTransceivers().forEach(function (transceiver: { stop: () => void; }) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    this.pc.getSenders().forEach(function (sender: { track: { stop: () => void; }; }) {
        sender.track.stop();
    });

    // close peer connection
    setTimeout(() => {
        innerThis.pc.close();
    }, 500);
}
}

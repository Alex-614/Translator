import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
    selector: 'app-sessionhost',
    standalone: true,
    imports: [],
    template: `
    <main>
        <div class="flex-row">
            <p>Room ID:</p><p #p_roomId></p>
            <p>Status:</p><p #p_status></p>
        </div>
        <div class="flex-row">
            <button #btn_start class="btn_main" (click)=create()>Start</button>
            <button #btn_stop class="btn_main d-none" (click)=stop()>Stop</button>
            <button #btn_back class="btn_main" (click)=goBack()>Go Back</button>
            <button #btn_download class="btn_main" (click)=download()>Download Text</button>
        </div>
        <div id="textarea">
            <p #p_text></p>
            <p #p_partial>></p>
        </div>
    </main>
  `,
    styleUrl: './sessionhost.component.css'
})
export class SessionhostComponent {
    private userId: string;
    private language: string;
    constructor(
        private renderer: Renderer2,
        private activatedroute: ActivatedRoute,
        private router: Router) {
        this.activatedroute.queryParams.subscribe(params => {
            this.userId = params['userId'];
            this.language = params['lang'];
        });
    }

    private pc: any;
    private dc: any;
    @ViewChild('btn_start') btn_start: ElementRef<HTMLButtonElement>;
    @ViewChild('btn_stop') btn_stop: ElementRef<HTMLButtonElement>;
    @ViewChild('p_status') p_status: ElementRef<HTMLParagraphElement>;
    @ViewChild('p_roomId') p_roomId: ElementRef<HTMLParagraphElement>;
    @ViewChild('ip_roomId') ip_roomId: ElementRef<HTMLInputElement>;
    @ViewChild('p_text') p_text: ElementRef<HTMLDivElement>;
    @ViewChild('p_partial') p_partial: ElementRef<HTMLDivElement>;


    //when user leaves the session page close the webrtc connection
    ngOnDestroy() {
        console.log("onDestroy");
        this.stop();
    }

    //navigate back function
    goBack() {
        this.router.navigate(['/login/account'], { queryParams: { userId: this.userId } });
    }

    //downloads the transcribed text as txt file
    download() {
        var text = this.p_text.nativeElement.innerHTML;
        var filename = "Transkription.txt";
        var downloadEle = document.createElement('a');
        downloadEle.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        downloadEle.setAttribute('download', filename, );
        downloadEle.style.display = 'none';
        document.body.appendChild(downloadEle);
        downloadEle.click();
        document.body.removeChild(downloadEle);
    }

    btn_show_stop() {
        this.btn_start.nativeElement.classList.add('d-none');
        this.btn_stop.nativeElement.classList.remove('d-none');
    }

    btn_show_start() {
        this.btn_stop.nativeElement.classList.add('d-none');
        this.btn_start.nativeElement.classList.remove('d-none');
        this.p_status.nativeElement.innerText = 'Press start';
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
            return fetch('http://' + window.location.host + '/' + uri_append, { // fetch request offer from server [url here]
                body: JSON.stringify({
                    sdp: offer.sdp,
                    type: offer.type,
                    language: language,
                    userid: innerThis.userId
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST'
            });
        }).then(function (response: any) {
            return response.json();
        }).then((answer: any) => {
            innerThis.renderer.setProperty(innerThis.p_roomId.nativeElement, 'innerHTML', answer.roomid);
            console.log(answer.sdp);
            return innerThis.pc.setRemoteDescription(answer);
        }).catch((e: any) => {
            console.log(e);
            innerThis.btn_show_start();
        });
    }

    //receive full text paragraph (optimized semantics)
    performRecvText(str: string) {
        var htmlStr = this.p_text.nativeElement.innerText;
        htmlStr += str + ". ";
        this.renderer.setProperty(this.p_text.nativeElement, 'innerHTML', htmlStr);
        this.renderer.setProperty(this.p_partial.nativeElement, 'innerHTML', "> ");
    }

    //receive partial of text paragraph (instant)
    performRecvPartial(str: string) {
        this.renderer.setProperty(this.p_partial.nativeElement, 'innerHTML', "> " + str);
    }

    // send a creation request to the sfu
    create() {
        const innerThis = this;
        this.btn_show_stop();
        this.renderer.setProperty(this.p_status.nativeElement, 'innerHTML', "Connecting...");
        this.pc = new RTCPeerConnection();

        this.dc = this.pc.createDataChannel('result');
        this.dc.onclose = function () {
            clearInterval(this.dcInterval);
            console.log('Closed data channel');
            innerThis.btn_show_start();
        };
        this.dc.onopen = function () {
            console.log('Opened data channel');
        };
        this.dc.onmessage = function (messageEvent: { data: any; }) {
            innerThis.renderer.setProperty(innerThis.p_status.nativeElement, 'innerHTML', "Listening... say something");

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
                innerThis.btn_show_start();
            }
        }

        var constraints = {
            audio: true,
            video: false,
        };

        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            stream.getTracks().forEach((track) => {
                innerThis.pc.addTrack(track, stream);
            });
            return innerThis.negotiate("create", this.language);
        }, (err) => {
            console.log('Could not acquire media: ' + err);
            innerThis.btn_show_start();
        });
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

        // close local audio
        this.pc.getSenders().forEach(function (sender: { track: { stop: () => void; }; }) {
            sender.track.stop();
        });

        // close peer connection
        setTimeout(() => {
            innerThis.pc.close();
        }, 500);
    }
}
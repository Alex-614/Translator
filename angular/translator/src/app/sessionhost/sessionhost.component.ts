import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
    selector: 'app-sessionhost',
    standalone: true,
    imports: [],
    template: `
    <button (click)=create()>Create</button>
    <button #btn_start>Start</button>
    <button #btn_stop (click)=stop()>Stop</button>
    <p #p_status>statusField</p>
    <p #p_roomId>RoomID</p>
    <input #ip_roomId placeholder="Enter RoomID">
    <button (click)=join()>Join</button>
    <p #p_text>Text</p>
    <p #p_partial>Partial</p>
  `,
    styleUrl: './sessionhost.component.css'
})
export class SessionhostComponent {
    constructor(private renderer: Renderer2) { }
    private pc: any;
    private dc: any;
    private dcInterval: any;
    @ViewChild('btn_start') btn_start: ElementRef<HTMLButtonElement>;
    @ViewChild('btn_stop') btn_stop: ElementRef<HTMLButtonElement>;
    @ViewChild('p_status') p_status: ElementRef<HTMLParagraphElement>;
    @ViewChild('p_roomId') p_roomId: ElementRef<HTMLParagraphElement>;
    @ViewChild('ip_roomId') ip_roomId: ElementRef<HTMLInputElement>;
    @ViewChild('p_text') p_text: ElementRef<HTMLParagraphElement>;
    @ViewChild('p_partial') p_partial: ElementRef<HTMLParagraphElement>;

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
    negotiate(uri_append: string, language: any) { // setup connection
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
        }).then(function (response:any) {
            return response.json();
        }).then((answer:any) => {
            innerThis.renderer.setProperty(innerThis.p_roomId.nativeElement, 'innerHTML', answer.roomid);
            console.log(answer.sdp);
            return innerThis.pc.setRemoteDescription(answer);
        }).catch( (e: any) => {
            console.log(e);
            innerThis.btn_show_start();
        });
    }

    performRecvText(str: string) {
        var htmlStr = this.p_text.nativeElement.innerText;
        htmlStr += '<div>' + str + '</div>\n';
        this.renderer.setProperty(this.p_text.nativeElement, 'innerHTML', htmlStr);
        this.renderer.setProperty(this.p_partial.nativeElement, 'innerHTML', "> ");
    }

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
            this.btn_show_start();
        };
        this.dc.onopen = function () {
            console.log('Opened data channel');
        };
        this.dc.onmessage = function (messageEvent: { data: string; }) {
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
            return innerThis.negotiate("create", "en");
        },  (err) => {
            console.log('Could not acquire media: ' + err);
            innerThis.btn_show_start();
        });
    }

    // send a join request to the sfu
    join() {
        const innerThis = this;
        this.btn_show_stop();
        this.renderer.setProperty(this.p_status.nativeElement, 'innerHTML', "Connecting...");

        this.pc = new RTCPeerConnection();

        this.dc = this.pc.createDataChannel('result');
        this.dc.onclose = function () {
            clearInterval(innerThis.dcInterval);
            console.log('Closed data channel');
            innerThis.btn_show_start();
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
        this.negotiate("join?room=" + this.ip_roomId.nativeElement.value, "de");
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
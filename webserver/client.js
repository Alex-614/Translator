// webRTC peer connection
var pc = null;
var dc = null, dcInterval = null;

start_btn = document.getElementById('start');
stop_btn = document.getElementById('stop');
statusField = document.getElementById('status');

function btn_show_stop() {
    start_btn.classList.add('d-none');
    stop_btn.classList.remove('d-none');
}

function btn_show_start() {
    stop_btn.classList.add('d-none');
    start_btn.classList.remove('d-none');
    statusField.innerText = 'Press start';
}

// send a webRTC connection offer and additional information to the sfu
function negotiate(uri_append, language) { // setup connection
    return pc.createOffer().then(function (offer) {
        return pc.setLocalDescription(offer);
    }).then(function () {
        return new Promise(function (resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }

                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function () {
        var offer = pc.localDescription;
        console.log(offer.sdp);
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
    }).then(function (response) {
        return response.json();
    }).then(function (answer) {
        document.getElementById("room").innerText = answer.roomid;
        console.log(answer.sdp);
        return pc.setRemoteDescription(answer);
    }).catch(function (e) {
        console.log(e);
        btn_show_start();
    });
}

function performRecvText(str) {
    htmlStr = document.getElementById('text').innerHTML;
    htmlStr += '<div>' + str + '</div>\n';
    document.getElementById('text').innerHTML = htmlStr;
    document.getElementById('partial').innerText = '> ';
}

function performRecvPartial(str) {
    document.getElementById('partial').innerText = '> ' + str;
}

// send a creation request to the sfu
function create() {
    btn_show_stop();
    statusField.innerText = 'Connecting...';
    var config = {
        sdpSemantics: 'unified-plan'
    };

    pc = new RTCPeerConnection(config);

    dc = pc.createDataChannel('result');
    dc.onclose = function () {
        clearInterval(dcInterval);
        console.log('Closed data channel');
        btn_show_start();
    };
    dc.onopen = function () {
        console.log('Opened data channel');
    };
    dc.onmessage = function (messageEvent) {
        statusField.innerText = "Listening... say something";

        if (!messageEvent.data) {
            return;
        }

        let voskResult;
        try {
            voskResult = JSON.parse(messageEvent.data);
        } catch (error) {
            console.error(`ERROR: ${error.message}`);
            return;
        }
        if ((voskResult.text?.length || 0) > 0) {
            performRecvText(voskResult.text);
        } else if ((voskResult.partial?.length || 0) > 0) {
            performRecvPartial(voskResult.partial);
        }
    };

    pc.oniceconnectionstatechange = function () {
        if (pc.iceConnectionState == 'disconnected') {
            console.log('Disconnected');
            btn_show_start();
        }
    }

    var constraints = {
        audio: true,
        video: false,
    };

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        stream.getTracks().forEach(function (track) {
            pc.addTrack(track, stream);
        });
        return negotiate("create", "en");
    }, function (err) {
        console.log('Could not acquire media: ' + err);
        btn_show_start();
    });
}

// send a join request to the sfu
function join() {
    btn_show_stop();
    statusField.innerText = 'Connecting...';
    var config = {
        sdpSemantics: 'unified-plan'
    };

    pc = new RTCPeerConnection(config);

    dc = pc.createDataChannel('result');
    dc.onclose = function () {
        clearInterval(dcInterval);
        console.log('Closed data channel');
        btn_show_start();
    };
    dc.onopen = function () {
        console.log('Opened data channel');
    };
    dc.onmessage = function (messageEvent) {
        statusField.innerText = "Receiving...";

        if (!messageEvent.data) {
            return;
        }

        let voskResult;
        try {
            voskResult = JSON.parse(messageEvent.data);
        } catch (error) {
            console.error(`ERROR: ${error.message}`);
            return;
        }
        if ((voskResult.text?.length || 0) > 0) {
            performRecvText(voskResult.text);
        } else if ((voskResult.partial?.length || 0) > 0) {
            performRecvPartial(voskResult.partial);
        }
    };

    pc.oniceconnectionstatechange = function () {
        if (pc.iceConnectionState == 'disconnected') {
            console.log('Disconnected');
        }
    }
    
    negotiate("join?room=" + document.getElementById("roomid").value, "de");

}

// stop all streams and close the connection
function stop() {

    // close data channel
    if (dc) {
        dc.close();
    }

    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach(function (transceiver) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    pc.getSenders().forEach(function (sender) {
        sender.track.stop();
    });

    // close peer connection
    setTimeout(function () {
        pc.close();
    }, 500);
}





/*
user_uuid = crypto.randomUUID();
console.log("client guid: " + user_uuid);



let socket = new WebSocket("ws://127.0.0.1:2700/ws");

socket.onopen = function(e) {
  alert("[open] Connection established");
  alert("Sending to server");
  socket.send('{"action": "join", "roomid": "test"}');
};

socket.onmessage = function(event) {
  alert(`[message] Data received from server: ${event.data}`);
};

socket.onclose = function(event) {
  if (event.wasClean) {
    alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    alert('[close] Connection died');
  }
};

socket.onerror = function(error) {
  alert(`[error]`);
};




/*  for client endpoint
// Create a new EventSource instance with the URL of the SSE endpoint on the server
const eventSource = new EventSource('/sse-endpoint');

// Event listener for 'message' events
eventSource.addEventListener('message', (event) => {
  const message = event.data;

  // Handle the received message as needed
  console.log('Received message:', message);
});

// Event listener for 'error' events
eventSource.addEventListener('error', (error) => {
  // Handle errors that occur with the SSE connection
  console.error('Error occurred:', error);
});
*/

















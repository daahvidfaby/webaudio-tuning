const player = document.querySelector('#player');
let audioContext;

const handleAudioStreamInput = (stream) => {
    if(!audioContext) {
        try {
            audioContext = new AudioContext();
        } catch {
            alert('Web Audio API is not supported in this browser')
        }
    }

    if (window.URL) {
        player.srcObject = stream;
      } else {
        player.src = stream;
      }  

}

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: false,
    })
    .then(handleAudioStreamInput);
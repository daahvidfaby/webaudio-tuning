const player = document.querySelector('#player');
let audioCtx;

/// Lame MATLAB/Octave-like functions
function xcorr(input, output) {
  var n = input.length,
      norm, sum,  i, j;
  
  for (i = 0; i < n; i++) {
      sum = 0;
      for (j = 0; j < n; j++) {
          sum += (input[j] * (input[j+i] || 0)); // Pad input with zeroes
      }
      if (i === 0) norm = sum;
      output[i] = sum / norm;
  }
}

function findpeaks(data) {
  var locations = [0];

  for (var i = 1; i < data.length - 1; i++) {
      if (data[i] > 0 && data[i-1] < data[i] && data[i] > data[i+1]) {
          locations.push(i);
      }
  }

  return locations;
}

function diff(data) {
  return data.reduce(function (acc, value, i) {
      acc[i] = data[i] - data[i-1]; return acc;
  }, []).slice(1);
}

function mean(data) {
  return data.reduce(function (acc, value) {
      return acc + value;
  }, 0) / data.length;
}

function median(data) {
  var half;
  
  data.sort( function(a, b) {return a - b;} );
  half = Math.floor(data.length/2);

  if (data.length % 2)
      return data[half];
  else
      return (data[half-1] + data[half]) / 2.0;
}

const handleAudioStreamInput = (stream) => {
    if(!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext);
        } catch {
            alert('Web Audio API is not supported in this browser')
        }
    }

    var source = audioCtx.createMediaStreamSource(stream);
     
    const analyser = audioCtx.createAnalyser();
    const nyquist = audioCtx.sampleRate / 2;

    // highest precision
    analyser.fftSize = 1024;

    analyser.minDecibels = -40;


    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);




    // Connect the source to be analysed
    source.connect(analyser);

    // Get a canvas defined with ID "oscilloscope"
    var canvas = document.getElementById("oscilloscope");
    var canvasCtx = canvas.getContext("2d");
    const WIDTH = canvas.width = 500;
    const HEIGHT = canvas.height = 150;

    // draw an oscilloscope of the current audio source

    function draw() {
        requestAnimationFrame(draw);
      
        // get the Frequency Domain
        analyser.getByteFrequencyData(dataArray);
      
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
      
        const barWidth = (WIDTH / bufferLength) * 2.5;
        let max_val = -Infinity;
        let max_index = -1;
        let x = 0;
        for(let i = 0; i < bufferLength; i++) {
          let barHeight = dataArray[i];
          if(barHeight > max_val) {
            max_val = barHeight;
            max_index = i;
          }
      
          canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
          canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);
          x += barWidth;
        }
        console.log(`loudest freq: ${max_index * (nyquist / bufferLength)}`);
      }

    draw();



}



navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: false,
    })
    .then(handleAudioStreamInput);
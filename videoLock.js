

function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || 
                         navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || 
                           navigator.msGetUserMedia;

var video = document.querySelector('video');
var streamRecorder;

navigator.getUserMedia({audio: true, video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    }, function(){});



function openDoor() {
    var img = document.getElementById('door');
    img.src = 'doorOpen.jpg'
    var txt = document.getElementById('title');
    txt.innerHTML = 'Hi Ofer Vilenski!';
}

const width = 600;
let height = 0;
let streaming = false;
let video = null;
let roll = null;
let cheese = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, false);    
} else {
    init();
}

function init() {
    video = document.getElementById('cam');
    roll = document.querySelector('photo-roll');
    cheese = document.getElementById('startbutton');

    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch((err) => {
            console.error(`An error occurred: ${err}`)
        })
    
    video.addEventListener('canplay', function(ev){
        if (!streaming) {
            height = (video.videoHeight / video.videoWidth) * width;

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    startbutton.addEventListener(
        "click",
        (ev) => {
            takepicture();
            ev.preventDefault();
        },
        false
    );

    async function takepicture() {
        roll.next(video);
    }
}
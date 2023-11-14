// import * as faceapi from '/js/face-api.js';

const scoreThreshold = 0.5;
const inputSize = 512;
const minConfidence = 0.5;

//await faceapi.nets.tinyFaceDetector.load('/models', new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold }));
await faceapi.nets.ssdMobilenetv1.load('/models', new faceapi.SsdMobilenetv1Options({ minConfidence }));
// await faceapi.loadFaceLandmarkModel('/models');
await faceapi.loadFaceExpressionModel('/models');

const width = 320;
let height = 0;
let streaming = false;
let video = null;
let canvas = null;
let photo = null;
let startbutton = null;

function startup() {
    video = document.getElementById('cam');
    canvas = document.getElementById('shot-1');
    photo = document.getElementById('shot-2');
    startbutton = document.getElementById('startbutton');

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
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
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

    clearphoto();

    function clearphoto() {
        const context = canvas.getContext('2d');
        context.fillStyle = '#AAA';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const data = canvas.toDataURL('image/png');
        photo.setAttribute("src", data);
    }

    async function takepicture() {
        const context = canvas.getContext('2d');
        if (width && height) {
            canvas.width = width;
            canvas.height = height;
            context.drawImage(video, 0, 0, width, height);

            const data = canvas.toDataURL('image/png');
            photo.setAttribute("src", data);
            const results = await faceapi.detectAllFaces(photo)
                // .withFaceLandmarks()
                .withFaceExpressions();
            faceapi.matchDimensions(canvas, photo);

            const resizedResults = faceapi.resizeResults(results, photo);
            
            // faceapi.draw.drawDetections(canvas, resizedResults);
            //faceapi.draw.drawFaceExpressions(canvas, resizedResults, minConfidence);
        } else {
            clearphoto();
        }
    }
}

startup();
// Initialize Firebase
const config = {
  apiKey: "AIzaSyCwMUc5a8vSP7XGyQB6mvmWUoYpNSxmW0M",
  authDomain: "symbiote-demo.firebaseapp.com",
  databaseURL: "https://symbiote-demo.firebaseio.com",
  storageBucket: "symbiote-demo.appspot.com",
  messagingSenderId: "495439885483"
};

firebase.initializeApp(config);

let mic;

function setup() {
  mic = new p5.AudioIn();
  mic.start();
  frameRate(500);
}

function draw() {
  const vol = mic.getLevel(); // 0-1.0
  if (vol > 0.15) {
    firebase.database().ref('ad/').set({ audioEmotion: 'upbeat' });
  } else {
    firebase.database().ref('ad/').set({ audioEmotion: 'down' });
  }
}

$(() => {
  const video = document.getElementById('video');
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.play();
      });
  }

  // Elements for taking the snapshot
  const canvas = document.getElementById('canvas');

  setInterval(() => {
    canvas.getContext('2d').drawImage(video, 0, 0, 640, 480);
    uploadToFbStorage(dataURItoBlob(canvas.toDataURL()));
  }, 5000);
});

const uploadToFbStorage = (file) => {
  const storageRef = firebase.storage().ref();
  const uploadTask = storageRef.child('curImg/').put(file);

  uploadTask.on('state_changed', (snapshot) => {
  }, (error) => {
    console.log(error);
  }, () => {
    const imURL = uploadTask.snapshot.downloadURL;
    firebase.database().ref('im/').set({ imURL });
    console.log(imURL);
  });
};

const dataURItoBlob = (dataURI) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
};

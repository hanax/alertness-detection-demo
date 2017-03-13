// udp server required by the get_pulse app
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const firebase = require('firebase');
const config = {
  apiKey: "AIzaSyCwMUc5a8vSP7XGyQB6mvmWUoYpNSxmW0M",
  authDomain: "symbiote-demo.firebaseapp.com",
  databaseURL: "https://symbiote-demo.firebaseio.com",
  storageBucket: "symbiote-demo.appspot.com",
  messagingSenderId: "495439885483"
};
firebase.initializeApp(config);

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  var curBeat = msg.toString();
  if (curBeat == 0) return;

  // console.log(`server got: ${curBeat} from ${rinfo.address}:${rinfo.port}`);
  firebase.database().ref('hb/').set({ curBeat });
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(5050, '127.0.0.1');

// udp server end

// listen to face storage

const Vision = require('@google-cloud/vision');
const Storage = require('@google-cloud/storage');
const storage = Storage();
const visionClient = Vision();

const imURLRef = firebase.database().ref('im/');
imURLRef.on('value', function(snapshot) {
  // const imURL = snapshot.val().imURL;

  visionClient.detectFaces(storage.bucket('symbiote-demo.appspot.com').file('curImg'))
    .then((results) => {
      const face = results[0][0];
      console.log(`Emotions: (confidence $(face.confidence))`);
      console.log(`    Joy: ${face.joy}`);
      console.log(`    Anger: ${face.anger}`);
      console.log(`    Sorrow: ${face.sorrow}`);
      console.log(`    Surprise: ${face.surprise}`);

      firebase.database().ref('hb/').once('value').then((snapshot) => {
        console.log('Heart rate:');
        console.log(snapshot.val().curBeat);
      });
    })
    .catch((err) => {
      console.log(err);
    });
});
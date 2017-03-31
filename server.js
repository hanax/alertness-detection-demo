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

const visionClient = Vision({
  keyFilename: './symbiote-demo-key.json',
  projectId: 'symbiote-demo'
});

const imURLRef = firebase.database().ref('im/');
imURLRef.on('value', function(snapshot) {
  visionClient.detectFaces(storage.bucket('symbiote-demo.appspot.com').file('curImg'))
    .then((results) => {
      console.log(`---------`);

      const face = results[0][0];
      if (!face) return;
      console.log(`Emotions: (confidence ${face.confidence})`);
      console.log(`    Joy: ${face.joy}`);
      console.log(`    Anger: ${face.anger}`);
      console.log(`    Sorrow: ${face.sorrow}`);
      console.log(`    Surprise: ${face.surprise}`);
      firebase.database().ref('em/').set({ face });

      firebase.database().ref('ad/').once('value').then((snapshot) => {
        console.log('Audio emotion:');
        console.log(`    ${snapshot.val().audioEmotion}`);
      });

      let sleepFlg = false;
      console.log(`Head Angle:`);

      const tilt = face.angles.tilt;
      console.log(`    Tilt: ${tilt}`);
      // tilt < -5 means falling asleep
      if (tilt < -5) sleepFlg |= true;

      firebase.database().ref('hb/').once('value').then((snapshot) => {
        console.log('Heart rate:');
        const curBeat = snapshot.val().curBeat;
        console.log(`    ${curBeat}`);
        // beat < 50 means falling asleep
        if (curBeat < 50) sleepFlg |= true;

        console.log(`** Alert?: ${sleepFlg ? 'NO' : 'YES'} **`);

        let level = tilt - (-5) * (50 / curBeat)
        if (sleepFlg && level > 0) level = -1 * level;
        firebase.database().ref('al/').set({
          isAlert: !sleepFlg,
          level
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

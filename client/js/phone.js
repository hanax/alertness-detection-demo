// Initialize Firebase
const config = {
  apiKey: "AIzaSyCwMUc5a8vSP7XGyQB6mvmWUoYpNSxmW0M",
  authDomain: "symbiote-demo.firebaseapp.com",
  databaseURL: "https://symbiote-demo.firebaseio.com",
  storageBucket: "symbiote-demo.appspot.com",
  messagingSenderId: "495439885483"
};

firebase.initializeApp(config);

var curSpeed = 80;
var curAcc = 0;

$(() => {
  firebase.database().ref('sl/').set({ shouldSlowDown: false });

  setInterval(() => {
    if (curAcc < 0) {
      $('body').addClass('body--alert');
    } else {
      $('body').removeClass('body--alert');
    }
    curSpeed += curAcc;
    curSpeed = Math.min(80, Math.max(0, curSpeed));
    $('#speed').text(curSpeed);
  }, 800);

  firebase.database().ref('sl/').on('value', (snapshot) => {
    const shouldSlowDown = snapshot.val().shouldSlowDown;
    console.log(shouldSlowDown)
    if (shouldSlowDown) {
      curAcc = -2;
    } else {
      if (curSpeed < 80) {
        curAcc = 2;
      } else {
        curAcc = 0;
      }
    }
  });
});

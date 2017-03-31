// Initialize Firebase
const config = {
  apiKey: "AIzaSyCwMUc5a8vSP7XGyQB6mvmWUoYpNSxmW0M",
  authDomain: "symbiote-demo.firebaseapp.com",
  databaseURL: "https://symbiote-demo.firebaseio.com",
  storageBucket: "symbiote-demo.appspot.com",
  messagingSenderId: "495439885483"
};

firebase.initializeApp(config);

var curSpeed = 60;
var curAcc = 0;

$(() => {
  firebase.database().ref('sl/').set({ shouldSlowDown: false, shouldSpeedUpZCT: false });

  setInterval(() => {
    if (curAcc < 0) {
      $('body').addClass('body--alert');
    } else {
      $('body').removeClass('body--alert');
    }
    curSpeed += curAcc;
    if (curAcc === 2) {
      // recover mode
      curSpeed = Math.min(60, Math.max(0, curSpeed));
    } else if (curAcc === 1) {
      // zct speed up mode
      curSpeed = Math.min(70, Math.max(0, curSpeed));
    }

    $('#speed').text(curSpeed);
  }, 1000);

  firebase.database().ref('sl/').on('value', (snapshot) => {
    const { shouldSlowDown, shouldSpeedUpZCT } = snapshot.val();
    if (shouldSpeedUpZCT) {
      curAcc = 1;
      $('#speed-ic').show();
      return;
    }

    if (shouldSlowDown) {
      curAcc = -2;
    } else {
      if (curSpeed < 60) {
        curAcc = 2;
      } else {
        curAcc = 0;
      }
    }
  });
});

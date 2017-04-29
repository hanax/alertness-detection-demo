particlesJS.load('particles-js', 'js/particles.json', function() {
  console.log('callback - particles.js config loaded');
});

let alertCntdown = 0;

let face = {
  confidence: 99,
  emo: 'happy'
};
let curBeat = 65 + 10 * Math.random();
let isAlert = true;
let level = 22;

$(() => {
  const siriWave = new SiriWave({
    container: document.getElementById('siri-container'),
    style: 'ios9',
    speed: 0.035
  });
  siriWave.start();
  $('#alert-false').hide();
  $('#em-happy').hide();
  $('#em-sad').hide();

  setInterval(() => {
    if (Math.random() > 0.95) {
      face.emo = 'sad';
    } else {
      face.emo = 'happy';
    }
    face.confidence = 95 + 5 * Math.random();
    curBeat = 60 + 15 * Math.random();

    level = 15 + 5 * Math.random();
    isAlert = true;
    // if (Math.random() > 0.8) {
    //   level = -1 * level;
    //   isAlert = false;
    // } else {
    //   isAlert = true;
    //   level = Math.abs(level);
    // }
  }, 150);

  setInterval(() => {
    $('#emotion .dash-number').text(parseInt(face.confidence*100)/100);
    if (face.emo === 'happy') {
      $('#em-happy').show();
      $('#em-sad').hide();
      $('#em-neutural').hide();
    } else if (face.emo === 'sad') {
      $('#em-happy').hide();
      $('#em-sad').show();
      $('#em-neutural').hide();
    } else {
      $('#em-happy').hide();
      $('#em-sad').hide();
      $('#em-neutural').show();
    }

    siriWave.setSpeed(curBeat * 0.001125 - 0.01917);
    $('#heartbeat .dash-number').text(parseInt(curBeat*10)/10);

    $('#alertness .dash-number').text(parseInt(level*10)/10);

    if (isAlert) {
      $('#alertness').removeClass('text--urgent');
      $('#alertness').addClass('text--safe');
      $('#alert-false').hide();
      $('#alert-true').show();

      document.getElementById('alarm-sound').pause();
      alertCntdown = 0;
    } else {
      $('#alertness').removeClass('text--safe');
      $('#alertness').addClass('text--urgent');
      $('#alert-false').show();
      $('#alert-true').hide();

      if (alertCntdown === 0) {
        alertCntdown = Date.now();
        document.getElementById('alarm-sound').play();
      } else if (Date.now() - alertCntdown > 8000) {
        // more than 10 sec
        // firebase.database().ref('sl/').update({ shouldSlowDown: true });
      }
    }
  }, 200);

  document.getElementById('alarm-sound').addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
  }, false);

  $(document).on('keydown', (e) => {
    // hit space
    if (e.which === 32) {
      alertCntdown = 0;
      document.getElementById('alarm-sound').pause();
    }
    // hit a
    // if (e.which === 65) {
      // firebase.database().ref('sl/').update({ shouldSpeedUpZCT: true });
      // document.getElementById('alarm-zct').play();
    // }
  });
});

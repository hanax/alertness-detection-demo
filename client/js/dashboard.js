particlesJS.load('particles-js', 'js/particles.json', function() {
  console.log('callback - particles.js config loaded');
});

let alertCntdown = 0;

$(() => {
  firebase.database().ref('sl/').set({ shouldSlowDown: false });
  const siriWave = new SiriWave({
    container: document.getElementById('siri-container'),
    style: 'ios9',
    speed: 0.035
  });
  window.siriWave = siriWave;
  siriWave.start();
  $('#alert-false').hide();
  $('#em-happy').hide();
  $('#em-sad').hide();

  firebase.database().ref('em/').on('value', (snapshot) => {
    const face = snapshot.val().face;

    $('#emotion .dash-number').text(parseInt(face.confidence*100)/100);
    firebase.database().ref('ad/').once('value').then((snapshot) => {
      const audioEm = snapshot.val().audioEmotion;
      if (face.joy || audioEm === 'happy') {
        $('#em-happy').show();
        $('#em-sad').hide();
        $('#em-neutural').hide();
      } else if (face.sorrow || audioEm === 'sad') {
        $('#em-happy').hide();
        $('#em-sad').show();
        $('#em-neutural').hide();
      } else {
        $('#em-happy').hide();
        $('#em-sad').hide();
        $('#em-neutural').show();
      }
    });
  });

  firebase.database().ref('hb/').on('value', (snapshot) => {
    const curBeat = snapshot.val().curBeat;

    siriWave.setSpeed(curBeat * 0.001125 - 0.01917);
    $('#heartbeat .dash-number').text(parseInt(curBeat*10)/10);
  });

  firebase.database().ref('al/').on('value', (snapshot) => {
    const { isAlert, level } = snapshot.val();

    $('#alertness .dash-number').text(parseInt(level*10)/10);
    if (isAlert) {
      $('#alertness').removeClass('text--urgent');
      $('#alertness').addClass('text--safe');
      $('#alert-false').hide();
      $('#alert-true').show();
    } else {
      $('#alertness').removeClass('text--safe');
      $('#alertness').addClass('text--urgent');
      $('#alert-false').show();
      $('#alert-true').hide();
    }

    if (!isAlert && alertCntdown === 0) {
      alertCntdown = Date.now();
      document.getElementById('alarm-sound').play();
    } else if (!isAlert) {
      // more than 10 sec
      if (Date.now() - alertCntdown > 10000) {
        firebase.database().ref('sl/').set({ shouldSlowDown: true });
      }
    } else {
      document.getElementById('alarm-sound').pause();
      alertCntdown = 0;
    }
  });

  $(document).on('keydown', (e) => {
    // hit space
    if (e.which === 32) {
      alertCntdown = 0;
      document.getElementById('alarm-sound').pause();
    }
  });
});

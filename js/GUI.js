var healthBar;

function initCountdown(e) {
    var sec, min, hund, secExt, hundExt, setTimer;
    var divCountdown = document.getElementById("divCountdown");
    if (Math.floor(e / 60) == 0) {
        min = 0;
    } else {
        min = Math.floor(e / 60)
    }
    if (e % 60 == 0) {
        sec = 0;
    } else {
        sec = (e - 60 * min);
    }
    hund = 0;
    startTimer = setInterval(startCountdown, 10);

    function startCountdown() {
        hund = hund - 1;
        if (hund == 0 && sec == 0 && min == 0) {
            clearInterval(startTimer);
        } else if (hund < 0 && sec > 0) {
            sec = sec - 1;
            hund = 99;
        } else if (hund < 0 && sec == 0 && min > 0) {
            min = min - 1;
            sec = 59;
            hund = 99;
        }
        if (hund == 0 && sec == 0 && min == 0) {
            divCountdown.innerHTML = "GAME OVER";
        } else {
            if (sec < 10) {
                secExt = "0" + sec;
            } else {
                secExt = sec;
            }
            if (hund < 10) {
                hundExt = "0" + hund;
            } else {
                hundExt = hund;
            }
            divCountdown.innerHTML = min + ":" + secExt + ":" + hundExt;
        }
    }
}

function  initGUIElements() {

  /////////////////////////////////////////////////////////
  // GUI                                                 //
  /////////////////////////////////////////////////////////

  // Display the HUD: radar, health, score, and credits/directions
  /*$('body').append('<canvas id="radar" width="200" height="200"></canvas>');
  $('body').append('<div id="hud"><p>Health: <span id="health">100</span><br />Score: <span id="score">0</span></p></div>');

  // Set up the brief red flash that shows when you get hurt
  $('body').append('<div id="hurt"></div>');
  $('#hurt').css({width: window.innerWidth, height: window.innerHeight,});*/

    // The canvas used to render onto
    var displayCanvasContext = document.getElementById('displayCanvas').getContext('2d');
    healthBar = new HealthBar(displayCanvasContext, 5, 5, 50, 5, 100, 100);

    // Initialize the timer
    initCountdown(200);
}

function drawHealthbar(canvas, x, y, width, height, health, max_health) {
    if (health >= max_health) {
        health = max_health;
    }
    if (health <= 0) {
        health = 0;
    }
    canvas.fillStyle = '#0000000';
    canvas.fillRect(x, y, width, height);
    var colorNumber = Math.round((1 - (health / max_health)) * 0xff) * 0x10000 + Math.round((health / max_health) * 0xff) * 0x100;
    var colorString = colorNumber.toString(16);
    if (colorNumber >= 0x100000) {
        canvas.fillStyle = '#' + colorString;
    } else if (colorNumber << 0x100000 && colorNumber >= 0x100000) {
        canvas.fillStyle = '#0' + colorString;
    } else if (colorNumber << 0x10000) {
        canvas.fillStyle = '#00' + colorString;
    }
    canvas.fillRect(x + 1, y + 1, (health / max_health) * (width - 2), height - 2);
}

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

    // The canvas used to render onto
    var displayCanvasContext = document.getElementById('displayCanvas').getContext('2d');
    drawHealthbar(displayCanvasContext, 5, 5, 50, 5, 100, 100)

    // Initialize the timer
    initCountdown(200);
}
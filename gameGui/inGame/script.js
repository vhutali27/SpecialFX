var time = 0;
var running = 1;
increment();

function startPause() {
    if (running == 1) {
        running = 0;
        document.getElementById("pause").innerHTML = "Resume";
    } else {
        running = 1;
        increment();
        document.getElementById("pause").innerHTML = "Pause";
    }

}

function reset() {
    running = 1;
    time = 0;
    document.getElementById("pause").innerHTML = "Pause";
    document.getElementById("output").innerHTML = "0:00:00:00";
    increment();

}

function increment() {
    if (running == 1) {
        setTimeout(function() {
            time++;
            var mins = Math.floor(time / 10 / 60);
            var secs = Math.floor(time / 10 % 60);
            var hours = Math.floor(time / 10 / 60 / 60);
            var tenths = time % 10;
            if (mins < 10) {
                mins = "0" + mins;
            }
            if (secs < 10) {
                secs = "0" + secs;
            }
            document.getElementById("output").innerHTML = hours + ":" + mins + ":" + secs + ":" + tenths + "0";
            increment();
        }, 100);
    }
}
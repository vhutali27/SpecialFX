function initialise() {

    moveCount = 3;

    for (var x = 0; x < 10; x++) {
        balls[x] = [];
        for (var y = 0; y < 10; y++) {
            balls[x][y] = new Ball(x, y);
        }
    }

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            while (true) {
                var colorNum = getRandomNum(6);
                if (checkColor(i, j, colorNum)) {
                    balls[i][j].color = colorNum;
                    break;
                }
            }
        }
    }

    canvas.onmousedown = mouseDown;
    canvas.onmouseup = myMouseUp;

    timer = setInterval(checkBallStatus, 25);
}

function checkBallStatus() {
    if (moves.length > 0) {

        for (var i = 0; i < moves.length; i++) {
            moves[i].update();
        }

        moves = moves.filter(
            function(ball) {
                return ball.gapCount != 0;
            }
        );

        if (moves.length == 0) {
            moves[i].update();
            setRemoveFlag();
            fall();

        }

    }

    paint();
    if (moves.length == 0 && moveCount == 0) {
        clearInterval(timer);
        timer = null;
        setTimeout(gameOver(), 300);



    }

}


function paint() {

    ctx.clearRect(0, 0, 600, 700);

    for (var x = 0; x < 10; x++) {
        for (var y = 0; y < 10; y++) {
            ctx.drawImage(imageList[balls[x][y].color], x * 60, balls[x][y].getY(), 60, 60);
        }
    }
    ctx.font = 'bold 20px Open Sans';
    ctx.textAlign = 'center';
    ctx.fillText('Moves Left:' + moveCount, 150, 50);
    ctx.fillText('Score: 33333', 450, 50);
}
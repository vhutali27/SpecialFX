class HealthBar{
    constructor(canvas, x, y, width, height, health, max_health) {
        this.health = health;
        this.max_health = max_health;
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.canvas.fillStyle = '#0000000';
        this.canvas.fillRect(x, y, width, height);

        this.updateHealth(this.health)
    }

    updateHealth(health){
        this.canvas.clearRect(this.x, this.y, this.width, this.height);

        this.health = health;

        if (this.health >= this.max_health) {
            this.health = this.max_health;
        }
        if (this.health <= 0) {
            this.health = 0;
        }

        this.colorNumber = Math.round((1 - (this.health / this.max_health)) * 0xff) * 0x10000 + Math.round((this.health / this.max_health) * 0xff) * 0x100;
        this.colorString = this.colorNumber.toString(16);
        if (this.colorNumber >= 0x100000) {
            this.canvas.fillStyle = '#' + this.colorString;
        } else if (this.colorNumber << 0x100000 && this.colorNumber >= 0x100000) {
            this.canvas.fillStyle = '#0' + this.colorString;
        } else if (this.colorNumber << 0x10000) {
            this.canvas.fillStyle = '#00' + this.colorString;
        }
        this.canvas.fillRect(this.x + 1, this.y + 1, (this.health / this.max_health) * (this.width - 2), this.height - 2);

    }
}
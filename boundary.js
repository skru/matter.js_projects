class Boundary{
	
  constructor(x, y, width, height, options) {
    this.body = Bodies.rectangle(x, y, width, height, options);
    this.width = width;
    this.height = height;
    World.add(engine.world, this.body);
    boundaries.push(this);
  }

  show() {
    var pos = this.body.position;
    var angle = this.body.angle;
    push();
    translate(pos.x,pos.y)
    rotate(angle);

    rectMode(CENTER);
    fill(0);
    rect(0, 0, this.width, this.height);
    pop();
  }
}
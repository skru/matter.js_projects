class Boundary{
	
  constructor(x, y, width, height, options) {
    this.body = Bodies.rectangle(x, y, width, height, options);
    this.width = width;
    this.height = height;
    //this.rotate = rotate;
    //this.body.collisionFilter = {group: -1};
    //this.body.collisionFilter = {mask: defaultCategory};
    //this.rotate = Body.rotate( this.body, Math.PI/rotate);
    World.add(engine.world, this.body);
    //Body.rotate( this.body, Math.PI/this.rotate);
    boundaries.push(this);
  }

  show() {
    var pos = this.body.position;
    var angle = this.body.angle;
    push();
    translate(pos.x,pos.y)
    rotate(angle);

    rectMode(CENTER);
    fill(27);
    rect(0, 0, this.width, this.height);
    pop();
  }
}
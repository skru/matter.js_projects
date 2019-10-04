class Rock{

  constructor(x, y, sides, radius) {
    this.body = Bodies.polygon(x, y, sides, radius, {density: 0.5, label: "rock"})
    this.body.container = this;
    this.radius = radius;
    //this.body.collisionFilter = {mask: defaultCategory};
    World.add(engine.world, this.body);
    rocks.push(this);
  }

  show() {
    var pos = this.body.position;
    var angle = this.body.angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(0);
    ellipse(0,0, this.radius*2 );
    pop();
  }

  remove(){
  	World.remove(engine.world, this.body)
    rocks.splice(rocks.indexOf(this), 1)
  }

  isOffScreen(){
  	if (this.body.position.x < 0 || 
		this.body.position.x > canvasWidth*2 ||
		this.body.position.y < 0 || 
		this.body.position.y > canvasHeight
	){
  		this.remove()
  	};
  }
}
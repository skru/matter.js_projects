Composites.enemyCar = function(xx, yy, width, height, wheelSize, backWheelSize) {
    var group = Body.nextGroup(true),
        wheelBase = width*0.75,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 10;
        
        //collisionCategory = collisionCategories[Common.random(0, 1)];

    var car = Composite.create({ label: 'Car' }),
        body = Bodies.rectangle(xx, yy, width, height, {
            collisionFilter: {
                group: group,
                mask: defaultCategory
            },
            // chamfer: {
            //     radius: height * 0.2
            // },
            density: 0.0005,
            restitution: 0,
            friction: 1,
            label: 'carBody',
            //container = car,

        });
        body.composite = car;

    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, backWheelSize, {
        collisionFilter: {
            group: group,
            mask: defaultCategory
        },
        friction: 1,
        restitution: 0.001,
    });
                
    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group,
            mask: defaultCategory
        },
        friction: 1,
        restitution: 0.001
    });
                
    var axelA = Constraint.create({
        bodyB: body,
        pointB: { x: wheelAOffset, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1,
        length: 0
    });
                    
    var axelB = Constraint.create({
        bodyB: body,
        pointB: { x: wheelBOffset, y: wheelYOffset },
        bodyA: wheelB,
        stiffness: 1,
        length: 0
    });

    function boxes(x, y, width, height){
        var box = Bodies.rectangle(x, y, width/5, width/5, {
            label: 'enemy',
            density: 0.0001,
            restitution: 0,
            friction: 1
          
          });
        box.composite = car;
        return box;

    }

    var pyramid = Composites.pyramid(xx-width/2, yy-height-(width/5), 4, 4, 0, 0, function(x, y) {
        return boxes(x, y, width, height);
    });
    
    Composite.addBody(car, body);
    Composite.addBody(car, wheelA);
    Composite.addBody(car, wheelB);
    Composite.addComposite(car, pyramid);
    Composite.addConstraint(car, axelA);
    Composite.addConstraint(car, axelB);

    return car;
};


class Car{
  constructor(x, y, width, height, wheelSize, backWheelSize) {
    this.composites = Composites.enemyCar(
        x, 
        y, 
        width,
        height,
        wheelSize,
        backWheelSize
    );
    this.width = width;
    this.height = height;
    this.wheelSize = wheelSize*2;
    this.backWheelSize = backWheelSize*2;
    this.composites.container = this;
    this.damage = 0;
    this.good = probability(.1); //Common.choose([true, false])
    //console.log(wheelSize)

    World.add(engine.world, this.composites);
    cars.push(this);
  }

  show() {
    // carbody
    var pos = this.composites.bodies[0].position;
    var angle = this.composites.bodies[0].angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(127);
    rect(0, 0, this.width, this.height);
    pop();
    // front wheel
    pos = this.composites.bodies[1].position;
    angle = this.composites.bodies[1].angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(100);
    ellipse(0, 0, this.backWheelSize);
    pop();
    // back wheel
    pos = this.composites.bodies[2].position;
    angle = this.composites.bodies[2].angle;
    push();
    translate(pos.x, pos.y);
    rotate(angle);
    rectMode(CENTER);
    fill(100);
    ellipse(0,0, this.wheelSize);
    pop();

    var enemies = this.composites.composites[0].bodies
    for (var i = 0; i < enemies.length; i++) {
        //console.log(this.composites.composites[0].bodies)
        pos = enemies[i].position;
        angle = enemies[i].angle;
        push();
        translate(pos.x, pos.y);
        rotate(angle);
        rectMode(CENTER);
        if (this.good){
            fill(color('#0f0'));
        } else {
            fill(color('#F20000'));
        }
        
        rect(0,0, this.width/5, this.width/5);
        pop();
      }
  }

  remove(){
    if (this.damage >= 1){
        World.remove(engine.world, this.composites);
        for( var i = 0; i < cars.length; i++){ 
           if ( cars[i].composites === this.composites) {
             cars.splice(i, 1); 
             i--;
           }
        }
        //cars.splice(cars.indexOf(this), 1);
    } else {
        this.damage = this.damage + 1;
    }
    
  }
}
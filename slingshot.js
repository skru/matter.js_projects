var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Common = Matter.Common,
    Composites = Matter.Composites,
    Composite = Matter.Composite,
    Events = Matter.Events,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;

// canvas size
canvasWidth = window.innerWidth;
canvasHeight = window.innerHeight;

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: canvasWidth,
        height: canvasHeight,
        background: '#0f0f13',
        showAngleIndicator: false,
        wireframes: false
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);


var spawnX = canvasWidth + 200,
    spawnY = ((canvasHeight/8) * 7) + 5,
    spawnRate = 2, //2000
    carSpeed = -0.2, //02
    towerX = canvasWidth/8,
    towerY = (canvasHeight/4) * 3,
    carScaleMin = 0.4,
    carScaleMax = 0.8;

// create rocks
class Rock{
  constructor(x, y, sides, radius) {
    this.body = Bodies.polygon(x, y, sides, radius, { density: 0.004, label: "rock"})
  }
}
  
// create level
var rock = new Rock(towerX, towerY, 20, canvasWidth/64);
var ground = Bodies.rectangle(0, (canvasHeight/16) * 15, canvasWidth*3, canvasHeight/16, { isStatic: true, label: 'ground' })
var tower = Bodies.rectangle(towerX, towerY + (canvasHeight/8), 5, (canvasHeight/8), { isStatic: true, label: 'tower' })

// spawn sensor

//  var spawnSensor = Bodies.rectangle(canvasWidth-300, (canvasHeight/16) * 14, 500, 50, {
//     isSensor: true,
//     isStatic: true,
   
// });
// create slingshot
var anchor = { x: towerX, y: towerY },
elastic = Constraint.create({
    pointA: anchor,
    bodyB: rock.body,
    stiffness: 0.05
});

World.add(engine.world, [ground, tower, rock.body, elastic]);

// Create cars
var collisionCategories = [0x0001, 0x0002]

Composites.enemyCar = function(xx, yy, width, height, wheelSize) {
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
                //category: collisionCategory
            },
            chamfer: {
                radius: height * 0.2
            },
            density: 0.0005,
            restitution: 0,
            friction: 1,
            label: 'carBody',
        });

    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize + (wheelSize*Common.random(0,0.5)), {
        collisionFilter: {
            group: group,
            //category: collisionCategory
        },
        friction: 1,
        restitution: 0.001,
        // render: {
        //     sprite: {
        //         texture: 'img/wheel.png',
        //         xScale: 0.5,
        //         yScale: 0.5
        //     }
        // }
    });
                
    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group,
            //category: collisionCategory
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

    var pyramid = Composites.pyramid(xx-width/2, yy-height-(width/5), 4, 4, 0, 0, function(x, y) {
    return Bodies.rectangle(x, y, width/5, width/5, {
        label: 'enemy',
        density: 0.0001,
        restitution: 0,
        friction: 1
      
      });
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
  constructor(x, y, width, height, wheelSize) {
    this.composites = Composites.enemyCar(
        spawnX, 
        spawnY, 
        (canvasWidth/10) * Common.random(carScaleMin, carScaleMax), 
        (canvasWidth/40) * Common.random(carScaleMin, carScaleMax), 
        (canvasWidth/72) * Common.random(carScaleMin, carScaleMax)
    );
    World.add(engine.world, this.composites);
  }
}

var cars = [
  new Car(spawnX, spawnY, 80, 10, 12)
]


function advanceCar(car, index){
  Body.setAngularVelocity(car.composites.bodies[1], carSpeed);
}

Events.on(engine, 'beforeUpdate', function() {
    cars.forEach(advanceCar);
});

Events.on(engine, 'afterUpdate', function() {
    if (mouseConstraint.mouse.button === -1 && (rock.body.position.x > (towerX + (canvasWidth/128) ) || rock.body.position.y < (towerY - (canvasHeight/128)))) {
        rock = new Rock(towerX  , towerY, 20, canvasWidth/64);
        World.add(engine.world, rock.body);
        elastic.bodyB = rock.body;
    }
});





/// requestanimationframe
var requestInterval = function (fn, delay) {
  var requestAnimFrame = (function () {
    return window.requestAnimationFrame || function (callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  })(),
  start = new Date().getTime(),
  handle = {};
  function loop() {
    handle.value = requestAnimFrame(loop);
    var current = new Date().getTime(),
    delta = current - start;
    if (delta >= delay) {
      fn.call();
      start = new Date().getTime();
    }
  }
  handle.value = requestAnimFrame(loop);
  return handle;
};

function addCars(){
  var allowspawn = true;
  world.composites.forEach(function(car, index) { // check if any cars are within spawn area

    if (car.bodies.length > 0){ // hack, see below in removeCar
        if (car.bodies[0].position.x > spawnX - (canvasWidth/12)){ // selecting carBody body
            allowspawn = false
        }
    }
    
  });
  if (allowspawn){
    cars.push(new Car(spawnX, spawnY, 80, 10, 12))
  }
  

}

requestInterval(addCars, spawnRate)

function removeCar(bodyId){
  cars.forEach(function(car, index) {
    Composite.allComposites(car).forEach(function(composite) {
      Composite.allBodies(composite).forEach(function(body) {
        if (bodyId === body.id){
          World.remove(engine.world, composite.constraints, true);
          World.remove(engine.world, composite.bodies, true);
          cars.splice(index, 1);
          setTimeout(function(){ // remove enemies slightly after car (might have to remove)
                World.remove(engine.world, composite, true) 
                
            },500);
          

        }
      });
      
      
    });
    
  });
}


Matter.Events.on(engine, 'collisionStart', function(event) {
  //console.log(world.composites)
    let pairs = event.pairs;
    pairs.forEach(function(pair) {
      
      // if rock collides with round
      if (pair.bodyA.label === 'ground' && pair.bodyB.label === 'rock'){
        setTimeout(function(){
            World.remove(engine.world, pair.bodyB)
        },50);
      }
      if (pair.bodyA.label === 'rock' && pair.bodyB.label === 'ground'){
        setTimeout(function(){
            World.remove(engine.world, pair.bodyA)
        },50);
      }

      // enemy collides with ground or tower
      if ((pair.bodyA.label === 'ground' && pair.bodyB.label === 'enemy') ||
        (pair.bodyA.label === 'tower' && pair.bodyB.label === 'enemy')){
        setTimeout(function(){
            World.remove(engine.world, pair.bodyB, true);
        },250);
      }
      
      // car collides with tower
      if (
        ((pair.bodyA.label === 'tower' && pair.bodyB.label === 'carBody') ||
                (pair.bodyA.label === 'carBody' && pair.bodyB.label === 'tower'))
        ||
        ((pair.bodyA.label === 'ground' && pair.bodyB.label === 'carBody') ||
                (pair.bodyA.label === 'carBody' && pair.bodyB.label === 'ground'))
        ){
       
            removeCar(pair.bodyB.id);
      }
     
    });
});




// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: canvasWidth, y: canvasHeight }
});





// window.addEventListener("resize", function(){
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// });

 

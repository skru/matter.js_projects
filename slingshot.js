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

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 1000,
        height: 600,
        showAngleIndicator: true
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);


var spawnX = 900,
    spawnY = 550,
    spawnRate = 1200, //2000
    carSpeed = -0.1, //02
    towerX = 100,
    carScaleMin = 0.6,
    carScaleMax = 1.6;

// create rocks
class Rock{
  constructor(x, y, sides, radius) {
    this.body = Bodies.polygon(x, y, sides, radius, { density: 0.004, label: "rock"})
  }
}
  
// create level
var rock = new Rock(towerX, 450, 20, 12);
var ground = Bodies.rectangle(0, 600, 2000, 50, { isStatic: true, label: 'ground' })
var tower = Bodies.rectangle(towerX, 525, 5, 100, { isStatic: true, label: 'tower' })

// create slingshot
var anchor = { x: towerX, y: 450 },
elastic = Constraint.create({
    pointA: anchor,
    bodyB: rock.body,
    stiffness: 0.05
});

World.add(engine.world, [ground, tower, rock.body, elastic,]);

// Create cars
Composites.enemyCar = function(xx, yy, width, height, wheelSize) {
    var group = Body.nextGroup(true),
        wheelBase = 20,
        wheelAOffset = -width * 0.5 + wheelBase,
        wheelBOffset = width * 0.5 - wheelBase,
        wheelYOffset = 10;

    var car = Composite.create({ label: 'Car' }),
        body = Bodies.rectangle(xx, yy, width, height, {
            collisionFilter: {
                group: group
            },
            chamfer: {
                radius: height * 0.2
            },
            density: 0.0005,
            restitution: 0,
            friction: 1,
            label: 'carBody',
        });

    var wheelA = Bodies.circle(xx + wheelAOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 1,
        restitution: 0
    });
                
    var wheelB = Bodies.circle(xx + wheelBOffset, yy + wheelYOffset, wheelSize, {
        collisionFilter: {
            group: group
        },
        friction: 1,
        restitution: 0
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
    
    var pyramid = Composites.pyramid(xx-width/2, 480, 4, 4, 0, 0, function(x, y) {
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
    this.composites = Composites.enemyCar(spawnX, spawnY, 120 * Common.random(carScaleMin, carScaleMax), 20 * Common.random(carScaleMin, carScaleMax), 12 * Common.random(carScaleMin, carScaleMax));
    World.add(engine.world, this.composites);
  }
}

var cars = [
  new Car(spawnX, spawnY, 80, 10, 12)
]


function advanceCar(car, index){
  Body.setAngularVelocity(car.composites.bodies[1], -0.5);
}

Events.on(engine, 'afterUpdate', function() {
    if (mouseConstraint.mouse.button === -1 && (rock.body.position.x > 131 || rock.body.position.y < 430)) {
        rock = new Rock(towerX  , 450, 20, 12);
        World.add(engine.world, rock.body);
        elastic.bodyB = rock.body;
        // setTimeout(function(){
        //     World.remove(engine.world, [rocks[1].body]);
        //     rocks.pop();
        // },5000);
    }
    
    cars.forEach(advanceCar);

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
  //console.log('add car')
  cars.push(new Car(spawnX, spawnY, 80, 10, 12))
  // if (cars.length <= 5){
  //   cars.push(new Car(spawnX, spawnY, 80, 10, 12));
  // }
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
          // setTimeout(function(){
          //     World.remove(engine.world, composite.bodies, true);
          //     cars.splice(index, 1);
              
          // },500);
        }
      });
      
      
    });
    
  });
}


Matter.Events.on(engine, 'collisionStart', function(event) {
  //console.log(cars.length)
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
        //   var forceMagnitude = 15.6;
        //   console.log("go", pair.bodyB, forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1])
        //   //pair.bodyB.isStatic = true;
        

        // Body.applyForce(pair.bodyB, {x: pair.bodyB.position.x, y: pair.bodyB.position.y}, {
        //     x: (forceMagnitude + Common.random() * forceMagnitude) * Common.choose([1, -1]),
        //     y: -forceMagnitude + Common.random() * -forceMagnitude
        // });
          
          
          
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
        //console.log(pair.bodyB.id)
        //World.remove(engine.world, pair.bodyB, true);
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
    max: { x: 800, y: 600 }
});

 

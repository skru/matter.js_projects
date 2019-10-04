var Engine = Matter.Engine,
    //Render = Matter.Render,
    //Runner = Matter.Runner,
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
//console.log("can width", canvasWidth)
// create engine
// var engine = Engine.create(),
//     world = engine.world;

// create renderer
// var render = Render.create({
//     element: document.body,
//     engine: engine,
//     options: {
//         width: canvasWidth,
//         height: canvasHeight,
//         background: '#0f0f13',
//         showAngleIndicator: false,
//         wireframes: false
//     }
// });

// Render.run(render);

// // create runner
// var runner = Runner.create();
// Runner.run(runner, engine);


var spawnX = canvasWidth - 200,
    spawnY = ((canvasHeight/8) * 7) -5,
    spawnY2 = (canvasHeight/16) * 11 -5,
    spawnRate = 2, //2000
    carSpeed = -0.5, //02
    towerX = canvasWidth/8,
    towerY = (canvasHeight/4) * 3,
    carScaleMin = 0.4,
    carScaleMax = 0.8;

var spawns = []

var rock;
var ground;
var tower;
var anchor;
var cars = []; 
var rocks = [];
var boundaries = [];
  
var score = 0







// // keep the mouse in sync with rendering
// render.mouse = mouse;

// // fit the render viewport to the scene
// Render.lookAt(render, {
//     min: { x: 0, y: 0 },
//     max: { x: canvasWidth, y: canvasHeight }
// });





// window.addEventListener("resize", function(){
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// });

 function mousePressed() {
  if (mouseX > 0 && mouseX < 100 && mouseY > 0 && mouseY < 100) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

function setup() {
  var canvas = createCanvas(canvasWidth, canvasHeight);
  engine = Engine.create();
  world = engine.world;
  spawns = [spawnY, spawnY2]

  // create level

  rock = new Rock(towerX, towerY, 20, canvasWidth/64);
  ground = new Boundary(0, (canvasHeight/16) * 15, canvasWidth*4, canvasHeight/16, { isStatic: true, label: 'ground'});
  ground2 = new Boundary(canvasWidth, (canvasHeight/16) * 12, canvasWidth*1, canvasHeight/64, { isStatic: true, label: 'ground'});
  tower = new Boundary(towerX, towerY + (canvasHeight/8), 5, (canvasHeight/8), { isStatic: true, label: 'tower'});

  anchor = { x: towerX, y: towerY };
  elastic = Constraint.create({
      pointA: anchor,
      bodyB: rock.body,
      stiffness: 0.05
  });

  World.add(engine.world, elastic);


  // add mouse control
  var mouse = Mouse.create(canvas.elt),
      mouseConstraint = MouseConstraint.create(engine, {
          mouse: mouse,
          constraint: {
              stiffness: 0.2,
              render: {
                  visible: true
              }
          }
      });
  mouse.pixelRatio = pixelDensity(); // hdpi disply fix?

  World.add(engine.world, mouseConstraint);


  function advanceCar(car, index){
    Body.setAngularVelocity(car.composites.bodies[1], carSpeed);
  }

  Events.on(engine, 'beforeUpdate', function() {
      cars.forEach(advanceCar);
  });

  Events.on(engine, 'afterUpdate', function() {
    //console.log("mouse")
    // if (mouseConstraint.mouse.button === -1){
    //   console.log('pressee')
    // }
      if (mouseConstraint.mouse.button === -1 && 
        (rock.body.position.x > (towerX + 5 ) )) {
          
          rock = new Rock(towerX, towerY, 20, canvasWidth/64);
          elastic.bodyB = rock.body;
          // setTimeout(function(){
          //     World.remove(engine.world, rock.body);
          //     rocks.unshift();
          // },50);
          
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
    if (allowspawn) {
      cars.push(new Car(
        spawnX, 
        spawns[Common.choose([0, 1])],
        (canvasWidth/10) * Common.random(carScaleMin, carScaleMax), 
        (canvasWidth/40) * Common.random(carScaleMin, carScaleMax), 
        (canvasWidth/72) * Common.random(carScaleMin, carScaleMax),
        (canvasWidth/72) * Common.random(carScaleMin, carScaleMax)*Common.random(1,1.5)
        ))

    }
    

  }

  requestInterval(addCars, spawnRate)

  function removeCar(body){
    for( var i = 0; i < cars.length; i++){ 
       if ( cars[i].composites === body.composite.container.composites) {
         cars.splice(i, 1); 
         i--;
       }
    }
    World.remove(engine.world, body.composite, true);
  }


  Matter.Events.on(engine, 'collisionStart', function(event) {
      let pairs = event.pairs;
      //console.log(pairs)
      pairs.forEach(function(pair) {
        
        // rock collides with ground
        if (pair.bodyA.label === 'rock' && pair.bodyB.label === 'ground'){
          pair.bodyA.container.remove();
        }
        if (pair.bodyA.label === 'ground' && pair.bodyB.label === 'rock'){
          pair.bodyB.container.remove();
          
        }

        // enemy collides with ground or tower
        if (pair.bodyA.label === 'ground' && pair.bodyB.label === 'enemy'){
          setTimeout(function(){
              World.remove(engine.world, pair.bodyB, true);
          },250);
        } 
        if (pair.bodyA.label === 'tower' && pair.bodyB.label === 'enemy'){
          //console.log(pair.bodyB)
          if (pair.bodyB.composite.container.good){
            score += 1;
          } else {
            score -= 1;
          }
          
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
              //console.log("car collide", pair.bodyB)
              //console.log(pair.bodyB.composite.container);
              pair.bodyB.composite.container.remove()
        }
       
      });
  });
}

// function mousePressed() {
//   boxes.push(new Box(mouseX, mouseY, random(10, 40), random(10, 40)));
// }

function draw() {
//console.log(cars)

  background(255);
  Engine.update(engine);
  //console.log(rock)
  //rock.show();
  textSize(32);
  var scoreText = "SCORE: " + score;
  text(scoreText, 10, 100);

  for (var i = 0; i < rocks.length; i++) {
    if (!rocks[i].isOffScreen()){
      rocks[i].show();
    }
    
  }

  for (var i = 0; i < boundaries.length; i++) {
    boundaries[i].show();
  }

  for (var i = 0; i < cars.length; i++) {
    //console.log(cars[i])
    // if (cars[i].bodies.length > 0){ // hack, see below in removeCar
       cars[i].show();
       //console.log(cars[i].damage)
    // }
  }




}

// https://stackoverflow.com/questions/26271868/is-there-a-simpler-way-to-implement-a-probability-function-in-javascript?lq=1
var probability = function(n) {
     return !!n && Math.random() <= n;
};
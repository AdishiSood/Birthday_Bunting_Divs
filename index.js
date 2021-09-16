const {
  Engine,
  Render,
  Runner,
  World,
  Bodies,
  Events,
  Composites,
  Composite,
  Constraint,
  Body
} = Matter;

function createRope(line, pos, world, group, linkWidth, flagWidth) {
  let links = 0;
  const drop = 150;

  line.split("").forEach((letter) => {
    const d = document.createElement("div");
    d.classList.add("link");
    document.body.appendChild(d);

    const l = document.createElement("div");
    l.classList.add("flag");
    l.innerText = letter;
    document.body.appendChild(l);
    links += 2;
  });

  const d = document.createElement("div");
  d.classList.add("link");
  document.body.appendChild(d);
  links++;

  const ropeA = Composites.stack(
    100,
    100 + pos * drop,
    links,
    1,
    0,
    0,
    function (x, y, index) {
      return index % 2 === 0
        ? Bodies.rectangle(
            100 + index * ((linkWidth + flagWidth) * 0.5),
            y,
            linkWidth,
            linkWidth * 0.2,
            {
              collisionFilter: { group: group }
            }
          )
        : Bodies.rectangle(
            100 + index * ((linkWidth + flagWidth) * 0.5),
            y,
            flagWidth,
            60,
            {
              collisionFilter: { group: group }
            }
          );
    }
  );

  Composites.chain(ropeA, 0.5, -0.25, -0.5, -0.25, {
    length: 5,
    render: { type: "line" }
  });

  Composite.add(
    ropeA,
    Constraint.create({
      bodyB: ropeA.bodies[0],
      pointB: { x: -linkWidth * 0.5, y: -linkWidth * 0.1 },
      pointA: {
        x: ropeA.bodies[0].position.x - linkWidth * 0.5,
        y:
          pos * 25 +
          (pos % 2 === 0 ? 0 : drop) +
          ropeA.bodies[0].position.y -
          linkWidth * 0.1
      }, //world
      length: 1,
      stiffness: 0.8
    })
  );

  Composite.add(
    ropeA,
    Constraint.create({
      bodyB: ropeA.bodies[links - 1],
      pointB: { x: linkWidth * 0.5, y: -linkWidth * 0.1 },
      pointA: {
        x: ropeA.bodies[links - 1].position.x + linkWidth * 0.5,
        y:
          pos * 25 +
          (pos % 2 === 0 ? drop : 0) +
          ropeA.bodies[links - 1].position.y -
          linkWidth * 0.1
      },
      length: 1,
      stiffness: 0.8
    })
  );

  Composite.add(world, [ropeA]);

  return ropeA.bodies;
}

const lines = ["HAPPY", "BIRTHDAY"];;

const width = window.innerWidth;
const height = window.innerHeight;

const engine = Engine.create();
const world = engine.world;
const runner = Runner.create();

Runner.run(runner, engine);

const linkWidth = 30;
const flagWidth = 60;

const group = Body.nextGroup(true);

const bodies = [];
lines.forEach((line, index) => {
  bodies.push(...createRope(line, index, world, group, linkWidth, flagWidth));
});

const flags = document.querySelectorAll("div");

Events.on(runner, "afterTick", () => {
  let base = 0;
  lines.forEach((line) => {
    for (let x = 0; x < line.length * 2; x += 2) {
      let body = bodies[base + x];
      flags[base + x].style.transform = `translateY(${
        body.position.y - 30 * 0.1
      }px) translateX(${body.position.x - 30}px) rotate(${body.angle}rad)`;
      body = bodies[base + x + 1];
      flags[base + x + 1].style.transform = `translateY(${
        body.position.y - 30
      }px) translateX(${body.position.x - 30}px) rotate(${body.angle}rad)`;
    }

    let body = bodies[base + line.length * 2];
    flags[base + line.length * 2].style.transform = `translateY(${
      body.position.y - 30 * 0.1
    }px) translateX(${body.position.x - 30}px) rotate(${body.angle}rad)`;

    base += line.length * 2 + 1;
  });
});

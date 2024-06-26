let pent = []
let n = 5
let h = 600
let w = h + 200
let pentCheckboxes = []
let earsCheckboxes = []
let showNumbers
let skipAngle
let inputN
let xOff = 0
let yOff = 0
let zoom = 1
let state = 0


function setup() {
  inputN = createInput("5", "number")
  inputN.position(830, 30)
  inputN.changed(initPoly)

  showNumbers = createCheckbox("showNumbers")
  showNumbers.position(830, 60);
  skipAngle = createCheckbox("skipAngle")
  skipAngle.position(830, 80);



  createCanvas(w, h)
  initPoly()
}

function initPoly(newN) {
  if (pentCheckboxes.length > 0) {
    for (let i = pentCheckboxes.length - 1; i >= 0; i--) {
      pentCheckboxes[i].remove()
      pentCheckboxes.splice(i)
    }
    for (let i = earsCheckboxes.length - 1; i >= 0; i--) {
      earsCheckboxes[i].remove()
      earsCheckboxes.splice(i)
    }
    for (let i = pent.length - 1; i >= 0; i--) {
      pent.splice(i)
    }
  }
  n = inputN.value()


  for (let i = 0; i < n - 1; i++) {
    pentCheckboxes.push(createCheckbox("Poly " + i))
    pentCheckboxes[i].position(830, 100 + i * 20);

    if (i < n - 2) {
      earsCheckboxes.push(createCheckbox("Ears " + i))
      earsCheckboxes[i].position(920, 100 + i * 20);
    }
  }
  pentCheckboxes[0].checked(true)



  for (let i = 0; i < n; i++) {
    pent.push(createVector(
      200 + Math.round(Math.random() * (w - 500)),
      200 + Math.round(Math.random() * (h - 500))
    ))
  }

  state = 0

}
function getNext(p, a) {
  let res = []
  let ears = []
  for (let i = 0; i < n; i++) {
    let p1 = p[i]
    let p2 = p[(i + 1) % n]
    let v
    let dHalf = dist(p1.x, p1.y, p2.x, p2.y) / 2
    v = createVector(p2.x - p1.x, p2.y - p1.y)
    let len = dHalf / Math.cos(a)
    v = p5.Vector.fromAngle(v.heading() - a)
    v.setMag(len)
    v.add(p1)

    ears.push({
      x1: p1.x,
      y1: p1.y,
      x2: v.x,
      y2: v.y,
    })
    ears.push({
      x1: p2.x,
      y1: p2.y,
      x2: v.x,
      y2: v.y,
    })
    res.push(v)
  }
  return { pent: res, ears: ears }
}

function checkPent(p) {
  let sss = ""
  for (let i = 0; i < n; i++) {
    let p1 = p[i]
    let p2 = p[(i + 1) % 5]
    let d = dist(p1.x, p1.y, p2.x, p2.y)
    d = Math.abs(Math.round(d * 1000) / 1000)
    sss += "|" + d
  }
  return sss
}

function draw() {
  translate(xOff, yOff)
  scale(zoom)
  let textYOff = 0

  if (pentCheckboxes.length < 2)
    return

  background(0)
  noFill()
  colorMode(HSB)

  stroke(0, 100, 100)
  if (pentCheckboxes[0].checked()) {
    drawPent(pent, textYOff)
    textYOff += 20
  }
  let n1 = { pent: pent }
  for (let i = 1; i < n - 1; i++) {
    j = i
    if (i == 2 && skipAngle.checked())
      j = n - 1
    n1 = getNext(n1.pent, Math.PI * (180 - j * (360 / n)) / 360)
    if (earsCheckboxes[i - 1].checked())
      drawEars(n1.ears)

    stroke(i * (360 / n), 100, 100)
    if (pentCheckboxes[i].checked()) {
      drawPent(n1.pent, textYOff)
      textYOff += 20
    }
  }
}
function drawPent(p, textYOff) {
  strokeWeight(3)
  beginShape()
  for (let v of p)
    vertex(v.x, v.y)
  endShape(CLOSE)


  if (showNumbers.checked()) {
    strokeWeight(1)
    let sss = checkPent(p)
    text(sss, 50, 450 + textYOff)
  }

}
function drawEars(e) {
  strokeWeight(0.5)

  for (let v of e)
    line(v.x1, v.y1, v.x2, v.y2)

}
let oldX
let oldY
function mouseDragged() {
  let min = 20
  let res
  let relX = mouseX - xOff
  let relY = mouseY - yOff
  for (let p of pent) {
    let d = Math.pow(Math.pow(relX - p.x, 2) + Math.pow(relY - p.y, 2), 0.5)
    if (d < min) {
      min = d
      res = p
    }
  }
  if (res) {
    res.x = mouseX - xOff
    res.y = mouseY - yOff
  }
  else {
    if (!oldX) {
      oldX = mouseX
      oldY = mouseY
    }
    xOff -= oldX - mouseX
    yOff -= oldY - mouseY

    oldX = mouseX
    oldY = mouseY

  }

}
function mouseReleased() {
  oldX = null
  oldY = null
}

function mouseWheel(event) {
  // if (event.delta > 0) {
  //   zoom *= 1.1
  // } else {
  //   zoom /= 1.1
  // }

  if (event.delta > 0)
    iterateSteps()
}


function iterateSteps() {
  if (state > (n - 2) * 3) {
    for (let p of pentCheckboxes)
      p.checked(true)
    for (let p of earsCheckboxes)
      p.checked(true)
    state = 0
    return

  }

  for (let p of pentCheckboxes)
    p.checked(false)
  for (let p of earsCheckboxes)
    p.checked(false)


  let p1 = Math.floor(state / 3)
  pentCheckboxes[p1].checked(true)
  if (state % 3 == 2)
    pentCheckboxes[(state + 1) / 3].checked(true)
  if (state % 3 != 0) {

    p1 = Math.floor(state / 3)
    earsCheckboxes[p1].checked(true)
  }
  console.log("iter", state)
  state++
}


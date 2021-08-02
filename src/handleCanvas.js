import getCanvasDpr from './utils/getCanvasDpr'

function handleCanvas(canvas, mainColor) {
  const { PI, sin, cos, acos, atan2 } = Math
  const TAU = 2 * PI

  const _ = canvas.getContext('2d')

  const dpr = getCanvasDpr(_)

  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr

  canvas.style.width = `${window.innerWidth}px`
  canvas.style.height = `${window.innerHeight}px`

  const width = window.innerWidth
  const height = window.innerHeight

  _.scale(dpr, dpr)

  /* ---
    Data
  --- */

  const center = {
    x: width / 4,
    y: height / 2,
  }

  const right = {
    x: 1,
    y: 0,
  }

  const upRight = {
    x: Math.sqrt(2) / 2,
    y: -Math.sqrt(2) / 2,
  }

  const amplitudeScaleFactor = 256
  const waveLengthScaleFactor = 1 / 64
  const tickPeriod = 1000
  const maxSegments = 4
  const timeDilatation = 1 / 64
  const tickSpeed = 1 / 16
  const sinusoidalComplexity = 32

  const blue = '#2196f3'

  const state = {
    sinusoidals: [createSinusoidal()],
  }

  /* ---
    Update
  --- */

  let time = Date.now()

  function update() {
    const now = Date.now()
    const deltaTime = (now - time) * tickSpeed

    time = now

    state.sinusoidals.forEach(sinusoidal => {
      if (sinusoidal.cursor >= tickPeriod) {
        sinusoidal.segments.shift()
        sinusoidal.segments.push(createSinusoidalSegment(tickPeriod, sinusoidal.frequency))

        sinusoidal.cursor = 0
      }

      sinusoidal.cursor += deltaTime
    })
  }

  /* ---
    Draw
  --- */

  function draw() {
    _.clearRect(0, 0, width, height)

    drawCircle(center, 128)
    drawSinusoidal(state.sinusoidals[0], center, right)
  }

  function drawCircle(pos, radius, color = blue) {
    _.beginPath()
    _.arc(pos.x, pos.y, radius, 0, TAU, true)
    _.closePath()
    _.strokeStyle = color
    _.stroke()
  }

  function drawSinusoidal(sinusoidal, origin, direction, color = blue) {
    // const normalClockWise = rotateVector(direction, -PI / 2)
    const angle = getVectorsAngle(right, direction)
    let timeCursor = 0

    _.strokeStyle = color
    _.beginPath()
    _.moveTo(origin.x, origin.y)

    sinusoidal.segments.forEach(({ period, frequency, nodes }, i) => {
      const f = t => sinusoidal.amplitude / nodes.length * nodes.reduce((acc, node, n) => acc + node.coef * sin(n * t * timeDilatation + node.phase), 0)

      const t0 = i === 0 ? sinusoidal.cursor : 0

      for (let t = t0; t < period; t++) {
        const p = sumVectors(origin, rotateVector({
          x: waveLengthScaleFactor * (timeCursor + t - t0) / frequency,
          y: amplitudeScaleFactor * f(t),
        }, angle))

        _.lineTo(p.x, p.y)
      }

      timeCursor += period - t0
    })

    _.stroke()
  }

  /* ---
    Data structures
  --- */

  function createSinusoidal(frequency = 16 / tickPeriod, amplitude = 1) {
    const sinusoidal = {
      amplitude,
      frequency,
      cursor: 0,
      segments: [],
    }

    for (let i = 0; i < maxSegments; i++) {
      sinusoidal.segments.push(createSinusoidalSegment(tickPeriod, frequency))
    }

    return sinusoidal
  }

  function createSinusoidalSegment(period, frequency) {
    const nodes = []

    for (let i = 0; i < sinusoidalComplexity; i++) {
      nodes.push({
        coef: Math.random(),
        phase: TAU * Math.random(),
      })
    }

    return {
      period,
      frequency,
      nodes,
    }
  }

  /* ---
    Utils
  --- */

  function multiplyMatrixes(a, b) {
    const result = []

    for (let r = 0; r < a.length; r++) {
      const row = []

      for (let c = 0; c < b[0].length; c++) {
        let sum = 0

        for (let k = 0; k < b.length; k++) {
          sum += a[r][k] * b[k][c]
        }

        row.push(sum)
      }

      result.push(row)
    }

    return result
  }

  // function rotateVector(vector, angle) {
  //   const matrix = multiplyMatrixes(
  //     [
  //       [cos(angle), -sin(angle)],
  //       [sin(angle), cos(angle)],
  //     ],
  //     [[vector.x], [vector.y]]
  //   )

  //   return {
  //     x: matrix[0][0],
  //     y: matrix[1][0],
  //   }
  // }

  function rotateVector(vector, angle) {
    return {
      x: vector.x * cos(angle) - vector.y * sin(angle),
      y: vector.x * sin(angle) + vector.y * cos(angle),
    }
  }

  function sumVectors(a, b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
    }
  }

  function getVectorNorm(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y)
  }

  // θ = arccos ( a.b / |a| . |b| )
  function getVectorsAngle(a, b) {
    return atan2(b.y, b.x) - atan2(a.y, a.x)
    // return acos((a.x * b.x + a.y * b.y) / (Math.sqrt(a.x * a.x + a.y * a.y) * Math.sqrt(b.x * b.x + b.y * b.y)))
  }

  /* ---
    Loop
  --- */

  let stopped = false

  function tick() {
    update()
    draw()

    if (stopped) return

    window.requestAnimationFrame(tick)
  }

  window.requestAnimationFrame(tick)

  return () => stopped = true
}

export default handleCanvas

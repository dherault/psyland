import getCanvasDpr from './utils/getCanvasDpr'

function handleCanvas(canvas, mainColor) {
  const { PI, sin, cos, acos } = Math
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
    x: width / 2,
    y: height / 2,
  }

  const right = {
    x: 1,
    y: 0,
  }

  const upRight = {
    x: Math.sqrt(2) / 2,
    y: Math.sqrt(2) / 2,
  }

  const amplitudeScaleFactor = 64
  const waveLengthScaleFactor = 64 * 1024

  const blue = '#2196f3'

  const state = {
    sinusoidals: [createSinusoidal()],
  }

  /* ---
    Update
  --- */

  function update() {
    state.sinusoidals.forEach(sinusoidal => {
      if (sinusoidal.cursor % sinusoidal.frequency === 0) {
        sinusoidal.segments.unshift(1 / sinusoidal.frequency)
      }

      sinusoidal.cursor++
    })
  }

  /* ---
    Draw
  --- */

  function draw() {
    _.clearRect(0, 0, width, height)

    drawCircle(center, 128)
    drawSinusoidal(state.sinusoidals[0], center, upRight)
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

    console.log('angle', angle * 360 / TAU)
    const cursor = { ...origin }

    sinusoidal.segments.forEach(waveLength => {
      const halfAdjustedAmplitude = sinusoidal.amplitude * amplitudeScaleFactor / 2
      const quarterAdjustedWaveLength = waveLength * waveLengthScaleFactor / 4

      const p1 = {
        x: halfAdjustedAmplitude,
        y: quarterAdjustedWaveLength,
      }

      const p2 = {
        x: 0,
        y: 2 * quarterAdjustedWaveLength,
      }

      const p3 = {
        x: -halfAdjustedAmplitude,
        y: 3 * quarterAdjustedWaveLength,
      }

      const p4 = {
        x: 0,
        y: 4 * quarterAdjustedWaveLength,
      }
    })

    // console.log('normasl', start)
  }

  /* ---
    Data structures
  --- */

  function createSinusoidal(frequency = 1024, amplitude = 1) {
    return {
      amplitude,
      frequency,
      cursor: 0,
      segments: [],
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

  function rotateVector(vector, angle) {
    const matrix = multiplyMatrixes(
      [
        [cos(angle), -sin(angle)],
        [sin(angle), cos(angle)],
      ],
      [[vector.x], [vector.y]]
    )

    return {
      x: matrix[0][0],
      y: matrix[1][0],
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
    return acos((a.x * b.x + a.y * b.y) / (Math.sqrt(a.x * a.x + a.y * a.y) * Math.sqrt(b.x * b.x + b.y * b.y)))
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

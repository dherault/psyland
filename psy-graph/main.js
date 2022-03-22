const allGlyphs = 'abcdefghijkl'

const containerElement = document.getElementById('container')

const chance = x => Math.random() < x
const pick = array => Array.isArray(array) ? array[Math.floor(Math.random() * array.length)] : pick([...array])

function main() {
  let tick = 0
  let individualIdCounter = 0
  const individuals = {}

  function createIndividual(fatherId = null) {
    const individual = {
      id: (++individualIdCounter),
      glyphs: new Set(fatherId ? [pick(individuals[fatherId].glyphs)] : [pick(allGlyphs)]),
      fatherId,
      connections: new Set(fatherId ? [fatherId] : []),
      thread: [],
      createdAt: tick,
    }

    individuals[individual.id] = individual

    return individual
  }

  function draw() {
    containerElement.textContent = `
Tick: ${tick}
Individuals: ${Object.keys(individuals).length}

${Object.values(individuals).map(individual => `
${individual.id} - f: ${individual.fatherId} - g: ${individual.glyphs.size} - c: ${individual.connections.size} ::: ${individual.thread.slice(-24).join('')}
`).join('')}
`
  }

  function iterate() {
    const indivualIds = Object.keys(individuals)

    if (chance(0.25 / 12)) {
      createIndividual(pick(indivualIds) || null)
    }

    indivualIds.forEach(id => {
      updateIndividual(individuals[id])
    })

    draw()
  }

  function updateIndividual(individual) {
    const { glyphs, connections, thread, fatherId } = individual

    if (!connections.length || chance(0.75)) {
      thread.push(pick(glyphs))
    }
    else {
      const connectionGlyphs = connections.map(id => [...individuals[id].glyphs]).flat()

      thread.push(pick(connectionGlyphs))
    }

    if ((!fatherId || connections.size < individuals[fatherId].connections.size - 1) && chance((1 - individual.createdAt / tick) / 12)) {
      connections.add(pick(Object.keys(individuals)))
    }

    if ((!fatherId || glyphs.size < individuals[fatherId].glyphs.size - 1) && chance((1 - individual.createdAt / tick) / 12 / 12)) {
      glyphs.add(pick(allGlyphs))
    }
  }

  function loop() {
    tick++
    iterate()
    requestAnimationFrame(loop)
  }

  loop()
}

main()

import { useEffect, useRef } from 'react'

import handleCanvas from './handleCanvas'

function App() {
  const canvasRef = useRef()

  useEffect(() => handleCanvas(canvasRef.current), [])

  return (
    <canvas ref={canvasRef} />
  )
}

export default App

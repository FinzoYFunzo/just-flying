import './Image.css'
import { useEffect, useRef, useState } from 'react'
import { getColorSync } from 'colorthief'

export function Image({ visible, src, id }: { visible: number, src: string | undefined, id: number }) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [color, setColor] = useState('transparent')

  useEffect(() => {
    const img = imgRef.current
    if (!img || !src) return

    function handleLoad() {
      try {
        const currentImg = imgRef.current
        if (!currentImg) return

        const result = getColorSync(currentImg)

        if (!result) {
          setColor('transparent')
          return
        }

        if (Array.isArray(result) && result.length >= 3) {
          const [r, g, b] = result
          setColor(`rgb(${r}, ${g}, ${b})`)
          return
        }

        if (typeof (result as { hex?: () => string }).hex === 'function') {
          setColor((result as { hex: () => string }).hex())
          return
        }

        setColor('transparent')
      } catch (e) {
        console.error('Error obteniendo color:', e)
      }
    }

    if (img.complete) {
      handleLoad()
    } else {
      img.addEventListener('load', handleLoad)
    }

    return () => img.removeEventListener('load', handleLoad)
  }, [src])

  return (
    <div
      className='image-container'
      style={{
        backgroundColor: color,
        opacity: visible
      }}
    >
      <img
        ref={imgRef}
        className='image-src'
        id={`image-${id}`}
        src={src}
        crossOrigin='anonymous'
      />
    </div>
  )
}


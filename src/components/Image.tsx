import './Image.css'
import { useEffect, useRef, useState } from 'react'
import { FastAverageColor } from 'fast-average-color';
const fac = new FastAverageColor();

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

        fac.getColorAsync(img).then((color) => {
          setColor(color.hex)
        })

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


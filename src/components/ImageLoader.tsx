import "./ImageLoader.css"
import { useEffect, useRef, useState } from 'react'
import { appConfig } from '../helpers/utils.js'
import * as utils from '../helpers/utils.js'
import * as unsplash from '../helpers/unsplash-api.js'
import { Image } from './Image.js'
import Controller from './Controller.js'
import store from 'store2'
import { MusicPlayer } from "./MusicPlayer.js"

const API_PLACEHOLDER = import.meta.env.VITE_API_PLACEHOLDER === "true";
const URL_PLACEHOLDER = ["https://images.unsplash.com/photo-1563216368-5b6a40648062?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3Mjk4NTF8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkxNDg1NzB8&ixlib=rb-4.1.0&q=85", "https://images.unsplash.com/photo-1777979513826-bf31dc7ca628?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"]

// WARN: restara los valores por defecto en cada sesion
// eliminar esta linea para mantener persistencia
if (!store.size()) utils.defaultConfig();
let apiIndex: number = 0;

function ImageLoader() {
  const [imageSrc, setImageSrc] = useState<Array<string>>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [touchInterval, setTouchInterval] = useState(0);
  const [loading, setLoading] = useState(false);

  function switcher(): void {
    setActiveImage(prev => 1 - prev);
  }

  let unsplashApis: Array<Record<string, any>> = unsplash.unsplashApiParser(appConfig.get("API_keys"));
  let unsplashSingleApi: Record<string, any>;


  // Cambia la imagen con id imageId
  // WARN: la funcion es `async` solo por el PLACEHOLDER, no es necesario de otro modo
  async function changeImage(imageId: number): Promise<void> {
    const options: Record<string, string> = utils.parseOptions() || {}; // leemos localStorage
    ({ unsplashSingleApi, apiIndex } = unsplash.getUnsplash(unsplashApis, apiIndex)); // obtenemos una api de la lista

    if (API_PLACEHOLDER) {
      setImageSrc(prev => {
        const newSrc: Array<string> = [...prev];
        newSrc[imageId] = URL_PLACEHOLDER[imageId]
        return newSrc;
      });
      return
    }

    return unsplash.fetchImage(unsplashSingleApi, options)
      .then(async (res: any) => {
        const url: string = res.response[0].urls.full

        setImageSrc(prev => {
          const newSrc: Array<string> = [...prev];
          newSrc[imageId] = url
          return newSrc;
        });

      })
      .catch(() => {
        console.log("error en change Image")
      })
  }

  function setLoadInterval(interval: number) {
    return setInterval(() => {
      switcher();
    }, interval * 1000)
  }

  // solo para actuaizar el useState que depende de touchInterval
  function touch() {
    changeImage(1 - activeImage)
    setTouchInterval(prev => prev + 1)
  }

  // init
  useEffect(() => {
    changeImage(0);
    changeImage(1);
  }, [])

  // interval logic
  useEffect(() => {
    const interval: NodeJS.Timeout = setLoadInterval(appConfig.get("interval"))

    return () => {
      clearInterval(interval)
      setLoading(true)
      changeImage(1 - activeImage).then(() => { setLoading(false) })
    }
  }, [touchInterval])

  // para no ejecutar al montar
  let isMounted = useRef(false);

  // reload hidden image on switch
  useEffect(() => {
    if (isMounted.current) {
      setTimeout(() => {
        changeImage(1 - activeImage); // load hidden image
      }, 3000);
    }
    else {
      isMounted.current = true;
    }
  }, [activeImage])

  return (
    <>
      <Image
        visible={1 - activeImage}
        id={0}
        src={imageSrc[0]}
      />
      <Image
        visible={activeImage}
        id={1}
        src={imageSrc[1]}
      />
      <Controller callback={touch} loading={loading} />
      <MusicPlayer />
      <div className='preload-screen' style={{ display: (imageSrc[0] != undefined && imageSrc[1] != undefined) ? "none" : "inherit" }}>
        <p>Loading...</p>
        <p>Make sure to introduce your unsplash API keys</p>
      </div >
    </>
  )
}

export default ImageLoader

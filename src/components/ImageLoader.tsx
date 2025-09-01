import { useEffect, useRef, useState } from 'react'
import { appConfig} from '../helpers/utils.js'
import * as utils from '../helpers/utils.js'
import * as unsplash from '../helpers/unsplash-api.js'
import { Image } from './Image.js'
import Controller from './Controller.js'
import store from 'store2'
import { FastAverageColor } from 'fast-average-color'

const fac = new FastAverageColor();

interface imageSrc {
  url: string
  color: string
}
// restara los valores por defecto en cada sesion
// eliminar esta linea para mantener persistencia
if (!store.size()) utils.defaultConfig();


function ImageLoader() {
  const [imageSrc, setImageSrc] = useState<Array<imageSrc>>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [touchInterval, setTouchInterval] = useState(0);
  
  function switcher (): void {
    setActiveImage(prev => 1 - prev);
  }

  let unsplashApis: Array<Record<string, any>> = unsplash.unsplashApiParser(appConfig.get("API_keys"));
  let apiIndex: number = 0;
  let unsplashSingleApi: Record<string, any>;


  // Cambia la imagen que NO se esta mostrando
  function changeImage(imageId: number){
    const options: Record<string, string> = utils.parseOptions() || {}; // leemos localStorage
    ({ unsplashSingleApi, apiIndex } = unsplash.getUnsplash(unsplashApis, apiIndex)); // obtenemos una api de la lista


    unsplash.fetchImage(unsplashSingleApi, options)
      .then(async (res: any) =>{
        const url: string = res.response[0].urls.full
        const color: any = (await fac.getColorAsync(url)).hex;

        console.log(color)
        //const color = await getAverageColor(url);

        setImageSrc(prev => {
          const newSrc: Array<imageSrc> = [...prev];
          newSrc[imageId] = {
            url: url,
            color: color
          }
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
  function touch () {
    setTouchInterval(prev => prev + 1)
  }

  // init
  useEffect(() =>{
    changeImage(0);
    changeImage(1);
  }, [])

  // interval logic
  useEffect(() =>{
    const interval: NodeJS.Timeout = setLoadInterval(appConfig.get("interval"))

    return () => {
      clearInterval(interval)
      changeImage(1 - activeImage)
    }
  }, [touchInterval])

  // para no ejecutar al montar
  let isMounted = useRef(false);

  // reload hidden image on call
  useEffect(() =>{
    if (isMounted.current){
      setTimeout(()=>{
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
        src={imageSrc[0]?.url}
        color={imageSrc[0]?.color}
      />
      <Image
        visible={activeImage}
        id={1}
        src={imageSrc[1]?.url}
        color={imageSrc[1]?.color}
      />
      <Controller callback={touch}/>
      <p>Loading...</p>
      <p>Make sure to introduce your unsplash API keys</p>
    </>
  )
}

export default ImageLoader
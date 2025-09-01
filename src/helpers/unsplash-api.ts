import { createApi } from "unsplash-js"

export function fetchImage (unsplash: Record<string, any>, options: Record<string, string>): Promise<Object> {
  return unsplash.photos.getRandom(options)
  .catch((e: Error) =>{
    console.log(e)
  })
}

// Retorna todas las apis luego de ser procesadas por createApi
export function unsplashApiParser (apiKeys: Array<string> | []): Array<Record<string,any>> {
  return apiKeys.map((key) => {
    return createApi({ accessKey: key });
  });
}

export function getUnsplash (UAs: Array<Record<string, any>>, apiIndex: number) {
  return {
    unsplashSingleApi: UAs[apiIndex],
    apiIndex: (apiIndex == (UAs.length - 1)) ? 0 : apiIndex + 1
  }
}

export function unsplashFetchRandom (
  unsplash: Record<string, any>,
  options: Record<string, string>,
): Promise<string> {
  return fetchImage(unsplash, options)
  .then((res: any) =>{
    return res.response[0].urls.full
  })
  .catch((e) => {
    throw e;
  })
}

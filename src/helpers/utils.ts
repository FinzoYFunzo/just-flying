import store, { type StoreType } from 'store2'
//import { getAverageColor } from 'fast-average-color-node';

export interface appConfig {
  API_keys: Array<string>;
  interval: number;
  [key: string]: any;
}

export interface searchOptions {
  search_by: string;
  query?: string;
  topics?: string;
  collections?: string;
  [key: string]: any;
}

export interface settings {
  orientation: string;
  content_filter: string;
  count: number;
  [key: string]: any;
}

export const Config: StoreType = store.namespace('config');
export const appConfig: StoreType = store.namespace('app_config');
export const searchOptions: StoreType = store.namespace('search_options');
export const settings: StoreType = store.namespace('settings');

/**
 * Esto define la estructura defaulta para `localStorage`
 */
export function defaultConfig (){
  const app_config = {
    API_keys: [
      ""
    ],
    interval: 30,
  };
  const search_options= {
    search_by: 'query',
    query: 'iceland',
    topics: '',
    collections: '',
  }
  const localSettings = {
    orientation: 'landscape',
    content_filter: 'low',
    count: 1
  }

  appConfig.setAll(app_config);
  searchOptions.setAll(search_options);
  settings.setAll(localSettings)
}

/**
   * Retorna los parametros listos para ser usados en la query de unsplash
   * 
   * Pensado para ser usado para `unsplash.photos.getRandom()`
*/
export function parseOptions () {
  let params: Record<string, string> = {};

  // Parsear solo la opcion a utilizar de busqueda
  const searchType: string = searchOptions.get("search_by");
  params[searchType] = searchOptions.get(searchType);

  // Copy settings
  Object.assign(params, settings.getAll());

  return params;
}

export function ApiString2Array(api: string): Array<string>{
  return api.split(',').map(key => key.trim());
}

export function ApiArray2String(api: Array<string>): string{
  return api.join(',');
}

// export function avarageColor(url: string){
//   return getAverageColor(url).then(color =>{
//     return color
//   });
// }
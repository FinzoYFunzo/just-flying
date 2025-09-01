import { Config, appConfig, searchOptions, ApiArray2String, ApiString2Array} from '../helpers/utils.js'
import './Controller.css'

function Controller({callback}: {callback: any}){
    const defaultQueryType = searchOptions.get('search_by');
    const defaultSearch = searchOptions.get(defaultQueryType);
    const defaultApiKeys = ApiArray2String(appConfig.get('API_keys'));
    const defaultInterval = appConfig.get('interval');
    
    function updateConfig (formData: FormData) {
        const queryType: string = (formData.get('queryType') as string) || ''
        searchOptions.set("search_by", queryType, true);
        searchOptions.set(queryType, formData.get('search'), true);
    
        const apiKeysArray = ApiString2Array(formData.get('apiKeys') as string)

        appConfig.set('API_keys', apiKeysArray, true);

        console.log(formData.get('interval'));

        const intervalValue = Number(formData.get('interval'));
        if (Number.isNaN(intervalValue) || intervalValue < 10){
            appConfig.set('interval', 10, true) // return default config on error
        }
        else {
            appConfig.set('interval', intervalValue, true);
        }

        callback();
    }

    return(
        <form id='controller' action={updateConfig}>
            <fieldset>
                <legend><b>Controller</b></legend>

                <span>Search Options <a className='tooltip'>?</a></span>
                <div className='field'>
                    <label>Select your query type:</label>
                    <select defaultValue={defaultQueryType} name='queryType'>
                        <option value='query'>query</option>
                        <option value='topics'>topics</option>
                        <option value='collections'>colections</option>
                    </select>
                </div>

                <div className='field'>
                    <label>What to search?</label>
                    <input
                        defaultValue={defaultSearch}
                        name='search'
                        type='text'
                    />
                </div>

                <span>Config</span>
                <div className='field'>
                    <label>API Keys from Unsplash <br></br><span className='muted'>separated by coma (,)</span></label>
                    <input
                        defaultValue={defaultApiKeys}
                        name='apiKeys'
                        type='text'
                    />
                    <label>Interval <span className='muted'>un seconds</span> </label>
                    <input
                        defaultValue={defaultInterval}
                        name='interval'
                        type='text'
                    />
                </div>

                <button type="submit" >Load</button>
            </fieldset>
        </form>
    )
}

export default Controller
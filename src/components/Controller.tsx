import { useEffect, useState } from 'react';
import { appConfig, searchOptions, ApiArray2String, ApiString2Array } from '../helpers/utils.js'
import './Controller.css'

function Controller({ callback }: { callback: any }) {
    const [queryType, setQueryType] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [apiKeys, setApiKeys] = useState<string>("");
    const [interval, setInterval] = useState<number>();

    useEffect(() => {
        setQueryType(searchOptions.get('search_by'))
        setSearchQuery(searchOptions.get(queryType));
        setApiKeys(ApiArray2String(appConfig.get('API_keys')));
        setInterval(appConfig.get('interval'));
    }, [])
    

    function updateConfig(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const queryType: string = (formData.get('queryType') as string) || ''
        const searchQuery: string = (formData.get('search') as string) || ''
        const apiKeys: string = (formData.get('apiKeys') as string)
        const apiKeysArray = ApiString2Array(apiKeys)
        const intervalValue = Number(formData.get('interval'));

        setQueryType(queryType);
        setSearchQuery(searchQuery);
        setApiKeys(apiKeys);

        searchOptions.set("search_by", queryType, true);
        searchOptions.set(queryType, searchQuery, true);
        appConfig.set('API_keys', apiKeysArray, true);

        if (Number.isNaN(intervalValue) || intervalValue < 10) {
            setInterval(10);
            appConfig.set('interval', 10, true) // return default config on error
        }
        else {
            setInterval(intervalValue)
            appConfig.set('interval', intervalValue, true);
        }

        callback();
    }

    return (
        <form id='controller' onSubmit={updateConfig}>
            <fieldset>
                <legend><b>Controller</b></legend>

                <span>Search Options <a className='tooltip'>?</a></span>
                <div className='field'>
                    <label>Select your query type:</label>
                    <select value={queryType} name='queryType' onChange={e => setQueryType(e.target.value)}>
                        <option value='query'>query</option>
                        <option value='topics'>topics</option>
                        <option value='collections'>collections</option>
                    </select>
                </div>

                <div className='field'>
                    <label>What to search?</label>
                    <input
                        defaultValue={searchQuery}
                        name='search'
                        type='text'
                    />
                </div>

                <span>Config</span>
                <div className='field'>
                    <label>API Keys from Unsplash <br></br><span className='muted'>separated by coma (,)</span></label>
                    <input
                        defaultValue={apiKeys}
                        name='apiKeys'
                        type='text'
                    />
                    <label>Interval <span className='muted'>un seconds</span> </label>
                    <input
                        defaultValue={interval}
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

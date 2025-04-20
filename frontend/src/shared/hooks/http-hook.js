import  { useState, useCallback, useRef, useEffect } from 'react'
import {  useHistory } from 'react-router-dom/cjs/react-router-dom.min';

export const useHttpClient = () =>
{
	const [ isLoading, setIsLoading ] = useState( false );
	const [ error, setError ] = useState();

	const activeHttpRequest = useRef( [] );  // WHat is it doing???

	const sendRequest = useCallback( async ( url, method = 'GET', body = null, headers = {} ) => // what is useCallBack doing
	{
		setIsLoading( true );
		const httpAbortCtrl = new AbortController(); // what is it

		activeHttpRequest.current.push( httpAbortCtrl );

		try
		{
			const response = await fetch( url, { method, body, headers, signal: httpAbortCtrl.signal } );
			const responseData = await response.json();

			activeHttpRequest.current = activeHttpRequest.current.filter( reqCtrl => reqCtrl !== httpAbortCtrl );
			if ( !response.ok )
			{
				throw new Error( responseData.message );
			}
			setIsLoading( false );
			return responseData;
		} catch ( error )
		{
			setError( error.message );
			setIsLoading( false );
			throw error;
		}
	}, [] );

	const history = useHistory();
	const clearError = () =>
	{
		setError( null );
		history.push("/")
	}

	useEffect( () =>
	{
		return () =>
		{
			activeHttpRequest.current.forEach( abortCtrl => abortCtrl.abort() );
		};
	}, [] );
	return { isLoading, error, sendRequest, clearError };
};

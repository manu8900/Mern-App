import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const activeHttpRequests = useRef([]);
    const sendRequest = useCallback(
        async (
            url,
            method = 'GET',
            body = null,
            headers = {}
        ) => {
            setIsLoading(true);
            const httpAbortControl = new AbortController();
            activeHttpRequests.current.push(httpAbortControl);
            try {
                const response = await fetch(url, {
                    method,
                    body,
                    headers,
                    signal: httpAbortControl.signal
                });
                const responseData = await response.json();
                activeHttpRequests.current = activeHttpRequests.current.filter(
                    reqCtrl => reqCtrl !== httpAbortControl
                );
                if (!response.ok) {//check if response status is not 200.
                    throw new Error(responseData.message);
                }
                setIsLoading(false);
                return responseData;
            } catch (err) {
                setError(err.message);
                throw err;
            }
        }, []);

    const clearError = () => {
        setError(null);
    }
    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
        }
    }, [])
    return { isLoading, error, sendRequest, clearError };
};
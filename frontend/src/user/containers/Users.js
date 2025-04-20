import React, { useEffect, useState } from 'react'
import UsersList from '../../user/components/UsersList';
import ErrorModal from '../../shared/components/UIElement/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElement/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
const Users = () =>
{

	const [ loadedUser, setLoadedUser ] = useState();
	const { isLoading, error, sendRequest, clearError } = useHttpClient();

	useEffect( () =>
	{
		const request = async () =>
		{
			try
			{
				const responseData = await sendRequest( `${process.env.REACT_APP_BACKEND_URL}/api/users` );
				setLoadedUser( responseData.users );
			} catch ( error )
			{}
		};
		request();
	}, [sendRequest] );



	return <>
		<ErrorModal error={ error } onClear={ clearError } />
		{isLoading && (<div className='center'><LoadingSpinner/></div>)}
		{!isLoading && loadedUser && <UsersList items={loadedUser} />}
	</>
}

export default Users;
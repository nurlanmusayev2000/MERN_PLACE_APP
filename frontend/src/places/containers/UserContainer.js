import React, {  useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ContainerList from '../components/ContainerList';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";

const UserContainer = () => {
  const { userId } = useParams();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaces, setLoadedPlaces] = useState();

const params = useParams();
console.log('from params:', params.userId);
  useEffect(() => {
    const fetchPlaces = async () =>
    {

      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/api/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();
  }, [sendRequest, userId]);


  return (
    <>
      {error && <ErrorModal error={ error } onClear={ clearError } />}
      {isLoading && <LoadingSpinner asOverlay />}
      { !isLoading && loadedPlaces && <ContainerList items={ loadedPlaces } /> }
    </>
  );
};

export default UserContainer;

import React, { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Input from '../../shared/components/FormElements/Input';
import { VALIDATOR_REQUIRE } from '../../shared/components/Validator/validators';
import Button from '../../shared/components/FormElements/Button';
import { useForm } from '../../shared/hooks/form-hook';
import Card from '../../shared/components/UIElement/Card';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElement/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElement/ErrorModal';

import './NewContainer.css';
import { AuthContext } from '../../shared/context/auth-context';

const UpdateContainer = () =>
{

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const history = useHistory();
  const auth = useContext(AuthContext);
  const [formState, InputHandler, setFormData] = useForm({
    title: { value: '', isValid: false },
    description: { value: '', isValid: false }
  }, false);

  useEffect(() => {
    const fetchPlace = async () => {

      try
      {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`
        );
        setLoadedPlace(responseData.place);

        setFormData({
          title: { value: responseData.place.title, isValid: true },
          description: { value: responseData.place.description, isValid: true }
        }, true);
      } catch (err) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async e => {
    e.preventDefault();
    console.log("insida apdate");

    try {
      await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`,
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        }),
        {
          'Content-Type': 'application/json',
          Authorization:'Bearer ' + auth.token
         }
      );
    history.push(`/${auth.userId}/places`);
    } catch (err) {}
  };

  if (isLoading) {
    return <div className='center'><LoadingSpinner asOverlay /></div>;
  }

  if (!loadedPlace && !error) {
    return (<Card>
      <h2 className='center'>Could not find the place.</h2>
    </Card>);
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className='place-form' onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title"
            initialValue={loadedPlace.title}
            initialValid={true}
            onInput={InputHandler}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid description"
            initialValue={loadedPlace.description}
            initialValid={true}
            onInput={InputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdateContainer;

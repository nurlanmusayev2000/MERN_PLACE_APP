import React, { useContext }  from "react";

import {VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from '../../shared/components/Validator/validators'
import './NewContainer.css'
import Input from "../../shared/components/FormElements/Input";
import Button from '../../shared/components/FormElements/Button'
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from "../../shared/context/auth-context";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";


const NewContainer = () =>
{
	const auth = useContext( AuthContext );
	const { isLoading, error, sendRequest, clearError } = useHttpClient();

	const [formState,InputHandler] = useForm( {
			title:{
				value: '',
				isValid: false
			},
			description:{
				value: '',
				isValid: false
			},
			address:{
				value: '',
				isValid: false
			},
			image: {
				value: null,
				isValid:false
			}



		},false)

	const history = useHistory();
	const placeSubmitHandler = async ( e ) =>
	{
		e.preventDefault();
		console.log(formState,auth.userId);
		try
		{
			const formData = new FormData();
			formData.append( 'title', formState.inputs.title.value );
			formData.append( 'description', formState.inputs.description.value );
			formData.append( 'address', formState.inputs.address.value );
			formData.append( 'creator', auth.userId );
			formData.append( 'image', formState.inputs.image.value );

			await sendRequest( `${process.env.REACT_APP_BACKEND_URL}/api/places`, 'POST', formData, {
				Authorization:'Bearer ' + auth.token
			});

			history.push( '/' );
		} catch (error) {
			console.log(error);

		}

	}


	return (
		<>
			<ErrorModal error={ error} onClear={clearError} />
		<form className="place-form" onSubmit={placeSubmitHandler}>
			{ isLoading && <LoadingSpinner asOverlay/>}
			<Input id='title' element="input" type="text" label="Title" errorText="Please enter a valid title" onInput={ InputHandler } validators={ [ VALIDATOR_REQUIRE() ] } />
			<Input id='description' element="textarea" label="Description" errorText="Please enter a valid tescriptiomn" validators={ [ VALIDATOR_MINLENGTH( 5 ) ] } onInput={ InputHandler } />
			<Input id='address'
				element="input"
				label="Address"
				errorText="Please enter a valid adress"
				validators={ [ VALIDATOR_REQUIRE() ] }
				onInput={ InputHandler } />
			<ImageUpload id="image" onInput={InputHandler} errorText="please provide sn image" />
			<Button type="submit" disabled = {!formState.isValid}>ADD Place</Button>
		</form>
	</>
			)
}

export default NewContainer;
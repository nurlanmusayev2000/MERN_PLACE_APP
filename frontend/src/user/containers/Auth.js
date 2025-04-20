import React, { useContext, useState } from 'react'
import Input from '../../shared/components/FormElements/Input'
import Card from '../../shared/components/UIElement/Card'
import Button from '../../shared/components/FormElements/Button'
import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/components/Validator/validators'
import { useForm } from '../../shared/hooks/form-hook'
import {AuthContext} from '../../shared/context/auth-context'
import ErrorModal from '../../shared/components/UIElement/ErrorModal'
import LoadingSpinner from '../../shared/components/UIElement/LoadingSpinner'
import { useHttpClient } from '../../shared/hooks/http-hook'
import './Auth.css'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'
const Auth = () =>
{
	const auth = useContext( AuthContext );
	const [ isLogin, setIsLogin ] = useState( true );
	const { isLoading, error, sendRequest, clearError } = useHttpClient();

	const [ formState, InputHandler, setFormData ] = useForm( {
		email: {
			value: '',
			isValid: false
		},
		password: {
			value: '',
			isValid: false
		}
	}, false );

	const authSubmitHandler = async ( e ) =>
	{
		e.preventDefault();
		console.log(formState.inputs);

		if (isLogin) {
			try {
			const responseData =	await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/api/users/login`,
					'POST',
					JSON.stringify( {
						email: formState.inputs.email.value,
						password: formState.inputs.password.value
					} ),
					{
						'Content-Type': 'application/json'
					}
				);

				auth.login(responseData.userId,responseData.token);
			} catch (error) {}
		} else
		{
			try
			{
				const formData = new FormData();
				formData.append( 'name', formState.inputs.name.value );
				formData.append( 'email', formState.inputs.email.value );
				formData.append( 'password', formState.inputs.password.value );
				formData.append( 'image', formState.inputs.image.value );
				const responseData =	await sendRequest(
					`${process.env.REACT_APP_BACKEND_URL}/api/users/signup`,
					'POST',
					formData
				);
				console.log(responseData);

				auth.login(responseData.userId,responseData.token);
			} catch (error) {}
		}
	}

	const switchModeHandler = () =>
	{
		if(!isLogin){
			setFormData( {
			...formState.inputs,
				name: undefined,
				image:undefined
			}, formState.inputs.email.isValid && formState.inputs.password.isValid );
		} else
		{
			setFormData( {
				...formState.inputs,
				name: {
					value: '',
					isValid:false
				},
				image: {
					value: null,
					isValid: false
				}
			},false );
		}

		setIsLogin(prevMode => !prevMode)
	}

	return (
		<>
			<ErrorModal error={ error } onClear={ clearError } />
			<Card className="authentication">
				{isLoading && <LoadingSpinner asOverlay/>}
				<h2>Login Required</h2>
				<form onSubmit={ authSubmitHandler }>
					{ !isLogin && (
						<Input
							element='input'
							id="name"
							type="text"
							label="your name"
							validators={ [ VALIDATOR_REQUIRE ] }
							errorText="Please enter name"
							onInput={InputHandler}
						/>
					) }
					{ !isLogin && <ImageUpload id="image" center onInput={InputHandler} />}
				<Input id='email' element="input" type="email" label='email' placeholder="add your username" validators={[VALIDATOR_EMAIL()]} errorText='enter valid emal' onInput={InputHandler}/>
					<Input id="password" element="input" type="password" placeholder="add your password" label="Password" validators={[ VALIDATOR_MINLENGTH( 5 ) ]} errorText="pls enter valid password at least 5 char" onInput={InputHandler}/>
					<Button type='submit' disabled={ !formState.isValid }>{ isLogin ? 'Login' : 'Sign Up'}</Button>
				</form>
				<Button inverse onClick={switchModeHandler}>{ isLogin ? 'Sign Up' : 'Login'}</Button>
			</Card>
		</>
		)
}

export default Auth

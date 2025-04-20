import {React,useEffect,useRef,useState} from 'react'
import Button from './Button';

import './ImageUpload.css';


const ImageUpload = ( props ) =>
{
	const [ filePreview, setFilePreview ] = useState( "https://www.headshotpro.com/avatar-results/random-1.webp" );
	const [ file, setFile ] = useState();
	const [ isValid, setIsValid ] = useState();
	const filePickerRef = useRef(false);

	useEffect( () =>
	{
		if (!file) {
			return;
		}
		const fileReader = new FileReader();
		fileReader.onload = () =>
		{
			setFilePreview( fileReader.result );
		}
		fileReader.readAsDataURL( file );
	},[file])

	const pickedHandler = ( e ) =>
	{
		let pickedFile;
		let fileIsValid = false;
		if (e.target.files && e.target.files.length === 1) {
			pickedFile = e.target.files[ 0 ];
			setFile( pickedFile );
			setIsValid( true );
			fileIsValid = true;
		} else
		{
			setIsValid( false );
		}
		props.onInput( props.id, pickedFile, fileIsValid );
	};
	const pickImageHandler = () =>
	{
		filePickerRef.current.click();
	};
	return (
		<div className='form-control'>
			<input ref={filePickerRef} type="file" name="image" id={props.id} accept='.jpg , .jpeg, .png' style={{display:'none'}} onChange = {pickedHandler}/>
			<div className={ `image-upload ${ props.center && 'center' }` }>
				<div className="image-upload__preview">
					<img src={filePreview} alt="Preview" />
				</div>
				<Button type="button" onClick = {pickImageHandler} >Choose Image</Button>
			</div>
			{ !isValid && <p>{props.errorText}</p>}
		</div>
	)
}

export default ImageUpload
const { validationResult } = require( 'express-validator' );
const HttpError = require( '../models/http-error' );
const { v4: uuidv4 } = require('uuid');
const getCoordForAddress = require( '../util/location' );
const Place = require( '../models/places' );
const User = require( '../models/users' );
const { default: mongoose } = require( 'mongoose' );
const fs = require( 'fs' );


const getPlaceById = async ( req, res, next ) =>
{

	const placeId = req.params.pid;
	let place;

	console.log(placeId);

	try
	{
		place = await Place.findById( placeId );
	} catch (error) {
		const err = new HttpError( "something went weong with findbyID", 500 );
		return next( err );
	}

	if ( !place )
	{
		return next( new HttpError( 'Could not find a place for the provided id ', 404 ) );
	}
	console.log(place);

	res.json( { place: place.toObject({getters: true})}  );
}

const getPlacesByUserId= async ( req, res,next ) =>
{
	const userId = req.params.uid;

	let places;
	try {
		places = await Place.find( { creator: userId } );
	} catch (error) {
		const err = new HttpError( "something went weong with findbyID", 500 );
		return next( err );
	}


	if ( !places || places.length === 0 )
	{
		return next(new HttpError('Could not find a places for the provided user id', 404));

	}
	res.json( { places:places.map(place=>place.toObject({getters:true})) } );

}

const createPlace = async ( req, res, next) =>
{
	const err = validationResult( req );
	if ( !err.isEmpty() )
	{
		return next( new HttpError('Invalid inputs passed ,please check your data', 422))
	}
	console.log(req.body);

	const { title,description,address,creator} = req.body;

	let coordinates;

	try {
		coordinates = await getCoordForAddress( address );
	} catch (error) {
		return next( error );
	}
	const createdPlace = new Place( {
		title,
		description,
		address,
		creator,
		location: coordinates,
		image: req.file.path
		} );

	let user;
	try {
		user = await User.findById( creator );
	} catch (err) {
		const error = new HttpError( 'Creating place failed', 500 );
		return next( error );
	}

	if (!user) {
		return next( new HttpError( 'Could not find provided id', 404 ) );
	}

	try {
		const sess = await mongoose.startSession();
		sess.startTransaction();
		await createdPlace.save( { session: sess } );
		user.places.push( createdPlace );
		await user.save( { session: sess } );
		await sess.commitTransaction();

	} catch (error) {
		error = new HttpError( "something went wrong when new place has beeing created" );
		return	next( error );
	}


	res.status( 201 ).json( { place: createdPlace } );
}


const updatePlace = async ( req, res, next ) =>
{
	const err = validationResult( req );
	console.log(err.isEmpty());

	if ( !err.isEmpty() )
	{
		throw new HttpError('Invalid inputs passed ,please check your data', 422)
	}
	const { title, description } = req.body;
	const id = req.params.pid;
	console.log(id , title,description);
	console.log(Place);

	let updatedPlace;
	try
	{
		updatedPlace = await Place.findById( id );
		console.log(updatePlace);

	} catch (error) {
		const err = new HttpError( "something went wron with fetching data", 500 );
		return next( err );
	}

if (updatedPlace.creator.toString() !== req.userData.userId) {
	const error = new HttpError( 'you are not allowed to update this place', 401 );
}

		updatedPlace.title = title;
		updatedPlace.description = description;
	try {
		await updatedPlace.save();
	} catch (error) {
		const err = new HttpError( "something went wron with saving data", 500 );
		return next( err );
	}



	res.status(200).json({place:updatedPlace.toObject({getters:true})})
}

const deletePlace = async (req, res, next) => {
const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId).populate('creator'); // populate to get full user document
  } catch (err) {
    return next(new HttpError('Fetching place failed, try again later.', 500));
  }

  if (!place) {
    return next(new HttpError('Could not find place for this id.', 404));
	}
	const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await place.deleteOne({ session: sess }); // delete place
    place.creator.places.pull(place);         // remove from user's places array
    await place.creator.save({ session: sess });

    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError('Deleting place failed, please try again.', 500));
  }
	fs.unlink( imagePath, ( err ) =>
	{
		console.log(err);

	} );
  res.status(200).json({ message: 'Place deleted successfully.' });
};


exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
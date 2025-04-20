const { v4: uuidv4 } = require('uuid');
const HttpError = require( '../models/http-error' );
const { validationResult } = require( 'express-validator' );
const Users=require('../models/users')
const bcrypt = require( 'bcryptjs' );
const jwt = require('jsonwebtoken')

const getUsers = async ( req, res, next ) =>
{
	let users;
	try {
		users = await Users.find({},"-password");
	} catch (error) {
		return next(new HttpError( "Users could fetched", 404 ));
	}
	res.json( { users: users.map( user => user.toObject( { getters: true } ) ) } );
}


const signup =async ( req, res, next ) =>
{
	const errors = validationResult( req );
	  if (!errors.isEmpty()) {
			return next( new HttpError( "Missing fields or incorrect field", 400 ));
			}


	const { name, email, password } = req.body;
	let hasUser;
	try
	{
		hasUser =await Users.findOne({email});
	} catch (error) {
		return next(new HttpError("error happened during fetching user", 401 ));
	}
	if ( hasUser )
		return next(new HttpError( "mail is already exist", 500 ));


	let hashedPassword;
	try {
		hashedPassword =await bcrypt.hash( password, 12 );
	} catch (error) {
		return next(new HttpError( "something went wrong with password", 500 ));
	}
	const user = new Users( {
			email,
			password:hashedPassword,
			image: req.file.path,
			username: name,
			places:[]
		} );
	try {
		await user.save();
	} catch (error) {
		return next(new HttpError("error happened during adding user to db", 401 ));
	}

	let token;
	try {
		token = jwt.sign( { email: user.email, userId: user.id }, `${process.env.SECRET_KEY}`, { expiresIn: '1h' } );

	} catch (error) {
		return next(new HttpError("error happened during adding user to db", 401 ));
	}

	res.status( 201 ).json( {user:user.email,userId:user.id,name:user.username,token});
}

const login = async ( req, res, next ) =>
{
	const { email, password } = req.body;
	let user;
	try {
		user = await Users.findOne({email});
	} catch (error) {
		return next(new HttpError("error happened during login user ", 401 ));
	}
	let decodedPass;
	passCompare = bcrypt.compare( password, user.password );
	if ( !user || !passCompare )
	{
		return next(new HttpError("incorrect password", 401 ));
	}

	let token;
	try {
		token = jwt.sign( { email: user.email, userId: user.id }, `${process.env.SECRET_KEY}`, { expiresIn: '1h' } );

	} catch (error) {
		return next(new HttpError("error happened during login user to db", 401 ));
	}

res.status(201).json({
  userId: user.id,        // ✅ This is what's missing
  token,
  user: user.email,
  name: user.username
});


}

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
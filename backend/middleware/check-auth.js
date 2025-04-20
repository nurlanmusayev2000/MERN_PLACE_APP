
const jwt = require( 'jsonwebtoken' );
const HttpError = require( '../models/http-error' );

module.exports = (req,res,next) =>
{
		console.log(req);

	if (req.method === 'OPTIONS') {
		return next();
	}
	try {
		const auth = req.headers.authorization;
		const token = auth.split( ' ' )[ 1 ];
		if (!token) {
			throw new Error("authentication failed")
		}
		const decodedToken = jwt.verify( token, `${process.env.SECRET_KEY}` );
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (error) {
		const err = new HttpError( 'auth fail', 401 );
		return next( err );
}



}
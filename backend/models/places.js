const { default: mongoose, Schema } = require( "mongoose" );

const placeSchema = new Schema( {
	title: { type: String, required: true },
	description: { type: String, required: true },
	address: { type: String, required: true },
	image: { type: String },
	location: {
		lat: { type: Number, required: true },
		lng: { type: Number, required: true }
	},
	creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User'}
} );


module.exports = mongoose.model( "Place", placeSchema );
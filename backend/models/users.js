const { default: mongoose, Schema, model } = require( "mongoose" );

const userSchema = new Schema( {
	username: { type: String, required: true },
	email: { type: String, required: true , unique:true},
	password: { type: String, reqired: true, minlength: 6 },
	image: { type: String },
	places:[{type: mongoose.Types.ObjectId, required: true, ref: 'Place'}]
} )

module.exports = model('User',userSchema)
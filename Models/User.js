const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return !v.includes('.');
            },
            message: props => 'Username cannot contain dots (.)'
        }
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    followers: {
        type: [String], 
        default: []
    },
    profilePhoto:{
        type:String,
        default:'https://res.cloudinary.com/dbfyj6zg0/image/upload/v1738299292/profilepic_fwvypn.png',
    },
    
},{
        timestamps: true, 
    
});

const User = mongoose.model('User',UserSchema);
module.exports=User;
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var userSchema = mongoose.Schema({
  		id:mongoose.Schema.Types.ObjectId,
        account:String,
  		password:String,
  		nickname:{
  			type:String,
  			default:'新用户'},
  		age:{
  			type:Number,
  			min:0,
  			max:120
  		},
      mailbox:String,
      address:String,
      introduction:String
  });
var User = mongoose.model('User',userSchema);
module.exports = User;

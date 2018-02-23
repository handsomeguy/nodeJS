/**
 * Created by Administrator on 2017/1/14.
 */
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var chatRecordSchema = mongoose.Schema({
    id:mongoose.Schema.Types.ObjectId,
    sender:String,
    receiver:String,
    content:String,
    date:Date,
    status:{
        type:String,
        default:'unread'
    }
});
var chatRecord = mongoose.model('chatRecord',chatRecordSchema);
module.exports = chatRecord;
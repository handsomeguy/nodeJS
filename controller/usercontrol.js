/**
 * Created by Administrator on 2017/1/14.
 */
var userModel = require('../models/usermodel');
var chatModel = require('../models/chatRecord');
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var lodash = require('lodash');
var moment = require('moment');
/*此模块防止函数处理器对应的handle*/
module.exports = {

    /*
     @description 注册新用户接口
     @param 账号和密码
     @return 成功或失败
     */
    registerNewUser:function (req,res) {

        var account =  req.body['account'];
        var password = req.body['password'];
        if(account == ''||password==''){
            res.json(200,{result:'failed',reason:'字段不能为空！'});
            return;
        }
        if(account.length>20||password.length>20){
            res.json(200,{result:'failed',reason:'字段过长！'});
            return;
        }
        if(/[\u4e00-\u9fa5]+/.test(account)){
            res.json(200,{result:'failed',reason:'账号格式错误！'});
            return;
        }
        userModel.find({account:account},function(err,users){
            if(err){handleError(res);return;}
            //已存在该用户账号 失败
            if(users.length != 0){
                res.json(200,{result:'failed',
                              reason:'已存在该账号'
                            });
                return;
            }else{
                //不存在该用户 新增用户 成功
                console.log('addNew'+account+password);
                var userentity = new userModel({
                account:account,
                password:password
                }).save(function(err){
                        if(err){
                            console.log(err);
                            console.log('something wrong with adding newUser');
                            res.json(200,{result:'failed',reason:'服务器出错'});
                            return;
                        }
                        console.log('add New User successfully');
                        res.json(200,{result:'success'});
                    })
                console.log(userentity);

            }
        })
    },

    /*
     @description 用户登录接口
     @param 账号和密码
     @return 成功或失败
     */
    loginUser:function(req,res){
        var account = req.query.account;
        var password = req.query.password;
        if(account == ''||password==''){
            res.json(200,{result:'failed',reason:'字段不能为空！'});
            return;
        }
        if(account.length>20||password.length>20){
            res.json(200,{result:'failed',reason:'字段过长！'});
            return;
        }
        userModel.findOne({account:account},function(err,user){
            if(err){handleError(err);return;}
            if(!user){
                res.json(200,{result:'failed',reason:'账号不存在'});
                return;
            }
            //密码错误
            if(user.password != password){
                res.json(200,{result:'failed',reason:'密码错误'});
                return;
            }else{
                req.session.userid = user._id;
                //登录成功
                res.status(200);
                res.send({result:'success'});
            }

        })
    },
    /*
     @description 获取好友列表接口 获取所有的好友id和nickname
     @return 返回好友数组 包含id和nickname
     */
    getFriendsList:function(req,res){
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'请先登录'});
            return;
        }
        userModel.find()
            .select('_id nickname')
            .exec(function(err,users){
                if(err){handleError(res);return;}
                lodash.remove(users, function (user) {
                    return user._id==req.session.userid;
                })
                users = users.map(function(user){
                    return{
                        id:user._id,
                        nickname:user.nickname
                    }
                });
                res.json(200,JSON.stringify(users));
            })
    },
    /*
     @description 获取某个用户的个人资料
     @params id
     @return 返回对应用户信息
     */
    getUserInformation:function(req,res){
        var searchid = req.query.id;
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'请先登录'});
            return;
        }
        if(searchid == ''){
            res.json(200,{result:'failed',reason:'查无此人'});
            return;
        }
        userModel.findOne({_id:searchid},function(err,user){
            if(err){handleError(res);return;}
            if(!user){
                res.json(200,{result:'failed',reason:'查无此人'});
                return;
            }
            user = {
                nickname:user.nickname,
                age:user.age,
                mailbox:user.mailbox,
                address:user.address,
                introduction:user.introduction
            };
            res.json(200,user);
        })
    },
    /*
     @description 发送信息给某个好友
     @params  接受者id 文本内容
     @return 返回成功或失败
     */
    sendContent:function(req,res){
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'请先登录'});
            return;
        }
        if(req.session.id == req.body['receiver']){
            res.json(200,{result:'failed',reason:'发送出错！'});
            return;
        }
        if(req.body['receiver']==''||req.body['content']==''){
            res.json(200,{result:'failed',reason:'字段不能为空！'});
            return;
        }
        userModel.findOne({_id:req.body['receiver']},function(err,user){
            if(err){handleError(res);return;}
            //满足条件后存储新的消息记录
//            var nowTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            var nowTime = new Date();
            new chatModel({
                sender:req.session.userid,
                receiver:req.body['receiver'],
                content:req.body['content'],
                date:nowTime
            }).save(function(err){
                    if(err){handleError(res);return;}
                    res.json(200,{result:'success'});
                })
        })

    },
    /*
     @description 获取与某个好友的聊天记录
     @params  好友id
     @return 聊天记录数组
     */
    getChatRecord:function(req,res){
        var friendId = req.query.id;
        var selfId = req.session.userid;
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'请先登录'});
            return;
        }
        chatModel.find()
                .where('sender').in([friendId, selfId])
                .where('receiver').in([friendId, selfId])
                .select('sender receiver date content')
                .sort('date')
                .exec(function(err,records){
                    if(err){handleError(res);return;}
                records = records.map(function(record){
                    return {
                        sender:record.sender,
                        receiver:record.receiver,
                        date:moment(record.date).format('YYYY-MM-DD HH:mm:ss'),
                        content:record.content
                    }
                })
                    res.json(200,JSON.stringify(records));
                })
//        chatModel.find({sender:selfId,receiver:friendId},function(err,records){
//            if(err){handleError(res);return;}
//            chatModel.find({sender:friendId,receiver:selfId},function(err,tworecords){
//                if(err){handleError(res);return;}
//                var allRecords = records.concat(tworecords);
//                allRecords = allRecords.map(function(record){
//                    return{
//                        sender:record.sender,
//                        receiver:record.receiver,
//                        content:record.content,
//                        date:record.date
//                    }
//                });
//                res.json(200,JSON.stringify(allRecords));
//            })
//        })

    },
    /*
     @description 修改用户的个人资料 只有本人可以修改
     @params  nickname
     @params  age
     @params  mailbox
     @params  address
     @params  introduction
     @return 成功或失败
     */
    updateUserInfor:function(req,res){
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'请先登录'});
            return;
        }
        userModel.update({_id:req.session.userid},
            {$set:{
                nickname:req.body['nickname'],
                age:req.body['age'],
                mailbox:req.body['mailbox'],
                address:req.body['address'],
                introduction:req.body['introduction']}},
            function(err){
                if(err){handleError(res);return;}
                res.json(200,{result:'success'});
        });
    },
    /*
     @description 获取未读消息
     @params  no
     @return 聊天记录数组
     */
    getUnreadChatRecord:function(req,res){
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'请先登录'});
            return;
        }
        chatModel.find({receiver:req.session.userid,status:'unread'})
            .sort('date')
            .exec(function(err,records){
                if(err){handleError(res);return;}
                var finalrecords = records.map(function(record){
                    return{
                        sender:record.sender,
                        receiver:record.receiver,
                        content:record.content,
                        date:moment(record.date).format('YYYY-MM-DD HH:mm:ss'),
                    }
                });
                res.json(200,JSON.stringify(finalrecords));
                for(var i = 0;i<records.length;i++){
                    records[i].status = 'read';
                    records[i].save(function(err){
                        if(err){handleError(res);return;}
                    });
                }
            });
    },
    /*
     @description 退出登录
     @params  no
     @return 成功或失败
     */
    logout:function(req,res){
        if(!req.session.userid){
            res.json(200,{result:'failed',reason:'未登录状态'});
            return;
        }
        req.session.userid = '';
        res.json(200,{result:'success'});
    }

}


function handleError(res){
    console.log('error');
    res.json(200,{result:'failed',reason:'服务器出错'});
    return;
}
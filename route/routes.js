var express = require('express');
var fs = require('fs');
var path = require('path');
var controller = require('../controller/usercontrol');
module.exports = function  (app) {

//	console.log(path.join(process.cwd(),'/public'));
//	console.log(path.resolve(__dirname, '../public'));
	app.use(express.static(path.resolve(__dirname, '../public')));



    app.post('/register',controller.registerNewUser);
    app.get('/login',controller.loginUser);
    app.get('/getList',controller.getFriendsList);
    app.get('/getUserInfor',controller.getUserInformation);
    app.post('/sendContent',controller.sendContent);
    app.get('/getChatRecord',controller.getChatRecord);
    app.post('/updateUserInfor',controller.updateUserInfor);
    app.get('/getUnreadChatRecord',controller.getUnreadChatRecord);
    app.get('/logout',controller.logout);



	app.get('/try',function  (req,res) {
        if(!req.session.userid){
            req.session.userid = 'zps';
            res.send(200,'welcome to my web!');
            return;
        }
        res.send(200,'hello!'+req.session.userid+'welcome back!');
	});

	app.get('/home',function  (req,res) {
		fs.readFile(path.join(process.cwd(),'/public/image/pic.jpg'),function(err,data){
			if(err){
				console.log('error');
				res.status(400);
				res.send('error');
				return;
			}
			res.status(200);
			res.set('Content-Type','text/html');
			res.send(data);
		})
	})
}
//var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var utils = require('../util/utils');
var consts = require('../consts/consts');
var async = require('async');
var logger = require('ss-logger').getLogger(__filename);
var userDao = module.exports;
/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
*/
userDao.getPlayersByUid = function(uid, cb){
	var sql = 'select * from Player where userId = ?';
	var args = [uid];

	pomelo.app.get('dbclient').query(sql,args,function(err, res) {
		if(err) {
			utils.invokeCallback(cb, err.message, null);
			return;
		}

		if(!res || res.length <= 0) {
			utils.invokeCallback(cb, null, []);
			return;
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

userDao.getUserByName = function (username, cb){
	var sql = 'select * from	User where name = ?';
	var args = [username];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb, err.message, null);
		} else {
			if (!!res && res.length === 1) {
				var rs = res[0];
				var user = {id: rs.id, name: rs.name, password: rs.password, from: rs.from,loginCount:rs.loginCount,lastLoginTime:rs.lastLoginTime,loginType:rs.loginType};
				utils.invokeCallback(cb, null, user);
			} else {
				utils.invokeCallback(cb, ' user not exist ', null);
			}
		}
	});
};

userDao.getUserByUdID = function (udid, cb){
    var sql = 'select * from	User where udid = ?';
    var args = [udid];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var rs = res[0];
                var user = {id: rs.id, name: rs.name, password: rs.password, from: rs.from,loginCount:rs.loginCount,lastLoginTime:rs.lastLoginTime,loginType:rs.loginType,isBing:rs.isBind};
                utils.invokeCallback(cb, null, user);
            }else if(!!res && res.length > 1){
                for(var i = 0;i < res.length; i++){
                    if(res[i].isBind == 1){
                        var rs = res[i];
                        var user = {id: rs.id, name: rs.name, password: rs.password, from: rs.from,loginCount:rs.loginCount,lastLoginTime:rs.lastLoginTime,loginType:rs.loginType,isBing:rs.isBind};
                        utils.invokeCallback(cb, null, user);
                    }
                }
            }else {

                utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};


/**
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
userDao.getUserById = function (uid, cb){
	var sql = 'select * from	User where id = ?';
	var args = [uid];
	pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
			return;
		}

		if (!!res && res.length > 0) {
            var user = {id: res[0].id, name: res[0].name, password: res[0].password, from: res[0].from,loginCount:res[0].loginCount,lastLoginTime:res[0].lastLoginTime,loginType:res[0].loginType};
			utils.invokeCallback(cb, null, user);
		} else {
			utils.invokeCallback(cb, ' user not exist ', null);
		}
	});
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
userDao.createUser = function (udid,username, password, from,loginType,cb){
	var sql = 'insert into User (udid,name,password,email,`from`,loginCount,lastLoginTime,loginType,createTime,isBind) values(?,?,?,?,?,?,?,?,?,?)';
    var createTime = Date.now();
	var loginTime = Date.now();
	var args = [udid,username, password, '',from || '', 1, loginTime,loginType,createTime,0];
	pomelo.app.get('dbclient').insert(sql, args, function(err,res){
		if(err !== null){
			utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
		} else {
			var user = {id: res.insertId, udid:udid, name: username, password: password, loginCount: 1, lastLoginTime:loginTime};
			utils.invokeCallback(cb, null, user);
		}
	});
};

/**
 * Create a new player
 * @param {String} uid User id.
 * @param {String} name Player's name in the game.
 * @param {Number} roleId Player's roleId, decide which kind of player to create.
 * @param {function} cb Callback function
 */
userDao.createPlayer = function (uid, name,cb){
	var sql = 'insert into Player (userId, name, sex,image, level, experience, gold,money,winCount, loseCount, drawCount,freeTimes,delayMoney,playerCount,huCount,ziMoCount,duiBaoCount) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var playerInfo = consts.PLAYER;
	var args = [uid, name, playerInfo.sex, playerInfo.image,playerInfo.level, playerInfo.experience, playerInfo.gold,playerInfo.money ,playerInfo.winCount, playerInfo.loseCount, playerInfo.drawCount,playerInfo.freeTimes,playerInfo.delayMoney,playerInfo.playerCount,playerInfo.huCount,playerInfo.ziMoCount,playerInfo.duiBaoCount];
	pomelo.app.get('dbclient').insert(sql, args, function(err,res){
		if(err !== null){
			logger.error('create player failed! ' + err.message);
			utils.invokeCallback(cb,err.message, null);
		} else {
            var player = {id: res.id, userId:res.userId, name: res.name, sex: res.sex, level: res.level, experience:res.experience,resloginTime:res.resloginTime,gold:res.gold,winCount:res.winCount,loseCount:res.loseCount,drawCount:res.drawCount};
			utils.invokeCallback(cb,null,player);
		}
	});
};

/**
 * Update a player
 * @param {Object} player The player need to update, all the propties will be update.
 * @param {function} cb Callback function.
 */
userDao.updatePlayer = function (player, cb){
    var sql = 'update Player set sex = ?, level = ?, experience = ?, gold = ?, winCount = ?, loseCount = ?, drawCount = ?,freeTimes = ?,money = ?,delayMoney =?,playerCount = ?,huCount =?,ziMoCount = ?,duiBaoCount = ?,qianDaoCount=?,threeCount=?,fiveCount=?,sevenCount=?,swCount=?,ssCount=? where id = ?';
    var args = [player.sex, player.level, player.experience, player.gold, player.winCount, player.loseCount, player.drawCount,player.freeTimes ,player.money,player.delayMoney,player.playerCount,player.huCount,player.ziMoCount,player.duiBaoCount,player.qianDaoCount,player.threeCount,player.fiveCount,player.sevenCount,player.swCount,player.ssCount,player.id];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
		if(err !== null){
			utils.invokeCallback(cb,err.message, null);
		} else {
			if (!!res && res.affectedRows>0) {
				utils.invokeCallback(cb,null,true);
			} else {
				logger.error('update player failed!');
				utils.invokeCallback(cb,null,false);
			}
		}
	});
};
userDao.editPlayer = function (player, cb){
    var sql = 'update Player set name = ?,sex = ?,image = ? where id = ?';
    var args = [player.name,player.sex,player.image,player.id];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            utils.invokeCallback(cb,err.message, null);
        } else {
            if (!!res && res.affectedRows>0) {
                utils.invokeCallback(cb,null,true);
            } else {
                logger.error('update player failed!');
                utils.invokeCallback(cb,null,false);
            }
        }
    });
};

userDao.updateUser = function (user, cb){
    var sql = 'update User set loginCount = ?, lastLoginTime = ? where id = ?';
    var args = [user.loginCount,user.lastLoginTime,user.id];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            utils.invokeCallback(cb,err.message, null);
        } else {
            if (!!res && res.affectedRows>0) {
                utils.invokeCallback(cb,null,true);
            } else {
                logger.error('update player failed!');
                utils.invokeCallback(cb,null,false);
            }
        }
    });
};


userDao.getAllPlayers = function(start,num,cb){
    var sql = 'select * from Player where 1 = 1 limit ?,?';
    var args = [start,num];
    pomelo.app.get('dbclient').query(sql,args,function(err, res) {
        if(err) {
            utils.invokeCallback(cb, err.message, null);
            return;
        }
        if(!res || res.length <= 0) {
            utils.invokeCallback(cb, null, []);
            return;
        } else {
            utils.invokeCallback(cb, null, res);
        }
    });
};




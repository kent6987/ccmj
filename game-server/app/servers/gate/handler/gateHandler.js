var dispatcher = require('../../../util/dispatcher');
var utils = require('../../../util/utils');
var consts = require('../../../consts/consts');
var userDao = require('../../../dao/userDao');
var Token = require('../../../token/token');
var secret = require('../../../../config/session').secret;
var logger = require('ss-logger').getLogger(__filename);
var RouteData = require('../../../util/routeData');
var async = require('async');
var Business = require('../../../domain/business');
/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

Handler.prototype.queryEntry = function(msg, session, next) {
    var self = this;
    async.waterfall([
        function(callback) {
            self.assignConnector(msg, session, callback);
        },
        function(result) {
            next(null, result);
        }
    ], function (err) {
        if(err) {
            logger.error('[gateHandler] [login] 玩家登录失败，失败原因：' + err.stack);
            next(null, {
                code: consts.RES_CODE.ERR_FAILED,
                error: err.stack
            });
            return;
        }
    });

};

Handler.prototype.touristEntry = function(msg,session,next){
    var self = this;
    async.waterfall([
        function(callback) {
            self.login(msg, session, callback);
        },
        function(loginResult, callback) {
            if(loginResult.code !== consts.RES_CODE.SUC_OK) {
                next(null, loginResult);
                return;
            }
            next(null,loginResult);
        }
    ], function (err) {
        if(err) {
            logger.error('[gateHandler] [login] 玩家登录失败，失败原因：' + err.stack);
            next(null, {
                code: consts.RES_CODE.ERR_FAILED,
                error: err.stack
            });
            return;
        }
    });
}

Handler.prototype.login = function(msg,session,next){
    var udid = msg.udid;
    var name = msg.name;
    if(!udid) {
        logger.error('[gateHandler] [login] 玩家登录失败，失败原因：udid不存在');
        next(null, {
            code: consts.RES_CODE.ERR_INVALID_PARAMETER,
            error: consts.ERR_MSG.INVALID_PARAMETER
        });
        return;
    }
    if(!name){
        logger.error('[gateHandler] [login] 玩家登录失败，失败原因：name不存在');
        next(null, {
            code: consts.RES_CODE.ERR_INVALID_PARAMETER,
            error: consts.ERR_MSG.INVALID_PARAMETER
        });
        return;
    }
    userDao.getUserByUdID(udid,function(err,user){
        if(err || !user){
            userDao.createUser(udid,name,'000000','',0,function(err,user){
                if(err || !user){
                    logger.error('[gateHandler] [login] [udid:' + udid +']创建用户失败，失败原因：' + err);
                    next(null, {
                        code: consts.RES_CODE.ERR_FAILED,
                        error: err
                    });
                    return;
                }
                userDao.createPlayer(user.id,name,function(err,player){
                    if(err){
                        logger.error('[gateHandler] [login] [userId: '+ user.id +'] 创建玩家失败，失败原因：' + err);
                        next(null, {
                            code: consts.RES_CODE.ERR_FAILED,
                            error: err
                        });
                        return;
                    }
                    var taskList = Business.task;
                    for(var k = 0; k < taskList.length;k++){
                        var taskInfo = {
                            uid : user.id,
                            taskId : taskList[k].id,
                            schedule: 0,
                            haveDraw : 0
                        }
                        taskDao.createTask(taskInfo,function(err,task){
                            if(err){
                                logger.error('[gateHandler] [login] [uid: '+ user.id +'] [初始化玩家任务失败]');
                                next(null, {
                                    code: consts.RES_CODE.ERR_FAILED,
                                    error: err
                                });
                                return;
                            }
                        });
                    }
                    var date = new Date();
                    var length =  new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
                    var dataArray = [];
                    var m = date.getMonth() + 1;
                    for(var  i = 0; i < length; i++){
                        var data = {
                            time:m + "/" + (i + 1),
                            isDraw:0
                        }
                        var str1 = JSON.stringify(data);
                        dataArray.push(str1);
                    }
                    var taskData = dataArray.join("-");
                    taskDao.createEverydayTask(user.id,taskData,function(err,EverydayTask){
                        if(err){
                            logger.error('[gateHandler] [login] [uid: '+ user.id +'] [初始化玩家签到信息失败 失败原因：'+ err +']');
                            next(null, {
                                code: consts.RES_CODE.ERR_FAILED,
                                error: err
                            });
                            return;
                        }
                    })
                    var token = Token.create(user.id, Date.now(), secret);
                    next(null,{code:consts.RES_CODE.SUC_OK,uid:user.id,token:token,loginType:user.loginType});
                    return;
                });
            });
        }else{
            var count = user.loginCount + 1;
            var updateInfo = {
                id:user.id,
                loginCount:count,
                lastLoginTime:Date.now()
            }
            userDao.updateUser(updateInfo,function(err,result){
                if(err){
                    logger.error('[gateHandler] [login] [uid: '+ user.id +'] 更新玩家信息失败，失败原因：' + err);
                }
            });
            var token = Token.create(user.id, Date.now(), secret);
            next(null,{code:consts.RES_CODE.SUC_OK,uid:user.id,token:token,loginType:user.loginType});
            return;
        }
    });
};

Handler.prototype.loginByName = function(msg,session,next){
    var name = msg.name;
    var password = msg.password;
    if(!name){
        logger.error('[gateHandler] [loginByName] 参数错误，name：' + name);
        next(null, {
            code: 500,
            error: '参数name错误'
        });
        return;
    }
    if(!password){
        logger.error('[gateHandler] [loginByName] 参数错误，password：' + password);
        next(null, {
            code: 500,
            error: '参数password错误'
        });
        return;
    }
    userDao.getUserByName(name,function(err,user){
        if(err){
            next(null, {
                code: 5001,
                error: '获取用户信息失败'
            });
            logger.error('[gateHandler] [loginByName] 玩家用用户名登录失败，失败原因：' + err);
            return;
        }

        if(!user){
            logger.error('[gateHandler] [loginByName] 玩家用用户名登录失败，失败原因：用户不存在');
            next(null, {
                code: 500,
                error: '用户不存在'
            });
            return;
        }

        if(user.password != password){
            logger.error('[gateHandler] [loginByName] 玩家用用户名登录失败，失败原因：密码错误');
            next(null, {
                code: 500,
                error: '密码错误'
            });
            return;
        }
        var count = user.loginCount + 1;
        var updateInfo = {
            id:user.id,
            loginCount:count,
            lastLoginTime:Date.now()
        }
        userDao.updateUser(updateInfo,function(err,result){
            if(err){
                logger.error('[gateHandler] [loginByName] 用户登录时更新用户登录次数失败，失败原因：' + err);
            }
        });
        var token = Token.create(user.id, Date.now(), secret);
        next(null,{code:consts.RES_CODE.SUC_OK,uid:user.id,token:token,loginType:user.loginType});
        return;
    });
}

Handler.prototype.assignConnector = function(msg, session, next) {
    var connectors = this.app.getServersByType('connector');
    if (!connectors || connectors.length===0) {
        next(null, {
            code: consts.RES_CODE.ERR_FAILED,
            error: consts.ERR_MSG.CONNECTOR_SERVER_DOWN
        });
        return;
    }
    var connectorCount = connectors.length;

    var minConnectionIndex = 0;
    var theMinPlayerConnectionCount = 100000;//set a min value
    for(var i=0; i<connectorCount; i++ ) {
        var connectorId = connectors[i].id;
        if (!RouteData.connectorRoute[connectorId]) {
            minConnectionIndex = i;
            theMinPlayerConnectionCount = 0;
            break;
        }
        else {
            if(RouteData.connectorRoute[connectorId] < theMinPlayerConnectionCount) {
                minConnectionIndex = i;
                theMinPlayerConnectionCount = RouteData.connectorRoute[connectorId];
            }
        }
    }

    var theSelectedConnectorId = connectors[minConnectionIndex].id;
    RouteData.connectorRoute[theSelectedConnectorId] = theMinPlayerConnectionCount + 1;

    var res = connectors[minConnectionIndex];


    if(RouteData.cardServers.length===0) {
        var cardServers = this.app.getServersByType('card');
        var cardServerCount = cardServers.length;
        for(var cardServerIndex = 0; cardServerIndex<cardServerCount; cardServerIndex++) {
            RouteData.cardServers[cardServerIndex] = cardServers[cardServerIndex].id;
        }
    }
    next(null, {
        code: consts.RES_CODE.SUC_OK,
        host: res.host,
        port: res.clientPort,
        cardServers: RouteData.cardServers
    });
};
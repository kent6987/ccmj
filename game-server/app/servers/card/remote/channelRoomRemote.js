/**
 * Created with JetBrains WebStorm.
 * User: Pro2012
 * Date: 13-8-4
 * Time: PM7:59
 * To change this template use File | Settings | File Templates.
 */
var Business = require('../../../domain/business');
var Player = require('../../../domain/entity/player');
var consts = require('../../../consts/consts');

var Remote = function(app) {
    this.app = app;
};

module.exports = function(app) {
    return new Remote(app);
};

Remote.prototype.add = function(sid,id,uid,sex,level,gold,name,experience,winCount,loseCount,drawCount,freeTimes,money,delayMoney,playerCount,huCount,ziMoCount,duiBaoCount,image,qianDaoCount,threeCount,fiveCount,sevenCount,swCount,ssCount,cb) {
//    console.log('add is called!!! %j channelRoomRemote start',uid);
    if (!Business.players[uid]) {
        var optsPlayer = {
            sid:sid,
            id:id,
            uid: uid,
            sex:sex,
            image:image,
            level:level,
            gold: gold,
            money:money,
            playerName: name,
            experience:experience,
            winCount:winCount,
            loseCount:loseCount,
            drawCount:drawCount,
            freeTimes:freeTimes,
            delayMoney:delayMoney,
            playerCount:playerCount,
            huCount:huCount,
            ziMoCount:ziMoCount,
            duiBaoCount:duiBaoCount,
            qianDaoCount:qianDaoCount,
            threeCount:threeCount,
            fiveCount:fiveCount,
            sevenCount:sevenCount,
            swCount:swCount,
            ssCount:ssCount
        };
        //init player in game
        Business.players[uid] = new Player(optsPlayer);
    }
    cb(null, {
        code: consts.RES_CODE.SUC_OK
    });
};

Remote.prototype.kick = function(uid, sid) {
    console.log('来这里了？');
    var self = this;
    var player = Business.players[uid];
    if (!!player) {
        player.seyOnTuoGuan(true);
        player.setIsOnline(false);
        if(player.isPlaying == true){
            console.log('uid：' + uid + '离开了游戏，玩家还在游戏状态，等待重连！');
            return;
        }
        var channelId = player.channelId;
        if (channelId !== -1) {
            var channelRoomHandler = require('../../card/handler/channelRoomHandler')(self.app);
            var msg = {
                uid: uid,
                sid: sid
            };
            //player leave channel and room
            channelRoomHandler.leaveChannel(msg, null, null);
        }
        //clear the player in game
        console.log('玩家已结束游戏，离开游戏，清除缓存内的玩家！');
        delete Business.players[uid];
    }
    else {
        console.log('Not found this player %j', uid);
    }
}
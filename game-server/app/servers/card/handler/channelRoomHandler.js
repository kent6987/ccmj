var async = require('async');
/**
 * author: sunye
 * email: sunye19890111@sina.com
 */
var pomelo = require('pomelo');
var messageService = require('../../../domain/messageService');
var Business = require('../../../domain/business');
var consts = require('../../../consts/consts');
var Player = require('../../../domain/entity/player');
var https = require('https');
var userDao = require('../../../dao/userDao');
var crypto = require('crypto');
var logger = require('ss-logger').getLogger(__filename);
var Handler = function(app) {
    this.app = app;
};

module.exports = function(app) {
    return new Handler(app);
};
/**
 * 进入频道
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.enterChannel = function(msg, session, next) {
    var uid = session.uid;
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.enterChannel] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    if (player.channelId != -1) {
        //频道ID不为-1，并且玩家还在游戏状态，则返回inGame为1，通知客户端执行断线重连逻辑
        if(player.onTuoGuan && player.roomId !== -1 && player.isPlaying){
            next(null, {
                inGame:1,
                code: consts.RES_CODE.SUC_OK
            });
            return;
        }
    }else {
        next(null, {
            inGame:0,
            code: consts.RES_CODE.SUC_OK
        });
        return;
    }
};
/**
 * 断线重连
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.reEnterChannel = function(msg,session,next){
    var uid = session.uid;
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.leaveChannel] [Uid:' + uid + '] [failed],The player not exist!');
        if(!!next) {
            next(null, {
                code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
                error: consts.ERR_MSG.USER_INFO_MISSING
            });
        }
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    var playersId = room.roomPlayerIds;
    var players = {};
    var index = 1;
    var paiLength = room.allCards.length - 16;
    for(var i = 0; i < playersId.length; i++){
        if(playersId[i] !== uid){
            var playerKey = 'player' + index;
            var currPlayer = Business.players[playersId[i]];
            var currGangArray = new Array();
            for(var j = 0; j < 3; j++){
                for(var k = 0; k < currPlayer.yaoGangCards[j].length; k++){
                    currGangArray.push(currPlayer.yaoGangCards[j][k]);
                }
            }
            for(var j = 0; j < 3; j++){
                for(var k = 0; k < currPlayer.jiuGangCards[j].length; k++){
                    currGangArray.push(currPlayer.jiuGangCards[j][k]);
                }
            }
            for(var j = 0; j < currPlayer.xiGangCards.length; j++){
                currGangArray.push(currPlayer.xiGangCards[j]);
            }
            for(var j = 0; j < currPlayer.xuangFengGangCards.length; j++){
                currGangArray.push(currPlayer.xuangFengGangCards[j]);
            }
            var inHandsCardLength = currPlayer.inHandCards[0].length + currPlayer.inHandCards[1].length + currPlayer.inHandCards[2].length + currPlayer.inHandCards[3].length + currPlayer.inHandCards[4].length;
                players[playerKey] = {
                gangArray:currGangArray,
                playerCard: currPlayer.playerCard,
                inHandCardsLength:inHandsCardLength,
                outHandCards: currPlayer.outHandCards,
                position:currPlayer.position,
                playerInfo:currPlayer.getInfo()
            };
            index++;
        }
    }
    var gangArray = new Array();
    for(var i = 0; i < 3; i++){
        for(var j = 0; j < player.yaoGangCards[i].length; j++){
            gangArray.push(player.yaoGangCards[i][j]);
        }
        for(var j = 0; j < player.jiuGangCards[i].length; j++){
            gangArray.push(player.jiuGangCards[i][j]);
        }
    }
    for(var i = 0; i < player.xiGangCards.length; i++){
        gangArray.push(player.xiGangCards[i]);
    }
    for(var i = 0; i < player.xuangFengGangCards.length; i++){
        gangArray.push(player.xuangFengGangCards[i]);
    }
    var playerInfo = {
        isBanker : player.isBanker?1:0,
        isTing : player.isTing?1:0
    }
    var myself = {
        gangArray: gangArray,
        playerCard: player.playerCard,
        inHandCards:player.inHandCards,
        outHandCards: player.outHandCards,
        playerInfo:playerInfo,
        position:player.position
    }
    var value = 0;
    if(room.m_BaoPAI){
        value = room.m_BaoPAI.value;
    }
    player.setIsOnline(true);
    next(null, {
        player: myself,
        player1:players.player1,
        player2:players.player2,
        player3:players.player3,
        baoPai:value,
        paiLast:paiLength
    });
}
Handler.prototype.startEnter = function(msg, session, next){
    var self = this;
    var uid = session.uid;
    var channelId = Number(msg.channelId);
    if(channelId < 0 || channelId >= Business.channels.length) {
        logger.error('[Handler.prototype.enterChannel] [Uid:' + uid + '] [failed], The param channelId error! channelId:' + channelId);
        next(null, {
            code: consts.RES_CODE.ERR_INVALID_PARAMETER,
            error: consts.ERR_MSG.INVALID_PARAMETER
        });
        return;
    }
    var player = Business.players[uid];
    if(player.roomId != -1) {
        this.leaveRoom(msg, session, null);
    }
    if(player.channelId != -1) {
        this.leaveChannel(msg, session, null);
    }
    player.enterChannel(Business.channels[channelId]);

    var channel = this.app.get('channelService').getChannel(msg.channelId, true);
    if(!!channel) {
        if (!channel.getMember(uid)) {
            var sid = session.get('sid');
            channel.add(uid, sid);
        }
    }
    async.waterfall([
        function(cb){
            self.enterRoom(msg, session, cb);
        },function(result){
            logger.info('[Handler.prototype.enterChannel] [Uid:' + uid + '] [successed] enter channel!');
            next(null,result);
        }
    ], function (err) {
        next(null, {
            code: consts.RES_CODE.ERR_FAILED,
            error: err.stack
        });
    });
}
Handler.prototype.enterRoom = function(msg, session, next) {
    var uid = session.uid;
    if(!uid){
        logger.error('[Handler.prototype.enterRoom] [Uid:' + uid + '] [failed]  enter room failed,uid is null!');
        next(null, {
                code: consts.RES_CODE.FAIL,
                error: consts.ERR_MSG.SESSION_OVERDUE
            });
        return;
    }
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.enterRoom] [Uid:' + uid + '] [failed],The player not exist!');
        if(!!next) {
            next(null, {
                code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
                error: consts.ERR_MSG.USER_INFO_MISSING
            });
        }
        return;
    }
    if(player.roomId !=-1) {
        this.leaveRoom(msg, session, null);
    }
    var room = null;
    var rooms = Business.channels[player.channelId].getAllRooms();
    for(var i = 0; i < rooms.length; i++){
        if(rooms[i].totalRoomPlayerCount < 4){
            room = rooms[i];
            break;
        }
    }
    if(!room){
        logger.error('[Handler.prototype.enterRoom] [Uid:' + uid + '] [channelId:'+ player.channelId +'] [roomId:'+ player.roomId +'] [failed],There is no room!');
    next(null,{
                code: consts.RES_CODE.ERR_FAILED,
                error: consts.ERR_MSG.ROOM_IS_FULL
    });
    return;
    }
    player.enterRoom(room);
    var position = room.getPositionByUid(uid);
    player.setPosition(position);
    var msg = {
        userId: uid,
        playerId:player.id,
        name: player.name,
        gold: player.gold,
        sex:player.sex,
        image:player.image,
        winCount:player.winCount,
        loseCount:player.loseCount,
        drawCount:player.drawCount,
        level:player.level,
        position:position
    }
    var playerIds = room.roomPlayerIds;
    var uidArray = new Array();
    for(var i = 0; i < playerIds.length; i++){
        if(playerIds[i] !== uid){
            var uidObject = {};
            uidObject.uid = playerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
    }
    if(uidArray.length > 0){
        messageService.pushMessageByUids(uidArray,'onEnterRoom',msg);
    }
    var playerIds2 = room.roomPlayerIds;
    var players = {};
    var index = 0;
    for(var i = 0; i < playerIds2.length; i++){
        if(playerIds2[i] !== uid){
            var playerKey = 'player' + index;
            players[playerKey] =  Business.players[playerIds2[i]].getInfo();
            index++;
        }
    }
    var roomPlayerNumber = room.totalRoomPlayerCount -1;    // In addition to others outside their own
    if (!!next) {
        next(null, {
            inGame:0,
            code: consts.RES_CODE.SUC_OK,
            position:position,
            roomPlayerNumber:roomPlayerNumber,
            players:players

        });
    }

};
Handler.prototype.leaveChannel = function(msg, session, next) {
    var uid;
    uid = msg.uid;
    if(!uid){
        uid = session.uid;
    }
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.leaveChannel] [Uid:' + uid + '] [failed],The player not exist!');
        if(!!next) {
            next(null, {
                code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
                error: consts.ERR_MSG.USER_INFO_MISSING
            });
        }
        return;
    }
    if(player.channelId != -1) {
        if(player.roomId != -1) {
            this.leaveRoom(msg, session, null);
        }
        var strChannelId = player.channelId + '';
        player.leaveChannel(Business.channels[player.channelId]);

        var channel = pomelo.app.get('channelService').getChannel(strChannelId, false);
        if(!!channel) {
            if (!!session) {
                var sid = session.get('sid');
                channel.leave(uid, sid);
            }
            else {
                if (!!msg.sid) {
                    channel.leave(uid, msg.sid);
                }
            }
        }
        player.reSetPlayerInfo4LeaveChannel();
        if(!!next) {
            next(null, {
                result: 1
            });
        }
    }else{
        if(!!next) {
            next(null, {
                result: 0
            });
        }
    }
};
Handler.prototype.leaveRoom = function(msg, session, next) {
    var uid;
    uid = msg.uid;
    if(!uid){
        uid = session.uid;
    }
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.leaveRoom] [Uid:' + uid + '] [failed],The player not exist!');
        if(!!next) {
            next(null, {
                code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
                error: consts.ERR_MSG.USER_INFO_MISSING
            });
        }
        return;
    }
    var theOriginalRoomId = player.roomId;
    if(theOriginalRoomId != -1) {
        var theAllRooms = Business.channels[player.channelId].getAllRooms();
        var room =  theAllRooms[theOriginalRoomId];
        var position = player.position;
        player.leaveRoom(theAllRooms[theOriginalRoomId]);
        var playerIds = room.roomPlayerIds;
        var msg = {
            position:position
        }
        var uidArray = new Array();
        for(var i=0; i < playerIds.length; i++){
            if(playerIds[i] != uid){
                var uidObject = {};
                uidObject.uid = playerIds[i];
                uidObject.sid = player.sid;
                uidArray.push(uidObject);
            }
        }
        if(playerIds.length > 0){
            messageService.pushMessageByUids(uidArray,'onLeaveRoom',msg);
        }
    }
    if(!!next) {
        next(null, {
            code: consts.RES_CODE.SUC_OK
        });
    }
};
Handler.prototype.zaiLaiYiJu = function(msg,session,next){
    var uid = session.uid;
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.zaiLaiYiJu] [Uid:' + uid + '] [failed],The player not exist!');
        if(!!next) {
            next(null, {
                code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
                error: consts.ERR_MSG.USER_INFO_MISSING
            });
        }
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    var playerIds2 = room.roomPlayerIds;
    var players = {};
    var count = 0;
    for(var i = 0; i < playerIds2.length; i++){
        if(playerIds2[i] !== uid){
            var playerKey = 'player' + count;
            players[playerKey] =  Business.players[playerIds2[i]].getInfo();
            count++;
        }
    }
    var roomPlayerNumber = room.totalRoomPlayerCount -1;
    if (!!next) {
        next(null, {
            code: consts.RES_CODE.SUC_OK,
            position:player.position,
            roomPlayerNumber:roomPlayerNumber,
            players:players

        });
    }
}
Handler.prototype.getChannels = function(msg,session,next){
    var uid = session.uid;
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.enterChannel] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    if (player.channelId != -1) {
        if(player.onTuoGuan && player.roomId !== -1 && player.isPlaying){
            next(null, {
                inGame:1,
                code: consts.RES_CODE.SUC_OK
            });
            return;
        }
    }else {
        next(null, {
            code: consts.RES_CODE.SUC_OK,
            inGame:0
    });
    }
}
Handler.prototype.getChannelMember = function(msg,session,next){
    var uid = session.uid;
    var player =  Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.enterChannel] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var playerNumArray =  new Array();
    for(var i = 0; i < 6;i++){
        var channel = Business.channels[i];
        playerNumArray.push(channel.totalChannelPlayerCount);
    }
    next(null, {
        code: consts.RES_CODE.SUC_OK,
        playerNumArray:playerNumArray
    });
}

Handler.prototype.editPlayerInfo = function(msg,session,next){
    var uid = session.uid;
    var name = msg.name;
    var sex = msg.sex;
    var image = msg.image;
    var player = Business.players[uid];
    player.setSex(sex);
    player.setPlayerName(name);
    player.setImage(image);
    var updatePlayer = {
        id:player.playerId,
        sex:sex,
        image:image,
        name:name
    }
    userDao.editPlayer(updatePlayer,function(err, success){
        if(err){
            var msg = {};
            messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onUpdatePlayer',msg);
            next();
            return;
        }
        var msg = {};
        messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onUpdatePlayer',msg);
    });
    next();
}
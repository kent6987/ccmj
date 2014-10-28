/**
 * Created with JetBrains WebStorm.
 * User: sunye
 * Date: 13-10-14
 * Time: PM14:57
 */
var pomelo = require('pomelo');
var messageService = require('../../../domain/messageService');
var Business = require('../../../domain/business');
var consts = require('../../../consts/consts');
var schedule = require('pomelo-schedule');
var logger = require('ss-logger').getLogger(__filename);
var Handler = function(app) {
    this.app = app;
};

module.exports = function(app) {
    return new Handler(app);
};
Handler.prototype.openTimer = function(data){
    var room = data.room;
    var player = data.player;
    var msg = {
        position:player.position
    };
    var uidArray = new Array();
    for(var i=0; i < room.roomPlayerIds.length; i++){
        var uidObject = {};
        uidObject.uid = room.roomPlayerIds[i];
        uidObject.sid = player.sid;
        uidArray.push(uidObject);
    }
    var mssg ={};
    messageService.pushMessageByUids(uidArray,'onChangeTurn',msg);
    messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
    room.openScheduleJob();
}
Handler.prototype.GetRandomNum = function(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
/**
 * 玩家准备，当准备的玩家人数少于4时，只返回此玩家的位置和准备状态，当准备的玩家大于4人时，给每个玩家初始化一副牌，并给庄家多发一颗牌
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.ready = function(msg,session,next){
    var uid  = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.ready] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    if(player.isReady){
        next(null,{
            code:2001,
            message:'此玩家已经准备'
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.setReady(player);
    var roomPlayerIds = room.roomPlayerIds;// A array,save as all player uid in this room
    var cc = 0;//already ready player number
    //每当有玩家准备后会检查当前有多少玩家已经准备
    for(var i = 0; i < roomPlayerIds.length; i++){
        var pp = Business.players[roomPlayerIds[i]];
        if(pp.isReady){
            cc++;
        }
    }
    if(cc == 3){//如果有三个人准备了，则开启踢人定时器
        room.openKickTimer();
    }
    if(cc < 4){//push the player's ready message to another player
        var msg = {
            position: player.position
        }
        var uidArray = new Array();
        for(var i=0; i < roomPlayerIds.length; i++){
            if(roomPlayerIds[i] !== uid){
                var uidObject = {};
                uidObject.uid = roomPlayerIds[i];
                uidObject.sid = player.sid;
                uidArray.push(uidObject);
            }
        }
        if(uidArray.length > 0){
            messageService.pushMessageByUids(uidArray,'onReady',msg);
        }
        var re = player.isReady?1:0;
        if (!!next) {
            next(null, {
                code: consts.RES_CODE.SUC_OK,
                isReady:re
            });
        }
    }else{
        room.cancelKickTimer();
        room.initPlayersCard();//init cards for everyone,Everyone has 13 cards
        var banker_position = room.bankerPosition;
        var roomPositions = room.positions; //is a array[][]
        var bankerId = roomPositions[banker_position -1][banker_position]; //the same as playerId
        var banker = Business.players[bankerId];
        banker.setIsBanker();
        room.initCurrentPlayers();
        room.setCurrentPlayer(bankerId);//开启定时器后会首先给这个玩家发牌
        var num1 = this.GetRandomNum(1,6); var num2 = this.GetRandomNum(1,6);
        room.setShaizi(num1,num2);
        //设置四个人都为游戏状态
        for(var k = 0; k < roomPlayerIds.length; k++){
            var toReadyPlayer = Business.players[roomPlayerIds[k]];
            toReadyPlayer.setIsPlaying(true);
        }
        var bankerPosition = banker.position;
        var msg = {
            bankerPosition:bankerPosition
        }
        var uidArray = new Array();
        for(var i=0; i < roomPlayerIds.length; i++){
            var uidObject = {};
            uidObject.uid = roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
        messageService.pushMessageByUids(uidArray,'onStart',msg);
        setTimeout(this.openTimer,4700,{player:banker,room:room});
        next();
    }
}

Handler.prototype.enterScene = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.enterScene] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    var roomPlayerIds = room.roomPlayerIds;
    player.setEnterSence();
    player.setIsPlaying(true);
        var cards = {};
        var index0 = 0;
        var index1 = 0;
        var index2 = 0;
        var index3 = 0;
        var index4 = 0;
        for(var n = 1; n < 14;n++){
            var cuKey = 'card' + n;
            if(player.inHandCards[0].length > 0 && index0 < player.inHandCards[0].length){
                cards[cuKey] = {key:0,value:player.inHandCards[0][index0]};
                index0++;
                continue;
            }
            if(player.inHandCards[1].length > 0 && index1 < player.inHandCards[1].length){
                cards[cuKey] = {key:1,value:player.inHandCards[1][index1]};
                index1++;
                continue;
            }
            if(player.inHandCards[2].length > 0 && index2 < player.inHandCards[2].length){
                cards[cuKey] = {key:2,value:player.inHandCards[2][index2]};
                index2++;
                continue;
            }
            if(player.inHandCards[3].length > 0 && index3 < player.inHandCards[3].length){
                 cards[cuKey] = {key:3,value:player.inHandCards[3][index3]};
                 index3++;
                 continue;
            }
            if(player.inHandCards[4].length > 0 && index4 < player.inHandCards[4].length){
                cards[cuKey] = {key:4,value:player.inHandCards[4][index4]};
                index4++;
                continue;
            }
        }
        var msg = {shaiZiNum1:room.shaizi1,shaiZiNum2:room.shaizi2,card1:cards.card1,card2:cards.card2,card3:cards.card3,card4:cards.card4,
                    card5:cards.card5,card6:cards.card6,card7:cards.card7,card8:cards.card8,card9:cards.card9,card10:cards.card10,
                    card11:cards.card11,card12:cards.card12,card13:cards.card13};
        messageService.pushMessageToPlayer({uid:player.uid, sid : player.sid},'onDispatchCard',msg);
    next();
}
Handler.prototype.clickGang = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickGang] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.clickGang(uid);
    next();
}
Handler.prototype.clickTing = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickTing] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.clickTing(uid);
    var tingPai = player.m_TempTingDePaiVec;
    var numArray = new Array();
    for(var i = 0; i < tingPai.length; i++){
        var keHuDePai = tingPai[i].KeHuDePais;
        for(var j = 0; j < keHuDePai.length; j++){
            var num = room.getPaiLastWhenTing(keHuDePai[j]);
            numArray.push(num);
        }
    }
    next(null, {
        code: consts.RES_CODE.SUC_OK,
        tingPai:tingPai,
        numArray:numArray
    });
}
Handler.prototype.clickChi = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickChi] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    var chidepai = room.clickChi(uid);
    next(null, {
        chiDePai: chidepai
    });
}
Handler.prototype.clickChi2 = function(msg,session,next){
    var uid = session.uid;
    var index = msg.index;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickChi2] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.clickChi2(uid,index);
    next();
}
Handler.prototype.daPai = function(msg,session,next){
    var uid = session.uid;
    var card ={
        key:msg.key,
        value:msg.value
    }
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.daPai] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
   var result = true;
   if(player.onTuoGuan){
       result = false;
   }else{
       room.daPai(uid,card);
   }
    if(result){
        if (!!next) {
            next(null, {
                result: 1
            });
        }
    }else{
        if (!!next) {
            next(null, {
                result: 0,
                key:msg.key,
                value:msg.value
            });
        }
    }
}
Handler.prototype.clickPeng = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickPeng] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.clickPeng(uid);
    next();
}
Handler.prototype.cancelTuoGuan = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.cancelTuoGuan] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.cancel_TuoGuan(uid);
    if (!!next) {
        next(null, {
            code: consts.RES_CODE.SUC_OK
        });
    }
}
Handler.prototype.clickGuo = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickGuo] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.clickGuo(uid);
    next();
}
Handler.prototype.clickHu = function(msg,session,next){
    var uid = session.uid;
    var player = Business.players[uid];
    if (!player) {
        logger.error('[Handler.prototype.clickHu] [Uid:' + uid + '] [failed],The player not exist!');
        next(null, {
            code: consts.ACTION_RES_CODE.ERR_USER_NOT_EXIST,
            error: consts.ERR_MSG.USER_INFO_MISSING
        });
        return;
    }
    var room = Business.channels[player.channelId].getAllRooms()[player.roomId];
    room.clickHu(uid);
    next(null, {
        code: 1
    });
}


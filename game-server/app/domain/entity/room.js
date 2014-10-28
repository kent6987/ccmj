/**
 * User: sunye
 * Date: 13-10-15
 * Time: PM9:05
 * email：sunye19890111@sina.com
 */
var pomelo = require('pomelo');
var Business = require('../../domain/business');
var messageService = require('./../messageService');
var schedule = require('pomelo-schedule');
var log = require('ss-logger');
var jf = require('../../../cfg/logger.json');
log.configure( jf );
var logger = log.getLogger( __filename );
var Room = function(opts) {
    this.roomId = Number(opts.roomId);
    this.roomName = opts.roomName;
    this.channelId = opts.channelId;
    this.allCards = [];
    this.bankerPosition = 1;
    this.roomPlayerIds = [];
    this.totalRoomPlayerCount = 0;
    this.positions = [{1:''},{2:''},{3:''},{4:''}];
    this.currentPlayers = new Array();
    this.currentPlayer = 0;
    this.m_ZhuaDePAi = {key:-1,value:0x00};
    this.daChuDePai = {key:-2,value:0x00};
    this.currentGangCatd = null;
    this.m_BaoPAI = null;
    this.m_bAlreadyDaBao = false;
    this.lastPlayer = -1;
    this.currentGangType = -1;
    this.ziDongTiRen = false;
    this.shaizi1 = 0;
    this.shaizi2 = 0;
};
Room.prototype.id = null;
Room.prototype.onlyId = null;
Room.prototype.readyId = null;
Room.prototype.kickId = null;
module.exports = Room;
Room.prototype.setShaizi = function(num1,num2){
    this.shaizi1 = num1;
    this.shaizi2 = num2;
}
Room.prototype.reSetRoomData = function(){
    this.allCards.length = 0;
    this.currentPlayers.length = 0;
    this.currentPlayer = 0;
    this.m_ZhuaDePAi = null;
    this.daChuDePai = null;
    this.currentGangCatd = null;
    this.m_BaoPAI = null;
    this.m_bAlreadyDaBao = false;
    this.lastPlayer = -1;
    this.currentGangType = -1;
    this.ziDongTiRen = false;
}
Room.prototype.waitFucntion = function(data){
    var player = data.player;
    var room = data.room;
    var card = {};
    var inHands = false;
    if(room.m_ZhuaDePAi.key == -1){
        inHands = false
    }else{
        for(var i = 0; i < player.inHandCards[room.m_ZhuaDePAi.key].length; i++){
            if(room.m_ZhuaDePAi.value == player.inHandCards[room.m_ZhuaDePAi.key][i]){
                inHands = true;
            }
        }
    }
    if(inHands == false){
        var shouliPai = player.inHandCards;
        for(var i = 4;  i >= 0; i--){
            if(shouliPai[i].length > 0){
                card ={
                    key:i,
                    value:shouliPai[i][shouliPai[i].length - 1]
                }
                break;
            }
        }
    }else{
        card = room.m_ZhuaDePAi
    }
    room.daPai(player.uid,card);
    var msg = {}
    if(player.onTuoGuan == false){
        player.seyOnTuoGuan(true);
        messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onTuoGuan',msg);
    }
    messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onZiDongDaPai',msg);
}
Room.prototype.waitFucntion2 = function(data){
    var player = data.player;
    var room = data.room;
    var card = {};
    var inHands = false;
    if(room.m_ZhuaDePAi.key == -1){
        inHands = false
    }else{
        for(var i = 0; i < player.inHandCards[room.m_ZhuaDePAi.key].length; i++){
            if(room.m_ZhuaDePAi.value == player.inHandCards[room.m_ZhuaDePAi.key][i]){
                inHands = true;
            }
        }
    }
    if(inHands == false){
        var shouliPai = player.inHandCards;
        for(var i = 4;  i >= 0; i--){
            if(shouliPai[i].length > 0){
                card ={
                    key:i,
                    value:shouliPai[i][shouliPai[i].length - 1]
                }
                break;
            }
        }
    }else{
        card = room.m_ZhuaDePAi
    }
    room.daPai(player.uid,card);
    var msg = {}
    messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onZiDongDaPai',msg);
}
Room.prototype.ziDongGuo = function(data){
    var room = data.room;
    var player = data.player;
    var msg = {}
    messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onGuo',msg);
    room.clickGuo(player.uid);
}
Room.prototype.wait4TingFucntion = function(data){
    var player = data.player;
    var room = data.room;
    var card = player.m_TempTingDePaiVec[0].DaChuThenCanTingDePai;
    room.daPai4Ting(player.uid,card);
    var msg = {}
    if(player.onTuoGuan == false){
        player.seyOnTuoGuan(true);
        messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onTuoGuan',msg);
    }
}
Room.prototype.update = function(data){
    var room = data.room;
    var player = Business.players[room.currentPlayers[room.currentPlayer]];
    if (player.state_doHu == true) {
        room.CheckHuType();
        room.CountHuScore();
        room.CountGangScore();
        room.storeData(1);
        var playerHuData = new Array();
        for(var i = 0; i < room.roomPlayerIds.length; i++){
            var hu_Player = Business.players[room.roomPlayerIds[i]];
            var huPaiArray = new Array();
            for(var k = 0 ; k < 5; k++){
                for(var j = 0; j < hu_Player.inHandCards[k].length; j++){
                    huPaiArray.push(hu_Player.inHandCards[k][j]);
                }
            }
            var data = {
                position:hu_Player.position,
                gangScore:hu_Player.GangScore,
                huScore:hu_Player.HuScore,
                cardsInHand:huPaiArray
            };
            playerHuData.push(data);
        }
        var bao = 0;
        if(room.m_bAlreadyDaBao == true){
            bao = room.m_BaoPAI.value;
        }else{
            bao = 0x00;
        }
        var huType = new Array();
        var ziMo = player.HuType_ZiMo?1:0;
        var piao = player.HuType_Piao?1:0;
        var duiBao = player.HuType_DuiBao?1:0;
        var jiaHu = player.HuType_JiaHu?1:0;
        var zhanLi = player.HuType_ZhanLi?1:0;
        huType.push(ziMo);huType.push(piao);huType.push(duiBao);huType.push(jiaHu);huType.push(zhanLi);
        var zhuaDePai = {};var daDePai = {};
        var dianPosition = -1;
        if(ziMo == 1){
            zhuaDePai = room.m_ZhuaDePAi;
            daDePai = {key:-2,value:0x00};
        }else{
            zhuaDePai = {key:-1,value:0x00};
            daDePai = room.daChuDePai;
            dianPosition = room.lastPlayer + 1;
        }

        var msg = {
            resArray:playerHuData,
            huPosition:player.position,
            bao:bao,
            huType:huType,
            zhuaDePai:zhuaDePai,
            daDePai:daDePai,
            dianPosition:dianPosition
        }
        var uidArray = new Array();
        for(var i=0; i < room.roomPlayerIds.length; i++){
            var uidObject = {};
            uidObject.uid = room.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
        messageService.pushMessageByUids(uidArray,'onHu',msg);
        for(var i = 0; i < room.currentPlayers.length; i++){
            var allPlayer = Business.players[room.currentPlayers[i]];
            if(allPlayer.isOnline == false){
                allPlayer.leaveRoom(room);
                var strChannelId = allPlayer.channelId + '';
                allPlayer.leaveChannel(Business.channels[allPlayer.channelId]);
                var channel = pomelo.app.get('channelService').getChannel(strChannelId, false);
                channel.leave(allPlayer.uid, allPlayer.sid);
                delete Business.players[allPlayer.uid];//此人离开房间后 把此人从缓存中删除
            }else{
                allPlayer.reSetPai();
            }
        }
        room.reSetRoomData();
        if(room.bankerPosition != player.position){
            room.setBankerPosition();
        }
        clearInterval(room.id);
        return;
    }
    for (var i = 1; i < 4; i++) {
        var playerNextIndex = (room.currentPlayer + i) % 4;
        var playerNext = Business.players[room.currentPlayers[playerNextIndex]];
        if (playerNext.isTing == true) {
            playerNext.setState_nextRoundAfterTing(true);
        }
    }
    if(player.isTing == true && player.state_nextRoundAfterTing == true){
//        if(room.m_bAlreadyDaBao == true){
        var baoPai = room.setBaoPai();
        player.setBaoPai(baoPai);
        if (room.CheckBaoPai() == false) {
            room.ChangeBaoPai();
        }
//        }
        //打宝

        if (player.CheckHuPaiWithBaoPai()) {
            if (player.state_guoMyTurn == false) {
                player.setCanHu(true);
                var haveGang = 0;
                if(player.haveYaoGang || player.haveJiuGang || player.haveXiGang
                    || player.haveXuanFengGang || player.haveAnGang|| player.haveMingGang || player.state_mingGangFromOther|| player.haveBuYao
                    || player.haveBuJiu || player.haveBuXi|| player.haveBuXuanFeng){
                    haveGang = 1;
                }
                var canHu = player.canHu?1:0;
                var canTing = player.canTing?1:0;
                var canChi = player.canChi?1:0;
                var canPeng = player.canPeng?1:0;
                var msg = {
                    canGang:haveGang,
                    canHu:canHu,
                    canTing:canTing,
                    canChi:canChi,
                    canPeng:canPeng
                }
                messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onAction',msg);
                var mssg = {};
                var uidArray = new Array();
                for(var i=0; i < room.roomPlayerIds.length; i++){
                    var uidObject = {};
                    uidObject.uid = room.roomPlayerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
                messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
                clearInterval(room.id);
                room.onlyId = setTimeout(room.ziDongGuo,12000,{player:player,room:room});
                return ;
            }
        }
    }
    if(!room.CheckTianWanDan()){
        return;
    }
    if (player.state_zhuaWanPai == false) {
        //抓牌
        var card = room.getCard(player.uid);
        if(card == null){//没有牌了
            room.CountGangScore();
            room.storeData(2);
            var playerHuData = new Array();
            for(var i = 0; i < room.roomPlayerIds.length; i++){
                var hu_Player = Business.players[room.roomPlayerIds[i]];
                var huPaiArray = new Array();
                for(var k = 0 ; k < 5; k++){
                    for(var j = 0; j < hu_Player.inHandCards[k].length; j++){
                        huPaiArray.push(hu_Player.inHandCards[k][j]);
                    }
                }
                var data = {
                    position:hu_Player.position,
                    gangScore:hu_Player.GangScore,
                    huScore:hu_Player.HuScore,
                    cardsInHand:huPaiArray
                };
                playerHuData.push(data);
            }
            var bao = 0;
            if(room.m_bAlreadyDaBao == true){
                bao = room.m_BaoPAI.value;
            }else{
                bao = 0x00;
            }
            var msg = {
                resArray:playerHuData,
                bao:bao
            }
            var uidArray = new Array();
            for(var i=0; i < room.roomPlayerIds.length; i++){
                var uidObject = {};
                uidObject.uid = room.roomPlayerIds[i];
                uidObject.sid = player.sid;
                uidArray.push(uidObject);
            }
            messageService.pushMessageByUids(uidArray,'onPingJu',msg);
            logger.debug('推送平局事件onPingJu成功');
            for(var i = 0; i < room.currentPlayers.length; i++){
                var allPlayer = Business.players[room.currentPlayers[i]];
                if(allPlayer.isOnline == false){
                    allPlayer.leaveRoom(room);
                    var strChannelId = allPlayer.channelId + '';
                    allPlayer.leaveChannel(Business.channels[allPlayer.channelId]);
                    var channel = pomelo.app.get('channelService').getChannel(strChannelId, false);
                    channel.leave(allPlayer.uid, allPlayer.sid);
                    delete Business.players[allPlayer.uid];//此人离开房间后 把此人从缓存中删除
                }else{
                    allPlayer.reSetPai();
                }
            }
            room.reSetRoomData();
//            room.openKickTimer();
            clearInterval(room.id);
            return;
        }
        player.checkAllStateAfterZhuaPai();
        if (player.isTing == true && player.state_nextRoundAfterTing == true) {//当宝正好是胡的那张牌时
            if(room.m_BaoPAI.value == room.m_ZhuaDePAi.value){
                var totalCardsInHand = 0;
                for (var i = 0 ; i < 5; i++) {
                    totalCardsInHand += player.inHandCards[i].length + player.anGangCards[i].length;
                }
                if (totalCardsInHand == 2) {
                    var isChiVecEmpty = player.chiCrads[0].length == 0 &&  player.chiCrads[1].length == 0 &&  player.chiCrads[2].length == 0;
                    if (isChiVecEmpty) {
                        player.setCanHu(true);
                    }
                }else{
                    player.setCanHu(true);
                }
            }
        }
        player.setState_zhuaWanPai();
    }
    if (player.state_guoMyTurn == true || (player.haveYaoGang == false && player.haveJiuGang == false && player.haveXiGang == false
            && player.haveXuanFengGang == false && player.haveAnGang == false && player.haveMingGang == false
            && player.haveBuYao == false && player.haveBuJiu == false && player.haveBuXi == false
            && player.haveBuXuanFeng== false && player.canHu == false && player.canTing == false || player.onTuoGuan == true)
        ) {
        logger.debug('玩家：[ '+ player.uid +' ]没有********消息');
        if (player.state_daWanpai == false) {
            logger.debug('玩家：[ '+ player.uid +' ]打完牌的状态为false，关闭逻辑定时器');
            clearInterval(room.id);
            if(player.isTing && player.state_nextRoundAfterTing){
                logger.debug('玩家：[ '+ player.uid +' ]打完牌的状态为false，并且上听了，state_nextRoundAfterTing状态为true，则开启上听自动打牌定时器');
                room.onlyId = setTimeout(room.waitFucntion2,1000,{player:player,room:room});
            }else{
                if(player.onTuoGuan == true){
                    if(player.canHu == true && player.isTing == true){
                        room.clickHu(player.uid);
                    }else{
                        room.onlyId = setTimeout(room.waitFucntion,1000,{player:player,room:room});
                    }
                }else{
                    var msg ={}
                    messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onKeYiDaPai',msg);
                    if(player.isTing == true){
                        room.onlyId = setTimeout(room.wait4TingFucntion,12000,{player:player,room:room});
                    }else{
                        room.onlyId = setTimeout(room.waitFucntion,12000,{player:player,room:room});
                    }

                }
            }
        }
    }else{
        var haveGang = 0;
        if(player.haveYaoGang || player.haveJiuGang || player.haveXiGang
            || player.haveXuanFengGang || player.haveAnGang|| player.haveMingGang || player.state_mingGangFromOther|| player.haveBuYao
            || player.haveBuJiu || player.haveBuXi|| player.haveBuXuanFeng){
            haveGang = 1;
        }
        var canHu = player.canHu?1:0;
        var canTing = player.canTing?1:0;
        var canChi = player.canChi?1:0;
        var canPeng = player.canPeng?1:0;
        var msg = {
                canGang:haveGang,
                canHu:canHu,
                canTing:canTing,
                canChi:canChi,
                canPeng:canPeng
        }
        messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onAction',msg);
        logger.debug('推送玩家['+player.uid+'] 五种状态的事件：onAction');
        var mssg = {};
//        nextPlayerPosition = ((room.currentPlayer + 1)%4 + 1);
//        var msgg = {
//            position:nextPlayerPosition
//        }
        var uidArray = new Array();
        for(var i=0; i < room.roomPlayerIds.length; i++){
            var uidObject = {};
            uidObject.uid = room.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
//        messageService.pushMessageByUids(uidArray,'onChangeTurn',msgg);
        messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
        logger.debug('推送所有玩家更新计时器的消息：onActionTime');
        clearInterval(room.id);
        room.onlyId = setTimeout(room.ziDongGuo,12000,{player:player,room:room});
    }
    room.CheckDaWanPai();
}
Room.prototype.CheckDaWanPai = function(){
    var player2 = Business.players[this.currentPlayers[this.currentPlayer]];
    if (player2.state_daWanpai == true) {
        var daChuPai = this.daChuDePai;
        for (var i = 1; i < 4; i ++) {
            var playerNext =(this.currentPlayer + i) % 4;
            var player = Business.players[this.currentPlayers[playerNext]];
            if (player.state_checkingDaPaiFinish == true ) {
                continue;
            }
            player.CheckChiHuPai(daChuPai.key, daChuPai.value);

            player.CheckMingGangPaiFromOther(daChuPai.key, daChuPai.value);
            if (player.isTing == false) {//如果听了就只检查杠和胡
                player.checkPeng(daChuPai);
                if (i == 1) {
                    player.checkChi(daChuPai);
                }
            }
            player.setState_checkingDaPaiFinish();

        }
        for (var i = 1; i < 4; i ++) {
            var playerNext =(this.currentPlayer + i) % 4;
            var player = Business.players[this.currentPlayers[playerNext]];
            if (player.canHu == false || player.state_guoOtherTurn == true) {
                continue;
            }
            if (player.canHu == true && player.onTuoGuan == false) {
                var haveGang = 0;
                if(player.haveYaoGang || player.haveJiuGang || player.haveXiGang
                    || player.haveXuanFengGang || player.haveAnGang|| player.haveMingGang || player.state_mingGangFromOther|| player.haveBuYao
                    || player.haveBuJiu || player.haveBuXi|| player.haveBuXuanFeng){
                    haveGang = 1;
                }
                var canHu = player.canHu?1:0;
                var canTing = player.canTing?1:0;
                var canChi = player.canChi?1:0;
                var canPeng = player.canPeng?1:0;
                var msg = {
                    canGang:haveGang,
                    canHu:canHu,
                    canTing:canTing,
                    canChi:canChi,
                    canPeng:canPeng
                }
                messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onAction',msg);
                logger.debug('推送玩家['+player.uid+'] 五种状态的事件：onAction');
                var mssg = {};
//                nextPlayerPosition = ((this.currentPlayer + 1)%4 + 1);
//                var msgg = {
//                    position:nextPlayerPosition
//                }
                var uidArray = new Array();
                for(var i=0; i < this.roomPlayerIds.length; i++){
                    var uidObject = {};
                    uidObject.uid = this.roomPlayerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
//                messageService.pushMessageByUids(uidArray,'onChangeTurn',msgg);
                messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
                logger.debug('推送所有玩家更新计时器的消息：onActionTime');
                clearInterval(this.id);
                this.onlyId = setTimeout(this.ziDongGuo,12000,{player:player,room:this});
                return;
            }else if(player.canHu == true && player.onTuoGuan == true && player.isTing == true){
                this.clickHu(player.uid);
                return;
            }
        }
        for (var i = 1; i < 4; i ++) {
            var playerNext =(this.currentPlayer + i) % 4;
            var player = Business.players[this.currentPlayers[playerNext]];
            if (player.canHu == true) {
                continue;//如果已经胡过了，说明胡和其他状态都发过了
            }
            if (player.state_guoOtherTurn == true) {
                break;//如果点了过了，其他人就不可能杠和碰了
            }
            if ((player.state_mingGangFromOther == true || player.canPeng == true) && player.onTuoGuan == false) {
                var haveGang = 0;
                if(player.haveYaoGang || player.haveJiuGang || player.haveXiGang
                    || player.haveXuanFengGang || player.haveAnGang|| player.haveMingGang || player.state_mingGangFromOther|| player.haveBuYao
                    || player.haveBuJiu || player.haveBuXi|| player.haveBuXuanFeng){
                    haveGang = 1;
                }
                var canHu = player.canHu?1:0;
                var canTing = player.canTing?1:0;
                var canChi = player.canChi?1:0;
                var canPeng = player.canPeng?1:0;
                var msg = {
                    canGang:haveGang,
                    canHu:canHu,
                    canTing:canTing,
                    canChi:canChi,
                    canPeng:canPeng
                }
                messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onAction',msg);
                logger.debug('推送玩家['+player.uid+'] 五种状态的事件：onAction');
                var mssg = {};
//                nextPlayerPosition = ((this.currentPlayer + 1)%4 + 1);
//                var msgg = {
//                    position:nextPlayerPosition
//                }
                var uidArray = new Array();
                for(var i=0; i < this.roomPlayerIds.length; i++){
                    var uidObject = {};
                    uidObject.uid = this.roomPlayerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
//                messageService.pushMessageByUids(uidArray,'onChangeTurn',msgg);
                messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
                logger.debug('推送所有玩家更新计时器的消息：onActionTime');
                clearInterval(this.id);
                this.onlyId = setTimeout(this.ziDongGuo,12000,{player:player,room:this});
                return;
            }
        }
        do {
            var playerUid = this.currentPlayers[(this.currentPlayer + 1)%4];
            var player = Business.players[playerUid];
            if (player.haveMingGang == true ||player.canPeng == true || player.canHu == true) {
                continue;
            }
            if (player.state_guoOtherTurn == true) {
                continue;
            }
            if (player.canChi == true && player.onTuoGuan == false) {
                var haveGang = 0;
                if(player.haveYaoGang || player.haveJiuGang || player.haveXiGang
                    || player.haveXuanFengGang || player.haveAnGang|| player.haveMingGang || player.state_mingGangFromOther|| player.haveBuYao
                    || player.haveBuJiu || player.haveBuXi|| player.haveBuXuanFeng){
                    haveGang = 1;
                }
                var canHu = player.canHu?1:0;
                var canTing = player.canTing?1:0;
                var canChi = player.canChi?1:0;
                var canPeng = player.canPeng?1:0;
                var msg = {
                    canGang:haveGang,
                    canHu:canHu,
                    canTing:canTing,
                    canChi:canChi,
                    canPeng:canPeng
                }
                messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onAction',msg);
                logger.debug('推送玩家['+player.uid+'] 五种状态的事件：onAction');
                var mssg = {};
//                nextPlayerPosition = ((this.currentPlayer + 1)%4 + 1);
//                var msgg = {
//                    position:nextPlayerPosition
//                }
                var uidArray = new Array();
                for(var i=0; i < this.roomPlayerIds.length; i++){
                    var uidObject = {};
                    uidObject.uid = this.roomPlayerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
//                messageService.pushMessageByUids(uidArray,'onChangeTurn',msgg);
                messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
                logger.debug('推送所有玩家更新计时器的消息：onActionTime');
                clearInterval(this.id);
                this.onlyId = setTimeout(this.ziDongGuo,12000,{player:player,room:this});
                return;
            }
        } while (0);
        this.ResetStateAfterChangePlayer((this.currentPlayer + 1) % 4 , true);
    }
}
Room.prototype.ResetStateAfterChangePlayer = function(current,canZhuaPai){
    this.lastPlayer = this.currentPlayer;
    var player = Business.players[this.currentPlayers[this.currentPlayer]];
    player.resetState();
    this.currentPlayer = current;
    this.resumeCheck();
    var nextPlayer = Business.players[this.currentPlayers[current]];
    logger.debug('玩家：'+ player.uid + '动作结束，执行权交给：' + nextPlayer.uid);
    nextPlayer.resetNotifyState();
    if (canZhuaPai == true) {
        nextPlayer.setState_zhuaWanPaiFalse();
    }
    else{
        nextPlayer.setState_zhuaWanPai();
        if(player.buGanging == false && player.state_mingGangFromOther == false){
            var del = player.DaChuPaiBeiChiPengGangHu();
            if(del){
                var playerIds = this.roomPlayerIds;
                var uidArray = new Array();
                for(var i = 0; i < playerIds.length; i++){
                    var uidObject = {}
                    uidObject.uid = playerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
                var msg = {
                    position:(this.lastPlayer + 1)
                }
                messageService.pushMessageByUids(uidArray,'onChiPengGangHu',msg);
            }
        }else{
            player.setBuGanging(false);
            player.setState_mingGangFromOther(false);
//            this.buGanging = false;
        }

    }
    var msg = {
        position:nextPlayer.position
    };
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
        var uidObject = {};
        uidObject.uid = this.roomPlayerIds[i];
        uidObject.sid = player.sid;
        uidArray.push(uidObject);
    }
    var mssg ={};
    messageService.pushMessageByUids(uidArray,'onChangeTurn',msg);
    messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
    nextPlayer.setState_daWanpaiFalse();
}
Room.prototype.resumeCheck = function(){
    var player1 = Business.players[this.currentPlayers[(this.currentPlayer + 1)%4]];
    var player2 = Business.players[this.currentPlayers[(this.currentPlayer + 2)%4]];
    var player3 = Business.players[this.currentPlayers[(this.currentPlayer + 3)%4]];
    player1.resetNotifyState();
    player2.resetNotifyState();
    player3.resetNotifyState();
}
Room.prototype.openScheduleJob = function(){
    this.id = setInterval(this.update,40,{room:this});
}
Room.prototype.setCurrentPlayer = function(uid){
    for(var  i = 0; i < this.currentPlayers.length; i++){
        if(uid == this.currentPlayers[i]){
            this.currentPlayer = i;
        }
    }
}
Room.prototype.initCurrentPlayers = function(){
    for(var  i = 0; i < this.positions.length; i++){
        this.currentPlayers.push(this.positions[i][i+1]);
    }
}
/**
 * init cards for everyOne
 */
Room.prototype.initPlayersCard = function() {
    logger.debug('[Room.prototype.initPlayersCard] --- 关闭检查踢人条件定时器');
//    clearInterval(this.readyId);
//    clearTimeout(this.kickId);
    //init cards for this room
    for(var i = 0; i < Business.cards.length; i++){
        this.allCards.push(Business.cards[i]);
    }
    //shuffle cards for this room
    this.allCards =  this.shuffle(this.allCards);
    for(var i=0; i < this.roomPlayerIds.length; i++){
        var player = Business.players[this.roomPlayerIds[i]];
        for(var j=0; j < 13; j++){
            var card = this.allCards[0];
            player.setInHandsCards(card.key,card.value);
            this.allCards.splice(0,1);
        }
        player.sortShouLiPai();
    }

}
Room.prototype.shuffle = function(o){ //v1.0
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
/**
 * 点击打牌
 * @param uid
 * @param card
 * @returns {boolean}
 */
Room.prototype.daPaiTest = function(uid){
    var player = Business.players[uid];
    var card = {};
    if(!this.m_ZhuaDePAi){
        if(player.inHandCards[0].length > 0){
            var value = player.inHandCards[0][0];
            card.key = 0;
            card.value = value;
        }

    }else{
        card = this.m_ZhuaDePAi;
    }
    clearTimeout(this.onlyId);
    var dapaiPosition = player.chuPai(card.key,card.value);
    this.daChuDePai = card;
    var position = this.getPositionByUid(uid);
    var msg = {
        daChuPaiJson:{
            value:card.value
        },
        deletePos:dapaiPosition,
        chuPaiPlayerID:position
    }
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
        if(uid !== this.roomPlayerIds[i]){
            var uidObject = {};
            uidObject.uid = this.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
    }
    messageService.pushMessageByUids(uidArray,'onDaPai',msg);
    logger.debug('测试打完牌，开启逻辑定时器');
    this.openScheduleJob();
}
Room.prototype.daPai = function(uid,card){
    clearTimeout(this.onlyId);
    var player = Business.players[uid];
//    if(player.state_daWanpai == true){
//        return false;
//    }
    var dapaiPosition = player.chuPai(card.key,card.value);
    this.daChuDePai = card;
    this.m_ZhuaDePAi = {key:-1,value:0x00};
    player.setZhuadePai({key:-1,value:0x00});
    logger.debug('玩家uid ：' + uid + ',打出的牌：' + JSON.stringify(card));
        var position = this.getPositionByUid(uid);
        var msg = {
            daChuPaiJson:{
                key:card.key,
                value:card.value
            },
            deletePos:dapaiPosition,
            chuPaiPlayerID:position
        }
        var uidArray = new Array();
        for(var i=0; i < this.roomPlayerIds.length; i++){
            if(uid !== this.roomPlayerIds[i]){
                var uidObject = {};
                uidObject.uid = this.roomPlayerIds[i];
                uidObject.sid = player.sid;
                uidArray.push(uidObject);
            }
        }
    messageService.pushMessageByUids(uidArray,'onDaPai',msg);
    logger.debug('玩家：' + uid + '打完牌，开启逻辑定时器');
    this.openScheduleJob();
    return true;
}
Room.prototype.daPai4Ting = function(uid,card){
    clearTimeout(this.onlyId);
    var player = Business.players[uid];
    var dapaiPosition = player.chuPai(card.key,card.value);
    this.daChuDePai = card;
    this.m_ZhuaDePAi = {key:-1,value:0x00};
    player.setZhuadePai({key:-1,value:0x00});
    logger.debug('玩家uid ：' + uid + ',打出的牌：' + JSON.stringify(card));
    var position = this.getPositionByUid(uid);
    var msg = {
        daChuPaiJson:{
            key:card.key,
            value:card.value
        },
        deletePos:dapaiPosition,
        chuPaiPlayerID:position
    }
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
            var uidObject = {};
            uidObject.uid = this.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
    }
    messageService.pushMessageByUids(uidArray,'onDaPai',msg);
    logger.debug('玩家：' + uid + '打完牌，开启逻辑定时器');
    this.openScheduleJob();
}
Room.prototype.getCard = function(uid){
    var card = null;
    var position = this.getPositionByUid(uid);
    var player = Business.players[uid];
    if(this.allCards.length > 16){
        card = this.allCards[0];
        player.setInHandsCards(card.key,card.value);
        this.allCards.splice(0,1);
        player.sortShouLiPai(card.key);
    }else{
        return null;
    }
    this.m_ZhuaDePAi = card;
    player.setZhuadePai(card);
    var paiLength = this.allCards.length - 16;
    var daPaiType = 0;
    if(player.isTing && player.state_nextRoundAfterTing){
        daPaiType = 1;
    }
    var msg = {
        zhuaPaiPlayerID : position,
        zhuaDePai:card,
        daPaiType:daPaiType
    }
    messageService.pushMessageToPlayer({uid:uid, sid : player.sid},'onZhuaPai',msg);
    for(var i = 0 ; i < this.currentPlayers.length;i++){
        var player = Business.players[this.currentPlayers[i]];
        logger.debug('每个人的信息：' + JSON.stringify(player));
    }
    var msgg = {
        zhuaPaiPlayerID:position
    }
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
        if(this.roomPlayerIds[i] != uid){
            var uidObject = {};
            uidObject.uid = this.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
    }
    messageService.pushMessageByUids(uidArray,'onAnotherZhuaPai',msgg);
    var msggg = {
        last:paiLength
    };
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
            var uidObject = {};
            uidObject.uid = this.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
    }
//    var mssg = {};
    messageService.pushMessageByUids(uidArray,'onLast',msggg);
//    messageService.pushMessageByUids(uidArray,'onActionTime',mssg)
    logger.debug('玩家：[ ' + uid + ' ],抓牌，抓的牌为：' + JSON.stringify(card));
    return card;
};
Room.prototype.addRoomPlayer = function(uid) {
    this.roomPlayerIds.push(uid);
    this.totalRoomPlayerCount++;
    for(var i = 0; i < this.positions.length; i++){
        if(this.positions[i][i+1] == null || this.positions[i][i+1] == ''){
            this.positions[i][i+1] = uid + '';
            break;
        }
    }
};
Room.prototype.removeRoomPlayerById = function(uid) {

    for(var i = 0; i < this.roomPlayerIds.length; i++){
        if(this.roomPlayerIds[i] == uid){
            this.roomPlayerIds.splice(i,1);
            this.totalRoomPlayerCount--;
        }
    }
    for(var i = 0; i < this.positions.length; i++){
        if(this.positions[i][i+1] == uid)  {
            this.positions[i][i+1] = '';
            break;
        }
    }
    this.cancelKickTimer();
    if(this.totalRoomPlayerCount == 3){
        logger.debug('此时房间内有三个人，开启检查定时器');
        this.openKickTimer();
    }
};
Room.prototype.getPositionByUid = function(uid){
    for(var i = 0; i < this.positions.length; i++){
        var position = 0;
         if(this.positions[i][i+1] == uid)  {
             position = i + 1;
             break;
         }
    }
    return position;
}
Room.prototype.setBankerPosition = function(){
    var pos = this.bankerPosition;
    this.bankerPosition = pos%4 + 1;
}
/**
 * 点击杠按钮
 * @param uid
 */
Room.prototype.clickGang = function(uid){
    clearTimeout(this.onlyId);
    if(this.currentPlayers[this.currentPlayer] == uid){
        this.PlayerDoZhuaPaiGang(uid);
    }else{
        this.PlayerDoGangPaiFromOther(uid);
    }
    logger.debug('玩家uid ：' + uid + ',点击杠！');
    logger.debug('玩家：' + uid + '点击完杠，开启逻辑定时器');
    this.openScheduleJob();

}
Room.prototype.PlayerDoZhuaPaiGang = function(uid){
    var player = Business.players[uid];
    var playerPosition = player.position;
    var playerIds = this.roomPlayerIds;
    var uidArray = new Array();
    for(var i = 0; i < playerIds.length; i++){
        var uidObject = {}
        uidObject.uid = playerIds[i];
        uidObject.sid = player.sid;
        uidArray.push(uidObject);
    }

    if (player.haveYaoGang) {
        var position = player.setYaoGangCards();
        player.setState_zhuaWanPai();
        if (player.isBanker == false) {
            player.checkBuYaoGang();
            if (player.checkAnGang()) {
                player.setHaveAnGang(true);
            }
        }
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:1,
            deletePos1:position.key1,
            deletePos2:position.key2,
            deletePos3:position.key3
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveJiuGang) {
        var position = player.setJiuGangCards();
        player.setState_zhuaWanPai();
        if (player.isBanker == false) {
            player.checkBuJiuGang();
            if (player.checkAnGang()) {
                player.setHaveAnGang(true);
            }
        }
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:2,
            deletePos1:position.key1,
            deletePos2:position.key2,
            deletePos3:position.key3
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveXiGang) {
        var position = player.setXiGangCards();
        player.setState_zhuaWanPai();

        if (player.isBanker == false) {
            player.checkBuXiGang();
            if (player.checkAnGang()) {
                player.setHaveAnGang(true);
            }
        }
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:3,
            deletePos1:position.key1,
            deletePos2:position.key2,
            deletePos3:position.key3
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveXuanFengGang) {
        var position = player.setXuanFengGang();
        player.setState_zhuaWanPaiFalse();
        if (player.isBanker == false) {
            if (player.checkBuXuanFengGang() == true) {
                player.setState_tianDNXBDan(true);
            }
        }
        else
            player.setState_tianDNXBDan(true);
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:4,
            deletePos1:position.key1,
            deletePos2:position.key2,
            deletePos3:position.key3,
            deletePos4:position.key4
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveBuYao) {
        var position = player.setBuYaoGang();
        this.currentGangType = 1;
        this.currentGangCatd = position.card;
        this.daChuDePai = position.card;
        player.setBuGanging(true);
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:5,
            key:position.card.key,
            value:position.card.value,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveBuJiu) {
        var position = player.setBuJiuGang()
        this.currentGangType = 2;
        this.currentGangCatd = position.card;
        this.daChuDePai = position.card;
        player.setBuGanging(true);
//        this.buGanging = true;
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:5,
            key:position.card.key,
            value:position.card.value,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveBuXi) {
        var position = player.setBuXiGang();
        this.currentGangType = 3;
        this.currentGangCatd = position.card;
        this.daChuDePai = position.card;
        player.setBuGanging(true);
//        this.buGanging = true;
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:5,
            key:position.card.key,
            value:position.card.value,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveBuXuanFeng) {
        var position = player.setBuXuanFengGang();
        this.currentGangType = 4;
        this.currentGangCatd = position.card;
        this.daChuDePai = position.card;
        player.setBuGanging(true);
//        this.buGanging = true;
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:5,
            key:position.card.key,
            value:position.card.value,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveAnGang) {
        var position = player.setAnGang();
        this.currentGangCatd =  position.card;
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:9,
            key:position.card.key,
            value:position.card.valeu,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }
    if (player.haveMingGang) {
        var position = player.setMingGang();
        this.currentGangType = 10;
        this.currentGangCatd = position.card;
        this.daChuDePai = position.card;
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:7,
//            key:position.card.key,
//            value:position.card.value,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        return true;
    }

}
Room.prototype.PlayerDoGangPaiFromOther = function(uid){
    var player = Business.players[uid];
    player.setState_firstZhuaPai(false);
    var currentPlayerIndex = -1;
    for(var i = 0; i < this.currentPlayers.length; i++){
        if(this.currentPlayers[i] == uid){
            currentPlayerIndex = i;
        }
    }
    if (player.state_mingGangFromOther) {
        this.ResetStateAfterChangePlayer(currentPlayerIndex,false);
        var pai = this.daChuDePai;
        var position = player.DoMingGangPaiFromOther(pai.key, pai.value);
        player.setState_zhuaWanPaiFalse();
        var playerPosition = player.position;
        var playerIds = this.roomPlayerIds;
        var uidArray = new Array();
        for(var i = 0; i < playerIds.length; i++){
            var uidObject = {}
            uidObject.uid = playerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
        var msg = {
            gangPaiPlayerID:playerPosition,
            gangActionType:8,
            key:pai.key,
            value:pai.value,
            deletePos1:position.key
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
    }
    return true;
}
Room.prototype.CheckTianWanDan = function(){
    var tianDanPai = this.currentGangCatd;
    var player = Business.players[this.currentPlayers[this.currentPlayer]];

    if (player.state_tianWanDan == false && player.state_doingTianDan == true) {
        for (var i = 1; i < 4; i ++) {
            var playerNextIndex =(this.currentPlayer + i) % 4;
            var platerNext = Business.players[this.currentPlayers[playerNextIndex]];
            if (platerNext.state_checkingTianDanFinish == true) {
                continue;
            }
            if (platerNext.CheckChiHuPai(tianDanPai.key, tianDanPai.value) == true)
                platerNext.setCanHu(true);
            if (platerNext.isTing == false) {
                platerNext.checkPeng(tianDanPai);
            }
            platerNext.setState_checkingTianDanFinish(true);
        }

        for (var i = 1; i < 4; i ++) {
            var playerNextIndex =(this.currentPlayer + i) % 4;
            var platerNext = Business.players[this.currentPlayers[playerNextIndex]];
            if (platerNext.canHu == false || platerNext.state_guoOtherTurn == true) {
                continue;
            }
            if (platerNext.canHu == true) {
                var haveGang = 0;
                if(platerNext.haveYaoGang || platerNext.haveJiuGang || platerNext.haveXiGang
                    || platerNext.haveXuanFengGang || platerNext.haveAnGang|| platerNext.haveMingGang || platerNext.state_mingGangFromOther|| platerNext.haveBuYao
                    || platerNext.haveBuJiu || platerNext.haveBuXi|| platerNext.haveBuXuanFeng){
                    haveGang = 1;
                }
                var canHu = platerNext.canHu?1:0;
                var canTing = platerNext.canTing?1:0;
                var canChi = platerNext.canChi?1:0;
                var canPeng = platerNext.canPeng?1:0;
                var msg = {
                    canGang:haveGang,
                    canHu:canHu,
                    canTing:canTing,
                    canChi:canChi,
                    canPeng:canPeng
                }
                messageService.pushMessageToPlayer({uid:platerNext.uid,sid:platerNext.sid},'onAction',msg);
                var mssg = {};
//                nextPlayerPosition = ((this.currentPlayer + 1)%4 + 1);
//                var msgg = {
//                    position:nextPlayerPosition
//                }
                var uidArray = new Array();
                for(var i=0; i < this.roomPlayerIds.length; i++){
                    var uidObject = {};
                    uidObject.uid = this.roomPlayerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
//                messageService.pushMessageByUids(uidArray,'onChangeTurn',msgg);
                messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
                clearInterval(this.id);
                this.onlyId = setTimeout(this.ziDongGuo,12000,{player:platerNext,room:this});
                return false;
            }
        }
        for (var i = 1; i < 4; i ++) {
            var playerNextIndex =(this.currentPlayer + i) % 4;
            var platerNext = Business.players[this.currentPlayers[playerNextIndex]];
            if (platerNext.canHu == true) {
                continue;//如果已经胡过了，说明胡和其他状态都发过了
            }
            if (platerNext.state_guoOtherTurn == true) {
                break;//如果点了过了，其他人就不可能碰了
            }
            if (platerNext.canPeng == true) {
                var haveGang = 0;
                if(platerNext.haveYaoGang || platerNext.haveJiuGang || platerNext.haveXiGang
                    || platerNext.haveXuanFengGang || platerNext.haveAnGang|| platerNext.haveMingGang || platerNext.state_mingGangFromOther|| platerNext.haveBuYao
                    || platerNext.haveBuJiu || platerNext.haveBuXi|| platerNext.haveBuXuanFeng){
                    haveGang = 1;
                }
                var canHu = platerNext.canHu?1:0;
                var canTing = platerNext.canTing?1:0;
                var canChi = platerNext.canChi?1:0;
                var canPeng = platerNext.canPeng?1:0;
                var msg = {
                    canGang:haveGang,
                    canHu:canHu,
                    canTing:canTing,
                    canChi:canChi,
                    canPeng:canPeng
                }
                messageService.pushMessageToPlayer({uid:platerNext.uid,sid:platerNext.sid},'onAction',msg);
                var mssg = {};
//                nextPlayerPosition = ((this.currentPlayer + 1)%4 + 1);
//                var msgg = {
//                    position:nextPlayerPosition
//                }
                var uidArray = new Array();
                for(var i=0; i < this.roomPlayerIds.length; i++){
                    var uidObject = {};
                    uidObject.uid = this.roomPlayerIds[i];
                    uidObject.sid = player.sid;
                    uidArray.push(uidObject);
                }
//                messageService.pushMessageByUids(uidArray,'onChangeTurn',msgg);
                messageService.pushMessageByUids(uidArray,'onActionTime',mssg);
                clearInterval(this.id);
                this.onlyId = setTimeout(this.ziDongGuo,12000,{player:platerNext,room:this});
                return false;
            }
        }
        player.setState_tianWanDan(true);
        player.setState_doingTianDan(false);
        player.PlayerDoTianGangFinished(tianDanPai);
        if(this.currentGangType == 10){
            var msg = {
                gangPaiPlayerID:player.position,
                gangActionType:10,
                key:this.currentGangCatd.key,
                value:this.currentGangCatd.value
            }
        }else{
            var msg = {
                gangPaiPlayerID:player.position,
                type:this.currentGangType,
                gangActionType:6,
                key:this.currentGangCatd.key,
                value:this.currentGangCatd.value
            }
        }

        var uidArray = new Array();
        for(var i=0; i < this.roomPlayerIds.length; i++){
            var uidObject = {};
            uidObject.uid = this.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
        messageService.pushMessageByUids(uidArray,'onGang',msg);
        this.resumeCheck();
    }
    return true;

}
/**
 * 点击听按钮
 * @param uid
 */
Room.prototype.clickTing = function(uid){
    clearTimeout(this.onlyId);
    var player = Business.players[uid];
    player.clickTing();
    var msg = {
        position:player.position
    }
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
        if(this.roomPlayerIds[i] != uid){
            var uidObject = {};
            uidObject.uid = this.roomPlayerIds[i];
            uidObject.sid = player.sid;
            uidArray.push(uidObject);
        }
    }
    messageService.pushMessageByUids(uidArray,'onTing',msg);
    logger.debug('玩家uid ：' + uid + ',点击听！');
    logger.debug('玩家：' + uid + '点击完听，开启逻辑定时器');
    this.openScheduleJob();
}
Room.prototype.getPaiLastWhenTing = function(card){
    var ret = 0;
    for (var i = 0; i < 4; i++) {
        var players = Business.players[this.currentPlayers[i]];
        ret += players.CheckPaiNumInThisPlayer(card);
    }
    var player = Business.players[this.currentPlayers[this.currentPlayer]];
    ret += player.CheckPaiNumInHand(card);
    ret = 4 - ret;
    return ret;
}
Room.prototype.clickChi = function(uid){
    clearTimeout(this.onlyId);
    var player  = Business.players[uid];
    var chiPai = player.currentChi;
    logger.debug('玩家uid ：' + uid + ',点击吃！');
    return chiPai;
}
Room.prototype.clickChi2 = function(uid,index){
    var player  = Business.players[uid];
    var cnm = player.setChi(this.daChuDePai,index);
    var position = this.getPositionByUid(uid);
    var chidePai = player.currentChi[index];
    var msg = {
        chiDePai:chidePai,
        chiPaiPlayerID:position,
        deletePos1:cnm.key1,
        deletePos2:cnm.key2
    }
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
        var uidObject = {};
        uidObject.uid = this.roomPlayerIds[i];
        uidObject.sid = player.sid;
        uidArray.push(uidObject);
    }
    messageService.pushMessageByUids(uidArray,'onChi',msg);
    var curr = -1;
    for(var i = 0; i < this.currentPlayers.length; i++){
        if(this.currentPlayers[i] == uid){
            curr = i;
            break;
        }
    }
    this.ResetStateAfterChangePlayer(curr , false);
    if(player.checkTing()){
        player.setCanTing(true);
    }
    logger.debug('玩家uid ：' + uid + ',点击要吃的牌！');
    logger.debug('玩家：' + uid + '点击完要吃的牌，开启逻辑定时器');
    this.openScheduleJob();
}
Room.prototype.clickPeng = function(uid){
    clearTimeout(this.onlyId);
    var player = Business.players[uid];
    var cnm = player.setPeng(this.daChuDePai.key,this.daChuDePai.value);
    var position = this.getPositionByUid(uid);
    var curr = -1;
    for(var i = 0; i < this.currentPlayers.length; i++){
        if(this.currentPlayers[i] == uid){
            curr = i;
            break;
        }
    }
    var msg = {
        pengPai:this.daChuDePai,
        pengPaiPlayerID:position,
        deletePos1:cnm.key,
        deletePos2:(cnm.key + 1)
    }
    var uidArray = new Array();
    for(var i=0; i < this.roomPlayerIds.length; i++){
        var uidObject = {};
        uidObject.uid = this.roomPlayerIds[i];
        uidObject.sid = player.sid;
        uidArray.push(uidObject);
    }
    messageService.pushMessageByUids(uidArray,'onPeng',msg);
    var curr = -1;
    for(var i = 0; i < this.currentPlayers.length; i++){
        if(this.currentPlayers[i] == uid){
            curr = i;
            break;
        }
    }
    this.ResetStateAfterChangePlayer(curr , false);
    if(player.checkTing()){
        player.setCanTing(true);
    }
    logger.debug('玩家uid ：' + uid + ',点击碰！');
    logger.debug('玩家：' + uid + '点击完碰，开启逻辑定时器');
    this.openScheduleJob();
}
Room.prototype.clickGuo = function(uid){
    clearTimeout(this.onlyId);
    var currPlayerId = this.currentPlayers[this.currentPlayer];
    if (currPlayerId == uid) {
        var currPlayer = Business.players[currPlayerId];
        currPlayer.setState_guoMyTurn(true);
    }else{
        var player = Business.players[uid];
        player.settState_guoOtherTurn(true);
    }
    logger.debug('玩家uid ：' + uid + ',点击放弃！');
    logger.debug('玩家：' + uid + '点击完过，开启逻辑定时器');
    this.openScheduleJob();
}
Room.prototype.CheckBaoPai = function(){
    var count = 0;
    for (var i = 0; i < 4; i++) {
        var player = Business.players[this.currentPlayers[i]];
        count += player.CheckBaoPaiNumInThisPlayer(this.m_BaoPAI);
    }
    if (count == 3) {
        return false;
    }
    return true;
}
Room.prototype.setBaoPai = function(){
    if (this.m_bAlreadyDaBao == false) {
        this.m_bAlreadyDaBao = true;
        var card = this.allCards[0];
        this.allCards.splice(0,1);
        this.m_BaoPAI = card;
    }
    return this.m_BaoPAI;
}
Room.prototype.ChangeBaoPai = function(){
    var card = this.allCards[0];
    this.allCards.splice(0,1);
    this.m_BaoPAI = card;
}
Room.prototype.cancel_TuoGuan = function(uid){
//    clearTimeout(this.onlyId);
    var player = Business.players[uid];
    player.seyOnTuoGuan(false);
}
Room.prototype.clickHu = function(uid){
    clearTimeout(this.onlyId);
    var currPlayer = this.currentPlayers[this.currentPlayer];
    if (currPlayer == uid) {
        var player = Business.players[currPlayer];
        player.PlayerDoHuMyTurn();
    }else{
        var player = Business.players[uid];
        player.PlayerDoHuOtherTurn();
        var currentPlayerIndex = -1;
        for(var i = 0; i < this.currentPlayers.length; i++){
            if(this.currentPlayers[i] == uid){
                currentPlayerIndex = i;
            }
        }
        this.ResetStateAfterChangePlayer(currentPlayerIndex,false);
    }
    logger.debug('玩家：' + uid + '点击完胡，开启逻辑定时器');
    this.openScheduleJob();

}
Room.prototype.CheckHuType = function(){
    var player = Business.players[this.currentPlayers[this.currentPlayer]];

    if (player.HuType_ZiMo == true) {
        if (player.baoPai.value != 0x00) {
            if (player.zhuaDePai.value == 0x00) {
                player.setHuType_DuiBao(true);
                if (player.CheckPiaoWithPai(player.baoPai) == true) {
                    player.setHuType_Piao(true);
                }
                if (player.CheckJiaHuWith13PaisInHand() == true) {
                    player.setHuType_JiaHu(true);
                }
            }else{
                if (player.baoPai.value == player.zhuaDePai.value) {
                    player.setHuType_DuiBao(true);
                }
                if (player.CheckPiaoWithoutPai() == true) {
                    player.setHuType_Piao(true);
                }
                if (player.CheckJiaHuWith14PaisInHand(player.zhuaDePai) == true) {
                    player.setHuType_JiaHu(true);
                }
            }
        }
        else{
            if (player.CheckPiaoWithoutPai() == true) {
                player.setHuType_Piao(true);
            }
            if (player.CheckJiaHuWith14PaisInHand(player.zhuaDePai) == true) {
                player.setHuType_JiaHu(true);
            }
        }
    }
    else{
        if (player.CheckPiaoWithPai(this.daChuDePai) == true) {
            player.setHuType_Piao(true);
        }
        if (player.CheckJiaHuWith13PaisInHand() == true) {
            player.setHuType_JiaHu(true);
        }
    }
    if (player.CheckZhanLi() == true) {
        player.setHuType_ZhanLi(true);
    }
    logger.debug('玩家：[ '+ player.uid +' ]检查胡牌的类型成功');
}
Room.prototype.CountHuScore = function(){
    var Fan = 0;
    if(this.channelId == 0){
        Fan = 200;
    }else if(this.channelId == 1){
        Fan = 500;
    }else if(this.channelId == 2){
        Fan = 1000;
    }else if(this.channelId == 3){
        Fan = 2000;
    }else if(this.channelId == 4){
        Fan = 5000;
    }else if(this.channelId ==5){
        Fan = 8888;
    }
    var player = Business.players[this.currentPlayers[this.currentPlayer]];
    if (player.HuType_Piao == true){
        Fan *= 4;
    }
    if (player.HuType_DuiBao == true) {
        Fan *= 2;
    }
    if (player.HuType_JiaHu == true) {
        if (player.HuType_Piao != true) {
            Fan *= 2;
        }
    }
    if (player.HuType_ZiMo == true) {
        Fan *= 2;
    }else{
        var oldPlayer = Business.players[this.currentPlayers[this.lastPlayer]];
        var type = oldPlayer.HuScore *= 2;
        oldPlayer.setHuScore(type);
    }
    if (player.HuType_ZhanLi == true) {
        Fan *= 2;
    }
    if (player.isBanker == true) {
        Fan *= 2;
    }
    for (var i = this.currentPlayer + 1; i < this.currentPlayer + 4; i++) {
        var currPlayer =  Business.players[this.currentPlayers[i % 4]];
        var type = currPlayer.HuScore *= Fan;
        currPlayer.setHuScore((0 - type));
        if (currPlayer.isBanker == true) {
            var t = currPlayer.HuScore *= 2;
            currPlayer.setHuScore(t);
        }
}
    var huTotal = 0;
    for (var i = this.currentPlayer+ 1; i < this.currentPlayer + 4; i++) {
        var currPlayer =  Business.players[this.currentPlayers[i % 4]];
        huTotal += currPlayer.HuScore;
    }
    var player2 = Business.players[this.currentPlayers[this.currentPlayer]];
    player2.setHuScore((0 -huTotal));
    logger.debug('计算胡牌的分数成功');
}
Room.prototype.CountGangScore = function(){
    var Fan = 0;
    if(this.channelId == 0){
        Fan = 200;
    }else if(this.channelId == 1){
        Fan = 500;
    }else if(this.channelId == 2){
        Fan = 1000;
    }else if(this.channelId == 3){
        Fan = 2000;
    }else if(this.channelId == 4){
        Fan = 5000;
    }else if(this.channelId == 5){
        Fan = 8888;
    }
    for (var i = 0 ; i < 4; i++) {
        var currentPlayer = Business.players[this.currentPlayers[i]];
        var iGangScore = currentPlayer.getGangTotalNums() * Fan;
        var num = currentPlayer.GangScore += iGangScore * 3;
        currentPlayer.setGangScore(num);
        for (var j = i + 1 ; j < i + 4; j++) {
            var nextPlayer = Business.players[this.currentPlayers[j % 4]];
            var t = nextPlayer.GangScore -= iGangScore;
            nextPlayer.setGangScore(t);
        }
    }
    logger.debug('计算杠的分数成功');
}
Room.prototype.storeData = function(type){
    var taiFei = 0;
    var w_exp = 0;
    var l_exp = 0;
    var d_exp = 0;
    if(this.channelId == 0){
        taiFei = 200;
        w_exp = 10;
        l_exp = 1;
        d_exp = 2;
    }else if(this.channelId == 1){
        taiFei = 200;
        w_exp = 15;
        l_exp = 2;
        d_exp = 5;
    }else if(this.channelId == 2){
        taiFei = 200;
        w_exp = 25;
        l_exp = 3;
        d_exp = 8;
    }else if(this.channelId == 3){
        taiFei = 200;
        w_exp = 50;
        l_exp = 5;
        d_exp = 12;
    }else if(this.channelId == 4){
        taiFei = 200;
        w_exp = 80;
        l_exp = 8;
        d_exp = 20;
    }else if(this.channelId == 5){
        taiFei = 200;
        w_exp = 120;
        l_exp = 10;
        d_exp = 50;
    }
    var huTotal = 0;
    for (var i = this.currentPlayer+ 1; i < this.currentPlayer + 4; i++) {
        var otherPlayer = Business.players[this.currentPlayers[i % 4]];
        huTotal += otherPlayer.HuScore;
        otherPlayer.setTotalScore(otherPlayer.GangScore + otherPlayer.HuScore);
        if(type == 1){
            otherPlayer.setLoseCount(otherPlayer.loseCount + 1);
            var exp = otherPlayer.experience + l_exp;
            otherPlayer.setExperience(exp);
        }else{
            var exp = otherPlayer.experience + d_exp;
            otherPlayer.setExperience(exp);
            otherPlayer.setDrawCount(otherPlayer.drawCount + 1);
        }
        otherPlayer.checkLevel();
        var otherGold = otherPlayer.gold + otherPlayer.totalScore - taiFei;
        otherPlayer.setGold(otherGold);
        otherPlayer.updatePlayer();
        otherPlayer.checkTask();//检查任务
    }
    var player = Business.players[this.currentPlayers[this.currentPlayer]];
    player.setTotalScore(player.GangScore + (0 - huTotal));
    if(type == 1){
        var exp = player.experience + w_exp;
        player.setExperience(exp);
        player.setWinCount(player.winCount + 1);
    }else{
        var exp = player.experience + d_exp;
        player.setExperience(exp);
        player.setDrawCount(player.drawCount + 1);
    }
    player.checkLevel();
    var playerGold = player.gold + player.totalScore - taiFei;
    player.setGold(playerGold);
    player.updatePlayer();
    player.checkTask();//检查任务

    for(var i = 0; i < this.roomPlayerIds.length; i++){
        var currPlayer = Business.players[this.roomPlayerIds[i]];
        var msg = {
            gold: currPlayer.gold,
            winCount:currPlayer.winCount,
            loseCount:currPlayer.loseCount,
            drawCount:currPlayer.drawCount,
            level:currPlayer.level
        }
        messageService.pushMessageToPlayer({uid:currPlayer.uid,sid:currPlayer.sid},'onHuPlayerInfo',msg);
    }
}
Room.prototype.kickUnReadyPlayer = function(data){
    var room = data.room;
    clearInterval(room.readyId);
    var currArray = new Array();
    for(var i = 0; i < 4; i++){
        currArray.push(room.roomPlayerIds[i]);
    }
    for(var i = 0; i < 4; i++){
        var player = Business.players[currArray[i]];
        if(!!player){
            if(!player.isReady){//玩家未准备，准备踢出未准备的玩家
                var position = player.position;
                player.leaveRoom(room);
                var strChannelId = player.channelId + '';
                player.leaveChannel(Business.channels[player.channelId]);
                var channel = pomelo.app.get('channelService').getChannel(strChannelId, false);
                channel.leave(player.uid, player.sid);
                player.reSetPlayerInfo4LeaveChannel(); //重置玩家部分状态
                var msgg = {
                    position:position
                };
                logger.debug('position:' + position);
                var mssg = {};
                messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onKick',mssg);  //push踢出消息给被踢出的玩家
                var uidArray = new Array();
                //push踢出消息给没有踢出的玩家
                for(var j = 0; j < room.roomPlayerIds.length; j++){
                    var cuurPlay = Business.players[room.roomPlayerIds[j]];
                    if(player.uid != cuurPlay.uid && cuurPlay.isReady){
                        var uidObject = {};
                        uidObject.uid = room.roomPlayerIds[j];
                        uidObject.sid = player.sid;
                        uidArray.push(uidObject);
                    }
                }
                messageService.pushMessageByUids(uidArray,'onLeaveRoom',msgg);
//                room.ziDongTiRen = true;
            }
        }
    }
//    logger.debug('踢人完成，重新开启检查踢人定时器!');
//    room.openKickTimer();
}
Room.prototype.kickTimer = function(data){
    var room = data.room;
    var count = 0;
    for(var i = 0; i < room.roomPlayerIds.length; i++){
        var currPlayer = Business.players[room.roomPlayerIds[i]];
            if(currPlayer.isReady){
                count++;
            }
    }
    if(count < 3){
        clearInterval(room.readyId);
    }else if(count == 3 && room.totalRoomPlayerCount == 4){
        //满足踢人条件，12000毫秒后开始踢人并通知将要被踢的人
        clearInterval(room.readyId);
        for(var i = 0; i <room.roomPlayerIds.length; i++ ){
            var player = Business.players[room.roomPlayerIds[i]];
            if(!player.isReady){
                var readyToKickPlayer = {};
                //push 12秒之后准备踢人的消息
                messageService.pushMessageToPlayer({uid:player.uid,sid:player.sid},'onReadyToKickPlayer',readyToKickPlayer);
            }
        }
        room.kickId = setTimeout(room.kickUnReadyPlayer,12000,{room:room});
    }
}
Room.prototype.openKickTimer = function(){
    //房间内有三个人准备，开启踢人定时器
    this.readyId = setInterval(this.kickTimer,100,{room:this});
}
Room.prototype.cancelKickTimer = function(){
    clearTimeout(this.kickId);
    clearInterval(this.readyId);
}
Room.prototype.setReady = function(player){
    player.setReady();
}
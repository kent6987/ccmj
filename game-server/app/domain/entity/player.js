/**
 * User: sunye
 * Date: 13-10-15
 * Time: PM2:48
 * email：sunye19890111@sina.com
 */
var messageService = require('./../messageService');
var Business = require('../../domain/business');
var userDao = require('../../dao/userDao');
var logger = require('ss-logger').getLogger(__filename);

var Player = function(opts) {
    this.playerId = opts.id;
    this.sid = opts.sid;
    this.uid = opts.uid;
    this.sid = opts.sid;
    this.sex = opts.sex;                                        //玩家性别
    this.image = opts.image;                                    //玩家头像编号
    this.level = opts.level;                                    //玩家等级
    this.gold = opts.gold;                                      //玩家金币
    this.money = opts.money;                                    //玩家的充值金币
    this.name = opts.playerName;                                //玩家昵称
    this.experience = opts.experience;                          //玩家经验
    this.winCount = opts.winCount;                              //赢的场次
    this.loseCount = opts.loseCount;                            //输的场次
    this.drawCount = opts.drawCount;                            //平的场次
    this.position = 0;
    this.channelId = -1;//opts.channelId;
    this.roomId = -1;
    this.isReady = false;
    this.enterSences = false;
    this.onTuoGuan = false;
    this.isPlaying = false;
    this.inOnline = true;;
    this.isFirst = true;
    this.haveYaoGang = false;
    this.haveJiuGang = false;
    this.haveXiGang = false;
    this.haveXuanFengGang = false;
    this.haveMingGang = false;
    this.haveAnGang = false;
    this.haveBuYao = false;
    this.haveBuJiu = false;
    this.haveBuXi = false;
    this.haveBuXuanFeng = false;
    this.outHandCards = new Array();
    this.inHandCards = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    this.chiCrads = new Array(new Array(),new Array(),new Array());
    this.pengCards = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    this.yaoGangCards = new Array(new Array(),new Array(),new Array());
    this.jiuGangCards = new Array(new Array(),new Array(),new Array());
    this.xiGangCards = new Array();
    this.xuangFengGangCards = new Array();
    this.mingGangCards = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    this.anGangCards = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    this.currentMingGang = new Array();
    this.currentAnGang = new Array();
    this.currentPeng = new Array();
    this.currentChi = new Array();
    this.canHu = false;
    this.canTing = false;
    this.canChi = false;
    this.canPeng = false;
    this.isBanker = false;
    this.isTing = false;
    this.state_zhuaWanPai = false;
    this.state_guoMyTurn = false;
    this.state_guoOtherTurn = false;
    this.state_daWanpai = false;
    this.state_checkingDaPaiFinish = false;
    this.state_checkingTianDanFinish = false;
    this.state_mingGangFromOther = false;
    this.state_doingTianDan = false;
    this.state_tianWanDan = false;
    this.state_nextRoundAfterTing = false;
    this.baoPai = {key:-1,value:0x00};
    this.state_zhuangDoGangDNXB = false;
    this.HuType_ZiMo = false;
    this.zhuaDePai = {key:-1,value:0x00};
    this.HuType_DuiBao = false;
    this.HuType_Piao = false;
    this.HuType_JiaHu = false;
    this.HuType_ZhanLi = false;
    this.state_doHu = false;
    this.m_TempTingDePaiVec = new Array();
    this.HuScore = 1;
    this.GangScore = 0;
    this.totalScore = 0;
    this.playerCard = new Array();
    this.buGanging = false;
    this.state_tianMingGangMySelfIng = false;
};
module.exports = Player;
/**
 * 玩家离开频道，充值玩家的状态
 */
Player.prototype.reSetPlayerInfo4LeaveChannel = function(){
    this.position = 0;      //玩家的位置
    this.channelId = -1;    //玩家所在的频道
    this.roomId = -1;       //玩家所在房间ID
    this.isReady = false;   //玩家准备状态
}
Player.prototype.updatePlayer = function(){
    var updatePlayer = {
        id:this.playerId,
        sex:this.sex,
        level:this.level,
        experience:this.experience,
        gold:this.gold,
        money:this.money,
        winCount:this.winCount,
        loseCount:this.loseCount,
        drawCount:this.drawCount
    }
    userDao.updatePlayer(updatePlayer,function(err, success){
        if(err){
            return;
        }
    });
}
Player.prototype.setMoney = function(type){
    this.money = type;
}
Player.prototype.setLevel = function(type){
    this.level = type;
}
Player.prototype.setExperience = function(type){
    this.experience = type;
}

Player.prototype.setIsOnline = function(type){
    this.isOnline = type;
}
Player.prototype.setGold = function(type){
    this.gold = type;
}
Player.prototype.setWinCount = function(type){
    this.winCount = type;
}
Player.prototype.setLoseCount = function(type){
    this.loseCount = type;
}
Player.prototype.setDrawCount = function(type){
    this.drawCount = type;
}
Player.prototype.setTotalScore = function(type){
    this.totalScore = type;
}
Player.prototype.setGangScore = function(type){
    this.GangScore = type;
}
Player.prototype.setHuScore = function(type){
    this.HuScore = type;
}
Player.prototype.setPosition = function(position){
    this.position = position;
}
Player.prototype.setHuType_ZhanLi = function(type){
    this.HuType_ZhanLi = type;
}
Player.prototype.setHuType_JiaHu = function(type){
    this.HuType_JiaHu = type;
}
Player.prototype.setHuType_Piao = function(type){
    this.HuType_Piao = type;
}
Player.prototype.setZhuadePai = function(card){
    this.zhuaDePai = card;
}
Player.prototype.setHuType_DuiBao = function(type){
    this.HuType_DuiBao = type;
}
Player.prototype.setIsPlaying = function(type){
    this.isPlaying = type;
}
Player.prototype.setBaoPai = function(card){
    this.baoPai = card;
    var msg = {
        value:card.value
    }
    messageService.pushMessageToPlayer({uid:this.uid,sid:this.sid},'onBao',msg);
}
Player.prototype.seyOnTuoGuan = function(type){
    this.onTuoGuan = type;
}
Player.prototype.setState_nextRoundAfterTing = function(type){
    this.state_nextRoundAfterTing = type;
}
Player.prototype.setIsBanker = function(){
    this.isBanker = true;
}
Player.prototype.setState_firstZhuaPai = function(type){
    this.isFirst = type;
}
Player.prototype.setCanHu = function(type){
    this.canHu = type;
}
Player.prototype.sortShouLiPai = function(){
    for(var i = 0; i < 5;i++){
        this.inHandCards[i].sort();
    }
}
Player.prototype.checkYaoGang = function(){
    var shouLiPai = this.inHandCards;
    if(shouLiPai[0][0] == 0x01 && shouLiPai[1][0] == 0x11 && shouLiPai[2][0] == 0x21){
        this.haveYaoGang = true;
        return true;
    }
    return false;
}
Player.prototype.checkBuYaoGang = function(){
    if(this.yaoGangCards[0].length > 0){
        if(this.inHandCards[0][0] ==0x01 || this.inHandCards[1][0] == 0x11 || this.inHandCards[2][0] == 0x21){

            this.haveBuYao = true;
            return true;
        }
        return false;
    }
    return false;
}
Player.prototype.checkJiuGang = function(){
    var shouLiPai = this.inHandCards;
    if(shouLiPai[0][(shouLiPai[0].length - 1)] == 0x09 && shouLiPai[1][(shouLiPai[1].length - 1)] == 0x19 && shouLiPai[2][(shouLiPai[2].length - 1)] == 0x29 ){
        this.haveJiuGang = true;
        return true;
    }
    return false;
}
Player.prototype.checkBuJiuGang = function(){
    if(this.jiuGangCards[0].length > 0){
        if(this.inHandCards[0][this.inHandCards[0].length - 1] == 0x09 || this.inHandCards[1][this.inHandCards[1].length - 1] == 0x19 || this.inHandCards[2][this.inHandCards[2].length - 1] == 0x29){
            this.haveBuJiu = true;
            return true;
        }
        return false;
    }
    return false;
}
Player.prototype.checkXiGang = function(){
    var shouLiPai = this.inHandCards;
    var haveZ = false;
    var haveF = false;
    var haveB = false;

    for(var i =0; i < shouLiPai[3].length; i++){
        if(shouLiPai[3][i] == 0x31){
            haveZ = true;
        }else if(shouLiPai[3][i] == 0x32){
            haveF = true;
        }else if(shouLiPai[3][i] == 0x33){
            haveB = true;
        }
    }

    if(haveZ && haveF && haveB){

        return true
    }
    return false;
}
Player.prototype.checkBuXiGang = function(){
    if(this.xiGangCards.length > 0){
        var shouLiPai = this.inHandCards;
        if(shouLiPai[3].length > 0){
            this.haveBuXi = true;
            return true
        }
        return false;
    }
    return false;
}
Player.prototype.checkXuanFengGang = function(){
    var shouLiPai = this.inHandCards;
    var haveD = false;
    var haveN = false;
    var haveX = false;
    var haveB = false;
    for(var i =0; i < shouLiPai[4].length; i++){
        if(shouLiPai[4][i] == 0x34){
            haveD = true;
        }else if(shouLiPai[4][i] == 0x35){
            haveN = true;
        }else if(shouLiPai[4][i] == 0x36){
            haveX = true;
        }else if(shouLiPai[4][i] == 0x37){
            haveB = true;
        }
    }
    if(haveD && haveN && haveX && haveB){
        return true
    }
    return false;
}
Player.prototype.setState_tianDNXBDan = function(type){
    this.state_zhuangDoGangDNXB = type;
}
Player.prototype.checkBuXuanFengGang = function(){
    if(this.xuangFengGangCards.length > 0){
        var shouLiPai = this.inHandCards;
        if(shouLiPai[4].length > 0){
            this.haveBuXuanFeng = true;
            return true
        }
        return false;
    }
    return false;
}
Player.prototype.setInHandsCards = function(key,value){
    this.inHandCards[key].push(value);
}
Player.prototype.setJiuGangCards = function(){
    var length1 = this.inHandCards[0].length;
    var length2 = this.inHandCards[1].length;
    var length3 = this.inHandCards[2].length;
    this.jiuGangCards[0].push(0x09);
    this.inHandCards[0].splice(this.inHandCards[0].length - 1,1);
    this.jiuGangCards[1].push(0x19);
    this.inHandCards[1].splice(this.inHandCards[1].length - 1,1);
    this.jiuGangCards[2].push(0x29);
    this.inHandCards[2].splice(this.inHandCards[2].length - 1,1);
    this.haveJiuGang = false;
    var position = {
        key1:length1 -1,
        key2:(length1 + length2 - 1),
        key3:(length1 + length2 + length3 - 1)
    }
    if(this.checkTing()){
        this.canTing = true;
    }
    if(this.checkHuForPlayer()){
        this.canHu = true;
    }
    return position;
}
Player.prototype.getGangTotalNums = function(){
    var ret = 0;
    if (this.yaoGangCards[0].length > 0) {
        for (var i = 0; i < 3; i++) {
            ret += this.yaoGangCards[i].length;
        }
        ret -= 2;
    }
    if (this.jiuGangCards[0].length > 0) {
        for (var i = 0; i < 3; i++) {
            ret += this.jiuGangCards[i].length;
        }
        ret -= 2;
    }
    if (this.xiGangCards.length > 0) {
        ret += this.xiGangCards.length;
        ret -= 2;
    }
    if (this.xuangFengGangCards.length > 0) {
        ret += this.xuangFengGangCards.length;
        ret -= 3;
    }
    for (var i = 0; i < 5; i++) {
    ret += this.mingGangCards[i].length / 4 + this.anGangCards[i].length / 4 * 2;
    }
    ret += this.mingGangCards[3].length / 4 + this.anGangCards[3].length / 4 * 2;
    if (this.mingGangCards[1].length > 0 && this.mingGangCards[1][0] == 0x11) {
        ret ++;
    }
    if (this.mingGangCards[2].length > 0 && this.mingGangCards[2][0] == 0x21) {
        ret ++;
    }
    if (this.anGangCards[1].length > 0 && this.anGangCards[1][0] == 0x11) {
        ret += 2;
    }
    if (this.anGangCards[2].length > 0 && this.anGangCards[2][0] == 0x21) {
        ret += 2;
    }
    return ret;
}
Player.prototype.setXiGangCards = function(){
    this.inHandCards[3].sort();
    var length = this.inHandCards[0].length + this.inHandCards[1].length + this.inHandCards[2].length;
    var len1 = length + this.getIndexByCard(3,0x31);
    var len2 = length + this.getIndexByCard(3,0x32);
    var len3 = length + this.getIndexByCard(3,0x33);
    for(var i =0; i < this.inHandCards[3].length; i++){
        if(this.inHandCards[3][i] == 0x31){
            this.xiGangCards.push(0x31);
            this.inHandCards[3].splice(i,1);
            break;
        }
    }

    for(var i =0; i < this.inHandCards[3].length; i++){
        if(this.inHandCards[3][i] == 0x32){
            this.xiGangCards.push(0x32);
            this.inHandCards[3].splice(i,1);
            break;
        }
    }

    for(var i =0; i < this.inHandCards[3].length; i++){
        if(this.inHandCards[3][i] == 0x33){
            this.xiGangCards.push(0x33);
            this.inHandCards[3].splice(i,1);
            break;
        }
    }
    this.haveXiGang = false;
    if(this.checkTing()){
        this.canTing = true;
    }
    if(this.checkHuForPlayer()){
        this.canHu = true;
    }
    var position = {
        key1:len1,
        key2:len2,
        key3:len3
    }
    return position;
}
Player.prototype.getIndexByCard = function(key,value){
    var index = -1;
    var currentArray = this.inHandCards[key];
    for(var i = 0; i < currentArray.length; i++){
        if(currentArray[i] == value){
            index = i;
            break;
        }
    }
    return index;
}
Player.prototype.setXuanFengGang = function(){
    var length = this.inHandCards[0].length + this.inHandCards[1].length + this.inHandCards[2].length + this.inHandCards[3].length;
    var len1 = length + this.getIndexByCard(4,0x34);
    var len2 = length + this.getIndexByCard(4,0x35);
    var len3 = length + this.getIndexByCard(4,0x36);
    var len4 = length + this.getIndexByCard(4,0x37);
    for(var i =0; i < this.inHandCards[4].length; i++){
        if(this.inHandCards[4][i] == 0x34){
            this.xuangFengGangCards.push(0x34);
            this.inHandCards[4].splice(i,1);
            break;
        }
    }
    for(var i =0; i < this.inHandCards[4].length; i++){
        if(this.inHandCards[4][i] == 0x35){
            this.xuangFengGangCards.push(0x35);
            this.inHandCards[4].splice(i,1);
            break;
        }
    }
    for(var i =0; i < this.inHandCards[4].length; i++){
        if(this.inHandCards[4][i] == 0x36){
            this.xuangFengGangCards.push(0x36);
            this.inHandCards[4].splice(i,1);
            break;
        }
    }
    for(var i =0; i < this.inHandCards[4].length; i++){
        if(this.inHandCards[4][i] == 0x37){
            this.xuangFengGangCards.push(0x37);
            this.inHandCards[4].splice(i,1);
            break;
        }
    }
    this.haveXuanFengGang = false;
    var position = {
        key1:len1,
        key2:len2,
        key3:len3,
        key4:len4
    }
    return position;
}
Player.prototype.setYaoGangCards = function(){
    var leng1 = this.inHandCards[0].length;
    var leng2 = this.inHandCards[0].length + this.inHandCards[1].length;
    this.yaoGangCards[0].push(0x01);
    this.inHandCards[0].splice(0,1);
    this.yaoGangCards[1].push(0x11);
    this.inHandCards[1].splice(0,1);
    this.yaoGangCards[2].push(0x21);
    this.inHandCards[2].splice(0,1);
    this.haveYaoGang = false;
    var position = {
        key1:0,
        key2:leng1,
        key3:leng2
    }
    if(this.checkTing()){
        this.canTing = true;
    }
    if(this.checkHuForPlayer()){
        this.canHu = true;
    }
    return position;
}
Player.prototype.setBuYaoGang = function(){
    if(this.inHandCards[0][0] == 0x01){
        this.inHandCards[0].splice(0,1);
        this.haveBuYao = false;
        this.state_doingTianDan = true;
        this.state_tianWanDan   = false;
        var card = {
            key:0,
            value:0x01
        }
        var position ={
            key:0,
            card:card
        }
        return position;
    }

    if(this.inHandCards[1][0] == 0x11){
        var len = this.inHandCards[0].length;
        this.inHandCards[1].splice(0,1);
        this.haveBuYao = false;
        this.state_doingTianDan = true;
        this.state_tianWanDan   = false;
         var card = {
            key:1,
            value:0x11
        }
        var position = {
            key:len,
            card:card
        }
        return position;
    }

    if(this.inHandCards[2][0] == 0x21){
        var len = this.inHandCards[0].length + this.inHandCards[1].length;
        this.inHandCards[2].splice(0,1);
        this.haveBuYao = false;
        this.state_doingTianDan = true;
        this.state_tianWanDan   = false;
        var card = {
            key:2,
            value:0x21
        }
        var position = {
            key:len,
            card: card
        }
        return position;
    }
}
Player.prototype.setBuJiuGang = function(){
    if(this.inHandCards[0][this.inHandCards[0].length - 1] == 0x09){
        var len = this.inHandCards[0].length - 1;
        this.inHandCards[0].splice(this.inHandCards[0].length - 1,1);
        this.haveBuJiu = false;
        this.state_doingTianDan = true;
        this.state_tianWanDan   = false;
        var card = {
            key:0,
            value:0x09
        }
        var position = {
            key: len,
            card:card
        }
        return position;
    }

    if(this.inHandCards[1][this.inHandCards[1].length - 1] == 0x19){
        var len = this.inHandCards[0].length + this.inHandCards[1].length - 1;
        this.inHandCards[1].splice(this.inHandCards[1].length - 1,1);
        this.haveBuJiu = false;
        this.state_doingTianDan = true;
        this.state_tianWanDan   = false;
        var card = {
            key:1,
            value:0x19
        }
        var position = {
            key:len,
            card: card
        }
        return position;
    }

    if(this.inHandCards[2][this.inHandCards[2].length - 1] == 0x29){
        var len = this.inHandCards[0].length + this.inHandCards[1].length + this.inHandCards[2].length - 1;
        this.inHandCards[2].splice(this.inHandCards[2].length - 1,1);
        this.haveBuJiu = false;
        this.state_doingTianDan = true;
        this.state_tianWanDan   = false;
        var card = {
            key:2,
            value:0x29
        }
        var position = {
            key:len,
            card: card
        }
        return position;
    }
}
Player.prototype.setBuXiGang = function(){
    var value = this.inHandCards[3][0];
    var len = this.inHandCards[0].length + this.inHandCards[1].length + this.inHandCards[2].length;
    var card = {
        key:3,
        value:value
    }
    this.inHandCards[3].splice(0,1);
    this.haveBuXi = false;
    this.state_doingTianDan = true;
    this.state_tianWanDan   = false;
    var position = {
        key:len,
        card: card
    }
    return position;
}
Player.prototype.setBuXuanFengGang = function(){
    var len = this.inHandCards[0].length + this.inHandCards[1].length + this.inHandCards[2].length + this.inHandCards[3].length;
    var value  = this.inHandCards[4][0];
    var card = {
        key:4,
        value:value
    }
    this.inHandCards[4].splice(0,1);
    this.haveBuXuanFeng = false;
    this.state_doingTianDan = true;
    this.state_tianWanDan   = false;
    var position = {
        key:len,
        card: card
    }
    return position;
}
Player.prototype.checkAnGang = function(){
    var length = this.currentAnGang.length;
    this.currentAnGang.splice(0,length);
    var shouLiPai = this.inHandCards;

    for(var i = 0; i < 5; i++){
        if(shouLiPai[i].length < 3){
            continue;
        }
        for(var j=0;j < shouLiPai[i].length - 3; j++){
            if(shouLiPai[i][j] == shouLiPai[i][j + 1] && shouLiPai[i][j] == shouLiPai[i][j + 2] && shouLiPai[i][j] == shouLiPai[i][j + 3]){
                var card = {};
                card.key = i;
                card.valeu = shouLiPai[i][j];
                this.currentAnGang.push(card);
                this.haveAnGang = true;
                return true;
            }
        }
    }
    return false;
}
Player.prototype.checkMingGang = function(){
    var length = this.currentMingGang.length;
    this.currentMingGang.splice(0,length);
    for (var i = 0 ; i < 5; i++) {
        if (this.pengCards[i].length > 0) {
            for (var j = 0; j < this.pengCards[i].length - 2; j++) {
                for (var k = 0; k < this.inHandCards[i].length; k++) {
                    if (this.inHandCards[i][k] == this.pengCards[i][j]) {
                        var card = {};
                        card.key = i;
                        card.value = this.inHandCards[i][k];
                        this.currentMingGang.push(card);
                        return true;
                    }
                }
                j += 3;
            }
        }
    }
    return false;
}
Player.prototype.CheckMingGangPaiFromOther = function(p_Type,p_Value){
    var len = this.currentMingGang.length;
    this.currentMingGang.splice(0,len);
    var shouLipai = this.inHandCards;
    if(shouLipai[p_Type].length > 0)
    {
        var iSize = shouLipai[p_Type].length;
        if( iSize >= 3)
        {
            for(var i = 0 ; i < iSize-2 ;  i++ )
            {
                if((shouLipai[p_Type][i]==p_Value)&&(shouLipai[p_Type][i+1]==p_Value)&&(shouLipai[p_Type][i+2]==p_Value))
                {
                    var card = {};
                    card.key   = p_Type;
                    card.value  = p_Value;
                    this.currentMingGang.push(card);
                    break;
                }
            }
        }
        if(this.currentMingGang.length> 0)
        {
            this.state_mingGangFromOther = true;
            return true;
        }
    }
    return false;
}
Player.prototype.setMingGang = function(){
    var card = this.currentMingGang[0];
    var key = card.key;
    var value = card.value;
    var count = this.getPositionByValue(card.value);
    //从手里牌数组中删除这个牌
    for(var i = 0; i < this.inHandCards[key].length; i++){
        if(value == this.inHandCards[key][i]){
            this.inHandCards[key].splice(i,1);
            break;
        }
    }
    this.haveMingGang = false;
//    this.state_zhuaWanPai = false;
    this.state_tianWanDan   = false;
    this.state_doingTianDan = true;
    this.state_tianMingGangMySelfIng = true;
    var position = {
        key: count,
        card:card
    }
    return position;
}
Player.prototype.setAnGang = function(){
    var card = this.currentAnGang[0];
    var key = card.key;
    var value = card.valeu;
    var count = this.getPositionByValue(value);
    for(var i = 0; i < this.inHandCards[key].length; i++){
        if(value == this.inHandCards[key][i]){
            this.inHandCards[key].splice(i,4);
            break;
        }
    }
    for(var i = 0; i < 4;i++){
        this.anGangCards[key].push(value);
    }
    this.anGangCards[key].sort();
    this.haveAnGang = false;
    this.state_zhuaWanPai = false;
    var position = {
        key: count,
        card:card
    }
    var gangArray = new Array();
    for(var i = 0; i < 4 ; i++){
        gangArray.push(card);
    }
    var stCHIPENGGANG = {
        isGang: 1,
        isAnGang: 1,
        Vec3or4:gangArray
    }
    this.playerCard.push(stCHIPENGGANG);
    return position;
}
Player.prototype.enterChannel = function(channel) {
    this.channelId = channel.channelId;
    channel.addChannelPlayer(this.uid);
};
Player.prototype.leaveChannel = function(channel) {
    this.channelId = -1;
    channel.removeChannelPlayerById(this.uid);
};
Player.prototype.enterRoom = function(room) {
    this.roomId = room.roomId;
    room.addRoomPlayer(this.uid);
};
Player.prototype.leaveRoom = function(room) {
    this.roomId = -1;
    room.removeRoomPlayerById(this.uid);
};
Player.prototype.setReady = function() {
    this.isReady = true;
};
Player.prototype.checkChi = function(card){
    var p_Type = card.key;
    var p_Value = card.value;
    var length = this.currentChi.length;
    this.currentChi.splice(0,length);
    if (p_Type > 2) {
        return false;
    }
    var totalCardsInHand = 0;
    for (var i = 0 ; i < 5; i++) {
        totalCardsInHand += this.inHandCards[i].length + this.anGangCards[i].length;
    }
    if (totalCardsInHand <= 4) {
        return false;
    }
    //饼
    if(this.inHandCards[p_Type].length > 0)
    {
        var iSize = this.inHandCards[p_Type].length;
        if( iSize >= 2)
        {
            for(var i = 0 ; i < iSize-1 ;  i++ )
            {
                if((this.inHandCards[p_Type][i]==(p_Value-2))&&(this.inHandCards[p_Type][i+1]==(p_Value-1)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value-2;
                    t_Chi.value2 = p_Value-1;
                    t_Chi.value3 = p_Value;
                    this.currentChi.push(t_Chi);

                }
                if((this.inHandCards[p_Type][i]==(p_Value-1))&&(this.inHandCards[p_Type][i+1]==(p_Value+1)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value-1;
                    t_Chi.value2 = p_Value;
                    t_Chi.value3 = p_Value+1;
                    this.currentChi.push(t_Chi);

                }
                if((this.inHandCards[p_Type][i]==(p_Value+1))&&(this.inHandCards[p_Type][i+1]==(p_Value+2)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value;
                    t_Chi.value2 = p_Value+1;
                    t_Chi.value3 = p_Value+2;
                    this.currentChi.push(t_Chi);
                }
            }

        }
        //假设吃B，已有ABC
        if( iSize >= 3)
        {
            for(var i = 1 ; i < iSize-1 ;  i++ )
            {
                if((this.inHandCards[p_Type][i-1]==(p_Value-1))&&(this.inHandCards[p_Type][i]==p_Value)&&(this.inHandCards[p_Type][i+1]==(p_Value+1)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value-1;
                    t_Chi.value2 = p_Value;
                    t_Chi.value3 = p_Value+1;
                    this.currentChi.push(t_Chi);
                }
            }
        }
        //假设吃B，已有ABBC
        if( iSize >= 4)
        {
            for(var i = 1 ; i < iSize-2 ;  i++ )
            {
                if((this.inHandCards[p_Type][i-1]==(p_Value-1))&&(this.inHandCards[p_Type][i]==p_Value)&&(this.inHandCards[p_Type][i+2]==(p_Value+1)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value-1;
                    t_Chi.value2 = p_Value;
                    t_Chi.value3 = p_Value+1;
                    this.currentChi.push(t_Chi);
                }
            }
        }
        //假设吃B，已有ABBBC
        if( iSize >= 5)
        {
            for(var i = 1 ; i < iSize-3 ;  i++ )
            {
                if((this.inHandCards[p_Type][i-1]==(p_Value-1))&&(this.inHandCards[p_Type][i]==p_Value)&&(this.inHandCards[p_Type][i+3]==(p_Value+1)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value-1;
                    t_Chi.value2 = p_Value;
                    t_Chi.value3 = p_Value+1;
                    this.currentChi.push(t_Chi);
                }
            }
        }
        //假设吃B，已有ABBBBC
        if( iSize >= 6)
        {
            for(var i = 1 ; i < iSize-4 ;  i++ )
            {
                if((this.inHandCards[p_Type][i-1]==(p_Value-1))&&(this.inHandCards[p_Type][i]==p_Value)&&(this.inHandCards[p_Type][i+4]==(p_Value+1)))
                {
                    var t_Chi = {};
                    t_Chi.key = p_Type;
                    t_Chi.value1 = p_Value-1;
                    t_Chi.value2 = p_Value;
                    t_Chi.value3 = p_Value+1;
                    this.currentChi.push(t_Chi);
                }
            }
        }
        if (this.currentChi.length > 1) {
            for (var i = 0 ; i < this.currentChi.length - 1;i++) {
                if (this.currentChi[i].value1 == this.currentChi[i + 1].value1 &&
                    this.currentChi[i].value2 == this.currentChi[i + 1].value2 &&
                    this.currentChi[i].value3 == this.currentChi[i + 1].value3) {
                    this.currentChi.splice(i,1);
                    break;
                }
            }
        }

        if(this.currentChi.length > 0)
        {
            this.canChi = true;
            return  true;
        }
    }
    return false;
}
Player.prototype.reSetPai = function(){
    this.isPlaying = false;
    this.isReady = false;
    this.enterSences = false;
    this.onTuoGuan = false;
    this.isFirst = true;
    this.haveYaoGang = false;
    this.haveJiuGang = false;
    this.haveXiGang = false;
    this.haveXuanFengGang = false;
    this.haveMingGang = false;
    this.haveAnGang = false;
    this.haveBuYao = false;
    this.haveBuJiu = false;
    this.haveBuXi = false;
    this.haveBuXuanFeng = false;
    this.outHandCards.length = 0;
    for(var i = 0;i < 5;i++){
        this.inHandCards[i].length = 0;
        this.pengCards[i].length = 0
        this.mingGangCards[i].length = 0;
        this.anGangCards[i].length = 0;
    }
    for(var i = 0; i < 3;i++){
        this.chiCrads[i].length = 0;
        this.yaoGangCards[i].length = 0;
        this.jiuGangCards[i].length = 0;
    }
    this.xiGangCards.length = 0;
    this.xuangFengGangCards.length = 0;
    this.currentMingGang.length = 0;
    this.currentAnGang.length = 0;
    this.currentPeng.length = 0;
    this.currentChi.length = 0;
    this.canHu = false;
    this.canTing = false;
    this.canChi = false;
    this.canPeng = false;
    this.isBanker = false;
    this.isTing = false;
    this.state_zhuaWanPai = false;
    this.state_guoMyTurn = false;
    this.state_guoOtherTurn = false;
    this.state_daWanpai = false;
    this.state_checkingDaPaiFinish = false;
    this.state_checkingTianDanFinish = false;
    this.state_mingGangFromOther = false;
    this.state_doingTianDan = false;
    this.state_tianWanDan = false;
    this.state_nextRoundAfterTing = false;
    this.baoPai = {key:-1,value:0x00};
    this.state_zhuangDoGangDNXB = false;
    this.HuType_ZiMo = false;
    this.zhuaDePai = {key:-1,value:0x00};
    this.HuType_DuiBao = false;
    this.HuType_Piao = false;
    this.HuType_JiaHu = false;
    this.HuType_ZhanLi = false;
    this.state_doHu = false;
    this.m_TempTingDePaiVec.length = 0;
    this.HuScore = 1;
    this.GangScore = 0;
    this.totalScore = 0;
    this.playerCard.length = 0;
    this.buGanging = false;
    this.state_tianMingGangMySelfIng = false;
}
Player.prototype.setBuGanging = function(type){
    this.buGanging = type;
}
Player.prototype.setEnterSence = function(){
    this.enterSences = true;
}
Player.prototype.cancelReady = function(){
    this.isReady = false;
}
Player.prototype.getPositionByValue = function(value){
    var count = 0;
    for(var i = 0; i < 5;i++){
        var qunima = false;
        for(var j = 0; j < this.inHandCards[i].length; j++){
            if(value == this.inHandCards[i][j]){
                qunima = true;
                break;
            }
            count++;
        }
        if(qunima){
            break;
        }
    }
    return count;
}
Player.prototype.setState_checkingDaPaiFinish = function(){
    this.state_checkingDaPaiFinish = true;
}
Player.prototype.setChi = function(card,index){
    var shouLiPai = this.inHandCards;
    var chidepai = this.currentChi[index];
    var valueArray = new Array();
    valueArray.push(chidepai.value1);
    valueArray.push(chidepai.value2);
    valueArray.push(chidepai.value3);
    for(var i = 0; i < valueArray.length;i++){
        if(valueArray[i] == card.value){
            valueArray.splice(i,1);
        }
    }
    var count1 = this.getPositionByValue(valueArray[0]);
    var count2 = this.getPositionByValue(valueArray[1]);
    for(var i = 0; i < shouLiPai[chidepai.key].length; i++){
        for(var j = 0; j < valueArray.length; j++){
            if(shouLiPai[chidepai.key][i] == valueArray[j]){
                shouLiPai[chidepai.key].splice(i,1);
            }
        }
    }
    this.chiCrads[chidepai.key].push(chidepai.value1);
    this.chiCrads[chidepai.key].push(chidepai.value2);
    this.chiCrads[chidepai.key].push(chidepai.value3);
    this.chiCrads[chidepai.key].sort();
    this.isFirst = false;
    this.canChi = false;
    var position = {
        key1:count1,
        key2:count2
    }
    var card1 = {
        key:chidepai.key,
        value:chidepai.value1
    }
    var card2 = {
        key:chidepai.key,
        value:chidepai.value2
    }
    var card3 = {
        key:chidepai.key,
        value:chidepai.value3
    }
    var gangArray = new Array();
    gangArray.push(card1);
    gangArray.push(card2);
    gangArray.push(card3);
    var stCHIPENGGANG = {
        isGang: 0,
        isAnGang: 0,
        Vec3or4:gangArray
    }
    this.playerCard.push(stCHIPENGGANG);
    return position;
}
Player.prototype.CheckChiHuPai = function(p_Type,p_Value){
    var shouLiPai = this.inHandCards;
    shouLiPai[p_Type].push(p_Value);
    shouLiPai[p_Type].sort();

    var hu = this.checkHu(shouLiPai);

    for(var i = 0; i < shouLiPai[p_Type].length; i++){
        if(shouLiPai[p_Type][i] == p_Value){
            shouLiPai[p_Type].splice(i,1);
            break;
        }
    }
    if (hu == true) {
        this.canHu = true;
        return true;
    }
    return false;
}
Player.prototype.checkPeng = function(card){
    var length = this.currentPeng.length;
    this.currentPeng.splice(0,length);
    var totalCardsInHand = 0;//手里剩余的牌数
    for (var i = 0 ; i < 5; i++) {
        totalCardsInHand += this.inHandCards[i].length + this.anGangCards[i].length;
    }
    //检查是否有吃牌
    var isChiVecEmpty = this.chiCrads[0].length == 0 && this.chiCrads[1].length == 0 && this.chiCrads[2].length == 0;
    if (totalCardsInHand <= 4 && !isChiVecEmpty) {//如果手里的牌数小于4张，并且有吃牌，则不能碰
        return false;
    }
    var key = card.key;
    var value = card.value;
    if(this.inHandCards[key].length > 0){
        var length = this.inHandCards[key].length;
        if(length >= 2){
            for(var i=0;i < length - 1; i++){
                if(this.inHandCards[key][i] == value && this.inHandCards[key][i + 1] == value){
                    this.currentPeng.push(card);
                    break;
                }
            }
        }
        if(this.currentPeng.length > 0){
            this.canPeng = true;
            return true;
        }
    }
    return false;
}
Player.prototype.setPeng = function(p_Type,p_Value){
    var shouLiPai = this.inHandCards;
    var count = this.getPositionByValue(p_Value);
    shouLiPai[p_Type].push(p_Value);
    shouLiPai[p_Type].sort();
    for(var i = 0; i < shouLiPai[p_Type].length; i++){
        if(shouLiPai[p_Type][i] == p_Value){
            shouLiPai[p_Type].splice(i,3);
            for(var i = 0; i < 3; i++){
                this.pengCards[p_Type].push(p_Value);
            }
            this.pengCards[p_Type].sort();
            this.canPeng = false;
            this.isFirst = false;
            var position = {
                key:count
            }
            var card={
                key:p_Type,
                value:p_Value
            }
            var gangArray = new Array();
            for(var i = 0; i < 3;i++){
                gangArray.push(card);
            }
            var stCHIPENGGANG = {
                isGang: 0,
                isAnGang: 0,
                Vec3or4:gangArray
            }
            this.playerCard.push(stCHIPENGGANG);
            return position;
        }
    }
}
Player.prototype.checkHuForPlayer = function(){
    if(this.checkHu(this.inHandCards)){
        return true;
    }
    return false;
}
Player.prototype.checkHu = function(array){
    for(var i = 0; i < 5; i++){
        if(array[i].length % 3 == 1){
            return false;
        }
    }
    var totalCardsInHand = 0;//手把一，不是飘不让胡
    for (var i = 0 ; i < 5; i++) {
        totalCardsInHand += array[i].length + this.anGangCards[i].length;
    }
    if (totalCardsInHand == 2) {
        var isChiVecEmpty = this.chiCrads[0].length == 0 &&  this.chiCrads[1].length == 0 &&  this.chiCrads[2].length == 0;
        if (!isChiVecEmpty) {
            return false;
        }
    }
    if(this.checkYaoJiu(array) == false){
        return false;
    }
    if(this.checkDuanMen(array) == false){
        return false;
    }
    var haveDaCha = {result:false};
    var jiangPos = this.checkJiang(array,haveDaCha);
    if(jiangPos == -1){
        return false;
    }
    if(!haveDaCha.result){
        if(this.checkDaCha(array,jiangPos) == false){
            return false;
        }
    }
    for (var i = 0; i < 5; i++) {
        if (i == jiangPos) {
            continue;
        }
        if (i == 3 || i == 4) {
            var onlyCheck333or3333 = this.checkThree(array[i],haveDaCha);
            if (onlyCheck333or3333 == false) {
                return false;
            }
        }
        else{
            var check123or333or3333 = this.checkShunOrThree(array[i],haveDaCha);
            if (check123or333or3333 == false) {
                return false;
            }
        }
    }
    return true;
}
Player.prototype.getYaoJiuCount = function(){
    var count = 0;
    for(var i = 0; i < 5; i++){
        for(var j = 0; j < this.inHandCards[i].length; j++){
            if(this.checkYaoJiuWithAPai(this.inHandCards[i][j]) == true){
                count++;
            }
        }

        for(var j = 0; j < this.pengCards[i].length; j += 3){
            if(this.checkYaoJiuWithAPai(this.pengCards[i][j]) == true){
                count += 3;
            }
        }

        for(var j = 0; j < this.mingGangCards[i].length;j += 4){
            if(this.checkYaoJiuWithAPai(this.mingGangCards[i][j]) == true){
                count += 4;
            }
        }
        for(var j = 0; j < this.anGangCards[i].length;j += 4){
            if(this.checkYaoJiuWithAPai(this.anGangCards[i][j]) == true){
                count += 4;
            }
        }
    }
    for(var i = 0 ; i < 3; i++){
        for(var j = 0; j < this.chiCrads[i].length;j++){
            if(this.checkYaoJiuWithAPai(this.chiCrads[i][j]) == true){
                count++;
            }
        }
    }

    count += (this.yaoGangCards[0].length + this.yaoGangCards[1].length + this.yaoGangCards[2].length);
    count += (this.jiuGangCards[0].length + this.jiuGangCards[1].length + this.jiuGangCards[2].length);
    count += this.xiGangCards.length;
    count += this.xuangFengGangCards.length;
    return count;
}
Player.prototype.checkYaoJiuWithAPai = function(value){
    if(value == 0x01 || value == 0x09 || value == 0x11 || value == 0x19 || value == 0x21 || value == 0x29 || value == 0x31 || value == 0x32 || value == 0x33 || value == 0x34 || value == 0x35 || value == 0x36 || value == 0x37){
        return true;
    }
    return false;
}
Player.prototype.checkTing = function(){
    var allKindPai = [0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,
        0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,
        0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,
        0x31,0x32,0x33,0x34,0x35,0x36,0x37]
    if (this.checkDuanMen(this.inHandCards) == false) {
        return false;
    }
//    var ss = this.getYaoJiuCount();
    if (this.getYaoJiuCount() == 0) {
        return false;
    }
    var FindTing = false;
    for (var a = 0; a < 5; a++)
    {
        for (var b = 0; b < this.inHandCards[a].length; b++)
        {
            var testVector = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
            for (var j = 0; j < 5; j++)
            {
                for (var k = 0; k < this.inHandCards[j].length; k++)
                {
                    testVector[j].push(this.inHandCards[j][k]);
                }
            }
            if((this.getYaoJiuCount() == 1 ) && (this.checkYaoJiuWithAPai(this.inHandCards[a][b]))){
                continue;
            }
            var delPai = {
                key:a,
                value:this.inHandCards[a][b]
            }
            var tingDePai = {};
            tingDePai.DaChuThenCanTingDePai = delPai;
            tingDePai.KeHuDePais = [];
            var isYouTing = false;
            this.DelPaiFromTestVector(testVector, delPai.key,delPai.value);
            for (var m = 0; m < 34; m++)
            {
                var addPai = {};
                addPai.value = allKindPai[m];
                if(allKindPai[m]>=0x01 && allKindPai[m] <= 0x09)
                {
                    addPai.key = 0;
                }
                else if (allKindPai[m] >= 0x11 && allKindPai[m] <= 0x19)
                {
                    addPai.key = 1;
                }
                else if (allKindPai[m] >= 0x21 && allKindPai[m] <= 0x29)
                {
                    addPai.key = 2;
                }
                else if (allKindPai[m] >= 0x31 && allKindPai[m] <= 0x33)
                {
                    addPai.key = 3;
                }
                else
                {
                    addPai.key = 4;
                }
                this.AddPaiToTestVector(testVector, addPai.key, addPai.value);
                var hu = this.checkHu(testVector);
                this.DelPaiFromTestVector(testVector, addPai.key, addPai.value);
                if ( hu == true)
                {
                    FindTing = true;
                    isYouTing = true;
                    tingDePai.KeHuDePais.push(addPai);
                }
            }
            if (isYouTing == true) {
                this.m_TempTingDePaiVec.push(tingDePai);
            }
        }
    }
    if (FindTing == true) {
        return true;
    }
    return false;
}
Player.prototype.CheckPaiNumInThisPlayer = function(card){
    var ret = 0;
    for (var i = 0; i < 5; i++) {
    for (var j = 0; j < this.pengCards[i].length; j++) {
        if (this.pengCards[i][j] == card.value) {
            ret ++;
        }
    }
    for (var j = 0; j < this.mingGangCards[i].length; j++) {
        if (this.mingGangCards[i][j] == card.value) {
            ret ++;
        }
    }
}
    for (var i = 0; i < 3; i++) {
    for (var j = 0; j < this.chiCrads[i].length; j++) {
        if (this.chiCrads[i][j] == card.value) {
            ret ++;
        }
    }
    for (var j = 0; j < this.yaoGangCards[i].length; j++) {
        if (this.yaoGangCards[i][j] == card.value) {
            ret ++;
        }
    }
    for (var j = 0; j < this.jiuGangCards[i].length; j++) {
        if (this.jiuGangCards[i][j] == card.value) {
            ret ++;
        }
    }
}
    for (var j = 0; j < this.xiGangCards.length; j++) {
        if (this.xiGangCards[j] == card.value) {
            ret ++;
        }
    }

    for (var j = 0 ; j < this.xuangFengGangCards.length; j++) {
        if (this.xuangFengGangCards[j] == card.value) {
            ret ++;
        }
    }

    for (var i = 0; i < this.outHandCards.length; i++) {
    if (this.outHandCards[i] == card.value) {
        ret ++;
    }
    }
    return ret;
}
Player.prototype.CheckPaiNumInHand = function(card){
    var ret = 0;
    for (var i = 0; i < 5; i++) {
    for (var j = 0; j < this.inHandCards[i].length; j++) {
        if (this.inHandCards[i][j] == card.value) {
            ret++;
        }
    }
}
    return ret;
}
Player.prototype.AddPaiToTestVector = function(array,key,value){
    var t_Find = false;
    for(var i = 0; i < array[key].length; i++){
        if(array[key][i] > value){
            array[key].push(value);
            array[key].sort();
            t_Find = true;
            break;
        }
    }
    if(t_Find==false)
    {
        array[key].push(value);
    }
    return true;
}
Player.prototype.DelPaiFromTestVector = function(array,key,value){
    for(var i = 0; i < array[key].length ; i++){
        if(array[key][i] == value){
            array[key].splice(i,1);
            return true;
        }
    }
    return false;
}
Player.prototype.checkYaoJiu = function (array) {
    //先查中发白东南西北碰杠
    if (this.pengCards[3].length > 0 || this.pengCards[4].length > 0
        ||this.mingGangCards[3].length > 0 || this.mingGangCards[4].length > 0
        ||this.anGangCards[3].length > 0 || this.anGangCards[4].length > 0) {
        return true;
    }
    //幺九中发白东南西北蛋
    if (this.yaoGangCards[0].length > 0 || this.jiuGangCards[0].length > 0
        ||this.xiGangCards.length > 0 || this.xuangFengGangCards.length > 0) {
        return true;
    }

    if (array[0][0] == 0x01 ||
        array[1][0] == 0x11 ||
        array[2][0] == 0x21 ||
        array[0][array[0].length - 1] == 0x09 ||
        array[1][array[1].length - 1] == 0x19 ||
        array[2][array[2].length - 1] == 0x29||
        array[3].length > 0 ||
        array[4].length > 0 )
    {
        return true;
    }

    for (var i = 0 ; i < 3 ; i++) {//检测万饼条里面的幺九
        for (var j = 0; j < this.chiCrads[i].length; j++) {
            if (this.chiCrads[i][j] == 0x01 || this.chiCrads[i][j] == 0x11 || this.chiCrads[i][j] == 0x21
                ||this.chiCrads[i][j] == 0x09 || this.chiCrads[i][j] == 0x19 || this.chiCrads[i][j] == 0x29) {
                return true;
            }
        }
        for (var j = 0; j < this.pengCards[i].length; j+=3) {
            if (this.pengCards[i][j] == 0x01 || this.pengCards[i][j] == 0x11 || this.pengCards[i][j] == 0x21
                ||this.pengCards[i][j] == 0x09 || this.pengCards[i][j] == 0x19 || this.pengCards[i][j] == 0x29) {
                return true;
            }
        }
        for (var j = 0; j < this.mingGangCards[i].length; j+=4) {
            if (this.mingGangCards[i][j] == 0x01 || this.mingGangCards[i][j] == 0x11 || this.mingGangCards[i][j] == 0x21
                ||this.mingGangCards[i][j] == 0x09 || this.mingGangCards[i][j] == 0x19 || this.mingGangCards[i][j] == 0x29) {
                return true;
            }
        }
        for (var j = 0; j < this.anGangCards[i].length; j+=4) {
            if (this.anGangCards[i][j] == 0x01 || this.anGangCards[i][j] == 0x11 || this.anGangCards[i][j] == 0x21
                ||this.anGangCards[i][j] == 0x09 || this.anGangCards[i][j] == 0x19 || this.anGangCards[i][j] == 0x29) {
                return true;
            }
        }
    }
    return false;
};
Player.prototype.checkDuanMen = function (array) {
    if (this.yaoGangCards[0].length > 0 || this.jiuGangCards[0].length > 0) {
        return true;
    }
    var haveWan = false, haveBing = false, haveTiao = false;
    if (array[0].length > 0 || this.chiCrads[0].length > 0 || this.pengCards[0].length > 0 || this.mingGangCards[0].length > 0 || this.anGangCards[0].length > 0) {
        haveWan = true;
    }
    if (array[1].length > 0 || this.chiCrads[1].length > 0 || this.pengCards[1].length > 0 || this.mingGangCards[1].length > 0 || this.anGangCards[1].length > 0) {
        haveBing = true;
    }
    if (array[2].length > 0 || this.chiCrads[2].length > 0 || this.pengCards[2].length > 0 || this.mingGangCards[2].length > 0 || this.anGangCards[2].length > 0) {
        haveTiao = true;
    }
    if (haveWan && haveBing && haveTiao) {
        return true;
    }
    return false;
};
Player.prototype.checkJiang = function (array,haveDaCha) {
    var checkJiang = false;
    var pos = -1;
    var count = 0;
    for (var i = 0; i < 5; i++) {
        if (array[i].length % 3 == 2) {
            count++;
            pos = i;
        }
    }
    if (count != 1) {
        return false;
    }
    for (var i = 0; i < array[pos].length - 1; i++) {
        if (array[pos][i] == array[pos][i + 1]) {
            var remainingData = new Array();
            for (var j = 0; j < array[pos].length; j++) {
                if (j == i || j == i + 1) {
                    continue;
                }
                remainingData.push(array[pos][j]);
            }
            if (pos == 3 || pos == 4) {
                if (this.checkThree(remainingData,haveDaCha) == true) {
//                    haveDaCha.result = true;
                    checkJiang = true;
                    break;
                }
            }
            else {
                if (this.checkShunOrThree(remainingData,haveDaCha) == true) {
                    checkJiang = true;
                    break;
                }
            }
            i++;
        }
    }
    if (checkJiang) {
        return pos;
    } else {
        return -1;
    }
};
Player.prototype.checkDaCha = function (array,jiangPos) {
    if (this.yaoGangCards[0].length > 0 || this.jiuGangCards[0].length > 0 || this.xiGangCards.length > 0 || this.xuangFengGangCards.length > 0) {
        return true;
    }
    if (array[3].length > 0) {
        return true;
    }
    for (var i = 0; i < 5; i++) {
        if (this.pengCards[i].length > 0|| this.mingGangCards[i].length > 0 || this.anGangCards[i].length > 0) {
            return true;
        }
    }
    for (var i = 0; i < 5; i++) {
        if (i == jiangPos) {
            continue;
        }
        if (array[i].length < 3) {
            continue;
        }
        for (var j = 0; j < array[i].length - 2; j ++) {
            var check333 = this.Check333(array[i][j], array[i][j+1], array[i][j+2]);
            if (check333 == true) {
                return true;
            }
        }
    }
    return false;
};
Player.prototype.checkThree = function (arrayChuan,haveDaCha) {
    var array  = new Array();
    for (var k = 0; k < arrayChuan.length; k++){
        array.push(arrayChuan[k]);
    }
    if (array.length == 0) {
        return true;
    }
    if (array.length % 3 != 0) {
        return false;
    }
    var tempVector = new Array();
    //再加入tempVector之前清除所有333
    array.push(-1);
    array.push(-2);
    for (var i = 0; i < (array.length - 2);) {
        if (this.Check333(array[i], array[i + 1], array[i + 2]) == true) {
            haveDaCha.result = true;
            i += 3;
        } else {
            tempVector.push(array[i]);
            i++;
        }
    }
    if (tempVector.length > 0) {
        return false;
    }
    else
        return true;
};
Player.prototype.checkShunOrThree = function (arrayChuan,haveDaCha) {
    var array  = new Array();
    for (var k = 0; k < arrayChuan.length; k++){
            array.push(arrayChuan[k]);
    }
    if (array.length == 0) {
        return true;
    }
    if (array.length % 3 != 0) {
        return false;
    }
    var tempVector = new Array();
    array.push(-1);
    array.push(-2);
    var hasDaCha = false;
    for (var i = 0; i < (array.length - 2);) {
        if (this.Check333(array[i], array[i + 1], array[i + 2]) == true) {
              hasDaCha = true;
            i += 3;
        }
        else {
            tempVector.push(array[i]);
            i++;
        }
    }
    //check shun
    while (tempVector.length > 0) {
        var NaChu1 = false, NaChu2 = false;
        var ZuiXiaoDeShu = tempVector[0];
        tempVector.splice(0,1);
        for (var i = 0; i < tempVector.length;) {
            if (tempVector[i] - 1 == ZuiXiaoDeShu) {
                if (!NaChu1) {
                    tempVector.splice(i, 1);
                    NaChu1 = true;
                } else {
                    i++;
                }
            } else if (tempVector[i] - 2 == ZuiXiaoDeShu) {
                if (!NaChu2) {
                    tempVector.splice(i, 1);
                    NaChu2 = true;
                } else {
                    i++;
                }
            } else {
                i++;
            }
            if (NaChu1 && NaChu2) {
                break;
            }
        }
        if (!NaChu1 || !NaChu2) {
            return false;
        }
    }
    if(hasDaCha){
        haveDaCha.result = true;
    }
    return true;
};
Player.prototype.Check333 = function (card1, card2, card3) {
    if (card1 == card2 && card2 == card3) {
        return true;
    }
    return false;
};
Player.prototype.chuPai = function(key,value){
    var shouLiPai = this.inHandCards;
    var count = this.getPositionByValue(value);
    if(key >= 5 || key < 0){
        logger.error('unkonw error,key:' + key);
    }
    for(var i = 0; i < shouLiPai[key].length; i++){
        if(shouLiPai[key][i] == value){
            shouLiPai[key].splice(i,1);
            this.state_daWanpai = true;
            this.outHandCards.push(value);
            break;
        }
    }
    return count;
}
Player.prototype.checkAllStateAfterZhuaPai = function(){
    logger.debug('检查玩家：[ '+ this.uid +' ] 的胡、听、杠的状态');
    this.canHu = false;
    if (this.checkHuForPlayer()) {
        this.canHu = true;
    }
    if (this.isTing == false) {
        this.canTing = false;
        if (this.checkTing()) {
            this.canTing = true;
        }
    }
    if (this.state_zhuangDoGangDNXB == true) {
        this.state_zhuangDoGangDNXB = false;
    }else{
        if (this.isBanker == false || this.isFirst == false) {
            this.haveAnGang = false;
            if (this.checkAnGang()) {
                this.haveAnGang = true;
            }
        }
    }
    this.haveMingGang = false;
    if (this.checkMingGang()) {
        this.haveMingGang = true;
    }
    if (this.isTing == false)
    {
        if (this.checkMingGang == true) {
            this.haveMingGang = true;
        }
    }
    else{
        if (this.CheckMingGangWhenAfterTing(this.zhuaDePai) == true) {
            this.haveMingGang = true;
        }
    }
    if (this.isFirst == true) {
        this.isFirst = false;
        this.haveYaoGang = false;
        if (this.checkYaoGang()) {
            this.haveYaoGang = true;
        }
        this.haveJiuGang = false;
        if (this.checkJiuGang()) {
            this.haveJiuGang = true;
        }
        this.haveXiGang = false;
        if (this.checkXiGang()) {
            this.haveXiGang = true;
        }
        this.haveXuanFengGang = false;
        if (this.checkXuanFengGang()) {
            this.haveXuanFengGang = true;
        }
    }else{
        this.haveBuYao = false;
        if (this.checkBuYaoGang()) {
            this.haveBuYao = true;
        }
        this.haveBuJiu = false;
        if (this.checkBuJiuGang()) {
            this.haveBuJiu = true;
        }
        this.haveBuXi = false;
        if (this.checkBuXiGang()) {
            this.haveBuXi = true;
        }
        this.haveBuXuanFeng = false;
        if (this.checkBuXuanFengGang()) {
            this.haveBuXuanFeng = true;
        }
    }
}
Player.prototype.CheckMingGangWhenAfterTing = function(pai){
    var length = this.currentMingGang.length;
    this.currentMingGang.splice(0,length);
    for (var i = 0 ; i < 5; i++) {
        if (this.pengCards[i].length > 0) {
            for (var j = 0; j < this.pengCards[i].length - 2;) {
                if (pai.value == this.pengCards[i][j]) {
                    var card = {};
                    card.key = pai.key;
                    card.value = pai.value;
                    this.currentMingGang.push(card);
                    return true;
                }
                j += 3;
            }
        }
    }
}
Player.prototype.setState_guoMyTurn = function(type){
    this.state_guoMyTurn = type;
}
Player.prototype.settState_guoOtherTurn = function(type){
    this.state_guoOtherTurn = type;
}
Player.prototype.setState_zhuaWanPai = function(){
    logger.debug('设置玩家：[ '+ this.uid +' ]抓完牌的状态为true');
    this.state_zhuaWanPai = true;
}
Player.prototype.setState_zhuaWanPaiFalse = function(){
    this.state_zhuaWanPai = false;
}
Player.prototype.resetState = function(){
    this.state_zhuaWanPai = false;
    this.resetNotifyState();
}
Player.prototype.setCanTing = function(type){
    this.canTing = type;
}
Player.prototype.setState_daWanpaiFalse = function(){
    this.state_daWanpai = false;
}
Player.prototype.resetNotifyState = function(){
    this.canHu = false;
    this.canTing = false;
    this.canPeng = false;
    this.canChi = false;
    this.haveAnGang = false;
    this.haveMingGang = false;
    this.state_mingGangFromOther = false;
    this.haveYaoGang = false;
    this.haveJiuGang = false;
    this.haveXiGang = false;
    this.haveXuanFengGang = false;
    this.haveBuYao = false;
    this.haveBuJiu = false;
    this.haveBuXi = false;
    this.haveBuXuanFeng = false;
    this.state_doingTianDan = false;
    this.state_tianWanDan   = false;
    this.state_daWanpai   = false;
    this.state_guoMyTurn  = false;
    this.state_guoOtherTurn = false;
    this.state_checkingDaPaiFinish  = false;
    this.state_checkingTianDanFinish  = false;
}
Player.prototype.setState_tianWanDan = function(type){
    this.state_tianWanDan = type;
}
Player.prototype.setState_doingTianDan = function(type){
    this.state_doingTianDan = type;
}
Player.prototype.setState_checkingTianDanFinish = function(type){
    this.state_checkingTianDanFinish = type;
}
Player.prototype.PlayerDoTianGangFinished = function(card){
    if (this.state_tianMingGangMySelfIng == true) {
        this.state_zhuaWanPai = false;
        this.DoMingGangPaiFinished();
        this.state_tianMingGangMySelfIng = false;
        this.buGanging  = false;
        return true;
    }
    if (card.value == 0x01 || card.value == 0x11 || card.value == 0x21) {
        this.state_zhuaWanPai = false;
        this.DoTianYaoDanPaiFinished(card);
        this.checkBuYaoGang();
        this.buGanging  = false;
        return true;
    }
    if (card.value == 0x09 || card.value == 0x19 || card.value == 0x29) {
        this.state_zhuaWanPai = false;
        this.DoTianJiuDanPaiFinished(card);
        this.checkBuJiuGang();
        this.buGanging  = false;
        return true;
    }
    if (card.key == 3) {
        this.state_zhuaWanPai = false;
        this.DoTianZFBDanPaiFinished(card);
        this.checkBuXiGang();
        this.buGanging  = false;
        return true;
    }
    if (card.key == 4) {
        this.state_zhuaWanPai = false;
        this.DoTianDNXBDanPaiFinished(card);
        this.checkBuXuanFengGang();
        this.buGanging  = false;
        return true;
    }
    return false;
}
Player.prototype.DoTianYaoDanPaiFinished = function(card){
    this.yaoGangCards[card.key].push(card.value);
}
Player.prototype.DoTianJiuDanPaiFinished = function(card){
    this.jiuGangCards[card.key].push(card.value);
}
Player.prototype.DoTianZFBDanPaiFinished = function(card){
    this.xiGangCards.push(card.value);
}
Player.prototype.DoTianDNXBDanPaiFinished = function(card){
    this.xuangFengGangCards.push(card.value);
}
Player.prototype.DoMingGangPaiFinished = function(){
    var card = this.currentMingGang[0];
    var key = card.key;
    var value = card.value;
    //从碰的数组中删除这三张牌
    for(var i = 0; i < this.pengCards[key].length; i++){
        if(value == this.pengCards[key][i]){
            this.pengCards[key].splice(i,3);
            break;
        }
    }
    for(var i = 0; i < 4; i++){
        this.mingGangCards[key].push(value);
    }
    this.mingGangCards[key].sort();
    var gangArray = new Array();
    for(var i = 0; i < 4 ; i++){
        gangArray.push(card);
    }
    var stCHIPENGGANG = {
        isGang: 1,
        isAnGang: 0,
        Vec3or4:gangArray
    }
    this.playerCard.push(stCHIPENGGANG);
    return true;
}
Player.prototype.DaChuPaiBeiChiPengGangHu = function(){
    var len = this.outHandCards.length;
    this.outHandCards.splice((len-1),1);
    return true;
}
Player.prototype.setState_mingGangFromOther = function(type){
    this.state_mingGangFromOther = type;
}
Player.prototype.DoMingGangPaiFromOther = function(p_type,p_value){
    var shouLiPai = this.inHandCards;
    var count = 0;
    for(var i = 0; i < 5;i++){
        var qunima = false;
        for(var j = 0; j < this.inHandCards[i].length; j++){
            if(p_value == this.inHandCards[i][j]){
                qunima = true;
                break;
            }
            count++;
        }
        if(qunima){
            break;
        }
    }
    for(var i = 0; i < shouLiPai[p_type].length; i++){
        if(shouLiPai[p_type][i] == p_value){
            shouLiPai[p_type].splice(i,3);
        }
    }
    for(var i = 0; i < 4; i++){
        this.mingGangCards[p_type].push(p_value);
    }
    this.mingGangCards[p_type].sort();
    this.state_mingGangFromOther = false;
    this.canPeng = false;
    var position = {
        key:count
    }
    var card ={
        key:p_type,
        value:p_value
    }
    var gangArray = new Array();
    for(var i = 0; i < 4 ; i++){
        gangArray.push(card);
    }
    var stCHIPENGGANG = {
        isGang: 1,
        isAnGang: 0,
        Vec3or4:gangArray
    }
    this.playerCard.push(stCHIPENGGANG);
    return position;
}
Player.prototype.clickTing = function(){
    this.isTing = true;
    this.canTing = false;
    this.state_guoMyTurn = true;
}
Player.prototype.CheckBaoPaiNumInThisPlayer = function(card){
    var ret = 0;
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < this.pengCards[i].length; j++) {
            if (this.pengCards[i][j] == card.value) {
                ret ++;
            }
        }
        for (var j = 0; j < this.mingGangCards[i].length; j++) {
            if (this.mingGangCards[i][j] == card.value) {
                ret ++;
            }
        }
    }
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < this.chiCrads[i].length; j++) {
            if (this.chiCrads[i][j] == card.value) {
                ret ++;
            }
        }
        for (var j = 0; j < this.yaoGangCards[i].length; j++) {
            if (this.yaoGangCards[i][j] == card.value) {
                ret ++;
            }
        }
        for (var j = 0; j < this.jiuGangCards[i].length; j++) {
            if (this.jiuGangCards[i][j] == card.value) {
                ret ++;
            }
        }

    }
    for (var j = 0; j < this.xiGangCards.length; j++) {
        if (this.xiGangCards[j] == card.value) {
            ret ++;
        }
    }
    for (var j = 0 ; j < this.xuangFengGangCards.length; j++) {
        if (this.xuangFengGangCards[j] == card.value) {
            ret ++;
        }
    }
    for (var i = 0; i < this.outHandCards.length; i++) {
        if (this.outHandCards[i] == card.value) {
            ret ++;
        }
    }
    return ret;
}
Player.prototype.CheckHuPaiWithBaoPai = function(){
    var shouLiPai = this.inHandCards;
    shouLiPai[this.baoPai.key].push(this.baoPai.value);
    shouLiPai[this.baoPai.key].sort();
    var ret = this.checkHu(shouLiPai);
    for(var i = 0; i < shouLiPai[this.baoPai.key].length; i++){
        if(shouLiPai[this.baoPai.key][i] == this.baoPai.value){
            shouLiPai[this.baoPai.key].splice(i,1);
            break;
        }
    }
    if (ret == true) {
        return true;
    }
    return false;
}
Player.prototype.setHaveAnGang = function(type){
    this.haveAnGang = type;
}
Player.prototype.CheckZhanLi = function(){
    var cardNum = 0;
    for (var i = 0; i < 5; i++) {
    cardNum = cardNum + this.inHandCards[i].length + this.anGangCards[i].length;
}
    if (cardNum > 12) {
        return true;
    }
    return false;
}
Player.prototype.CheckPiaoWithPai = function(card){
    var shouLiPai = this.inHandCards;
    shouLiPai[card.key].push(card.value);
    shouLiPai[card.key].sort();
    var ret = this.CheckPiaoWithoutPai();
    for(var i = 0; i < shouLiPai[card.key].length; i++){
        if(shouLiPai[card.key][i] == card.value){
            shouLiPai[card.key].splice(i,1);
            break;
        }
    }
    return ret;
}
Player.prototype.CheckPiaoWithoutPai = function(){
    for (var i = 0; i < 3; i++) {
         if (this.chiCrads[i].length != 0) {
        return false;
         }
    }

//    vector<int> tempVector[5];
    var tempVector = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    for (var i = 0; i < 5; i++) {
    for (var j = 0; j < this.inHandCards[i].length; j++) {
        tempVector[i].push(this.inHandCards[i][j]);
    }
    tempVector[i].push(-1);
    tempVector[i].push(-2);
}

//    vector<int> tempVector2[5];
    var tempVector2 = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    for (var i = 0; i < 5; i++) {
    for (var j = 0; j < tempVector[i].length - 2; ) {
        if (this.Check333(tempVector[i][j],tempVector[i][j + 1],tempVector[i][j + 2]) == true) {
            j += 3;
        }
        else
        {
            tempVector2[i].push(tempVector[i][j]);
            j++;
        }
    }
}

    var totalLast = 0;
    for (var i = 0; i < 5; i++) {
    totalLast += tempVector2[i].length;
}

    if (totalLast == 2) {
        for (var i = 0; i < 5; i++) {
            if (tempVector2[i].length != 0) {
                if (tempVector2[i][0] == tempVector2[i][1]) {
                    return true;
                }
                else
                    return false;
            }
        }
    }

    if (totalLast == 5) {//这是抓牌对宝的飘
        var find22Times = 0;
        for (var i = 0; i < 5; i++) {
            for (var j = 0; j < tempVector2[i].length - 1; j++) {
                if (tempVector2[i][j] == tempVector2[i][j + 1]) {
                    find22Times++;
                    j++;
                }
            }
        }
        if (find22Times == 2) {
            return true;
        }
    }
    return false;
}
Player.prototype.CheckJiaHuWith14PaisInHand = function(card){
    var ret;
    var shouLiPai = this.inHandCards;
    for(var i = 0; i < shouLiPai[card.key].length; i++){
        if(shouLiPai[card.key][i] == card.value){
            shouLiPai[card.key].splice(i,1);
            break;
        }
    }
    ret = this.CheckJiaHuWith13PaisInHand();
    shouLiPai[card.key].push(card.value);
    shouLiPai[card.key].sort();
    return ret;
}
Player.prototype.CheckJiaHuWith13PaisInHand = function(){
    var testVector = new Array(new Array(),new Array(),new Array(),new Array(),new Array());
    for (var i = 0; i < 5; i++) {
    for (var j = 0; j < this.inHandCards[i].length; j++) {
        testVector[i].push(this.inHandCards[i][j]);
    }
}
    if (this.checkYaoJiu(testVector) == false) {
        return false;
    }
    var allKindPai = [0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,
        0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,
        0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,
        0x31,0x32,0x33,0x34,0x35,0x36,0x37];

    var totalCanHuPais = 0;

    for (var m = 0; m < 34; m++){
        var addPai = {};
        addPai.m_Value = allKindPai[m];
        if(allKindPai[m]>=0x01 && allKindPai[m] <= 0x09)
        {
            addPai.m_Type = 0;
        }
        else if (allKindPai[m] >= 0x11 && allKindPai[m] <= 0x19)
        {
            addPai.m_Type = 1;
        }
        else if (allKindPai[m] >= 0x21 && allKindPai[m] <= 0x29)
        {
            addPai.m_Type = 2;
        }
        else if (allKindPai[m] >= 0x31 && allKindPai[m] <= 0x33)
        {
            addPai.m_Type = 3;
        }
        else
        {
            addPai.m_Type = 4;
        }
        this.AddPaiToTestVector(testVector, addPai.m_Type, addPai.m_Value);
        var hu = this.checkHu(testVector);
        this.DelPaiFromTestVector(testVector, addPai.m_Type, addPai.m_Value);
        if ( hu == true)
        {
            totalCanHuPais ++;
        }
    }
    if (totalCanHuPais > 1) {
        return false;
    }
    return true;
}
Player.prototype.PlayerDoHuMyTurn = function(){
    this.state_doHu = true;
    this.HuType_ZiMo = true;
    return true;
}
Player.prototype.PlayerDoHuOtherTurn = function(){
    this.state_doHu = true;
    this.HuType_ZiMo = false;
    return true;
}
Player.prototype.checkLevel = function(){
    if(this.gold <= 0){
        this.level = '白板';
    }else if(this.gold > 0 && this.gold <= 100*2){
        this.level = '一万';
    }else if(this.gold > 100*2 && this.gold <= 200*2){
        this.level = '二万';
    }else if(this.gold > 200*2 && this.gold <= 500*2){
        this.level = '三万';
    }else if(this.gold > 500*2 && this.gold <= 1000*2){
        this.level = '四万';
    }else if(this.gold > 1000*2 && this.gold <= 2000*2){
        this.level = '五万';
    }else if(this.gold > 2000*2 && this.gold <= 3000*2){
        this.level = '六万';
    }else if(this.gold > 3000*2 && this.gold <= 5000*2){
        this.level = '七万';
    }else if(this.gold > 5000*2 && this.gold <= 8000*2){
        this.level = '八万';
    }else if(this.gold > 8000*2 && this.gold <= 12000*2){
        this.level = '九万';
    }else if(this.gold > 12000*2 && this.gold <= 20000*2){
        this.level = '东风';
    }else if(this.gold > 20000*2 && this.gold <= 30000*2){
        this.level = '西风';
    }else if(this.gold > 30000*2 && this.gold <= 40000*2){
        this.level = '南风';
    }else if(this.gold > 40000*2 && this.gold <= 80000*2){
        this.level = '北风';
    }else if(this.gold > 80000*2 && this.gold <= 120000*2){
        this.level = '中';
    }else if(this.gold > 120000*2 && this.gold <= 160000*2){
        this.level = '发';
    }else if(this.gold > 160000*2){
        this.level = '雀神';
    }
}

Player.prototype.getInfo = function() {
    var re = this.isReady?1:0;
    var iB = this.isBanker?1:0;
    var iT  = this.isTing?1:0;
    return {
        id:this.playerId,
        userId:this.uid,
        sex:this.sex,
        image:this.image,
        gold:this.gold,
        name:this.name,
        level:this.level,
        winCount:this.winCount,
        loseCount:this.loseCount,
        drawCount:this.drawCount,
        position:this.position,
        isBanker:iB,
        isTing:iT,
        isReady:re
    };
};

Player.prototype.setSex = function(type){
    this.sex = type;
}
Player.prototype.setPlayerName = function(type){
    this.name = type;
}
Player.prototype.setImage = function(type){
    this.image = type;
}
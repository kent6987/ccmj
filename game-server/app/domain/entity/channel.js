var Room = require('./room');

var Channel = function(opts) {
    this.channelId = Number(opts.channelId);
    if(this.channelId == 0){
        this.gold = 100;
    }else if(this.channelId == 1){
        this.gold = 1000;
    }else if(this.channelId == 2){
        this.gold = 2000;
    }else if(this.channelId == 3){
        this.gold = 3000;
    }else if(this.channelId == 4){
        this.gold = 5000;
    }else if(this.channelId == 5){
        this.gold = 10000;
    }
    this.channelName = opts.channelName;
    this.channelType = opts.channelType;
    this.rooms = [];
    this.channelPlayerIds = {};
    this.totalChannelPlayerCount = 0;
};

module.exports = Channel;


Channel.prototype.getAllRooms = function() {
    return this.rooms;
};
Channel.prototype.newRoom = function(roomId, roomName) {
//    console.log('初始化房间');
    var opts = {
        roomId: Number(roomId),
        roomName: roomName,
        channelId: this.channelId
    };
    this.rooms.push(new Room(opts));
};

Channel.prototype.addChannelPlayer = function(uid) {
    if (!this.channelPlayerIds[uid]) {
        this.channelPlayerIds[uid] = '1';
        this.totalChannelPlayerCount++;
    }
//    console.log('[channel.js] 此时channel中的人数：' + this.totalChannelPlayerCount);
};

Channel.prototype.removeChannelPlayerById = function(uid) {
    if (!!this.channelPlayerIds[uid]) {
        this.channelPlayerIds[uid] = null;
        this.totalChannelPlayerCount--;
    }
};

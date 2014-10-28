var Code = require('../../../consts/code');
var async = require('async');
var userDao = require('../../../dao/userDao');
var logger = require('ss-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var consts = require('../../../consts/consts');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};
/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
Handler.prototype.entry = function(msg, session, next) {
    var token = msg.token, self = this;
    if(!token) {
        logger.error('[Handler.prototype.entry] [failed] [token error] [token :' + token +']');
        next(null, {
            code: consts.RES_CODE.ERR_INVALID_PARAMETER,
            error: consts.ERR_MSG.ERR_TOKEN
        });
        return;
    }
    var uid, players, player;
    async.waterfall([
        function(cb) {
            // auth token
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function(code, user, cb) {
            if(code !== Code.OK) {
                next(null, {code: code});
                return;
            }
            if(!user) {
                next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
                return;
            }
            uid = user.id;
            userDao.getPlayersByUid(user.id, cb);
        }, function(res, cb) {
            // generate session and register chat status
            players = res;
            self.app.get('sessionService').kick(uid, cb);
        }, function(cb) {
            session.bind(uid, cb);
        }, function(cb) {
            if(!players || players.length === 0) {
                next(null, {code: Code.OK});
                return;
            }
            player = players[0];
            session.set('sid', self.app.get('serverId'));
            session.set('playerId',player.id);
            var cardServerIdMap = self.app.get('cardServerIdMap');
            session.set('cardSid', cardServerIdMap[1]);
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        }, function(cb) {
            var sid = session.get('sid');
            self.app.rpc.card.channelRoomRemote.add(session,sid,player.id,player.userId,player.sex,player.level,player.gold,player.name, player.experience,player.winCount,player.loseCount,player.drawCount,player.freeTimes,player.money,player.delayMoney,player.playerCount,player.huCount,player.ziMoCount,player.duiBaoCount,player.image,player.qianDaoCount,player.threeCount,player.fiveCount,player.sevenCount,player.swCount,player.ssCount,cb);
        },function(results){
            next(null, {code: Code.OK, player: players ? players[0] : null});
        }
    ], function(err) {
        if(err) {
            logger.error('[Handler.prototype.entry] [failed] [error :' + err.stack +']');
            next(null, {
                code: consts.RES_CODE.ERR_FAILED,
                error: err.stack
            });

        }
    });
};

var onUserLeave = function(app, session) {
    if(!session || !session.uid) {
        return;
    }
    logger.info('[Handler.prototype.entry] [user leave game!]');
    app.rpc.card.channelRoomRemote.kick(session,session.uid, app.get('serverId'), null);
};
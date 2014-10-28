var exp = module.exports;
//var dispatcher = require('./dispatcher');
//var Business = require('../domain/business');
exp.card = function(session, msg, app, cb) {
    //console.log('card route is called !');

    var cardServers = app.getServersByType('card');
    if(!cardServers) {
        cb(new Error('can not find cardServers servers.'));
        return;
    }
    var cardServerCount = cardServers.length;
    if(cardServerCount === 0) {
        cb(new Error('can not find cardServers servers.'));
        return;
    }
    var selectedServer = session.get('cardSid');
    if(!!selectedServer) {
        cb(null, selectedServer);
        return;
    }
    //var res = dispatcher.dispatch(session.get('rid'), chatServers);
    var res = cardServers[0];
    cb(null, res.id);
};
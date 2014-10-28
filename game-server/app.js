var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
var sync = require('pomelo-sync-plugin');
var business = require('./app/domain/business');
var Channel = require('./app/domain/entity/channel');
var consts = require('./app/consts/consts');
var logger = require('ss-logger').getLogger(__filename);
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'changchunmajiang');

// Configure for production enviroment
app.configure('production', function() {
    // enable the system monitor modules
    app.enable('systemMonitor');
});

app.configure('production|development', function() {
    if (app.serverType !== 'master') {
        var cardServers = app.get('servers').card;
        var cardServerIdMap = {};
        for(var id in cardServers){
            cardServerIdMap[cardServers[id].card] = cardServers[id].id;
        }
        app.set('cardServerIdMap', cardServerIdMap);
    }
    app.set('proxyConfig', {
        cacheMsg: true,
        interval: 30,
        lazyConnection: true
        // enableRpcLog: true
    });
    // remote configures
    app.set('remoteConfig', {
        cacheMsg: true,
        interval: 30
    });
    app.route('card',routeUtil.card);
    app.loadConfig('mysql', app.getBase() + '/config/mysql.json');
    app.globalFilter(pomelo.filters.timeout());
});

// Configure for card server
app.configure('production|development','card', function() {
    var desksTypes =  [consts.CHANNEL_TYPE.PRIMARY, consts.CHANNEL_TYPE.MIDDLERANK, consts.CHANNEL_TYPE.HIGHRANK, consts.CHANNEL_TYPE.MASTERLEVEL,consts.CHANNEL_TYPE.GRANDMASTER, consts.CHANNEL_TYPE.PEAKEDNESS];
    var specialCount = desksTypes.length;
    var roomCount = 500;
    for(var i=0; i<specialCount; i++) {
        var opts = {
            channelId: i,
            channelName: i +'',
            channelType: desksTypes[i]
        };
        var newChannel =  new Channel(opts);
        business.channels.push(newChannel);
        for(var j = 0;j < roomCount; j++) {
            newChannel.newRoom(j,'');
        }
    }

});


// Configure for auth server
app.configure('production|development', 'auth', function() {
    // load session congfigures
    app.set('session', require('./config/session.json'));
});
app.configure('production|development', 'billing', function() {
});

// Configure database
app.configure('production|development', function() {
    var dbclient = require('./app/dao/mysql/mysql').init(app);
    app.set('dbclient', dbclient);
});

app.configure('production|development', 'connector', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            heartbeat : 30,
            useDict : true,
            useProtobuf : true,
            disconnectOnTimeout: true
        });
});

app.configure('production|development', 'gate', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector
        });
});

// start app
app.start();

process.on('uncaughtException', function (err) {
    logger.error(' Caught exception: ' + err.stack);
});

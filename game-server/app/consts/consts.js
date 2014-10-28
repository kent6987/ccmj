/**
 * Created with JetBrains WebStorm.
 * User: Pro2012
 * Date: 13-8-14
 * Time: PM1:43
 * To change this template use File | Settings | File Templates.
 */
module.exports = {
    INFO: {
        VERSION                     : '2.0.01'
    },

    RES_CODE: {
        SUC_OK                      : 200,        //success

        ERR_FAILED                  : 500,        //failed
        ERR_INVALID_PARAMETER       : 501,        //failed, invalid parameter
        ERR_OPPONENT_INFO_MISS      : 502,
        ERR_LOW_VERSION             : 503,
        ERR_ROOM_FULL               : 504,
        ERR_LOGIN_FAILED            : -1,       //login failed
        ERR_REGISTER_FAILED_EXIST   : -2        //register failed, user already exists

    },

    ACTION_RES_CODE: {
        ERR_USER_NOT_EXIST           : 1         //the user not exist, login again
    },
    ERR_MSG: {
        ROOM_IS_FULL                 : 'Room is full',       //enter room
        USER_INFO_MISSING            : 'Login again',
        OPPONENT_INFO_MISSING        : 'Opponent leave the server',
        INVALID_PARAMETER            : 'Invalid parameter',
        UDID_NULL                        : 'udid is null',
        ERR_TOKEN                         : 'token is null',
        LOGIN_FAILED                 : 'Invalid user name or password',
        CONNECTOR_SERVER_DOWN        : 'Connector server is down',
        USER_EXIST                   : 'User already exists',
        SESSION_OVERDUE                   : 'session overdue',
        LOW_VERSION                  : 'Your version is too low'
    },

    PLAYER: {
        sex                 : '0',       //enter room
        image               :'1',
        level            : '白板',
        experience        : '0',
        gold            : '200000',
        money           :'0',
        winCount                        : '0',
        loseCount                         : '0',
        drawCount                 : '0',
        freeTimes             :'0',
        delayMoney              :'0',
        playerCount             :'0',
        huCount                 :'0',
        ziMoCount               :'0',
        duiBaoCount             :'0'
    },

    CHANNEL_TYPE: {
        PRIMARY                           :0,
        MIDDLERANK                       :1,
        HIGHRANK                         :2,
        MASTERLEVEL                      :3,
        GRANDMASTER                        :4,
        PEAKEDNESS                         :5
    }


};

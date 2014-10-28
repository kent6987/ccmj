/**
 * Created with JetBrains WebStorm.
 * User: Pro2012
 * Date: 13-8-4
 * Time: PM7:59
 * To change this template use File | Settings | File Templates.
 */

var Remote = function(app) {
    this.app = app;
};

module.exports = function(app) {
    return new Remote(app);
};
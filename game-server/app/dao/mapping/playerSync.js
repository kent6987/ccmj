module.exports =  {
	updatePlayer:function(client, player) {
		var sql = 'update Player sex = ?, level = ?, experience = ?, gold = ?, winCount = ?, loseCount = ?, drawCount = ? where id = ?';
		var args = [player.sex, player.level, player.experience, player.gold, player.winCount, player.loseCount, player.drawCount, player.id];
		client.query(sql, args, function(err, res) {
			if(err !== null) {
				console.error('write mysql failed!　' + sql + ' ' + JSON.stringify(player) + ' stack:' + err.stack);
			}
		});
	}
};

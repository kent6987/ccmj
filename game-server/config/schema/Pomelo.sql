/*
MySQL Data Transfer
Source Host: app56v1.photo.163.org
Source Database: Pomelo
Target Host: app56v1.photo.163.org
Target Database: Pomelo
Date: 2012-8-16 15:54:13
*/

SET FOREIGN_KEY_CHECKS=0;
-- ----------------------------
-- Table structure for Player
-- ----------------------------
DROP TABLE IF EXISTS `Player`;
CREATE TABLE IF NOT EXISTS `Player` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `image` smallint(2) unsigned DEFAULT '0',
  `sex` smallint(2) unsigned DEFAULT '0',
  `level` varchar(50) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `experience` smallint(11) unsigned DEFAULT '0',
  `gold` bigint(20) unsigned DEFAULT '0',
  `money` bigint(20) unsigned DEFAULT '0',
  `winCount` smallint(6) unsigned DEFAULT '0',
  `loseCount` smallint(6) unsigned DEFAULT '0',
  `drawCount` smallint(6) unsigned DEFAULT '0',
  `freeTimes` smallint(6) unsigned DEFAULT '0',
  `delayMoney` bigint(20) unsigned DEFAULT '0',
  `playerCount` smallint(6) unsigned DEFAULT '0',
  `huCount` smallint(6) unsigned DEFAULT '0',
  `ziMoCount` smallint(6) unsigned DEFAULT '0',
  `duiBaoCount` smallint(6) unsigned DEFAULT '0',
  `qianDaoCount` smallint(6) unsigned DEFAULT '0',
  `threeCount` smallint(6) unsigned DEFAULT '0',
  `fiveCount` smallint(6) unsigned DEFAULT '0',
  `sevenCount` smallint(6) unsigned DEFAULT '0',
  `swCount` smallint(6) unsigned DEFAULT '0',
  `ssCount` smallint(6) unsigned DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_PALYER_USER_ID` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=32351 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for Task
-- ----------------------------
DROP TABLE IF EXISTS `Task`;
CREATE TABLE IF NOT EXISTS `Task` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `taskId` smallint(11) unsigned NOT NULL DEFAULT '0',
  `schedule` bigint(20) unsigned DEFAULT '0',
  `haveDraw` bigint(20) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_TASK_ID` (`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=10162 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- ----------------------------
-- Table structure for User
-- ----------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `udid` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(50) COLLATE utf8_unicode_ci DEFAULT  '',
  `from` varchar(50) COLLATE utf8_unicode_ci DEFAULT  '',
  `password` varchar(50) COLLATE utf8_unicode_ci DEFAULT  '',
  `loginCount` smallint(6) unsigned DEFAULT '0',
  `lastLoginTime` bigint(20) unsigned DEFAULT '0',
  `loginType` bigint(2) unsigned DEFAULT '0',
  `createTime` bigint(20) unsigned DEFAULT '0',
  `isBind` smallint(4) unsigned DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32209 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

 DROP TABLE IF EXISTS `Qiandao`;
 CREATE TABLE IF NOT EXISTS `Qiandao` (
   `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
   `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
   `time` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
   `draw` int(2) unsigned DEFAULT '0',
   `isLingqu` bigint(2) unsigned DEFAULT '0',
   PRIMARY KEY (`id`),
   KEY `INDEX_TASK_ID` (`userId`)
 ) ENGINE=InnoDB AUTO_INCREMENT=10162 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `Payios`;
CREATE TABLE IF NOT EXISTS `Payios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `receipt` varchar(50) COLLATE utf8_unicode_ci DEFAULT  '',
  `result` smallint(4) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `INDEX_TASK_ID` (`receipt`)
) ENGINE=InnoDB AUTO_INCREMENT=10162 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

DROP TABLE IF EXISTS `PayAndroid`;
CREATE TABLE IF NOT EXISTS `PayAndroid` (
  `exorderno` bigint(50) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `transid` varchar(32) COLLATE utf8_unicode_ci DEFAULT  '',
  `appid` varchar(20) COLLATE utf8_unicode_ci DEFAULT  '',
  `waresid` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  `feetype` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  `money` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  `count` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  `result` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  `transtype` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  `transtime` varchar(20) COLLATE utf8_unicode_ci DEFAULT  '',
  `cpprivate` varchar(130) COLLATE utf8_unicode_ci DEFAULT  '',
  `paytype` varchar(10) COLLATE utf8_unicode_ci DEFAULT  '',
  PRIMARY KEY (`exorderno`)
) ENGINE=InnoDB AUTO_INCREMENT=10162 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

 DROP TABLE IF EXISTS `EverydayTask`;
 CREATE TABLE IF NOT EXISTS `EverydayTask` (
   `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
   `userId` bigint(20) unsigned NOT NULL DEFAULT '0',
   `taskData` text,
   PRIMARY KEY (`id`),
   KEY `INDEX_TASK_ID` (`userId`)
 ) ENGINE=InnoDB AUTO_INCREMENT=10162 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
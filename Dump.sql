CREATE DATABASE  IF NOT EXISTS `database` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `database`;
-- MySQL dump 10.13  Distrib 5.6.19, for osx10.7 (i386)
--
-- Host: 127.0.0.1    Database: database
-- ------------------------------------------------------
-- Server version	5.6.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Games`
--

DROP TABLE IF EXISTS `Games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Games` (
  `gameId` varchar(36) NOT NULL,
  `board` text NOT NULL,
  `startTime` datetime DEFAULT NULL,
  `challenger` varchar(15) DEFAULT NULL,
  `challengee` varchar(15) DEFAULT NULL,
  `wonBy` varchar(15) DEFAULT NULL,
  `lastMoveTime` datetime DEFAULT NULL,
  `playableGrid` int(10) unsigned DEFAULT NULL,
  `state` varchar(15) NOT NULL,
  `activePlayer` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`gameId`),
  UNIQUE KEY `gameId_UNIQUE` (`gameId`),
  KEY `playerOne_idx` (`challenger`),
  KEY `playerTwo_idx` (`challengee`),
  CONSTRAINT `playerOne` FOREIGN KEY (`challenger`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `playerTwo` FOREIGN KEY (`challengee`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Messages` (
  `message` longtext NOT NULL,
  `timeSent` datetime NOT NULL,
  `sender` varchar(15) NOT NULL,
  `gameId` varchar(45) DEFAULT NULL,
  KEY `sender_idx` (`sender`),
  KEY `gameId_idx` (`gameId`),
  CONSTRAINT `sender` FOREIGN KEY (`sender`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `NetworkLog`
--

DROP TABLE IF EXISTS `NetworkLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `NetworkLog` (
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ipAddress` varchar(45) DEFAULT NULL,
  `username` varchar(15) DEFAULT NULL,
  `body` mediumtext,
  `method` tinytext,
  `url` tinytext,
  `userAgent` mediumtext,
  `logId` int(10) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`logId`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Posts`
--

DROP TABLE IF EXISTS `Posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Posts` (
  `author` varchar(15) NOT NULL,
  `post` longtext NOT NULL,
  `postTime` varchar(45) NOT NULL,
  `threadId` varchar(20) NOT NULL,
  PRIMARY KEY (`author`,`postTime`),
  KEY `threadID_idx` (`threadId`),
  CONSTRAINT `author` FOREIGN KEY (`author`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `threadID` FOREIGN KEY (`threadId`) REFERENCES `Threads` (`threadId`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ThreadViews`
--

DROP TABLE IF EXISTS `ThreadViews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ThreadViews` (
  `userName` varchar(15) NOT NULL,
  `viewTime` datetime NOT NULL,
  `viewedThreadId` varchar(20) NOT NULL,
  PRIMARY KEY (`userName`,`viewTime`),
  KEY `threadId_idx` (`viewedThreadId`),
  CONSTRAINT `thread` FOREIGN KEY (`viewedThreadId`) REFERENCES `Threads` (`threadId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `user` FOREIGN KEY (`userName`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Threads`
--

DROP TABLE IF EXISTS `Threads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Threads` (
  `threadId` varchar(20) NOT NULL,
  `originalPoster` varchar(15) NOT NULL,
  `lastPostTime` datetime NOT NULL,
  `lastPoster` varchar(15) NOT NULL,
  `title` varchar(20) NOT NULL,
  PRIMARY KEY (`threadId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `userName` varchar(15) NOT NULL,
  `password` varchar(20) NOT NULL,
  `wins` int(11) NOT NULL DEFAULT '0',
  `loses` int(11) unsigned NOT NULL DEFAULT '0',
  `connectionCount` int(10) unsigned NOT NULL,
  `draws` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`userName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-11-22  0:46:03

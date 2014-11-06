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
  `gameId` varchar(30) NOT NULL,
  `board` tinyblob NOT NULL,
  `startTime` datetime NOT NULL,
  `endTime` datetime DEFAULT NULL,
  `playerOne` varchar(15) NOT NULL,
  `playerTwo` varchar(15) NOT NULL,
  `winner` varchar(15) DEFAULT NULL,
  `lastMoveTime` datetime NOT NULL,
  PRIMARY KEY (`gameId`),
  KEY `playerOne_idx` (`playerOne`),
  KEY `playerTwo_idx` (`playerTwo`),
  CONSTRAINT `playerOne` FOREIGN KEY (`playerOne`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `playerTwo` FOREIGN KEY (`playerTwo`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Games`
--

LOCK TABLES `Games` WRITE;
/*!40000 ALTER TABLE `Games` DISABLE KEYS */;
/*!40000 ALTER TABLE `Games` ENABLE KEYS */;
UNLOCK TABLES;

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
  `recipient` varchar(15) DEFAULT NULL,
  `gameId` varchar(30) DEFAULT NULL,
  KEY `sender_idx` (`sender`),
  KEY `recipient_idx` (`recipient`),
  KEY `gameId_idx` (`gameId`),
  CONSTRAINT `gameId` FOREIGN KEY (`gameId`) REFERENCES `Games` (`gameId`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `recipient` FOREIGN KEY (`recipient`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `sender` FOREIGN KEY (`sender`) REFERENCES `Users` (`userName`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Messages`
--

LOCK TABLES `Messages` WRITE;
/*!40000 ALTER TABLE `Messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `Messages` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `Posts`
--

LOCK TABLES `Posts` WRITE;
/*!40000 ALTER TABLE `Posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `Posts` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `ThreadViews`
--

LOCK TABLES `ThreadViews` WRITE;
/*!40000 ALTER TABLE `ThreadViews` DISABLE KEYS */;
/*!40000 ALTER TABLE `ThreadViews` ENABLE KEYS */;
UNLOCK TABLES;

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
-- Dumping data for table `Threads`
--

LOCK TABLES `Threads` WRITE;
/*!40000 ALTER TABLE `Threads` DISABLE KEYS */;
/*!40000 ALTER TABLE `Threads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `userName` varchar(15) NOT NULL,
  `password` varchar(20) NOT NULL,
  `online` bit(1) DEFAULT NULL,
  `wins` int(11) DEFAULT NULL,
  `loses` int(11) DEFAULT NULL,
  PRIMARY KEY (`userName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-11-05 20:27:05

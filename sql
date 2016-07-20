
CREATE TABLE `project` (
  `ID` int(64) NOT NULL auto_increment,
  `NAME` varchar(100) default NULL,
  `BELONG` varchar(100) default NULL,
  `MEMBER` varchar(100) default NULL,
  `ALARM` varchar(100) default NULL,
  `DESC` varchar(500) default NULL,
  `HERMES` varchar(100) default NULL,
  `CTRL` varchar(100) default NULL,
  `OPS` varchar(100) default 'ops',
  `OPSER` varchar(100) default NULL,
  `DEVER` varchar(100) default NULL,
  PRIMARY KEY  (`ID`),
  UNIQUE KEY `NAME` (`NAME`),
  UNIQUE KEY `HERMES` (`HERMES`)
) ENGINE=InnoDB AUTO_INCREMENT=606 DEFAULT CHARSET=utf8 

CREATE TABLE `resource` (
  `ID` int(64) NOT NULL auto_increment,
  `PROJECTID` int(64) NOT NULL,
  `TYPE` varchar(50) default NULL,
  `GROUP` varchar(50) default NULL,
  `NODE` varchar(100) default NULL,
  `EXTA` varchar(100) default NULL,
  `EXTB` varchar(100) default NULL,
  PRIMARY KEY  (`ID`),
  UNIQUE KEY `itne` (`PROJECTID`,`TYPE`,`GROUP`,`NODE`)
) ENGINE=InnoDB AUTO_INCREMENT=30933 DEFAULT CHARSET=utf8 


CREATE TABLE `user` (
  `name` varchar(100) default NULL,
  `zhCN` varchar(100) default NULL,
  `role` varchar(100) default NULL,
  `alarm` varchar(100) default NULL,
  `status` varchar(100) default NULL,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8

               Nproject
                             项目管理


使用说明：

   1. 在config.yml中把数据库信息配置上

        database: 'ns_project'
        host: 'ns_project'
        port: 3306
        username: 'root'
        password: 'root'


   2. 在config.yml中设置当前网站的登录地址

        loggin_addr: 'http://nproject.nices.net:9999/login'

   3. 在config.yml中配置上单点登录系统的地址

        sso:
          ref: 'http://login.nides.net:8080/?ref='
          sid: 'http://login.nices.net:8080/info?sid='

   4. 按照config.yml中配置的路径创建以下目录用于存放session

        /tmp/ns-dancer-sessions


   5. 在数据库中建下面几个表

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

   6. 启动服务
        ./bin/web  -p 8080

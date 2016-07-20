package project::askforresources;
use Dancer ':syntax';

our $VERSION = '0.1';

use MYDatabase;

use Dancer qw(session debug);
use FindBin qw( $RealBin );
use MIME::Base64;
use Data::Dumper;

use Tie::File;
use NS::Util::OptConf;

my %deploy;
BEGIN{ %deploy = NS::Util::OptConf->load()->get()->dump( 'deploy' )};


any '/project/askforresources' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  

    if( $param{ask_type} && $param{ask_desc} )
    {
        MYDatabase->exe(
            sprintf "insert into askforresources ( `PROJECTID`, `TYPE`,`DESC` ) values( '%s','%s','%s')",
                @param{qw( project_id ask_type ask_desc )}
        );
    }

    my $project = MYDatabase->exe( "select * from project where id=$id" );
    my $asked = MYDatabase->exe( "select * from askforresources where PROJECTID=$id" );


    my ( %res, %grp, %all );
    if( my @askid = map{ $_->[0] }@$asked )
    {
        my $resource = MYDatabase->exe( sprintf "select `ASKID`,`type`,`group`,count( `group` ) from resource where ASKID in ( %s ) group by `group`", join ',', @askid );
        
        map{
            my( $ASKID, $TYPE, $GROUP, $COUNT ) = @$_;
                $res{$ASKID}{$TYPE}{$GROUP} = $COUNT;
                $grp{$TYPE}{$GROUP} += $COUNT;
                $all{$TYPE} += $COUNT;
        }@$resource;
    }

    my %ed; map{ push @{$ed{ $_->[4] ? 'old':'new'}}, $_;}@$asked;

    template 'project/askforresources',
        +{ 
            project => $project->[0], 
            asked_new => $ed{new},
            asked_old => $ed{old},
            resources => +{ res => \%res, grp => \%grp, all => \%all } 
        };
};

any '/project/askforresources_host' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $skip;
    if( $param{desc}  )
    {
        my $ext = '';
        $ext .= "机器数量:$param{count};" if defined $param{count};
        $ext .= "系统:$param{os};" if defined $param{os};
        $ext .= "内存:$param{mem};" if defined $param{mem};
        $ext .= "磁盘:$param{disk};" if defined $param{disk};
        $ext .= "raid:$param{raid};" if defined $param{raid};
        $param{desc} = "$ext 描述:$param{desc}" if $ext;
        $skip = defined MYDatabase->exe( 
            sprintf "insert into askforresources ( `PROJECTID`, `TYPE`,`DESC`,`USER` ) values( '$id','host','%s','%s')",
                $param{desc}, session('user')
        ) ? 1 : 0;
    }
 
    template 'project/askforresources_host', +{ 
        project_id => $id,
        cmd => $param{cmd},
        name => $param{name},
        skip => $skip  
    };
};

any '/project/askforresources_lvs' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $skip;
    if( $param{desc}  )
    {
        my $ext = '';
        $ext .= "机房:$param{idc};" if $param{idc};
        $ext .= "LVS业务名:$param{service_name};" if $param{service_name};
        $ext .= "服务端口:$param{vip_port};" if $param{vip_port};


        $ext .= sprintf "是否复用VIP:%s;", $param{vip_type} == 1 ? '是':'否' if $param{vip_type};

        $ext .= "复用VIP:$param{VIP};" if $param{VIP};
        $ext .= sprintf "VIP类型:%s;", $param{net_type} ==1 ? '外网':'内网' if $param{net_type};

        $ext .= "RealServer IP:$param{RSIP};" if $param{RSIP};

        if ( $param{checker} )
        {
            if( $param{checker} eq 'HTTP_GET' || $param{checker} eq 'SSL_GET' )
            {
                $ext .= "健康检查:$param{checker};";
                $ext .= sprintf "检查方式:%s;", $param{md5_stauts} == 0 ? 'md5方式': 'stats_code方式';
                $ext .= "URL PATH:$param{url_path};" if $param{url_path};
            }
            elsif( $param{checker} eq 'TCP_CHECK' )
            {
                $ext .= "健康检查:$param{checker};";
            }

        }
        else
        {
            $ext .= "健康检查:空;";
        }

        $ext .= "邮件报警组:$param{email_alarm};" if $param{email_alarm};
        $ext .= "短信报警组:$param{sms_alarm};" if $param{sms_alarm};
        $param{desc} = "$ext 备注:$param{desc}" if $ext;
        $skip = defined MYDatabase->exe( 
            sprintf "insert into askforresources ( `PROJECTID`, `TYPE`,`DESC`,`USER` ) values( '$id','lvs','%s','%s')",
                $param{desc}, session('user')
        ) ? 1 : 0;
    }
 
    template 'project/askforresources_lvs', +{ 
        project_id => $id,
        cmd => $param{cmd},
        name => $param{name},
        skip => $skip,
        hermes => $param{hermes}
    };
};

any '/project/askforresources_domain' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $skip;
    if( $param{desc}  )
    {
        my $ext = '';
        $ext .= "域名类型:$param{type};" if $param{type};
        $param{desc} = "$ext 描述:$param{desc}" if $ext;
        $skip = defined MYDatabase->exe( 
            sprintf "insert into askforresources ( `PROJECTID`, `TYPE`,`DESC`,`USER` ) values( '$id','domain','%s','%s')",
                $param{desc}, session('user')
        ) ? 1 : 0;
    }
 
    template 'project/askforresources_domain', +{ 
        project_id => $id,
        cmd => $param{cmd},
        name => $param{name},
        skip => $skip  
    };
};

any '/project/askforresources_cron' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $project = MYDatabase->exe(
        "select id,name,belong,member,`desc`,hermes from project  where id=$id"
    );

    my ( %grp, %all );
        my $resource = MYDatabase->exe( "select `ASKID`,`type`,`group`,count( `group` ) from resource where ASKID in ( select id from askforresources where PROJECTID=$id ) group by `group`,`ASKID`" );

        map{
            my( $ASKID, $TYPE, $GROUP, $COUNT ) = @$_;
                $grp{$TYPE}{$GROUP} += $COUNT;
                $all{$TYPE} += $COUNT;
        }@$resource;



    template 'project/askforresources_cron', +{ 
        project_id => $id,
        project => $project->[0],
        resources => +{ grp => \%grp, all => \%all },
    };
};



any '/project/askforresources_cron_init' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $project = MYDatabase->exe(
        "select id,name,belong,member,`desc`,hermes from project  where id=$id"
    );

    my %node;
    for( split ';', $param{node} )
    {
        next unless $_ =~ /^([@\w_]+):{([\d,~*]+)}$/;
        $node{"{==\$DB==$1??=={$2}}"}  =1;
    }
    
    my $range = join ',', keys %node;    

    my @node;
    if( my $hermes = $project->[0][5] )
    {
        $range =~ s/\$DB/$hermes/g;
        @node = `$RealBin/../../tools/range -l '$range'`;
    }

    template 'project/askforresources_cron_init', +{ 
        project_id => $id,
        project => $project->[0],
        param => \%param,
        node => \@node,
        range => $range,
    };
};


any '/project/askforresources_cron_insert' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  
 

    my $project = MYDatabase->exe(
        "select member from project  where id=$id"
    );

    return "no the project_id = $id" unless $project && @$project;
    
        
    my $user = session('user');
    $user =~ s/@.*//;
    unless ( session('role') eq 'admin' )
    {
        my %member = map{ $_ => 1}grep{ $_} split '\|', $project->[0][0];

        return "Permission denied" unless $member{$user};
    }

    my %node;
    for( split ';', $param{node} )
    {
        next unless $_ =~ /^([@\w_]+):{([\d,~*]+)}$/;
        $node{"{==\$DB==$1??=={$2}}"}  =1;
    }
    
    my $range = join ',', keys %node;    

       

    my $exec = encode_base64( $param{exec}  );
    chomp $exec;

    MYDatabase->exe(
        sprintf "insert into crontab ( `PROJECTID`, `creator`, `CMD`, `NAME`,`USER`,`BATCH`,`TIMEOUT`,`Timer`,`NODE`,`DESC`,`STAT` ) values ( '$id', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', 'test' )",
   $user, $exec, map{ $param{$_}||''}qw(name user batch timeout timer node desc )
    );

    my $select = MYDatabase->exe(
        "select id from crontab where PROJECTID='$id' and NAME='$param{name}'"
    );

    redirect "/project/askforresources_cron_show?crontab_id=$select->[0][0]";

};


any '/project/askforresources_cron_show' => sub {
    my %param = %{request->params};
    my $id = $param{crontab_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $crontab = MYDatabase->exe(
        "select  `PROJECTID`, `creator`, `CMD`, `NAME`,`USER`,`BATCH`,`TIMEOUT`,`Timer`,`NODE`,`DESC`,`STAT` from crontab where id=$id"
    );

    return "no the crontab_id in db: $id" unless $crontab && @$crontab;
    my $data = $crontab->[0];

    if( $data->[10]  && $data->[10] eq 'test' )
    {
         redirect "/project/askforresources_cron_test?crontab_id=$id";
    }
    
    my $project = MYDatabase->exe(
        "select id,name,belong,member,`desc`,hermes from project  where id=$crontab->[0][0]"
    );


    my %node;
    for( split ';', $data->[8] )
    {
        next unless $_ =~ /^([@\w_]+):{([\d,~*]+)}$/;
        $node{"{==\$DB==$1??=={$2}}"}  =1;
    }

    my $range = join ',', keys %node;

    my @node;
    if( my $hermes = $project->[0][5] )
    {
        $range =~ s/\$DB/$hermes/g;
        @node = `$RealBin/../../tools/range -l '$range'`;
    }

    template 'project/askforresources_cron_show', +{ 
        crontab_id => $id,
        project => $project->[0],
        crontab => $crontab->[0],
        param => \%param,
        'exec' => decode_base64( $crontab->[0][2] ),
        node => \@node,
    };
};

any '/project/askforresources_cron_test' => sub {
    my %param = %{request->params};
    my $id = $param{crontab_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $crontab = MYDatabase->exe(
        "select  `PROJECTID`, `creator`, `CMD`, `NAME`,`USER`,`BATCH`,`TIMEOUT`,`Timer`,`NODE`,`DESC`,`STAT` from crontab where id=$id"
    );

    return "no the crontab_id in db: $id" unless $crontab && @$crontab;
    my $data = $crontab->[0];
    my $project = MYDatabase->exe(
        "select id,name,belong,member,`desc`,hermes from project  where id=$crontab->[0][0]"
    );

    my %node;
    for( split ';', $data->[8] )
    {
        next unless $_ =~ /^([@\w_]+):{([\d,~*]+)}$/;
        $node{"{==\$DB==$1??=={$2}}"}  =1;
    }

    my $range = join ',', keys %node;

    my @node;
    if( my $hermes = $project->[0][5] )
    {
        $range =~ s/\$DB/$hermes/g;
        @node = `$RealBin/../../tools/range -l '$range'`;
    }

    template 'project/askforresources_cron_test', +{ 
        crontab_id => $id,
        project => $project->[0],
        crontab => $crontab->[0],
        param => \%param,
        'exec' => decode_base64( $crontab->[0][2] ),
        node => \@node,
    };
};


any '/project/askforresources_cron_test_do' => sub {
    my %param = %{request->params};
    my $id = $param{crontab_id};
    return unless $id && $id =~ /^\d+$/;  
 

    my $crontab = MYDatabase->exe(
        "select  `PROJECTID`, `creator`, `CMD`, `NAME`,`USER`,`BATCH`,`TIMEOUT`,`Timer`,`NODE`,`DESC`,`STAT` from crontab where id=$id"
    );

    return "no the crontab_id in db: $id" unless $crontab && @$crontab >0;
    my $data = $crontab->[0];
    return "the crontab stat no test" unless $data->[10] eq 'test';

    my $user = session('user');
    $user =~ s/@.*//;

    unless ( session('role') eq 'admin' )
    {
        return "Permission denied" unless $user eq $data->[1];
    }


    my $project = MYDatabase->exe(
        "select  id,name,belong,member,`desc`,hermes from project where id=$data->[0]"
    );


    my %node;
    for( split ';', $data->[8] )
    {
        next unless $_ =~ /^([@\w_]+):{([\d,~*]+)}$/;
        $node{"{==\$DB==$1??=={$2}}"}  =1;
    }
    
    my $range = join ',', keys %node;    
    my $hermes = ( $project && @$project ) ? $project->[0][5] : 'hermes_undef';
    $range =~ s/\$DB/$hermes/g;

    die "tie cron.mould fail: $!" unless tie my @mould, 'Tie::File', "$deploy{conf}/cron.mould";
    die "tie cron.mould fail: $!" unless tie my @conf, 'Tie::File', "$deploy{conf}/cron.id_$id";


    my $exec = decode_base64( $data->[2] );
        @conf = @mould;
    map{
        $_ =~ s/\$env{test}/1/;
        $_ =~ s/\$env{batch}/1/;
        $_ =~ s/\$env{timeout}/$data->[6]/ if $data->[6];
        $_ =~ s/\$env{user}/$data->[4]/ if $data->[4];
        $_ =~ s/\$env{exec}/$exec/ if $data->[2];
        $_ =~ s/\$env{host}/$range/ if $data->[8];
    }@conf;

    system "setsid $RealBin/../../deploy/bin/deploy cron.id_$id &";
};


any '/project/askforresources_cron_submit' => sub {
    my %param = %{request->params};
    my $id = $param{crontab_id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $crontab = MYDatabase->exe(
        "select  `PROJECTID`, `creator`, `CMD`, `NAME`,`USER`,`BATCH`,`TIMEOUT`,`Timer`,`NODE`,`DESC`,`STAT` from crontab where id=$id"
    );

    return "no the crontab_id in db: $id" unless $crontab && @$crontab >0;
    my $project = MYDatabase->exe(
        "select id,name,belong,member,`desc`,hermes from project  where id=$crontab->[0][0]"
    );

    template 'project/askforresources_cron_submit', +{ 
        crontab_id => $id,
        project => $project->[0],
        crontab => $crontab->[0],
        param => \%param,
        'exec' => decode_base64( $crontab->[0][2] )
    };
};


any '/project/askforresources_cron_submit_do' => sub {
    my %param = %{request->params};
    my $id = $param{crontab_id};
    return unless $id && $id =~ /^\d+$/;


    my $crontab = MYDatabase->exe(
        "select  `PROJECTID`, `creator`, `CMD`, `NAME`,`USER`,`BATCH`,`TIMEOUT`,`Timer`,`NODE`,`DESC`,`STAT` from crontab where id=$id"
    );

    return "no the crontab_id in db: $id" unless $crontab && @$crontab >0;
    my $data = $crontab->[0];
    return "the crontab stat no test" unless $data->[10] eq 'test';

    my $user = session('user');
    $user =~ s/@.*//;

    unless ( session('role') eq 'admin' )
    {
        return "Permission denied" unless $user eq $data->[1];
    }

    MYDatabase->exe(
        "update crontab set stat='submit' where id=$id"
    );

    my $select = MYDatabase->exe(
        "select  id from crontab where stat='submit' and id=$id"
    );

    die "err" unless $select && @$select;

};


any '/project/askforresources_cron_edit' => sub {
    my %param = %{request->params};
    my $id = $param{crontab_id};
    return unless $id && $id =~ /^\d+$/;

    if( $param{name} && $param{user} && defined $param{batch} && $param{timeout} && $param{cmd}
        && $param{timer} && $param{node} && $param{desc} && $param{stat} && $param{creator} )

    {
        return "Permission denied" unless session('role') eq 'admin';
    
        my $exec = encode_base64( $param{cmd} );
        MYDatabase->exe(
            "update crontab set `NAME`='$param{name}', USER='$param{user}', BATCH='$param{batch}', TIMEOUT='$param{timeout}', `CMD`='$exec', `Timer`='$param{timer}', `NODE`='$param{node}',`DESC`='$param{desc}',`STAT`='$param{stat}', creator='$param{creator}' where id=$id"
        );
    }
     my $crontab = MYDatabase->exe( "select `NAME`,`USER`,`BATCH`,`TIMEOUT`,`CMD`,`Timer`,`NODE`,`DESC`,`STAT`,`creator` from crontab where id=$id" );

    template 'project/askforresources_cron_edit', +{
         crontab_id => $id,
         crontab => $crontab->[0],
         'exec' => decode_base64( $crontab->[0][4] ),
    };
};


true;

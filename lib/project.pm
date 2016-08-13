package project;
use Dancer ':syntax';

our $VERSION = '0.1';

use MYDatabase;

use Dancer qw(session debug);
use FindBin qw( $RealBin );
use MIME::Base64;
use Data::Dumper;
use NS::Util::OptConf;

get '/' => sub {
    redirect '/project/list';
};

get '/project/list' => sub {
    my %param = %{request->params};
    
    my $data = MYDatabase->exe( "select project.ID, project.NAME,project.BELONG,project.MEMBER,project.ALARM,project.DESC,project.HERMES,count( node ),project.OPS,project.OPSER,project.DEVER from  project  left join resource on project.ID=resource.PROJECTID  and resource.TYPE='host' group by project.id" );

    $data = [ grep{ $_->[2] eq $param{belong}  }@$data ] if( $param{belong} && $data );

    my %count;
    $count{project} = scalar @$data if $data;

    my $hostcount = MYDatabase->exe( "select count(*) from resource where type='host'");
    $count{host} = $hostcount->[0][0];


    my $user = MYDatabase->exe( "select count(*) from user");
    $count{user} = $user->[0][0];
    template 'project/list', +{ data => $data, count => \%count, belong => $param{belong} };
};

get '/project/list_hermes' => sub {
    my %param = %{request->params};
    
    my $data;
    if( $param{name} && $param{name} =~ /^\w+_\w+_\w+_\w+$/ )
    {
        $data = MYDatabase->exe( "select ID,`GROUP`,`NODE`,EXTA, EXTB from resource where ( type='host' or type='lvs' or type='domain' )and  projectid in (select id from project where hermes='$param{name}')" );
    }
    my $hermes = MYDatabase->exe( "select hermes from project where hermes is not null" );
    my %count;

    $count{project} = scalar @$data if $data;


    my $hostcount = MYDatabase->exe( "select count(*) from resource where type='host' or type='lvs' or type='domain' ");
    $count{host} = $hostcount->[0][0];


    my $user = MYDatabase->exe( "select count(*) from user");
    $count{user} = $user->[0][0];
    template 'project/list_hermes', +{ data => $data, count => \%count, hermes => $hermes, name => $param{name} };
};



get '/project/create' => sub {
    my $user = MYDatabase->exe( "select zhCN from user" );
    template 'project/create', +{ users => $user };
};

any '/project/create_submit' => sub {
    my %param = %{request->params};

     map{
         return "$_ error" unless $param{$_} && $param{$_} !~ /[;'"]/
     }qw( p_name p_member p_opser p_dever p_belong p_desc );


    map{ $param{$_} = [$param{$_}] unless ref $param{$_}; }
        qw( p_member p_opser p_dever);

    my $user = MYDatabase->exe( 
        sprintf "insert into project (`NAME`,`BELONG`,`DESC`, `OPS`,`ALARM`,`MEMBER`,`OPSER`,`DEVER`) values( '%s', '%s','%s','%s','%s','|%s|','|%s|','|%s|')", 
        @param{ qw(p_name p_belong p_desc p_ops )} , $param{p_alarm} ? '1': '0', 
        map{ join( '|', @{$param{$_}}) }qw( p_member p_opser p_dever )
    );

    my $project_id = MYDatabase->exe( "select id from project where name='$param{p_name}'" );

    redirect "/project/allocateresource?project_id=$project_id->[0][0]";
};


any '/project/show_resource_host' => sub {
    my %param = %{request->params};

    my $res = MYDatabase->exe( 
        sprintf "select `EXTA`,`NODE`,`GROUP` from resource where type='host' and ASKID in ( %s ) %s", $param{project_id} ? "select id from askforresources where PROJECTID='$param{project_id}'":"$param{ask_id}", $param{group_name} ? "and `GROUP`='$param{group_name}'" : ''
    );

    template 'project/show_resource_host', +{ hosts => $res, group_name => $param{group_name} };
};


any '/project/show_resource_lvs' => sub {
    my %param = %{request->params};

    my $res = MYDatabase->exe( 
        sprintf "select `EXTA`,`NODE`,`GROUP` from resource where type='lvs' and ASKID in ( %s ) %s", $param{project_id} ? "select id from askforresources where PROJECTID='$param{project_id}'":"$param{ask_id}", $param{group_name} ? "and `GROUP`='$param{group_name}'" : ''
    );

    template 'project/show_resource_lvs', +{ hosts => $res, group_name => $param{group_name} };
};

any '/project/show_resource_domain' => sub {
    my %param = %{request->params};

    my $res = MYDatabase->exe( 
        sprintf "select `EXTA`,`NODE`,`GROUP` from resource where type='domain' and ASKID in ( %s ) %s", $param{project_id} ? "select id from askforresources where PROJECTID='$param{project_id}'":"$param{ask_id}", $param{group_name} ? "and `GROUP`='$param{group_name}'" : ''
    );

    template 'project/show_resource_domain', +{ hosts => $res, group_name => $param{group_name} };
};



any '/project/editproject_update' => sub {
    my %param = %{request->params};
    my $id = $param{id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $skip;
    if( $param{name} && $param{belong} && defined $param{alarm} && $param{desc} && $param{hermes} && $param{hermes} =~ /^\w+_\w+_\w+_\w+$/ && $param{ops} && $param{ops} =~ /^\w+$/)
    {
        map{
            if( $param{$_} )
            {
                $param{$_} = [ $param{$_} ] unless ref $param{$_};
                $param{$_} = sprintf "|%s|", join '|', @{$param{$_}};
            }
            else
            {
                $param{$_} = '';
            }
        }qw( member opser dever );
        MYDatabase->exe( 
            "update project set `NAME`='$param{name}', BELONG='$param{belong}', MEMBER='$param{member}', ALARM='$param{alarm}', `DESC`='$param{desc}',HERMES='$param{hermes}',OPS='$param{ops}',OPSER='$param{opser}',DEVER='$param{dever}' where id=$id" 
        );
    }

    my $resource;
       $resource = MYDatabase->exe( "select `NAME`,`BELONG`,`MEMBER`,`ALARM`,`DESC`,`HERMES`,`OPS`,`OPSER`,`DEVER` from project where id=$id" );

    my $user = MYDatabase->exe( "select zhCN from user" );

    my %selected = map{ $_=> 1}grep{ $_ }split '\|', $resource->[0][2] if $resource && $resource->[0][2];
    my %selected_opser = map{ $_=> 1}grep{ $_ }split '\|', $resource->[0][7] if $resource && $resource->[0][7];
    my %selected_dever = map{ $_=> 1}grep{ $_ }split '\|', $resource->[0][8] if $resource && $resource->[0][8];

    template 'project/editproject_update', +{ 
         id => $id,
         resource => $resource->[0], 
         skip => $skip,  
         users => $user,
         selecteds => \%selected,
         selecteds_opser => \%selected_opser,
         selecteds_dever => \%selected_dever,
    };
};


any '/project/edithermes_update' => sub {
    my %param = %{request->params};
    my $id = $param{id};
    return unless $id && $id =~ /^\d+$/;  
 
    my $skip;
    if( $param{group} && $param{node} && $param{hostid} )
    {
        $param{hostname} ||='';
        $skip = defined MYDatabase->exe( 
            "update resource set `GROUP`='$param{group}', NODE='$param{node}', EXTA='$param{hostid}', EXTB='$param{hostname}' where id=$id" 
        ) ? 1 : 0;
    }

    my $resource;
    if( $param{delete} )
    {
        $skip = defined MYDatabase->exe( "delete from resource where id=$id" ) ? 1: 0;
         $skip = 1;
    }
    else
    {
        $resource = MYDatabase->exe( "select `GROUP`,`NODE`,`EXTA`,`EXTB` from resource where id=$id" );
    }

    template 'project/edithermes_update', +{ 
         id => $id,
         resource => $resource->[0], 
        skip => $skip  
    };
};


any '/project/view' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  

    my $project = MYDatabase->exe( "select * from project where id=$id" );

    my ( %res, %grp, %all );
    my $resource = MYDatabase->exe("select `PROJECTID`,`type`,`group`,count( `group` ) from resource where PROJECTID='$id' group by `group`");
    
    map{
        my( $ASKID, $TYPE, $GROUP, $COUNT ) = @$_;
            $res{$ASKID}{$TYPE}{$GROUP} = $COUNT;
            $grp{$TYPE}{$GROUP} += $COUNT;
            $all{$TYPE} += $COUNT;
    }@$resource;

    template 'project/view', +{ 
        project => $project->[0], 
        resources => +{ res => \%res, grp => \%grp, all => \%all } 
    };
};

true;

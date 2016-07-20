package project::allocateresource;
use Dancer ':syntax';

our $VERSION = '0.1';

use MYDatabase;

use Dancer qw(session debug);
use FindBin qw( $RealBin );
use MIME::Base64;
use Data::Dumper;

any '/project/allocateresource' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  

    if( $param{hermes} && $param{hermes} =~ /^\w+_\w+_\w+_\w+$/  )
    {
        MYDatabase->exe( 
            "update project set `HERMES`='$param{hermes}' where id=$id and `HERMES` is null"
        );
    }


    my $project = MYDatabase->exe( "select * from project where id=$id" );

    my ( %res, %grp, %all );

    template 'project/allocateresource', 
        +{
            project => $project->[0], 
            projectid => $id,
            resources => +{ res => \%res, grp => \%grp, all => \%all }
        };
};

any '/project/allocateresource_host' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  

    my $project = MYDatabase->exe( "select * from project where id=$id" );

    template 'project/allocateresource_host', +{ project => $project->[0] };
};

any '/project/allocateresource_lvs' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  

    my $project = MYDatabase->exe( "select * from project where id=$id" );

    template 'project/allocateresource_lvs', +{ project => $project->[0] };
};

any '/project/allocateresource_domain' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};
    return unless $id && $id =~ /^\d+$/;  

    my $skip;
    $param{rsip} = 'lvs' if $param{checker} && $param{checker} eq 'lvs';
    my @rsip = grep{ $_ } split /\n+/, $param{rsip} if $param{rsip};

    $param{domain_value} =~ s/\s+//g if $param{domain_value};
    if(  $param{domain_type} && $param{domain_value} )
    {
        my @domain_value;
        map{ chomp } @domain_value = `$RealBin/../../tools/range -l '$param{domain_value}'`;

        map{
            MYDatabase->exe( 
               "insert into resource (`projectid`,`type`,`group`,`node`,`exta`) values( '$id', 'dns', 'dns', '$_', '$param{domain_type}' )"
            );
            $skip = 1;
        } sort @domain_value;
    }

    template 'project/allocateresource_domain', +{ projectid => $id, skip => $skip };
};


any '/project/allocateresource_host_dragsort' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};

    map{ return unless $param{$_} }qw( project_id group_name group_host );
    map{ return unless $param{$_} =~ /^\d+$/ }qw( project_id );  
    $param{group_host} =~ s/[\r<>]//g;
    map{ $param{$_} =~ s/ //g }qw( group_name group_host );
    my @host = grep{ $_ } split /\n+/, $param{group_host};

    if( @host == 1 && $host[0] =~ /^[-\w{}~\.&,\/]+$/ )
    {
        map{chomp }@host = `$RealBin/../../tools/range -l '$host[0]'`;
        @host = sort @host;
    
    }

    my $res = MYDatabase->exe(
        sprintf "select `EXTA`,`NODE` from resource where type='host' and PROJECTID=$param{project_id} %s", $param{group_name} ? "and `GROUP`='$param{group_name}'" : ''
    );

    my ( %id, %host, @id );
    map{ $id{$_->[0]} = 1; $host{$_->[1]} = 1; }@$res;

    @host = grep{ !$host{$_} }@host;
    for( 1 .. 10000 )
    {
       last if @id == @host;
       next if $id{$_};
       push @id, $_;
    }


    template 'project/allocateresource_host_dragsort', 
        +{ 
            ids => \@id,
            idsstr => join( '|', @id ),
            hosts => \@host, 
            ask_id => $param{ask_id}, 
            project_id => $param{project_id},
            group_name => $param{group_name}  
         };
};

any '/project/allocateresource_lvs_dragsort' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};

    map{ return unless $param{$_} }qw( project_id group_name group_host );
    map{ return unless $param{$_} =~ /^\d+$/ }qw( project_id );  
    $param{group_host} =~ s/[\r<>]//g;
    map{ $param{$_} =~ s/ //g }qw( group_name group_host );
    my @host = grep{ $_ }split /\n+/, $param{group_host};

    
    template 'project/allocateresource_lvs_dragsort', +{ hosts => \@host, ask_id => $param{ask_id}, project_id => $param{project_id}, group_name => $param{group_name}  };
};


any '/project/allocateresource_host_dragsort_insert' => sub {
    my %param = %{request->params};

    my $id = $param{project_id};

    map{ return unless $param{$_} }qw(  project_id group_name hosts );
    map{ return unless $param{$_} =~ /^\d+$/ }qw( project_id );  
    $param{hosts} =~ s/[\n\r<>]//g;
    my @host = split /\|/, $param{hosts};
    my @id = split /\|/, $param{ids};

    my $i=0;
    map{
        MYDatabase->exe(  "insert into resource (`projectid`,`type`,`group`,`node`,`exta`) values('$param{project_id}','host','$param{group_name}','$_','$id[$i]')" );
        $i++;
    }@host;
    redirect "/project/allocateresource?project_id=$param{project_id}";
};


any '/project/allocateresource_lvs_dragsort_insert' => sub {
    my %param = %{request->params};
    my $id = $param{project_id};

    map{ return unless $param{$_} }qw( project_id group_name hosts );
    map{ return unless $param{$_} =~ /^\d+$/ }qw( project_id );  
    $param{hosts} =~ s/[\n\r<>]//g;
    my @host = split /\|/, $param{hosts};

    $param{group_name} = "lvs_$param{group_name}" unless $param{group_name} =~ /^lvs_/;

    map{
        MYDatabase->exe( "insert into resource (`projectid`,`type`,`group`,`node`,`exta`) values('$param{project_id}','lvs','$param{group_name}','$_','lvs')" );
    }@host;

    redirect "/project/allocateresource?project_id=$param{project_id}";
};


true;

package Dump;

use strict;
use warnings;

use POSIX;
use YAML::XS;
use Digest::MD5;
use NS::Util::DBConn;
use NS::Hermes::DBI::Cache;

sub new
{
    my ( $class, %self ) = @_;

    map{ die "$_ undef" unless $self{$_} }qw( conn data load );
    map{ $self{$_} = 0 }qw( md5 inx );

    mkdir $self{data} unless -d $self{data};

    bless \%self, ref $class || $class;
}

sub run
{
    my $this = shift;

    my ( $data, $prev, $midd, $root ) = @$this{ qw( data prev midd root ) };
    my $cache = $this->_load();

    my $curr = Digest::MD5->new->add( YAML::XS::Dump( $cache ) )->hexdigest;
    
    $this->{inx} = $curr eq $this->{md5} ? $this->{inx} + 1 : 0;
    $this->{md5} = $curr;
    warn "md5: $curr inx:( $this->{inx} )\n";

    $this->_dump( $cache ) if $this->{inx} == 2;

    return $this;
}

sub _load
{
    my ( $this, %r ) = shift;

    my ( $conn, $load ) = @$this{ qw( conn load ) };
    my $c =  NS::Util::DBConn->new( $conn );
    my $r = [ map{@$_}map{ $c->exe( $_ ) } ref $load ? @$load : ( $load ) ];

    map{ $r{$_->[0]}{$_->[1]}{$_->[2]} = $_->[3] }@$r;

    return \%r;
}

sub _dump
{
    my ( $this, $cache ) = @_;

    my $time = POSIX::strftime( "%Y.%m.%d_%H:%M:%S", localtime );
    my $cdb = NS::Hermes::DBI::Cache->new(
        "$this->{data}/$time",
        $NS::Hermes::DBI::Cache::TABLE 
    );
    for my $name ( keys %$cache )
    {
        for my $attr ( keys %{$cache->{$name}} )
        {
            while( my ( $k, $v ) = each %{$cache->{$name}{$attr}} )
            {
                $cdb->insert( $name, $attr, $k, $v ) ;
            }
        }
    }
    system "ln -fsn '$time' '$this->{data}/curr'";
}

1;

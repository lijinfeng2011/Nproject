package MYDatabase;

use strict;
use warnings;
use utf8;

use Dancer qw(session debug error );
use Dancer::Plugin::Database;

sub exe
{
    shift;
    return unless my $sql = shift;

    utf8::encode($sql);

    my $result = [];
    eval
    {
        my $sth = database->prepare( $sql );
        $sth->execute();
        $result = $sth->fetchall_arrayref if $sql =~ m/^\s*(select|show)/i;
    };

    if( $@ ) { error $@; return undef; }

    return $result;
}

1;

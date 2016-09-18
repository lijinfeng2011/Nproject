package data;
use Dancer ':syntax';
our $VERSION = '0.1';

use JSON;
set serializer => 'JSON';
use FindBin qw( $RealBin );

my %md5 = ( 'time' => time );
our $path = "$RealBin/../data/curr";

get '/mon' => sub { return 'ok'; };

get '/cache/data_md5' => sub {
    my  $time = time;

    if( $md5{time} + 3 < time || ! $md5{data} )
    {
        my $md5 = `md5sum $path`;
        if( $md5 && $md5 =~ /^([a-z0-9]{32})\s+$path/ )
        {
            %md5 = ( time => $time, data => $1 );
        }
        else { $md5{data} = undef; }

    }

    return $md5{data}
        ? +{ stat => $JSON::true,  data => $md5{data} }
        : +{ stat => $JSON::false, info => 'error' };
};

true;


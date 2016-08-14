package NSSO;
use Dancer ':syntax';

use Data::Dumper;
use LWP::UserAgent;
use JSON qw( decode_json );
use Dancer qw(cookie debug);
use Sign;

our $VERSION = '0.1';

hook 'before' => sub {
    redirect '/login' if ! session('user') && request->path_info !~ m{^/login};
};

get '/login' => sub{
    my $sid = params->{sid};

    return redirect config->{sso}{'ref'}.config->{'loggin_addr'} unless $sid;

    my ( $ua, $re, $info ) = LWP::UserAgent->new( ssl_opts => { verify_hostname => 0 });
    $ua->timeout( 6 ); 

    $re = $ua->get( config->{sso}{'sid'}.$sid ); 

    eval{ $info = decode_json $re->decoded_content };

    return redirect config->{sso}{'ref'}.config->{'loggin_addr'} 
        unless $re && $re->is_success && $info && $info->{user};
    
    session user => $info->{user};
    Sign::login( $info->{user}, request );

    redirect "/";
};

any ['get', 'post'] => '/logout' => sub {
    Sign::logout( session( 'user' ), request );
    session->destroy;
    redirect '/';
};

true;

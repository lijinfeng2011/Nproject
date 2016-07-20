package Auth;
use Dancer ':syntax';

use Data::Dumper;
use LWP::UserAgent;
use JSON qw( decode_json );

use Dancer qw(cookie debug);
use MYDatabase;

our $VERSION = '0.1';

use base qw( NSSO );

sub login
{
    my ( $user, $request ) = @_;
print Dumper $user;
}

sub logout
{
    my ( $user, $request ) = @_;
print Dumper $user;
}


#hook 'before' => sub {
#    redirect '/login' if ! session('user') && request->path_info !~ m{^/login};
#};
#
#get '/login' => sub{
#    my $sid = params->{sid};
#
#    return redirect config->{sso}{'ref'}.config->{'loggin_addr'} unless $sid;
#
#    my ( $ua, $re, $info ) = LWP::UserAgent->new( ssl_opts => { verify_hostname => 0 });
#    $ua->timeout( 6 ); 
#
#    $re = $ua->get( config->{sso}{'sid'}.$sid ); 
#
#    eval{ $info = decode_json $re->decoded_content };
#
#    return redirect config->{sso}{'ref'}.config->{'loggin_addr'} 
#        unless $re && $re->is_success && $info && $info->{user};
#
#    
#    session user => $info->{user};
#
##    my $user = MYDatabase->exe( "select role from user where name='$info->{user}'" );
##
##    if( $user && defined $user->[0][0] )
##    {
##        session role => $user->[0][0];
##    }
##    else
##    {
##        my $u = $info->{user};
##        $u =~ s/@.+$//;
##        MYDatabase->exe( "insert into user values ( '$info->{user}','$u','0','0','0' )" );
##        session role => $user->[0][0];
##    }
#
#    redirect "/";
#};
#
#any ['get', 'post'] => '/logout' => sub {
#    session->destroy;
#    redirect '/';
#};
#
#true;

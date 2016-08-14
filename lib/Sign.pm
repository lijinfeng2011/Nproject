package Sign;
use MYDB;
use Dancer qw(session);

sub login
{
    my ( $user, $request ) = @_;
    my $role = MYDB->exe( "select role from user where name='$user'" );

    if( $role && defined $role->[0][0] )
    {
        session role => $role->[0][0];
    }
    else
    {
        my $u = $user;
        $u =~ s/@.+$//;
        MYDB->exe( "insert into user values ( '$user','$u','0','0','0' )" );
        session role => 0;
    }
}

sub logout
{
    my ( $user, $request ) = @_;
}

1;

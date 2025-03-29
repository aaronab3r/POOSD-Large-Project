const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.createToken = function ( fn, ln, id)
{
    return _createToken( fn, ln, id );
}

_createToken = function ( fn, ln, id )
{
    var ret;

    try
    {
        const expiration = new Date();
        const user = {userId:id, firstName:fn, lastName:ln};

        const accessToken = jwt.sign( user, process.env.ACCESS_TOKEN_SECRET );

        // In order to exoire with a value other than the default, use the
            // following
        /*
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30m'} );
                                                                                            '24h'
                                                                                            '365d'
        */

        ret = {accessToken:accessToken};
    }
    catch(e)
    {
        ret = {error:e.message};
    }

    return ret;
}

exports.isExpired = function ( token )
{
    try {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        return false; // Token is valid if no error is thrown
    } catch (err) {
        // Token is invalid (expired, wrong signature, etc.)
        return true;
    }
}

exports.refresh = function refresh( token )
{
    try {
        var ud = jwt.decode(token, { complete: true });

        // Check if ud and ud.payload exist before accessing properties
        if (ud && ud.payload) {
            var userId = ud.payload.id;
            var firstName = ud.payload.fn;
            var lastName = ud.payload.ln;

            return _createToken(firstName, lastName, userId);
        } else {
            // Handle the case where the token is invalid or cannot be decoded
            console.error("Invalid or malformed token:", token);
            return { error: "Invalid token" }; // Or throw an error
        }
    } catch (error) {
        console.error("Error decoding token:", error);
        return { error: "Error decoding token" }; // Or throw an error
    }
}
export function storeToken( tok: string )
{
    try
    {
        localStorage.setItem('token_data', tok);
    }
    catch(e: any)
    {
        console.log(e.message);
    }
}

export function retrieveToken()
{
    var ud;
    try
    {
        ud = localStorage.getItem('token_data');
    }
    catch(e: any)
    {
        console.log(e.message);
    }
    return ud;
}
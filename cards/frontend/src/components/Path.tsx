const app_name = 'cop4331-1'
export function buildPath(route: string): string
{
    if (process.env.NODE_ENV !== 'development')
    {
        return 'http://' + app_name + '.online/' + route
    } 
    else
    {
        return 'http://localhost:5001/' + route
    }
}
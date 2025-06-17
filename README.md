# cf-b64
this is a simple online base64 generator, this would basically convert any external link you add to the end of the url into base64, to use this you can change the secret value from the 
```
env.secret
```
by going to the cf's `home > worker & pages > settings > Variables and Secrets` then add new value called `secret` with its value... 

## shared setup
for simple implementation you can create md5 or sha256 of a password then put it ther... 

## personal setup
or if you want to use this personally you can use this
```bash
openssl rand -base64 <enter_length>
# example:
openssl rand -base64 48
```
now just save this key somewhere incase you need to access the site just add it to you cookie and now you can access the online base64 

## public setup
and if you want to deploy if for public you can just comment out the auth, like so:
```js
    ...
    const auth = authenticate(request,env)
    if(!auth.isAuthenticated){
      return new Response(auth.reason)
    }
    ...
    // from ↑ to ↓
    ...
    const auth = authenticate(request,env)
    //if(!auth.isAuthenticated){
    //  return new Response(auth.reason)
    //}
    ...
```


### usage
to use the project all you need to do is create an http request to
```bash
curl -b "<cookie_key>=<secret>" "https://<project.url>/<command>?url=<external_url>"
```
for example:
``` bash
curl -b "session_id=123secure" "https://custom.domain/encode?url=https://example.com"
# or
curl -b "session_id=123secure" "https://custom.domain/decode?url=https://example.com"
```
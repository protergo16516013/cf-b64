/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
const cookie_key="session_id"

export default {
  async fetch(request, env, ctx) {

    const auth = authenticate(request,env)
    if(!auth.isAuthenticated){
      return new Response(auth.reason)
    }

    const validPath = ["/encode", "/decode"]
    const url = new URL(request.url)
    const path = url.pathname
    
    if(validPath.includes(path)){
      var result = ""
      
      if(path === "/encode"){
        result = await b64Handler("encode", url)
      }else if(path === "/decode"){
        result = await b64Handler("decode", url)
      }
      return new Response(result)
    } else {
      return new Response(auth.reason)
    }
  },
};



// logic --------------------------------
async function b64Handler(type, url){
  const res = await getExternalData(url)
  if(res.isError){
    return res.message
  }

  var processed = ""
  if(type === "encode"){
    processed = btoa(res.message)
  }else if(type === "decode"){
    processed = atob(res.message)
  }
  return processed
}
async function getExternalData(url){
  const searchParams = url.searchParams
  const externalURL = searchParams.get("url")
  const res = {
    "isError": false,
    "message":""
  }

  if(!externalURL){
    res.isError = true
    res.message = getMessage("help")
  }else{
    try{
      res.message = await fetch(externalURL)
      .then(res => res.text())
    }catch(err){
      res.isError = true
      res.message = [err.message, getMessage("help")].join("\n\n")
      console.warn(err)
    }
  }

  return res 
}






// authentication -----------------------
function parseCookie(rawCookies){
  var ret = {}
  var cookies = rawCookies.split(";")
  cookies.forEach(entry => {
    const [key, value] = entry.split("=")
    ret[key] = value
  });
  return ret
}

function authenticate(request, env){
  var isAuthenticated = false
  var reason = ""

  var secret = env.secret
  var hasCookie = request.headers.has("Cookie")
  if(!hasCookie){
    reason = "please authenticate your session!"
    return {isAuthenticated, reason}
  }

  var rawCookies = request.headers.get("Cookie")
  var cookies = parseCookie(rawCookies)

  if( !(Object.keys(cookies).includes(cookie_key) && secret === cookies[cookie_key]) ){
    reason = "invalid session!"
  }

  if(secret === cookies[cookie_key]){
    isAuthenticated = true
    reason = "session authenticated! proceed to /decode or /encode"
  }
  return {isAuthenticated, reason}
}



// messages -----------------------------
function getMessage(key){
  const messages = {
    "help":[
      "error: something went wrong!",
      "usage: ",
      "  /encode?url=<external_url>",
      "    or",
      "  /decode?url=<external_url>",
      "example: ",
      "  /encode?url=https://example.com",
      "",
      "description:",
      "these endpoint will return you the base64 encoded and decoded" ,
      "string of the entered <external_url>",
    ],
  }

  if(!Object.keys(messages).includes(key)){
    throw new Error(`${key} is not a valid message key`)
  }

  const message = messages[key].join("\n")
  return message
}
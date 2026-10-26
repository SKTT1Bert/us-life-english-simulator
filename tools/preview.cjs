// Loopback-only static preview, including WASM/modules and audio range requests.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),port=Number(process.env.PORT||8174);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.wasm':'application/wasm','.mp3':'audio/mpeg','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,`.${name==='/'?'/index.html':name}`);
  if(!file.startsWith(root+path.sep)||file.split(path.sep).some(part=>part.startsWith('.'))){res.writeHead(403).end();return;}
  const stat=fs.statSync(file);if(!stat.isFile()){res.writeHead(404).end();return;}
  let start=0,end=stat.size-1,status=200;
  if(req.headers.range){const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;if(start>end){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return;}status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${stat.size}`);}
  res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Content-Length':stat.size?end-start+1:0,'Accept-Ranges':'bytes','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'||!stat.size)res.end();else fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 }catch{res.writeHead(404).end();}
}).listen(port,'127.0.0.1',()=>console.log(`Daily English preview: http://127.0.0.1:${port}/`));

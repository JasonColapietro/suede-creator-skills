// Auto-managed by suede-graph-flo-xr. Applies a validated patch bundle to the run worktree.
// The clamp verifier cannot parse commands carrying multi-kilobyte inline payloads,
// so large patches are staged in bounded base64 chunks and applied from the file.
// Modes (the splice keeps the node -e argv convention: argv[1] is the first arg):
//   <worktree> <base64>                        legacy one-shot: decode and git-apply
//   <worktree> --start <tempRoot>              truncate the staging file
//   <worktree> --append <tempRoot> <offset> <fnv1a8> <b64chunk>  verified chunk append
//   <worktree> --apply <tempRoot> <totalLen> <fnv1a8>  verify, decode, check, apply, remove
process.argv.splice(1,1);
const {execFileSync}=require("node:child_process");
const fs=require("node:fs"),path=require("node:path");
const fail=m=>{process.stderr.write(String(m)+"\n");process.exit(1)};
const root=process.argv[1];
if(!root)fail("worktree path required");
let rootReal;try{rootReal=fs.realpathSync(root)}catch{fail("worktree does not exist")}
if(!fs.statSync(rootReal).isDirectory())fail("worktree is not a directory");
const applyPatch=patch=>{const run=extra=>{try{return {stdout:execFileSync("git",["-C",rootReal,"apply",...extra,"--whitespace=nowarn","-"],{input:patch,encoding:"utf8",stdio:["pipe","pipe","inherit"]}),stderr:"",status:0,error:null}}catch(error){return {stdout:error.stdout||"",stderr:error.stderr||"",status:Number.isInteger(error.status)?error.status:1,error}}};const checked=run(["--check"]);if(checked.error||checked.status!==0){process.stderr.write(checked.stderr||String(checked.error||"git apply --check failed"));process.exit(checked.status||1)}const applied=run([]);process.stdout.write(applied.stdout||"");process.stderr.write(applied.stderr||String(applied.error||""));process.exit(applied.error||applied.status!==0?applied.status||1:0)};
const mode=process.argv[2];
if(mode!=="--start"&&mode!=="--append"&&mode!=="--apply"){
  if(!mode)fail("payload or mode required");
  applyPatch(Buffer.from(mode,"base64"));
}
const tempRoot=process.argv[3];
if(!tempRoot)fail("temp root required");
let tempReal;try{tempReal=fs.realpathSync(tempRoot)}catch{fail("temp root does not exist")}
if(!tempReal.startsWith("/private/tmp/ship-")&&!tempReal.startsWith("/tmp/ship-"))fail("temp root is not a suede-graph-flo-xr private temp root");
if(!fs.statSync(tempReal).isDirectory())fail("temp root is not a directory");
const staging=path.join(tempReal,"apply-patch.b64");
if(mode==="--start"){fs.writeFileSync(staging,"");process.stdout.write("staging reset\n");process.exit(0)}
const fnv1a=text=>{let hash=0x811c9dc5;for(let i=0;i<text.length;i+=1){hash^=text.charCodeAt(i);hash=Math.imul(hash,0x01000193)}return (hash>>>0).toString(16).padStart(8,"0")};
if(mode==="--append"){const offset=Number(process.argv[4]);const expectHash=process.argv[5];const chunk=process.argv[6];if(!Number.isInteger(offset)||offset<0)fail("append offset must be a non-negative integer");if(typeof chunk!=="string"||!chunk||/[^A-Za-z0-9+/=]/.test(chunk))fail("append chunk must be non-empty base64 text");const current=fs.existsSync(staging)?fs.statSync(staging).size:0;if(current!==offset)fail("append offset mismatch: staging has "+current+" chars but this chunk expects offset "+offset+". Re-run the failed append command exactly as given.");const actualHash=fnv1a(chunk);if(expectHash!==actualHash)fail("append chunk checksum mismatch (expected "+expectHash+", got "+actualHash+" for "+chunk.length+" chars): the chunk was mistyped in transit. Re-run this exact append command again, copying the chunk precisely.");fs.appendFileSync(staging,chunk);process.stdout.write("appended "+chunk.length+" at "+offset+"\n");process.exit(0)}
if(!fs.existsSync(staging))fail("no staged patch");
const payload=fs.readFileSync(staging,"utf8");
const expectLength=Number(process.argv[4]);const expectPayloadHash=process.argv[5];
if(Number.isInteger(expectLength)&&payload.length!==expectLength){fail("staged payload is "+payload.length+" chars but "+expectLength+" were expected: one or more append chunks were dropped or truncated. Run --start again and replay every append command exactly as given.")}
if(expectPayloadHash&&fnv1a(payload)!==expectPayloadHash){fail("staged payload checksum mismatch: a chunk was mistyped in transit. Run --start again and replay every append command exactly as given.")}
fs.rmSync(staging,{force:true});
if(!payload)fail("staged patch is empty");
applyPatch(Buffer.from(payload,"base64"));

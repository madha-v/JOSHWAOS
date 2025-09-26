const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

const USERS_FILE = path.join(__dirname, 'storage', 'users.json');
const PROJECTS_FILE = path.join(__dirname, 'storage', 'projects.json');

if(!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));
if(!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, JSON.stringify({}));

app.use(cors());
app.use(bodyParser.json());

async function readJson(file){ return JSON.parse(await fs.promises.readFile(file,'utf8')); }
async function writeJson(file, obj){ await fs.promises.writeFile(file, JSON.stringify(obj, null, 2)); }

// Ensure demo user exists
(async ()=>{
  try{
    const users = await readJson(USERS_FILE);
    if(!users['admin']){
      const hash = await bcrypt.hash('admin123', 10);
      users['admin'] = { passwordHash: hash, createdAt: Date.now() };
      await writeJson(USERS_FILE, users);
      console.log('Demo user created: admin / admin123');
    } else {
      console.log('Demo user exists');
    }
  } catch(e){
    console.error('Error ensuring demo user', e);
  }
})();

function authMiddleware(req, res, next){
  const h = req.headers.authorization || '';
  const parts = h.split(' ');
  if(parts.length === 2 && parts[0] === 'Bearer'){
    try{
      const payload = jwt.verify(parts[1], JWT_SECRET);
      req.user = payload; return next();
    } catch(e){ return res.status(401).json({ error:'Invalid token' }); }
  }
  return res.status(401).json({ error:'Unauthorized' });
}

// Auth
app.post('/api/register', async (req, res) => {
  try{
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({ error:'username and password required' });
    const users = await readJson(USERS_FILE);
    if(users[username]) return res.status(400).json({ error:'User exists' });
    const hash = await bcrypt.hash(password, 10);
    users[username] = { passwordHash: hash, createdAt: Date.now() };
    await writeJson(USERS_FILE, users);
    return res.json({ ok:true });
  } catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});

app.post('/api/login', async (req, res) => {
  try{
    const { username, password } = req.body;
    if(!username || !password) return res.status(400).json({ error:'username and password required' });
    const users = await readJson(USERS_FILE);
    const u = users[username];
    if(!u) return res.status(400).json({ error:'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if(!ok) return res.status(400).json({ error:'Invalid credentials' });
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn:'8h' });
    return res.json({ token, username });
  } catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});

// Projects
app.post('/api/saveProject', authMiddleware, async (req, res) => {
  try{
    const { name, project } = req.body;
    if(!name || !project) return res.status(400).json({ error:'Missing name or project' });
    const projects = await readJson(PROJECTS_FILE);
    if(!projects[req.user.username]) projects[req.user.username] = {};
    projects[req.user.username][name] = { project, savedAt: Date.now() };
    await writeJson(PROJECTS_FILE, projects);
    return res.json({ ok:true });
  } catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});

app.get('/api/listProjects', authMiddleware, async (req, res) => {
  const projects = await readJson(PROJECTS_FILE);
  const mine = projects[req.user.username] || {};
  return res.json({ projects: Object.keys(mine).map(k=> ({ name:k, savedAt: mine[k].savedAt })) });
});

app.get('/api/loadProject', authMiddleware, async (req, res) => {
  const name = req.query.name;
  if(!name) return res.status(400).json({ error:'Missing name' });
  const projects = await readJson(PROJECTS_FILE);
  const mine = projects[req.user.username] || {};
  if(!mine[name]) return res.status(404).json({ error:'Not found' });
  return res.json({ project: mine[name].project });
});

// Scheduling algorithms (FCFS, SJF pre/non, Priority pre/non, RR)
function fcfs(arr){ let t=0,out=[]; arr.sort((a,b)=>a.arrival-b.arrival||a.pid.localeCompare(b.pid)); for(const p of arr){ t=Math.max(t,p.arrival); out.push({pid:p.pid,start:t,end:t+p.burst}); t+=p.burst; } return out; }

function sjfNonPreemptive(arr){ let t=0,out=[]; const q=arr.slice(); while(q.length){ const available=q.filter(x=>x.arrival<=t); if(available.length===0){ t=q[0].arrival; continue; } available.sort((a,b)=>a.burst-b.burst||a.arrival-b.arrival); const p=available[0]; out.push({pid:p.pid,start:t,end:t+p.burst}); t+=p.burst; const idx=q.findIndex(x=>x.pid===p.pid&&x.arrival===p.arrival); q.splice(idx,1);} return out; }

function sjfPreemptive(arr){ let t=0,out=[]; const rem={}; arr.forEach(p=>rem[p.pid]={...p,remaining:p.burst}); const arrivals=arr.slice().sort((a,b)=>a.arrival-b.arrival); let ai=0; const ready=[]; function push(){ while(ai<arrivals.length&&arrivals[ai].arrival<=t){ready.push(arrivals[ai].pid); ai++;}} push(); if(ready.length===0&&ai<arrivals.length){t=arrivals[ai].arrival; push();} let current=null; while(true){ push(); const cand=ready.filter(pid=>rem[pid].remaining>0); if(cand.length===0){ if(ai>=arrivals.length) break; t=arrivals[ai].arrival; push(); continue;} cand.sort((a,b)=>rem[a].remaining-rem[b].remaining||a.localeCompare(b)); const pid=cand[0]; if(current&&current.pid===pid){} else current={pid,start:t}; rem[pid].remaining-=1; t+=1; push(); if(rem[pid].remaining===0){ current.end=t; out.push(current); const idx=ready.indexOf(pid); if(idx>=0) ready.splice(idx,1); current=null; } else { const cand2=ready.filter(p=>rem[p].remaining>0); cand2.sort((a,b)=>rem[a].remaining-rem[b].remaining||a.localeCompare(b)); if(cand2[0]!==pid){ current.end=t; out.push(current); current=null; } } } return out; }

function priorityNonPreemptive(arr){ let t=0,out=[]; const q=arr.slice(); while(q.length){ const available=q.filter(x=>x.arrival<=t); if(available.length===0){ t=q[0].arrival; continue; } available.sort((a,b)=>a.priority-b.priority||a.arrival-b.arrival); const p=available[0]; out.push({pid:p.pid,start:t,end:t+p.burst}); t+=p.burst; const idx=q.findIndex(x=>x.pid===p.pid&&x.arrival===p.arrival); q.splice(idx,1);} return out; }

function priorityPreemptive(arr){ let t=0,out=[]; const rem={}; arr.forEach(p=>rem[p.pid]={...p,remaining:p.burst}); const arrivals=arr.slice().sort((a,b)=>a.arrival-b.arrival); let ai=0; const ready=[]; function push(){ while(ai<arrivals.length&&arrivals[ai].arrival<=t){ready.push(arrivals[ai].pid); ai++;}} push(); if(ready.length===0&&ai<arrivals.length){t=arrivals[ai].arrival; push();} let current=null; while(true){ push(); const cand=ready.filter(pid=>rem[pid].remaining>0); if(cand.length===0){ if(ai>=arrivals.length) break; t=arrivals[ai].arrival; push(); continue;} cand.sort((a,b)=>rem[a].priority-rem[b].priority||rem[a].remaining-rem[b].remaining||a.localeCompare(b)); const pid=cand[0]; if(current&&current.pid===pid){} else current={pid,start:t}; rem[pid].remaining-=1; t+=1; push(); if(rem[pid].remaining===0){ current.end=t; out.push(current); const idx=ready.indexOf(pid); if(idx>=0) ready.splice(idx,1); current=null; } else { const cand2=ready.filter(p=>rem[p].remaining>0); cand2.sort((a,b)=>rem[a].priority-rem[b].priority||rem[a].remaining-rem[b].remaining||a.localeCompare(b)); if(cand2[0]!==pid){ current.end=t; out.push(current); current=null; } } } return out; }

function roundRobin(arr, quantum){ let t=0,out=[]; const rem={}; arr.forEach(p=>rem[p.pid]={...p}); const arrivals=arr.slice().sort((a,b)=>a.arrival-b.arrival); let ai=0; const q=[]; function enqueue(){ while(ai<arrivals.length&&arrivals[ai].arrival<=t){q.push(arrivals[ai].pid); ai++;}} enqueue(); if(q.length===0&&ai<arrivals.length){t=arrivals[ai].arrival; enqueue();} while(q.length){ const pid=q.shift(); const p=rem[pid]; const exec=Math.min(Math.max(1,Number(quantum||1)), p.burst); out.push({pid,start:t,end:t+exec}); p.burst-=exec; t+=exec; enqueue(); if(p.burst>0) q.push(pid); } return out; }

app.post('/api/schedule', async (req, res) => {
  try{
    const { processes, algorithm, quantum } = req.body;
    if(!processes || !Array.isArray(processes)) return res.status(400).json({ error:'Invalid processes' });
    const arr = processes.map(p=>({ pid:String(p.pid), arrival: Number(p.arrival), burst: Number(p.burst), priority: Number(p.priority||0) }));
    let schedule = [];
    if(algorithm === 'fcfs') schedule = fcfs(arr);
    else if(algorithm === 'sjf') schedule = sjfNonPreemptive(arr);
    else if(algorithm === 'sjf-preemptive') schedule = sjfPreemptive(arr);
    else if(algorithm === 'priority') schedule = priorityNonPreemptive(arr);
    else if(algorithm === 'priority-preemptive') schedule = priorityPreemptive(arr);
    else if(algorithm === 'rr') schedule = roundRobin(arr, Math.max(1, Number(quantum||1)));
    else schedule = fcfs(arr);
    return res.json({ schedule, algorithm });
  } catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});

app.listen(PORT, ()=> console.log('Backend listening on http://localhost:' + PORT));

const scroller=document.getElementById('scroller');
const scenes=[...document.querySelectorAll('.scene')];
const current=document.getElementById('current');
const cursor=document.querySelector('.cursor');

let locked=false;

const observer=new IntersectionObserver(entries=>{
 entries.forEach(entry=>{
  if(entry.isIntersecting){
   entry.target.classList.add('active');
   current.textContent=String(scenes.indexOf(entry.target)+1).padStart(2,'0');
  }
 });
},{root:scroller,threshold:.55});
scenes.forEach(s=>observer.observe(s));

scroller.addEventListener('wheel',e=>{
 if(locked || Math.abs(e.deltaY)<8) return;
 const index=scenes.findIndex(s=>s.getBoundingClientRect().top>=-100 && s.getBoundingClientRect().top<scroller.clientHeight*.6);
 let next=index+(e.deltaY>0?1:-1);
 next=Math.max(0,Math.min(scenes.length-1,next));
 if(next!==index){
  e.preventDefault(); locked=true;
  scenes[next].scrollIntoView({behavior:'smooth'});
  setTimeout(()=>locked=false,900);
 }
},{passive:false});

document.addEventListener('keydown',e=>{
 if(['ArrowDown','PageDown','ArrowUp','PageUp',' '].includes(e.key)){
  e.preventDefault();
  const active=Math.max(0,scenes.findIndex(s=>s.classList.contains('active')));
  const dir=(e.key==='ArrowUp'||e.key==='PageUp')?-1:1;
  const next=Math.max(0,Math.min(scenes.length-1,active+dir));
  scenes[next].scrollIntoView({behavior:'smooth'});
 }
});

document.addEventListener('mousemove',e=>{
 document.documentElement.style.setProperty('--mx',e.clientX+'px');
 document.documentElement.style.setProperty('--my',e.clientY+'px');
 cursor.style.left=e.clientX+'px'; cursor.style.top=e.clientY+'px';
});
document.querySelectorAll('a,.work-card').forEach(el=>{
 el.addEventListener('mouseenter',()=>cursor.classList.add('view'));
 el.addEventListener('mouseleave',()=>cursor.classList.remove('view'));
});
scenes[0].classList.add('active');

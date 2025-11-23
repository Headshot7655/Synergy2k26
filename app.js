function loadCareers(){return JSON.parse(localStorage.getItem('careers')||'[]');}
function saveCareers(x){localStorage.setItem('careers',JSON.stringify(x));}
const form=document.getElementById('career-form');const list=document.getElementById('career-list');
const details=document.getElementById('career-details');const title=document.getElementById('career-title');
form.addEventListener('submit',e=>{e.preventDefault();let n=document.getElementById('career-name').value;
let c=loadCareers();if(!c.find(x=>x.name===n)){c.push({name:n,stats:{p:0,a:0,r:0},badges:{}});saveCareers(c);}refresh();});
function refresh(){let c=loadCareers();list.innerHTML='';c.forEach(x=>{let o=document.createElement('option');o.value=x.name;o.textContent=x.name;list.appendChild(o);});}
list.addEventListener('change',()=>{let c=loadCareers().find(x=>x.name===list.value);if(c){details.classList.remove('hidden');title.textContent=c.name;}});refresh();
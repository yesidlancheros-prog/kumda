/* js/auth.js - maneja registro, login, admin, sedes y clases
   - usa localStorage keys: 'kumba_users', 'kumba_current', 'kumba_classes'
*/

// ------- Datos iniciales (solo la primera vez) -------
(function initDefaults(){
  if(!localStorage.getItem('kumba_users')){
    const sample = [
      {user:'usuario1@kumba.com', pass:'1234', name:'Juan Pérez'},
      {user:'usuario2@kumba.com', pass:'2222', name:'Carla López'}
    ];
    localStorage.setItem('kumba_users', JSON.stringify(sample));
  }
  if(!localStorage.getItem('kumba_classes')){
    localStorage.setItem('kumba_classes', JSON.stringify([]));
  }
})();

// ------- Helpers -------
function getUsers(){ return JSON.parse(localStorage.getItem('kumba_users')||'[]'); }
function saveUsers(u){ localStorage.setItem('kumba_users', JSON.stringify(u)); }
function getCurrent(){ return JSON.parse(localStorage.getItem('kumba_current')||'null'); }
function setCurrent(u){ localStorage.setItem('kumba_current', JSON.stringify(u)); }
function clearCurrent(){ localStorage.removeItem('kumba_current'); }
function getClasses(){ return JSON.parse(localStorage.getItem('kumba_classes')||'[]'); }
function saveClasses(c){ localStorage.setItem('kumba_classes', JSON.stringify(c)); }

// ------- DOM ready -------
document.addEventListener('DOMContentLoaded', ()=> {
  // --- Setup for index/login page ---
  const btnLogin = document.getElementById('btnLogin');
  const email = document.getElementById('email');
  const pass = document.getElementById('pass');

  if(btnLogin){
    btnLogin.addEventListener('click', ()=>{
      const u = (email.value||'').trim();
      const p = (pass.value||'').trim();
      if(!u || !p){ alert('Ingresa correo y contraseña'); return; }
      const users = getUsers();
      const found = users.find(x=> x.user===u && x.pass===p);
      if(found){
        setCurrent({user:found.user, name:found.name, role: found.user==='yesidlan' ? 'admin' : 'user'});
        // redirect user
        window.location.href = 'usuario.html';
      } else {
        alert('Credenciales incorrectas');
      }
    });
  }

  // Admin modal trigger (doble clic sobre zona con id adminTrigger)
  const adminTrigger = document.getElementById('adminTrigger');
  const adminModal = document.getElementById('adminModal');
  const overlay = document.getElementById('overlay');
  const closeAdmin = document.getElementById('closeAdmin');
  const btnAdminLogin = document.getElementById('btnAdminLogin');

  if(adminTrigger){
    adminTrigger.addEventListener('dblclick', ()=>{
      overlay.classList.remove('hidden');
      adminModal.classList.remove('hidden');
    });
  }
  if(closeAdmin){
    closeAdmin.addEventListener('click', ()=>{
      overlay.classList.add('hidden');
      adminModal.classList.add('hidden');
    });
  }
  if(overlay){
    overlay.addEventListener('click', ()=>{
      overlay.classList.add('hidden');
      adminModal.classList.add('hidden');
    });
  }
  if(btnAdminLogin){
    btnAdminLogin.addEventListener('click', ()=>{
      const au = document.getElementById('adminUser').value.trim();
      const ap = document.getElementById('adminPass').value.trim();
      // Credencial admin por defecto:
      if(au==='yesidlan' && ap==='lancheros'){
        setCurrent({user:au, role:'admin', name:'Administrador'});
        overlay.classList.add('hidden');
        adminModal.classList.add('hidden');
        window.location.href = 'admin.html';
      } else {
        alert('Credenciales admin incorrectas');
      }
    });
  }

  // --- Setup registro page ---
  const btnRegister = document.getElementById('btnRegister');
  if(btnRegister){
    btnRegister.addEventListener('click', ()=>{
      const name = (document.getElementById('rname').value||'').trim();
      const user = (document.getElementById('remail').value||'').trim();
      const passw = (document.getElementById('rpass').value||'').trim();
      const msg = document.getElementById('regMsg');

      if(!name||!user||!passw){ msg.textContent='Completa todos los campos'; return; }
      const users = getUsers();
      if(users.find(x=>x.user===user)){ msg.textContent='Usuario ya existe'; return; }
      users.push({user:user, pass:passw, name:name});
      saveUsers(users);
      msg.style.color='green';
      msg.textContent='Cuenta creada ✅. Ahora puedes iniciar sesión.';
      setTimeout(()=> window.location.href = 'index.html', 1200);
    });
  }

  // --- Setup usuario page (sedes) ---
  const sedesContainer = document.getElementById('sedes');
  if(sedesContainer){
    const sedes = [
      {id:'Chapinero', name:'Sede Chapinero', address:'Calle 64 #9-30', img:'img/chapinero.jpg'},
      {id:'Cedritos', name:'Sede Cedritos', address:'Carrera 15 #120-20', img:'img/centro.jpg'},
      {id:'Suba', name:'Sede Suba', address:'Avenida Suba #98-50', img:'img/suba.jpg'},
    ];
    sedesContainer.innerHTML = '';
    sedes.forEach(s=>{
      const el = document.createElement('div');
      el.className='sede-card card';
      el.innerHTML = `<h3>${s.name}</h3><p>${s.address}</p><div class="row"><button class="btn" data-id="${s.id}">Ver más</button></div>`;
      sedesContainer.appendChild(el);
    });

    // evento ver mas
    sedesContainer.addEventListener('click', e=>{
      const b = e.target.closest('button');
      if(!b) return;
      const id = b.getAttribute('data-id');
      openSedeModal(id);
    });
  }

  // sede modal handlers
  const sedeModal = document.getElementById('sedeModal');
  const sedeOverlay = document.getElementById('sedeOverlay');
  const closeSede = document.getElementById('closeSede');
  if(closeSede) closeSede.addEventListener('click', ()=>{ sedeModal.classList.add('hidden'); sedeOverlay.classList.add('hidden'); document.getElementById('sedeContent').innerHTML=''; });
  if(sedeOverlay) sedeOverlay.addEventListener('click', ()=>{ sedeModal.classList.add('hidden'); sedeOverlay.classList.add('hidden'); document.getElementById('sedeContent').innerHTML=''; });

  // --- Setup admin page (clases CRUD) ---
  const btnAddClass = document.getElementById('btnAddClass');
  const classListDiv = document.getElementById('classList');

  function renderClasses(){
    if(!classListDiv) return;
    const classes = getClasses();
    classListDiv.innerHTML = '';
    if(classes.length===0){ classListDiv.innerHTML='<p class="muted">No hay clases programadas</p>'; return; }
    classes.forEach((c,i)=>{
      const d = document.createElement('div'); d.className='class-item';
      d.innerHTML = `<div><strong>${c.hora}</strong> - ${c.clase} <br><small>${c.profesor} • ${c.sede} • Cupo ${c.cupo}</small></div>
                     <div><button class="btn" data-i="${i}" style="background:#f55;color:#fff">Eliminar</button></div>`;
      classListDiv.appendChild(d);
    });
    // delegación eliminar
    classListDiv.querySelectorAll('button[data-i]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const idx = parseInt(btn.getAttribute('data-i'),10);
        const arr = getClasses();
        arr.splice(idx,1);
        saveClasses(arr);
        renderClasses();
      });
    });
  }

  if(btnAddClass){
    btnAddClass.addEventListener('click', ()=>{
      const prof = (document.getElementById('c_prof').value||'').trim();
      const clase = (document.getElementById('c_name').value||'').trim();
      const hora = (document.getElementById('c_time').value||'').trim();
      const sede = (document.getElementById('c_sede').value||'Chapinero').trim();
      const cupo = parseInt(document.getElementById('c_cupo').value||'10',10);
      if(!prof||!clase||!hora){ alert('Completa todos los campos'); return; }
      const arr = getClasses();
      arr.push({profesor:prof, clase:clase, hora:hora, sede:sede, cupo:cupo});
      saveClasses(arr);
      alert('Clase agregada');
      renderClasses();
    });
  }

  // Si estamos en admin.html, renderizar clases de entrada
  if(document.location.pathname.endsWith('admin.html') || document.location.pathname.endsWith('/admin.html')){
    renderClasses();
  }

  // Si estamos en usuario.html, no mostramos botones admin, solo clases por sede (cuando abran modal)
});

// ------- Funciones globales usadas por HTML -------
function openSedeModal(sedeId){
  const sedeContent = document.getElementById('sedeContent');
  if(!sedeContent) return;
  // data randomizada
  const trainersPool = ['Carlos Pérez','Andrea Gómez','Juan Rodríguez','Valeria Ruiz','Diego Morales','Sofía Vargas'];
  const machinesPool = ['Cinta de correr','Bicicleta estática','Mancuernas','Máquina de remo','Prensa de piernas','Banco de pesas'];
  const pick = (arr,n)=>{ const c=[...arr]; const out=[]; for(let i=0;i<n;i++){ const idx=Math.floor(Math.random()*c.length); out.push(c.splice(idx,1)[0]); } return out; };

  const trainers = pick(trainersPool,3);
  const machines = pick(machinesPool,5);
  const classes = getClasses().filter(c=> c.sede===sedeId);

  let html = `<h3>${sedeId}</h3><h4>Entrenadores</h4><ul>${trainers.map(t=>`<li>${t}</li>`).join('')}</ul>`;
  html += `<h4>Máquinas</h4><ul>${machines.map(m=>`<li>${m}</li>`).join('')}</ul>`;
  html += `<h4>Próximas clases</h4>`;
  if(classes.length===0) html += `<p class="muted">No hay clases programadas en esta sede.</p>`;
  else html += `<ul>${classes.map(c=>`<li>${c.hora} - ${c.clase} (Prof: ${c.profesor})</li>`).join('')}</ul>`;

  sedeContent.innerHTML = html;
  document.getElementById('sedeOverlay').classList.remove('hidden');
  document.getElementById('sedeModal').classList.remove('hidden');
}

// logout
function logout(){
  localStorage.removeItem('kumba_current');
  window.location.href = 'index.html';
}

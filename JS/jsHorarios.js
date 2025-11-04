// Script: calendar with weekly grid, multiple classes per slot, localStorage persistence
const DAYS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
const startHour = 5;
const endHour = 22; // last slot starts at 21:00 -> ends 22:00

// DOM refs
const hoursCol = document.getElementById('hoursCol');
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const typesList = document.getElementById('typesList');
const modalProf = document.getElementById('modalProf');
const modalLocation = document.getElementById('modalLocation');
const modalCapacity = document.getElementById('modalCapacity');
const modalTitle = document.getElementById('modalTitle');
const saveClassBtn = document.getElementById('saveClass');
const cancelModalBtn = document.getElementById('cancelModal');
const btnRegisterClient = document.getElementById('btnRegisterClient');
const btnRegisterPro = document.getElementById('btnRegisterPro');
const currentUserInfo = document.getElementById('currentUserInfo');

let classes = []; // array of class objects
let clients = [];
let professors = [];
let editing = null;
let selectedSlot = null;
let currentRole = 'client';
let currentUser = null;

// predefined class types (you can expand)
const CLASS_TYPES = ['CYCLINGTECH','YOGA','PILATES','CROSSTECH','STRETCHING','RUMBA','BODY PUMP','GAP','HIPOPRESIVOS'];

// init
function $(id){return document.getElementById(id)}
function uid(){return Date.now().toString(36) + Math.random().toString(36).slice(2,8)}

// load saved
function load() {
  classes = JSON.parse(localStorage.getItem('gl_classes')||'[]');
  clients = JSON.parse(localStorage.getItem('gl_clients')||'[]');
  professors = JSON.parse(localStorage.getItem('gl_profs')||'[]');
}
function save() {
  localStorage.setItem('gl_classes', JSON.stringify(classes));
  localStorage.setItem('gl_clients', JSON.stringify(clients));
  localStorage.setItem('gl_profs', JSON.stringify(professors));
}

// render hours and grid skeleton
function renderSkeleton(){
  hoursCol.innerHTML = '';
  for(let h=startHour; h<endHour; h++){
    const div = document.createElement('div');
    div.className = 'hour';
    const label = (h<=12)? `${h}:00 AM` : `${h-12}:00 PM`;
    div.innerText = label;
    hoursCol.appendChild(div);
  }

  grid.innerHTML = '';
  const inner = document.createElement('div');
  inner.className = 'grid-inner';
  // headers row for days
  const headerRow = document.createElement('div');
  headerRow.style.gridColumn = '1 / -1';
  headerRow.style.display = 'grid';
  headerRow.style.gridTemplateColumns = `repeat(7,1fr)`;
  for(let d=0; d<7; d++){
    const h = document.createElement('div');
    h.className = 'day-header';
    h.innerText = DAYS[d];
    headerRow.appendChild(h);
  }
  inner.appendChild(headerRow);

  // build slots row by row (each hour a row with 7 cells)
  for(let h=startHour; h<endHour; h++){
    // create 7 cells for days
    for(let d=0; d<7; d++){
      const cell = document.createElement('div');
      cell.className = 'slot';
      cell.dataset.day = d;
      cell.dataset.hour = h;
      cell.addEventListener('click', (e)=>{
        // avoid clicking on card buttons triggering slot open
        if(e.target.tagName.toLowerCase() === 'button') return;
        openModalForSlot(d,h);
      });
      inner.appendChild(cell);
    }
  }

  grid.appendChild(inner);
}

// render classes inside grid
function renderClasses(){
  // clear all slots
  const slots = document.querySelectorAll('.slot');
  slots.forEach(s=>s.innerHTML='');

  classes.forEach(c=>{
    const selector = `.slot[data-day="${c.day}"][data-hour="${c.hour}"]`;
    const slot = document.querySelector(selector);
    if(!slot) return;
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = c.id;
    card.innerHTML = `<div class="title"><strong>${c.type}</strong></div>
                      <div class="meta">${c.prof} • ${c.location || 'Sin ubicación'}</div>
                      <div class="meta">Horario: ${formatHour(c.hour)}</div>
                      <div class="meta">Inscritos: ${c.enrolled.length}${c.capacity? ' / '+c.capacity : ''}</div>`;
    const actions = document.createElement('div');
    actions.className = 'actions';

    if(currentRole === 'client'){
      const btn = document.createElement('button');
      btn.className = 'btn-enroll';
      btn.innerText = c.enrolled.includes(currentUser?.email) ? 'Inscripto' : 'Inscribirse';
      btn.disabled = c.enrolled.includes(currentUser?.email) || (c.capacity && c.enrolled.length>=c.capacity) || !currentUser;
      btn.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        enrollClient(c.id);
      });
      actions.appendChild(btn);
    } else {
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn-edit';
      btnEdit.innerText = 'Editar';
      btnEdit.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        openEditModal(c.id);
      });
      const btnDel = document.createElement('button');
      btnDel.className = 'btn-delete';
      btnDel.innerText = 'Eliminar';
      btnDel.addEventListener('click', (ev)=>{
        ev.stopPropagation();
        deleteClass(c.id);
      });
      actions.appendChild(btnEdit);
      actions.appendChild(btnDel);
    }

    card.appendChild(actions);
    slot.appendChild(card);
  });
}

function formatHour(h){
  return (h<=12)? `${h}:00 AM` : `${h-12}:00 PM`;
}

// modal helpers
function openModalForSlot(day,hour){
  selectedSlot = {day, hour};
  editing = null;
  modalTitle.innerText = `Crear clase - ${DAYS[day]} ${formatHour(hour)}`;
  modalProf.value = currentUser?.name || '';
  modalLocation.value = '';
  modalCapacity.value = '';
  Array.from(typesList.querySelectorAll('input')).forEach(i=>i.checked=false);
  showModal(true);
}

function openEditModal(id){
  const c = classes.find(x=>x.id===id);
  if(!c) return;
  editing = c.id;
  selectedSlot = {day:c.day, hour:c.hour};
  modalTitle.innerText = `Editar clase - ${DAYS[c.day]} ${formatHour(c.hour)}`;
  modalProf.value = c.prof;
  modalLocation.value = c.location || '';
  modalCapacity.value = c.capacity || '';
  Array.from(typesList.querySelectorAll('input')).forEach(i=>{
    i.checked = (i.value===c.type);
  });
  showModal(true);
}

function showModal(visible){
  modal.style.display = visible ? 'flex' : 'none';
}

// save class (handles multiple selected types -> creates multiple entries)
function saveClass(){
  const prof = modalProf.value.trim();
  const location = modalLocation.value.trim();
  const cap = parseInt(modalCapacity.value) || null;
  const checked = Array.from(typesList.querySelectorAll('input:checked')).map(i=>i.value);
  if(!prof || checked.length===0 || !selectedSlot) {
    showToast('Completa profesor y al menos un tipo de clase.');
    return;
  }

  if(editing){
    const c = classes.find(x=>x.id===editing);
    if(!c){ showToast('Clase no encontrada'); return; }
    c.prof = prof; c.location = location; c.capacity = cap;
    c.type = checked[0];
    showToast('Clase actualizada');
    editing = null;
  } else {
    checked.forEach(t=>{
      const newClass = {
        id: uid(),
        day: selectedSlot.day,
        hour: selectedSlot.hour,
        type: t,
        prof,
        location,
        capacity: cap,
        enrolled: []
      };
      classes.push(newClass);
    });
    showToast(`${checked.length} clase(s) creada(s)`);
  }
  save(); renderClasses(); showModal(false);
}

// enroll client
function enrollClient(classId){
  if(!currentUser || currentRole!=='client'){ showToast('Regístrate como cliente para inscribirte'); return; }
  const c = classes.find(x=>x.id===classId);
  if(!c) return;
  if(c.enrolled.includes(currentUser.email)){ showToast('Ya estás inscrito'); return; }
  if(c.capacity && c.enrolled.length>=c.capacity){ showToast('Capacidad completa'); return; }
  c.enrolled.push(currentUser.email);
  save();
  renderClasses();
  showToast('Inscripción realizada');
}

// delete class
function deleteClass(classId){
  if(!confirm('Eliminar esta clase?')) return;
  classes = classes.filter(x=>x.id!==classId);
  save(); renderClasses(); showToast('Clase eliminada');
}

function showToast(txt, time=2000){
  const t = document.getElementById('toast');
  t.innerText = txt;
  t.style.display = 'block';
  setTimeout(()=> t.style.display = 'none', time);
}

btnRegisterClient.addEventListener('click', ()=>{
  const name = document.getElementById('clientName').value.trim();
  const email = document.getElementById('clientEmail').value.trim();
  if(!name || !email) return showToast('Completa nombre y email');
  clients.push({id:uid(), name, email});
  save();
  document.getElementById('clientName').value=''; document.getElementById('clientEmail').value='';
  currentRole='client'; currentUser={name, email};
  updateRoleUI();
  renderClasses();
  showToast('Cliente registrado y seleccionado');
});

btnRegisterPro.addEventListener('click', ()=>{
  const name = document.getElementById('proName').value.trim();
  const email = document.getElementById('proEmail').value.trim();
  if(!name || !email) return showToast('Completa nombre y email');
  professors.push({id:uid(), name, email});
  save();
  document.getElementById('proName').value=''; document.getElementById('proEmail').value='';
  currentRole='pro'; currentUser={name, email};
  updateRoleUI();
  renderClasses();
  showToast('Profesor registrado y seleccionado');
});

Array.from(document.getElementsByName('role')).forEach(r=>{
  r.addEventListener('change', (e)=>{
    currentRole = e.target.value;
    updateRoleUI(); renderClasses();
  });
});

function updateRoleUI(){
  if(currentUser){
    currentUserInfo.innerText = `${currentUser.name} (${currentRole})`;
  } else currentUserInfo.innerText = '';
}

function buildTypesUI(){
  typesList.innerHTML = '';
  CLASS_TYPES.forEach(t=>{
    const id = 't_'+t.replace(/\s+/g,'_');
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" value="${t}" id="${id}" /> ${t}`;
    typesList.appendChild(label);
  });
}

function init(){
  load();
  renderSkeleton();
  buildTypesUI();
  renderClasses();
  saveClassBtn.addEventListener('click', saveClass);
  cancelModalBtn.addEventListener('click', ()=>showModal(false));
  modal.addEventListener('click', (e)=>{ if(e.target===modal) showModal(false);});
}

init();

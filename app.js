// Datos del catálogo (precios en MXN). "stock:false" = curso agotado.
const COURSES = [
  {id:"c",     name:"C desde cero",            cat:"Sistemas",  price:499, img:"images/c.svg",      stock:true,  desc:"Memoria, apuntadores y estructuras. La base de todo lo demás."},
  {id:"cpp",   name:"C++ orientado a objetos", cat:"Sistemas",  price:599, img:"images/cpp.svg",    stock:true,  desc:"Clases, herencia y plantillas con proyectos pequeños."},
  {id:"asm",   name:"Ensamblador x86",         cat:"Sistemas",  price:649, img:"images/asm.svg",    stock:false, desc:"Registros, pila e instrucciones para entender el procesador."},
  {id:"rust",  name:"Rust seguro",             cat:"Sistemas",  price:699, img:"images/rust.svg",   stock:true,  desc:"Propiedad y préstamos para programar sin errores de memoria."},
  {id:"js",    name:"JavaScript moderno",      cat:"Web",       price:449, img:"images/js.svg",     stock:true,  desc:"Del DOM a funciones asíncronas, con práctica en el navegador."},
  {id:"ts",    name:"TypeScript",              cat:"Web",       price:499, img:"images/ts.svg",     stock:true,  desc:"Tipos, interfaces y genéricos para JavaScript más confiable."},
  {id:"php",   name:"PHP para la web",         cat:"Web",       price:399, img:"images/php.svg",    stock:true,  desc:"Formularios, sesiones y conexión con bases de datos."},
  {id:"python",name:"Python práctico",         cat:"Aplicaciones", price:429, img:"images/python.svg", stock:true, desc:"Scripts, archivos y análisis de datos para empezar rápido."},
  {id:"java",  name:"Java y POO",              cat:"Aplicaciones", price:549, img:"images/java.svg",   stock:true, desc:"Objetos, colecciones e interfaces gráficas con Swing."}
];

const $ = s => document.querySelector(s);
const money = n => "$" + n.toLocaleString("es-MX") + " MXN";
const cart = new Set();
let filter = "Todos";
let toastTimer;

function renderFilters(){
  const cats = ["Todos", ...new Set(COURSES.map(c => c.cat))];
  $("#filters").innerHTML = cats.map(c => {
    const n = c === "Todos" ? COURSES.length : COURSES.filter(x => x.cat === c).length;
    return `<button class="chip" type="button" data-cat="${c}" aria-pressed="${c === filter}">${c} (${n})</button>`;
  }).join("");
}

function renderGrid(){
  const list = COURSES.filter(c => filter === "Todos" || c.cat === filter);
  $("#status").textContent = `Mostrando ${list.length} de ${COURSES.length} cursos` + (filter !== "Todos" ? ` en ${filter}` : "");
  $("#grid").innerHTML = list.map(c => {
    let btn;
    if (!c.stock) btn = `<button class="btn btn-soldout" type="button" disabled>Agotado</button>`;
    else if (cart.has(c.id)) btn = `<button class="btn btn-added" type="button" disabled>✓ En el carrito</button>`;
    else btn = `<button class="btn btn-primary" type="button" data-add="${c.id}">Agregar al carrito</button>`;
    return `<article class="card ${c.stock ? "" : "soldout"}">
      <img src="${c.img}" alt="Curso de ${c.name}">
      <div class="card-body">
        <span class="tag">${c.cat}</span>
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        ${c.stock ? "" : `<span class="soldout-label">Sin cupo disponible</span>`}
        <span class="price">${money(c.price)}</span>
        ${btn}
      </div></article>`;
  }).join("");
}

function renderCart(){
  const items = COURSES.filter(c => cart.has(c.id));
  $("#cart-list").innerHTML = items.map(c => `<li>
    <div><div class="name">${c.name}</div><div class="p">${money(c.price)}</div></div>
    <button class="link-btn" type="button" data-remove="${c.id}" aria-label="Quitar ${c.name} del carrito">Quitar</button></li>`).join("");
  $("#cart-empty").hidden = items.length > 0;
  $("#cart-total").textContent = money(items.reduce((s, c) => s + c.price, 0));
  $("#checkout").disabled = $("#clear").disabled = items.length === 0;
  const badge = $("#cart-count");
  badge.textContent = items.length;
  badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
}

function toast(msg, error){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("error", !!error);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

function openCart(open){
  $("#cart").hidden = $("#overlay").hidden = !open;
  $("#cart-toggle").setAttribute("aria-expanded", open);
  if (open) $("#cart-close").focus(); else $("#cart-toggle").focus();
}

// Eventos
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  filter = b.dataset.cat; renderFilters(); renderGrid();
});

$("#grid").addEventListener("click", e => {
  const b = e.target.closest("[data-add]");
  if (!b) return;
  const c = COURSES.find(x => x.id === b.dataset.add);
  if (!c.stock || cart.has(c.id)) return;          // restricción también en JS
  cart.add(c.id); renderCart(); renderGrid();
  toast(`“${c.name}” se agregó al carrito`);
});

$("#cart-list").addEventListener("click", e => {
  const b = e.target.closest("[data-remove]");
  if (!b) return;
  const c = COURSES.find(x => x.id === b.dataset.remove);
  cart.delete(c.id); renderCart(); renderGrid();
  toast(`“${c.name}” se quitó del carrito`, true);
});

$("#cart-toggle").addEventListener("click", () => openCart(true));
$("#cart-close").addEventListener("click", () => openCart(false));
$("#overlay").addEventListener("click", () => openCart(false));
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#cart").hidden) openCart(false); });

$("#clear").addEventListener("click", () => {
  if (!confirm("¿Quitar todos los cursos del carrito?")) return;
  cart.clear(); renderCart(); renderGrid(); toast("Carrito vaciado", true);
});
$("#checkout").addEventListener("click", () => {
  toast(`Inscripción simulada: ${cart.size} curso(s). No se realizó ningún pago.`);
  cart.clear(); renderCart(); renderGrid(); openCart(false);
});

renderFilters(); renderGrid(); renderCart();

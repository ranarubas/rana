// ====== EDIT THESE ======
const FREE_SHIPPING = 60;          // EUR
const SHIPPING_FEE = 5.95;         // EUR, charged below the free-shipping amount
const CHECKOUT_URL = "";           // paste your Stripe Payment Link here (supports iDEAL). Empty = order by email.
const ORDER_EMAIL = "info@jouwdomein.nl";
const PRODUCTS = [ // price incl. 21% BTW. Add img:"images/file.jpg" to show a real photo.
  {id:1,nl:"Messing Arabische Lantaarn",en:"Brass Arabian Lantern",cat:"light",price:54.95,old:69.95,c:["#B8893B","#7a5a22"]},
  {id:2,nl:"Houten Wandpaneel Gesneden",en:"Carved Wooden Wall Panel",cat:"wall",price:79.00,c:["#5A2A3A","#3a1824"]},
  {id:3,nl:"Kalligrafie Canvas Set",en:"Calligraphy Canvas Set",cat:"wall",price:59.95,c:["#0F3B3A","#072120"]},
  {id:4,nl:"Majlis Kussens (2 stuks)",en:"Majlis Cushions (pair)",cat:"textile",price:34.95,old:42.95,c:["#8a4b2d","#5a2f1a"]},
  {id:5,nl:"Wierookbrander Mabkhara",en:"Incense Burner Mabkhara",cat:"life",price:24.95,c:["#2c2a26","#111"]},
  {id:6,nl:"Mozaïek Tafellamp",en:"Mosaic Table Lamp",cat:"light",price:69.95,c:["#154c4a","#0a2a29"]},
  {id:7,nl:"Arabische Koffie Dallah Set",en:"Arabic Coffee Dallah Set",cat:"life",price:94.95,c:["#B8893B","#5a4116"]},
  {id:8,nl:"Geborduurde Tafelloper",en:"Embroidered Table Runner",cat:"textile",price:22.95,c:["#5A2A3A","#8a4b2d"]}
];
// ========================
const T = {
 nl:{bar:"Gratis verzending vanaf €60 · Betaal met iDEAL · 14 dagen bedenktijd",search:"Zoek producten",cart:"Winkelwagen",close:"Sluiten",
  h1:"Breng de warmte van een Arabische majlis in huis.",sub:"Lantaarns, houtsnijwerk, textiel en wanddecoratie, geleverd in Nederland en België.",cta:"Bekijk de collectie",
  u1:"Levering in 2 tot 4 werkdagen",u2:"Veilig betalen met iDEAL",u3:"14 dagen retourneren",u4:"Prijzen incl. BTW",
  coll:"De collectie",none:"Geen producten gevonden.",help:"Klantenservice",terms:"Algemene voorwaarden",returns:"Retourneren",
  total:"Totaal",vat:"Incl. 21% BTW. Verzendkosten worden hieronder berekend.",pay:"Afrekenen",empty:"Je winkelwagen is leeg. Voeg een product toe.",
  add:"In winkelwagen",sale:"Sale",all:"Alles",light:"Verlichting",wall:"Wanddecoratie",textile:"Textiel",life:"Lifestyle",
  more:a=>`Nog €${a} voor gratis verzending`,free:"Je krijgt gratis verzending",ship:"Verzending",freeW:"Gratis",mail:"Hallo, ik wil graag bestellen:"},
 en:{bar:"Free shipping over €60 · Pay with iDEAL · 14-day returns",search:"Search products",cart:"Cart",close:"Close",
  h1:"Bring the warmth of an Arabian majlis home.",sub:"Lanterns, carved wood, textiles and wall pieces, delivered in the Netherlands and Belgium.",cta:"Shop the collection",
  u1:"Delivery in 2 to 4 working days",u2:"Pay securely with iDEAL",u3:"14-day returns",u4:"Prices include VAT",
  coll:"The collection",none:"No products found.",help:"Customer service",terms:"Terms and conditions",returns:"Returns",
  total:"Total",vat:"Includes 21% VAT. Shipping is added below.",pay:"Checkout",empty:"Your cart is empty. Add a product.",
  add:"Add to cart",sale:"Sale",all:"All",light:"Lighting",wall:"Wall decor",textile:"Textiles",life:"Lifestyle",
  more:a=>`€${a} more for free shipping`,free:"You get free shipping",ship:"Shipping",freeW:"Free",mail:"Hello, I would like to order:"}
};
const $ = id => document.getElementById(id);
const eur = n => "€" + n.toFixed(2).replace(".", ",");
let lang = localStorage.getItem("ma-lang") || "nl", cat = "all", q = "", cart = {};
try { cart = JSON.parse(localStorage.getItem("ma-cart")) || {}; } catch(e) {}
const t = k => T[lang][k];

function texts(){
  document.documentElement.lang = lang; $("lang").textContent = lang === "nl" ? "EN" : "NL";
  document.querySelectorAll("[data-i18n]").forEach(e => e.textContent = t(e.dataset.i18n));
  document.querySelectorAll("[data-i18n-ph]").forEach(e => e.placeholder = t(e.dataset.i18nPh));
  $("cats").innerHTML = ["all","light","wall","textile","life"].map(c => `<button data-c="${c}" class="${c===cat?"on":""}">${t(c)}</button>`).join("");
  $("cats").querySelectorAll("button").forEach(b => b.onclick = () => { cat = b.dataset.c; texts(); grid(); });
}
function grid(){
  const list = PRODUCTS.filter(p => (cat==="all"||p.cat===cat) && p[lang].toLowerCase().includes(q));
  $("none").hidden = list.length > 0;
  $("grid").innerHTML = list.map(p => `<article class="card">
    ${p.old?`<span class="badge">${t("sale")}</span>`:""}
    ${p.img?`<img src="${p.img}" alt="${p[lang]}" loading="lazy">`:`<div class="art" style="background:linear-gradient(135deg,${p.c[0]},${p.c[1]})">${p[lang][0]}</div>`}
    <h3>${p[lang]}</h3><div class="cat">${t(p.cat)}</div>
    <div class="row"><span class="price"><b>${eur(p.price)}</b>${p.old?`<s>${eur(p.old)}</s>`:""}</span><button data-id="${p.id}">${t("add")}</button></div></article>`).join("");
  $("grid").querySelectorAll("button").forEach(b => b.onclick = () => { cart[b.dataset.id] = (cart[b.dataset.id]||0)+1; save(); open_(); });
}
function lines(){ return Object.keys(cart).map(id => ({p:PRODUCTS.find(x=>x.id==id), q:cart[id]})).filter(l=>l.p); }
function sums(){ const sub = lines().reduce((s,l)=>s+l.p.price*l.q,0); const ship = sub===0||sub>=FREE_SHIPPING?0:SHIPPING_FEE; return {sub,ship,total:sub+ship}; }
function save(){ try{localStorage.setItem("ma-cart",JSON.stringify(cart));}catch(e){} drawCart(); }
function drawCart(){
  const L = lines(), s = sums();
  $("items").innerHTML = L.length ? L.map(({p,q}) => `<div class="line"><div>${p[lang]}<br><small>${eur(p.price)}</small>
    <div class="qty"><button data-id="${p.id}" data-d="-1" aria-label="-">-</button>${q}<button data-id="${p.id}" data-d="1" aria-label="+">+</button></div></div><strong>${eur(p.price*q)}</strong></div>`).join("") : `<p class="empty">${t("empty")}</p>`;
  $("items").querySelectorAll(".qty button").forEach(b => b.onclick = () => { const id=b.dataset.id; cart[id]+=+b.dataset.d; if(cart[id]<=0) delete cart[id]; save(); });
  $("total").textContent = eur(s.total);
  $("count").textContent = L.reduce((n,l)=>n+l.q,0);
  $("shipMsg").textContent = s.sub>=FREE_SHIPPING ? t("free") : t("more")((FREE_SHIPPING-s.sub).toFixed(2).replace(".",","));
  $("meter").style.width = Math.min(100, s.sub/FREE_SHIPPING*100) + "%";
}
function open_(){ $("drawer").classList.add("on"); $("overlay").classList.add("on"); }
function close_(){ $("drawer").classList.remove("on"); $("overlay").classList.remove("on"); }
$("openCart").onclick = open_; $("closeCart").onclick = close_; $("overlay").onclick = close_;
document.addEventListener("keydown", e => { if(e.key==="Escape") close_(); });
$("search").oninput = e => { q = e.target.value.toLowerCase(); grid(); };
$("lang").onclick = () => { lang = lang==="nl"?"en":"nl"; localStorage.setItem("ma-lang",lang); texts(); grid(); drawCart(); };
$("checkout").onclick = () => {
  if(!lines().length) return;
  if(CHECKOUT_URL){ window.location.href = CHECKOUT_URL; return; }
  const s = sums();
  const body = `${t("mail")}\n${lines().map(l=>`- ${l.p[lang]} x${l.q}`).join("\n")}\n${t("ship")}: ${s.ship?eur(s.ship):t("freeW")}\n${t("total")}: ${eur(s.total)}\n\nNaam / Name:\nAdres / Address:\nPostcode & stad / City:`;
  window.location.href = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent("Bestelling / Order")}&body=${encodeURIComponent(body)}`;
};
texts(); grid(); drawCart();

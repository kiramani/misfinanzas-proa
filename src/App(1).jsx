import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { Plus, Search, Home, Target, CreditCard, Bell, Clock, TrendingUp, ArrowUpRight, ArrowDownRight, X, Edit2, Trash2, Wallet, Check, Award, BookOpen, BarChart3, Briefcase, ChevronDown, Layers, Eye, EyeOff, Palette, Camera, Download, Upload, Zap, RotateCcw } from "lucide-react";

/* ═══════════ CONSTANTS ═══════════ */
const CATS = [
  { id: "comida", name: "Comida", icon: "🍔", color: "#FF6B6B" },
  { id: "transporte", name: "Transporte", icon: "🚗", color: "#4ECDC4" },
  { id: "entretenimiento", name: "Entretenim.", icon: "🎮", color: "#45B7D1" },
  { id: "servicios", name: "Servicios", icon: "💡", color: "#96CEB4" },
  { id: "salud", name: "Salud", icon: "💊", color: "#FFEAA7" },
  { id: "educacion", name: "Educación", icon: "📚", color: "#DDA0DD" },
  { id: "ropa", name: "Ropa", icon: "👕", color: "#F0A500" },
  { id: "hogar", name: "Hogar", icon: "🏠", color: "#A8D8EA" },
  { id: "ahorro", name: "Ahorro", icon: "🏦", color: "#22C55E" },
  { id: "suscripciones", name: "Suscrip.", icon: "📱", color: "#8B5CF6" },
  { id: "mascotas", name: "Mascotas", icon: "🐾", color: "#F472B6" },
  { id: "otro", name: "Otro", icon: "📦", color: "#B0BEC5" },
];
const PAY_METHODS = [
  { id: "efectivo", name: "Efectivo", icon: "💵" },
  { id: "debito", name: "Débito", icon: "💳" },
  { id: "credito", name: "Crédito", icon: "💳" },
  { id: "transfer", name: "Transfer", icon: "🏦" },
];
const MEDALS = [
  { id: "m1", name: "Primera vez", desc: "Registra 1 movimiento", icon: "🌟", ck: d => d.transactions.length >= 1 },
  { id: "m2", name: "En racha", desc: "10 movimientos", icon: "🔥", ck: d => d.transactions.length >= 10 },
  { id: "m3", name: "Soñador", desc: "Crea una meta", icon: "🎯", ck: d => d.goals.length >= 1 },
  { id: "m4", name: "Meta cumplida", desc: "Completa una meta", icon: "🏆", ck: d => d.goals.some(g => g.saved >= g.target && g.target > 0) },
  { id: "m5", name: "Ahorrador", desc: "Ahorra $1,000+", icon: "🐷", ck: d => d.goals.reduce((s, g) => s + g.saved, 0) >= 1000 },
  { id: "m6", name: "Fotógrafo", desc: "Sube un ticket con foto", icon: "📸", ck: d => (d.tickets || []).some(t => t.photo) },
  { id: "m7", name: "Constante", desc: "50 movimientos", icon: "💎", ck: d => d.transactions.length >= 50 },
  { id: "m8", name: "Emprendedor", desc: "Agrega un producto", icon: "🧁", ck: d => (d.products || []).length >= 1 },
  { id: "m9", name: "Libre", desc: "Paga todas las deudas", icon: "🕊️", ck: d => d.debts.length > 0 && d.debts.every(x => x.paid >= x.amount) },
  { id: "m10", name: "Backup", desc: "Exporta tus datos", icon: "💾", ck: d => d.exported },
];
const TIPS = ["Regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro.", "Paga deudas con mayor interés primero (avalancha).", "Automatiza ahorros al cobrar.", "Revisa suscripciones cada 3 meses.", "Fondo de emergencia = 3-6 meses de gastos.", "El interés compuesto es tu mejor aliado.", "Registra TODOS tus gastos, incluso los chicos.", "Cocinar en casa ahorra hasta 40%."];
const USER_EMOJIS = ["👤", "👨", "👩", "🧔", "👱", "🧑", "👦", "👧", "🐱", "🐶", "🦊", "🐻", "🐼", "🦁", "🐸", "🦋", "🌸", "🎀", "💜", "⭐"];

/* ═══════════ THEMES ═══════════ */
const W_THEMES = [
  { id: "sakura", name: "Sakura 🌸", bg: "#FFF0F5", card: "#fff", cb: "#FFD6E7", text: "#4A2040", ts: "#B07098", ac: "#FF69B4", ab: "#FF69B415", nav: "#FFF5F9", pill: "#FFE4F0", pa: "#FF69B4", pt: "#B07098", bar: "#FFE4F0", deco: ["🌸", "💕", "✨", "🎀"], pat: "repeating-linear-gradient(45deg,#FFD6E720 0,#FFD6E720 10px,transparent 10px,transparent 20px)" },
  { id: "lavender", name: "Lavanda 💜", bg: "#F5F0FF", card: "#fff", cb: "#E0D4F5", text: "#2D1B4E", ts: "#8B6BAE", ac: "#9B59B6", ab: "#9B59B615", nav: "#F8F4FF", pill: "#EDE4F8", pa: "#9B59B6", pt: "#8B6BAE", bar: "#EDE4F8", deco: ["💜", "🦄", "✨", "🔮"], pat: "repeating-linear-gradient(135deg,#E0D4F520 0,#E0D4F520 10px,transparent 10px,transparent 20px)" },
  { id: "mint", name: "Menta 🍃", bg: "#F0FFF4", card: "#fff", cb: "#C6F6D5", text: "#1A3A2A", ts: "#68A882", ac: "#48BB78", ab: "#48BB7815", nav: "#F5FFF8", pill: "#E0F8E8", pa: "#48BB78", pt: "#68A882", bar: "#E0F8E8", deco: ["🍃", "🌿", "💚", "🦋"], pat: "repeating-linear-gradient(90deg,#C6F6D520 0,#C6F6D520 10px,transparent 10px,transparent 20px)" },
  { id: "peach", name: "Durazno 🍑", bg: "#FFF5EE", card: "#fff", cb: "#FFE0CC", text: "#4A2810", ts: "#C08060", ac: "#FF8C5A", ab: "#FF8C5A15", nav: "#FFF8F2", pill: "#FFE8D8", pa: "#FF8C5A", pt: "#C08060", bar: "#FFE8D8", deco: ["🍑", "🧡", "☀️", "🌺"], pat: "repeating-linear-gradient(45deg,#FFE0CC20 0,#FFE0CC20 10px,transparent 10px,transparent 20px)" },
  { id: "sky", name: "Cielo 🦋", bg: "#F0F8FF", card: "#fff", cb: "#BDE0FE", text: "#1B3A5C", ts: "#6B9ECF", ac: "#5B9BD5", ab: "#5B9BD515", nav: "#F5FAFF", pill: "#DEF0FF", pa: "#5B9BD5", pt: "#6B9ECF", bar: "#DEF0FF", deco: ["🦋", "💙", "☁️", "⭐"], pat: "repeating-linear-gradient(135deg,#BDE0FE20 0,#BDE0FE20 10px,transparent 10px,transparent 20px)" },
  { id: "dark_rose", name: "Noche Rosa 🖤", bg: "#1A0A14", card: "#2A1020", cb: "#4A2040", text: "#F5D0E8", ts: "#C090B0", ac: "#FF69B4", ab: "#FF69B420", nav: "#200E18", pill: "#3A1830", pa: "#FF69B4", pt: "#C090B0", bar: "#3A1830", deco: ["🖤", "🌹", "💎", "✨"], pat: "repeating-linear-gradient(45deg,#4A204015 0,#4A204015 10px,transparent 10px,transparent 20px)" },
];
const M_THEMES = [
  { id: "carbon", name: "Carbono 🔥", bg: "#0A0A0F", card: "#14141F", cb: "#252535", text: "#E8E8F0", ts: "#6B6B8A", ac: "#FF4444", ab: "#FF444420", nav: "#0F0F18", pill: "#1E1E30", pa: "#FF4444", pt: "#6B6B8A", bar: "#1E1E30", deco: ["🔥", "⚡", "💀", "🎯"], pat: "repeating-linear-gradient(45deg,#25253515 0,#25253515 10px,transparent 10px,transparent 20px)" },
  { id: "matrix", name: "Matrix 💚", bg: "#0A0F0A", card: "#0F1A0F", cb: "#1A3A1A", text: "#C0F0C0", ts: "#508050", ac: "#00FF41", ab: "#00FF4115", nav: "#0A120A", pill: "#152015", pa: "#00FF41", pt: "#508050", bar: "#152015", deco: ["💚", "🐍", "👾", "🔋"], pat: "repeating-linear-gradient(90deg,#1A3A1A15 0,#1A3A1A15 10px,transparent 10px,transparent 20px)" },
  { id: "ocean", name: "Océano 🌊", bg: "#0A1628", card: "#0F1E35", cb: "#1A3050", text: "#C0D8F0", ts: "#5080A8", ac: "#00B4D8", ab: "#00B4D815", nav: "#0C1A2E", pill: "#142840", pa: "#00B4D8", pt: "#5080A8", bar: "#142840", deco: ["🌊", "🦈", "⚓", "🧊"], pat: "repeating-linear-gradient(135deg,#1A305015 0,#1A305015 10px,transparent 10px,transparent 20px)" },
  { id: "ember", name: "Fuego 🌋", bg: "#1A0A00", card: "#251505", cb: "#402010", text: "#F0D0B0", ts: "#A07050", ac: "#FF6B00", ab: "#FF6B0020", nav: "#1A0C02", pill: "#301808", pa: "#FF6B00", pt: "#A07050", bar: "#301808", deco: ["🌋", "🔥", "☄️", "💥"], pat: "repeating-linear-gradient(45deg,#40201015 0,#40201015 10px,transparent 10px,transparent 20px)" },
  { id: "neon", name: "Neón 💜", bg: "#0F0A1A", card: "#1A1028", cb: "#2A1A40", text: "#E0D0F8", ts: "#8060B0", ac: "#A855F7", ab: "#A855F720", nav: "#120C1E", pill: "#201535", pa: "#A855F7", pt: "#8060B0", bar: "#201535", deco: ["💜", "🎮", "🕹️", "⚡"], pat: "repeating-linear-gradient(135deg,#2A1A4015 0,#2A1A4015 10px,transparent 10px,transparent 20px)" },
  { id: "steel", name: "Acero ⚙️", bg: "#12151A", card: "#1A1E25", cb: "#2A3040", text: "#D0D8E0", ts: "#607080", ac: "#64748B", ab: "#64748B20", nav: "#151820", pill: "#202830", pa: "#64748B", pt: "#607080", bar: "#202830", deco: ["⚙️", "🔩", "🛡️", "🗡️"], pat: "repeating-linear-gradient(90deg,#2A304015 0,#2A304015 10px,transparent 10px,transparent 20px)" },
];

/* ═══════════ GUIDE ═══════════ */
const BIZ_TYPES = [
  { id: "bollitos", name: "Bollitos", icon: "🧁", p: "bollitos" },
  { id: "ropa", name: "Ropa", icon: "👗", p: "ropa" },
  { id: "comida", name: "Comida", icon: "🍕", p: "comida" },
  { id: "belleza", name: "Belleza", icon: "💄", p: "productos" },
  { id: "tech", name: "Tech", icon: "💻", p: "servicios" },
  { id: "arte", name: "Arte", icon: "🎨", p: "manualidades" },
  { id: "otro", name: "Otro", icon: "📦", p: "productos" },
];
const GUIDE = [
  { t: "¿Por dónde empiezo?", i: "🚀", s: [{ t: "Producto estrella", c: "Identifica qué te hace ÚNICO con tus {p}. Sabor, presentación, precio o atención." }, { t: "Inversión inicial", c: "Nunca inviertas más del 30% de tus ahorros en tu primer lote." }, { t: "Cliente ideal", c: "Define: edad, género, zona, gustos. Entre más específico, mejor venderás tus {p}." }, { t: "Primer presupuesto", c: "Materia prima 40%, Empaque 10%, Marketing 15%, Transporte 10%, Ahorro 15%, Tu sueldo 10%." }] },
  { t: "Precio y ganancias", i: "💰", s: [{ t: "Fórmula del precio", c: "Precio = Costo × 2.5 a 3. Si tus {p} cuestan $10, véndelos entre $25-$30." }, { t: "Margen mínimo 40%", c: "Usa Mi Negocio para calcular. Si es menor a 30%, reduce costos o sube precio." }, { t: "Punto de equilibrio", c: "Gastos fijos ÷ ganancia por pieza = unidades mínimas. Ej: $3,000 ÷ $15 = 200 {p}/mes." }, { t: "Combos venden más", c: "'3 por $50' vende más que '$18 cada uno'. Compite por VALOR, no por precio bajo." }] },
  { t: "Marketing gratis", i: "📱", s: [{ t: "Redes sociales", c: "Instagram, TikTok, WhatsApp Business son GRATIS. Publica fotos de tus {p}, 3-5 veces/semana." }, { t: "Boca a boca", c: "Pide a tus 10 primeros clientes que te recomienden. 'Trae un amigo = 10% off para ambos'." }, { t: "WhatsApp Business", c: "Catálogo con fotos de cada producto. Los estados son tu vitrina diaria gratis." }, { t: "Tu marca", c: "Nombre memorable + logo (Canva gratis) + color que te identifique. Consistencia = confianza." }] },
  { t: "Inventario", i: "📦", s: [{ t: "Stock mínimo", c: "Nunca quedes en 0. Usa Alertas de Stock en la app para tus {p}." }, { t: "PEPS", c: "Lo que produces primero, véndelo primero. Clave si tus {p} tienen caducidad." }, { t: "Registro diario", c: "Cada venta regístrala. Al final del día, conteo físico vs digital." }] },
  { t: "Personal vs Negocio", i: "🏦", s: [{ t: "Separa cuentas", c: "NUNCA mezcles dinero personal con el del negocio. Usa Modo Familiar." }, { t: "Págadote sueldo", c: "Define cuánto te pagas al mes. Tu sueldo es gasto fijo del negocio." }, { t: "Reinversión", c: "Del total de ganancias, reinvierte mínimo 30% en mejorar tus {p}." }] },
  { t: "Escalar", i: "📈", s: [{ t: "Cuándo crecer", c: "Si vendes todo antes de lo planeado por 3 meses seguidos, escala 20%." }, { t: "Nuevos canales", c: "Facebook Marketplace, Mercado Libre, delivery apps, eventos, mayorista." }, { t: "Diversifica", c: "Si tu producto estrella es uno, crea 2-3 variaciones de tus {p}." }] },
  { t: "Inversión básica", i: "💎", s: [{ t: "CETES", c: "La más segura en México. Desde $100 en cetesdirecto.com. ~11% anual." }, { t: "ETFs", c: "NAFTRAC replica el IPC. Invierte lo que NO necesites en 5+ años." }, { t: "Interés compuesto", c: "$1,000/mes × 20 años al 10% = $765,697. Empieza HOY." }] },
  { t: "Libros recomendados", i: "📚", s: [{ t: "Padre Rico, Padre Pobre", c: "Diferencia entre activos y pasivos. Cómo hacer que el dinero trabaje para ti." }, { t: "El hombre más rico de Babilonia", c: "Págate primero, controla gastos, haz que tu oro trabaje." }, { t: "$100 Startup", c: "Crear negocio con poca inversión. Ejemplos reales para tu emprendimiento de {p}." }, { t: "Profit First", c: "Ventas - Ganancia = Gastos. Cambiará cómo manejas el dinero de tus {p}." }] },
];

/* ═══════════ HELPERS ═══════════ */
const $ = n => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pc = (a, b) => (b > 0 ? Math.min((a / b) * 100, 100) : 0);
const mRange = (d = new Date()) => ({ s: new Date(d.getFullYear(), d.getMonth(), 1), e: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) });
const wRange = (d = new Date()) => { const dy = d.getDay(), df = d.getDate() - dy + (dy === 0 ? -6 : 1); const s = new Date(d.getFullYear(), d.getMonth(), df); return { s, e: new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6, 23, 59, 59, 999) }; };
const qRange = (d = new Date()) => { const dy = d.getDate(), y = d.getFullYear(), m = d.getMonth(); return dy <= 15 ? { s: new Date(y, m, 1), e: new Date(y, m, 15, 23, 59, 59, 999) } : { s: new Date(y, m, 16), e: new Date(y, m + 1, 0, 23, 59, 59, 999) }; };
const pRange = p => ({ week: wRange, quincena: qRange, month: mRange }[p] || mRange)();

const DD = { transactions: [], budgets: CATS.map(c => ({ id: c.id, category: c.id, limit: 0 })), goals: [], debts: [], reminders: [], investments: [], assets: [], tickets: [], products: [], salesLog: [], recurring: [], settings: { themeId: "sakura", themeGender: "women", hideBalances: false, lowVision: false, showDeco: true, bizType: "bollitos" }, retirementPlan: { monthlyExpense: 15000, currentAge: 25, retireAge: 60, currentSavings: 0, monthlyContribution: 3000, annualReturn: 8 }, exported: false };
const DU = [{ id: "default", name: "Yo", emoji: "👤" }];

/* ═══════════ MAIN APP ═══════════ */
export default function App() {
  const [data, setData] = useState(DD);
  const [users, setUsers] = useState(DU);
  const [curUid, setCurUid] = useState("default");
  const [view, setView] = useState("dashboard");
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [fCat, setFCat] = useState("all");
  const [fPer, setFPer] = useState("month");
  const [sub, setSub] = useState(null);
  const [toast, setToast] = useState(null);
  const [quickAdd, setQuickAdd] = useState(false);

  const st = data.settings || {};
  const hide = st.hideBalances;
  const lv = st.lowVision;
  const deco = st.showDeco !== false;
  const gen = st.themeGender || "women";
  const pool = gen === "women" ? W_THEMES : M_THEMES;
  const T = pool.find(t => t.id === st.themeId) || pool[0];
  const dk = ["dark_rose", "carbon", "matrix", "ocean", "ember", "neon", "steel"].includes(T.id);
  const sKey = u => `fin-v5-${u}`;

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const ur = await window.storage.get("fin-users-v5");
        const lu = (ur && ur.value) ? JSON.parse(ur.value) : DU;
        setUsers(lu);
        const cu = await window.storage.get("fin-cur-v5");
        const id = (cu && cu.value) ? cu.value : "default";
        setCurUid(id);
        try {
          const dr = await window.storage.get(sKey(id));
          if (dr && dr.value) { const p = JSON.parse(dr.value); setData({ ...DD, ...p, settings: { ...DD.settings, ...(p.settings || {}) } }); }
        } catch (e) { }
      } catch (e) { }
    })();
  }, []);

  // Process recurring transactions on load
  useEffect(() => {
    if (!data.recurring || data.recurring.length === 0) return;
    const today = new Date().toDateString();
    const newTx = [];
    data.recurring.forEach(r => {
      if (r.lastRun === today) return;
      const now = new Date();
      if (r.freq === "daily" || (r.freq === "weekly" && now.getDay() === (r.dayOfWeek || 1)) || (r.freq === "monthly" && now.getDate() === (r.dayOfMonth || 1))) {
        newTx.push({ id: uid(), type: r.type, amount: r.amount, description: r.description + " (auto)", category: r.category, method: r.method || "efectivo", date: new Date().toISOString() });
      }
    });
    if (newTx.length > 0) {
      const updated = { ...data, transactions: [...newTx, ...data.transactions], recurring: data.recurring.map(r => ({ ...r, lastRun: today })) };
      sv(updated);
    }
  }, [data.recurring]);

  const sv = useCallback(async nd => { setData(nd); try { await window.storage.set(sKey(curUid), JSON.stringify(nd)); } catch (e) { } }, [curUid]);
  const swUser = async id => { try { await window.storage.set(sKey(curUid), JSON.stringify(data)); } catch (e) { } setCurUid(id); try { await window.storage.set("fin-cur-v5", id); } catch (e) { } try { const r = await window.storage.get(sKey(id)); if (r && r.value) { const p = JSON.parse(r.value); setData({ ...DD, ...p, settings: { ...DD.settings, ...(p.settings || {}) } }); } else setData(DD); } catch (e) { setData(DD); } setView("dashboard"); setSub(null); };
  const svUsers = async nu => { setUsers(nu); try { await window.storage.set("fin-users-v5", JSON.stringify(nu)); } catch (e) { } };

  const showToast = (msg, undo) => { setToast({ msg, undo }); setTimeout(() => setToast(null), 4000); };

  // Data operations
  const addTx = t => sv({ ...data, transactions: [{ ...t, id: uid(), date: t.date || new Date().toISOString() }, ...data.transactions] });
  const delTx = id => { const tx = data.transactions.find(t => t.id === id); const nd = { ...data, transactions: data.transactions.filter(t => t.id !== id) }; sv(nd); if (tx) showToast(`"${tx.description}" eliminado`, () => sv({ ...nd, transactions: [tx, ...nd.transactions] })); };
  const editTx = (id, u) => sv({ ...data, transactions: data.transactions.map(t => t.id === id ? { ...t, ...u } : t) });
  const addGoal = g => sv({ ...data, goals: [...data.goals, { ...g, id: uid(), saved: 0 }] });
  const updGoal = (id, u) => sv({ ...data, goals: data.goals.map(g => g.id === id ? { ...g, ...u } : g) });
  const delGoal = id => sv({ ...data, goals: data.goals.filter(g => g.id !== id) });
  const addDebt = d => sv({ ...data, debts: [...data.debts, { ...d, id: uid(), paid: 0 }] });
  const updDebt = (id, u) => sv({ ...data, debts: data.debts.map(d => d.id === id ? { ...d, ...u } : d) });
  const delDebt = id => sv({ ...data, debts: data.debts.filter(d => d.id !== id) });
  const updBudget = (cid, lim) => { const b = [...data.budgets]; const i = b.findIndex(x => x.category === cid); if (i >= 0) b[i].limit = lim; else b.push({ id: cid, category: cid, limit: lim }); sv({ ...data, budgets: b }); };
  const addRem = r => sv({ ...data, reminders: [...data.reminders, { ...r, id: uid(), paid: false }] });
  const delRem = id => sv({ ...data, reminders: data.reminders.filter(r => r.id !== id) });
  const togRem = id => sv({ ...data, reminders: data.reminders.map(r => r.id === id ? { ...r, paid: !r.paid } : r) });
  const addInv = i => sv({ ...data, investments: [...data.investments, { ...i, id: uid() }] });
  const updInv = (id, u) => sv({ ...data, investments: data.investments.map(i => i.id === id ? { ...i, ...u } : i) });
  const delInv = id => sv({ ...data, investments: data.investments.filter(i => i.id !== id) });
  const addAsset = a => sv({ ...data, assets: [...data.assets, { ...a, id: uid() }] });
  const delAsset = id => sv({ ...data, assets: data.assets.filter(a => a.id !== id) });
  const uSt = s => sv({ ...data, settings: { ...data.settings, ...s } });
  const uRet = r => sv({ ...data, retirementPlan: { ...data.retirementPlan, ...r } });
  // Products
  const addProd = p => sv({ ...data, products: [...(data.products || []), { ...p, id: uid(), sold: 0 }] });
  const delProd = id => sv({ ...data, products: (data.products || []).filter(p => p.id !== id) });
  const logSale = (pid, qty) => { const prod = (data.products || []).find(p => p.id === pid); if (!prod || qty <= 0) return; const sl = { id: uid(), productId: pid, productName: prod.name, qty, revenue: qty * prod.sellPrice, cost: qty * prod.costPrice, profit: qty * (prod.sellPrice - prod.costPrice), date: new Date().toISOString() }; sv({ ...data, products: (data.products || []).map(p => p.id === pid ? { ...p, stock: Math.max(0, p.stock - qty), sold: (p.sold || 0) + qty } : p), salesLog: [sl, ...(data.salesLog || [])] }); };
  const restock = (id, qty, tc) => sv({ ...data, products: (data.products || []).map(p => p.id === id ? { ...p, stock: p.stock + qty, costPrice: tc > 0 ? Math.round(tc / qty) : p.costPrice } : p) });
  const rstSales = id => sv({ ...data, products: (data.products || []).map(p => p.id === id ? { ...p, sold: 0 } : p), salesLog: (data.salesLog || []).filter(s => s.productId !== id) });
  const delSale = sid => { const sl = (data.salesLog || []).find(s => s.id === sid); if (!sl) return; sv({ ...data, products: (data.products || []).map(p => p.id === sl.productId ? { ...p, sold: Math.max(0, (p.sold || 0) - sl.qty), stock: p.stock + sl.qty } : p), salesLog: (data.salesLog || []).filter(s => s.id !== sid) }); };
  // Tickets
  const addTicket = t => sv({ ...data, tickets: [{ ...t, id: uid(), date: new Date().toISOString() }, ...(data.tickets || [])] });
  const delTicket = id => sv({ ...data, tickets: (data.tickets || []).filter(t => t.id !== id) });
  // Recurring
  const addRecurring = r => sv({ ...data, recurring: [...(data.recurring || []), { ...r, id: uid() }] });
  const delRecurring = id => sv({ ...data, recurring: (data.recurring || []).filter(r => r.id !== id) });
  // Export
  const exportData = () => { const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `misfinanzas-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(url); sv({ ...data, exported: true }); showToast("Datos exportados correctamente ✅"); };
  const importData = file => { const reader = new FileReader(); reader.onload = e => { try { const imported = JSON.parse(e.target.result); sv({ ...DD, ...imported, settings: { ...DD.settings, ...(imported.settings || {}) } }); showToast("Datos importados correctamente ✅"); } catch (err) { showToast("Error al importar ❌"); } }; reader.readAsText(file); };

  // Computed
  const pr = pRange(fPer);
  const ptx = data.transactions.filter(t => { const d = new Date(t.date); return d >= pr.s && d <= pr.e; });
  const tInc = ptx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const tExp = ptx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const bal = tInc - tExp;
  const sr = tInc > 0 ? ((tInc - tExp) / tInc * 100) : 0;
  const eByCat = CATS.map(c => ({ ...c, total: ptx.filter(t => t.type === "expense" && t.category === c.id).reduce((s, t) => s + t.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const l4w = Array.from({ length: 4 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i * 7); const r = wRange(d); const wt = data.transactions.filter(t => { const td = new Date(t.date); return td >= r.s && td <= r.e; }); return { name: `S${4 - i}`, ingresos: wt.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), gastos: wt.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) }; }).reverse();
  const hm = useMemo(() => Array.from({ length: 21 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (20 - i)); d.setHours(0, 0, 0, 0); const end = new Date(d); end.setHours(23, 59, 59, 999); return { date: new Date(d), spent: data.transactions.filter(t => t.type === "expense" && new Date(t.date) >= d && new Date(t.date) <= end).reduce((s, t) => s + t.amount, 0) }; }), [data.transactions]);
  const maxH = Math.max(...hm.map(d => d.spent), 1);
  const fHist = data.transactions.filter(t => { const ms = !search || (t.description || "").toLowerCase().includes(search.toLowerCase()); const mc = fCat === "all" || t.category === fCat; return ms && mc; });
  const medals = MEDALS.filter(m => m.ck(data));
  const hid = v => hide ? "••••" : v;
  const curUser = users.find(u => u.id === curUid) || users[0] || DU[0];
  const ticketTotal = (data.tickets || []).reduce((s, t) => s + (t.total || 0), 0);

  const navs = [{ id: "dashboard", e: "🏠", l: "Inicio" }, { id: "history", e: "📋", l: "Historial" }, { id: "budgets", e: "💳", l: "Presup." }, { id: "goals", e: "🎯", l: "Metas" }, { id: "debts", e: "💸", l: "Deudas" }, { id: "invest", e: "📈", l: "Inversión" }, { id: "tickets", e: "🧾", l: "Tickets" }, { id: "more", e: "⚙️", l: "Más" }];

  /* ═══════════ SHARED UI ═══════════ */
  const Btn = ({ onClick, c, ch, lbl }) => (<button onClick={onClick} style={{ background: c || T.ac, color: "#fff", border: "none", borderRadius: 10, padding: "7px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{ch}{lbl}</button>);
  const SBtn = ({ onClick, c, ch }) => (<button onClick={onClick} style={{ background: `${c}20`, color: c, border: "none", borderRadius: 7, padding: "5px 8px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 2 }}>{ch}</button>);
  const Cd = ({ title, action, glow, children }) => (<div style={{ background: T.card, borderRadius: 14, padding: 13, border: `1px solid ${T.cb}`, animation: "fadeIn 0.3s", boxShadow: glow ? `0 0 15px ${T.ac}20` : "none", marginBottom: 1 }}>{title && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>{title}</h3>{action}</div>}{children}</div>);
  const Pl = ({ active, onClick, children }) => (<button onClick={onClick} style={{ padding: "5px 10px", borderRadius: 20, border: "none", background: active ? T.pa : T.pill, color: active ? "#fff" : T.pt, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap", fontWeight: active ? 600 : 400 }}>{children}</button>);
  const PB = ({ value, color }) => (<div style={{ height: 6, background: T.bar, borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color || "#22C55E", borderRadius: 3, transition: "width 0.5s" }} /></div>);
  const TxR = ({ t }) => { const cat = CATS.find(c => c.id === t.category); return (<div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: `1px solid ${T.cb}20` }}><div style={{ width: 32, height: 32, borderRadius: 9, background: t.type === "income" ? "#22C55E25" : ((cat && cat.color) || "#B0BEC5") + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{t.type === "income" ? "💵" : (cat ? cat.icon : "📦")}</div><div style={{ flex: 1, minWidth: 0 }}><p style={{ margin: 0, fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</p><p style={{ margin: 0, fontSize: 10, color: T.ts }}>{cat ? cat.name : ""} · {new Date(t.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}</p></div><span style={{ fontSize: 13, fontWeight: 600, color: t.type === "income" ? "#22C55E" : T.text }}>{t.type === "income" ? "+" : "-"}{hide ? "••" : $(t.amount)}</span></div>); };
  const Ov = ({ children, onClose }) => (<div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}><div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: "20px 20px 0 0", padding: "20px 18px 28px", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", color: T.text, animation: "slideUp 0.3s" }}>{children}</div></div>);
  const MH = ({ title, onClose }) => (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h3><button onClick={onClose} style={{ background: T.pill, border: "none", borderRadius: 10, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.ts }}><X size={16} /></button></div>);
  const Inp = ({ label, ...p }) => (<div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, fontWeight: 500, color: T.ts, marginBottom: 3, display: "block" }}>{label}</label><input {...p} style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 10, border: `1px solid ${T.cb}`, fontSize: 13, background: T.card, color: T.text, outline: "none", ...p.style }} /></div>);

  /* ═══════════ RENDER ═══════════ */
  return (
    <div style={{ fontFamily: "'Segoe UI',system-ui,sans-serif", background: T.bg, height: "100vh", color: T.text, display: "flex", flexDirection: "column", overflow: "hidden", backgroundImage: deco ? T.pat : "none" }}>
      <style>{`::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:${T.ac}40;border-radius:4px}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes float0{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-15px) rotate(10deg)}}@keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px) rotate(-8deg)}}`}</style>
      {deco && <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.1 }}>{T.deco.map((e, i) => (<span key={i} style={{ position: "absolute", fontSize: 18 + i * 6, top: `${15 + i * 20}%`, right: `${5 + i * 12}%`, animation: `float${i % 2} ${4 + i * 2}s ease-in-out infinite` }}>{e}</span>))}</div>}

      {/* TOAST */}
      {toast && <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: T.card, border: `1px solid ${T.cb}`, borderRadius: 12, padding: "10px 16px", zIndex: 200, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", animation: "fadeIn 0.3s" }}><span style={{ fontSize: 13 }}>{toast.msg}</span>{toast.undo && <button onClick={() => { toast.undo(); setToast(null); }} style={{ background: T.ac, color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Deshacer</button>}</div>}

      {/* QUICK ADD */}
      {quickAdd && <Ov onClose={() => setQuickAdd(false)}><MH title="⚡ Gasto rápido" onClose={() => setQuickAdd(false)} /><QuickExpense onAdd={t => { addTx(t); setQuickAdd(false); }} T={T} Inp={Inp} /></Ov>}

      {/* HEADER */}
      <header style={{ flexShrink: 0, padding: lv ? "14px 14px" : "10px 14px", background: dk ? T.card : T.bg, borderBottom: `1px solid ${T.cb}`, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10, position: "relative" }}>
        <div>
          <h1 style={{ fontSize: lv ? 24 : 17, fontWeight: 800, margin: 0 }}><span style={{ color: T.text }}>mis</span><span style={{ color: T.ac }}>finanzas</span><span style={{ fontSize: 8, color: T.ts, marginLeft: 4, verticalAlign: "super" }}>PRO</span>{deco && <span style={{ marginLeft: 3 }}>{T.deco[0]}</span>}</h1>
          <p style={{ fontSize: lv ? 12 : 9, color: T.ts, margin: 0 }}>{new Date().toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}</p>
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <button onClick={() => setModal("users")} style={{ display: "flex", alignItems: "center", gap: 3, background: T.pill, border: "none", borderRadius: 10, padding: "5px 8px", cursor: "pointer", color: T.text }}><span style={{ fontSize: 14 }}>{curUser.emoji}</span><span style={{ fontSize: 10, fontWeight: 600, maxWidth: 45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{curUser.name}</span></button>
          <button onClick={() => uSt({ hideBalances: !hide })} style={{ background: T.pill, color: T.ts, border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>{hide ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          <button onClick={() => setModal("theme")} style={{ background: T.pill, color: T.ts, border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Palette size={14} /></button>
          <button onClick={() => setModal("add")} style={{ background: T.ac, color: "#fff", border: "none", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={16} /></button>
        </div>
      </header>

      {/* BODY */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* NAV */}
        <nav style={{ flexShrink: 0, width: lv ? 66 : 50, background: T.nav, borderRight: `1px solid ${T.cb}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0", overflowY: "auto", gap: 1 }}>
          {navs.map(n => (
            <button key={n.id} onClick={() => { setView(n.id); if (n.id !== "more") setSub(null); }} style={{ background: view === n.id ? T.ab : "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: lv ? "8px 3px" : "6px 3px", borderRadius: 10, color: view === n.id ? T.ac : T.ts, width: lv ? 58 : 42, borderLeft: view === n.id ? `3px solid ${T.ac}` : "3px solid transparent" }}>
              <span style={{ fontSize: lv ? 17 : 14 }}>{n.e}</span>
              <span style={{ fontSize: lv ? 8 : 7, fontWeight: view === n.id ? 700 : 400 }}>{n.l}</span>
            </button>
          ))}
        </nav>

        {/* CONTENT */}
        <main style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          <div style={{ padding: "12px 12px 24px", zoom: lv ? 1.4 : 1 }}>
            {view === "dashboard" && <DashView />}
            {view === "history" && <HistView />}
            {view === "budgets" && <BudgView />}
            {view === "goals" && <GoalsView />}
            {view === "debts" && <DebtsView />}
            {view === "invest" && <InvestView />}
            {view === "tickets" && <TicketsView />}
            {view === "more" && !sub && <MoreView />}
            {view === "more" && sub === "business" && <BizView />}
            {view === "more" && sub === "loan" && <LoanView />}
            {view === "more" && sub === "edu" && <EduView />}
            {view === "more" && sub === "rem" && <RemView />}
            {view === "more" && sub === "medals" && <MedView />}
            {view === "more" && sub === "ret" && <RetView />}
            {view === "more" && sub === "settings" && <SetView />}
          </div>
        </main>
      </div>

      {/* FLOATING QUICK BUTTON */}
      <button onClick={() => setQuickAdd(true)} style={{ position: "fixed", bottom: 20, right: 16, width: 50, height: 50, borderRadius: 25, background: T.ac, color: "#fff", border: "none", boxShadow: `0 4px 15px ${T.ac}50`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}><Zap size={22} /></button>

      {/* MODALS */}
      {modal === "add" && <AddTxMod />}
      {modal === "theme" && <ThemeMod />}
      {modal === "users" && <UsersMod />}
      {modal === "addGoal" && <SimpleModal title="Nueva meta" fields={[{ k: "name", l: "¿Para qué?", t: "text" }, { k: "target", l: "¿Cuánto?", t: "number" }]} onSave={v => { addGoal({ name: v.name, target: Number(v.target), icon: "🎯" }); setModal(null); }} />}
      {modal === "addDebt" && <SimpleModal title="Nueva deuda" fields={[{ k: "name", l: "Concepto", t: "text" }, { k: "creditor", l: "¿A quién?", t: "text" }, { k: "amount", l: "Monto", t: "number" }, { k: "interestRate", l: "Interés anual %", t: "number" }]} onSave={v => { addDebt({ name: v.name, creditor: v.creditor, amount: Number(v.amount), interestRate: Number(v.interestRate) || 0 }); setModal(null); }} />}
      {modal === "addRem" && <SimpleModal title="Recordatorio" fields={[{ k: "name", l: "Nombre", t: "text" }, { k: "amount", l: "Monto", t: "number" }, { k: "dayOfMonth", l: "Día del mes", t: "number" }]} onSave={v => { addRem({ name: v.name, amount: Number(v.amount), dayOfMonth: Number(v.dayOfMonth) }); setModal(null); }} />}
      {modal === "addInv" && <SimpleModal title="Inversión" fields={[{ k: "name", l: "Nombre", t: "text" }, { k: "invested", l: "Monto", t: "number" }, { k: "type", l: "Tipo", t: "text" }]} onSave={v => { addInv({ name: v.name, invested: Number(v.invested), currentValue: Number(v.invested), type: v.type || "Otro", platform: "" }); setModal(null); }} />}
      {modal === "addProd" && <SimpleModal title="Producto" fields={[{ k: "name", l: "Nombre", t: "text" }, { k: "sellPrice", l: "Precio venta", t: "number" }, { k: "costPrice", l: "Costo", t: "number" }, { k: "stock", l: "Stock", t: "number" }]} onSave={v => { addProd({ name: v.name, sellPrice: Number(v.sellPrice), costPrice: Number(v.costPrice) || 0, stock: Number(v.stock) || 0 }); setModal(null); }} btnColor="#F0A500" />}
      {modal === "addRecurring" && <SimpleModal title="Trans. recurrente" fields={[{ k: "description", l: "Descripción", t: "text" }, { k: "amount", l: "Monto", t: "number" }, { k: "dayOfMonth", l: "Día del mes", t: "number" }]} onSave={v => { addRecurring({ description: v.description, amount: Number(v.amount), type: "expense", category: "otro", freq: "monthly", dayOfMonth: Number(v.dayOfMonth) || 1 }); setModal(null); }} />}
      {modal === "addTicket" && <AddTicketMod />}
      {(modal || "").startsWith("sell-") && <SellMod pid={modal.split("-")[1]} />}
      {(modal || "").startsWith("restock-") && <RestockMod pid={modal.split("-")[1]} />}
      {(modal || "").startsWith("qa-") && <QAMod id={modal.split("-").slice(1).join("-")} />}
    </div>
  );

  /* ═══════════ INNER COMPONENTS ═══════════ */

  function QuickExpense({ onAdd, T: th, Inp: I }) {
    const [am, setAm] = useState(""); const [ds, setDs] = useState(""); const [cat, setCat] = useState("comida");
    return (<div>
      <I label="Monto" type="number" value={am} onChange={e => setAm(e.target.value)} style={{ fontSize: 22, fontWeight: 700, textAlign: "center", color: "#FF6B6B" }} />
      <I label="¿En qué?" value={ds} onChange={e => setDs(e.target.value)} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>{CATS.slice(0, 8).map(c => (<button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "4px 8px", borderRadius: 8, border: cat === c.id ? `2px solid ${c.color}` : `1px solid ${th.cb}`, background: cat === c.id ? `${c.color}15` : "transparent", cursor: "pointer", fontSize: 11, color: th.text }}>{c.icon}</button>))}</div>
      <button onClick={() => { if (am && ds) onAdd({ type: "expense", amount: Number(am), description: ds, category: cat, method: "efectivo" }); }} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: "#FF6B6B", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Registrar −</button>
    </div>);
  }

  function DashView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 5 }}>{[["week", "Sem"], ["quincena", "Qna"], ["month", "Mes"]].map(([k, v]) => (<Pl key={k} active={fPer === k} onClick={() => setFPer(k)}>{v}</Pl>))}</div>
      <div style={{ background: dk ? `linear-gradient(135deg,${T.card},${T.bg})` : `linear-gradient(135deg,${T.ac}15,${T.bg})`, borderRadius: 18, padding: 18, border: `1px solid ${T.cb}` }}>
        <p style={{ fontSize: 11, color: T.ts, margin: "0 0 2px" }}>Balance {deco && T.deco[2]}</p>
        <p style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", color: bal >= 0 ? T.ac : "#FF6B6B" }}>{hid($(bal))}</p>
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <div><div style={{ display: "flex", alignItems: "center", gap: 3 }}><ArrowUpRight size={12} color="#22C55E" /><span style={{ fontSize: 10, color: T.ts }}>Ingresos</span></div><p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#22C55E" }}>{hid($(tInc))}</p></div>
          <div><div style={{ display: "flex", alignItems: "center", gap: 3 }}><ArrowDownRight size={12} color="#FF6B6B" /><span style={{ fontSize: 10, color: T.ts }}>Gastos</span></div><p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#FF6B6B" }}>{hid($(tExp))}</p></div>
        </div>
      </div>
      <div style={{ background: T.ab, borderRadius: 12, padding: "10px 12px", display: "flex", gap: 8, border: `1px solid ${T.ac}20` }}><span style={{ fontSize: 16 }}>💡</span><p style={{ margin: 0, fontSize: 12, color: T.ts, lineHeight: 1.5 }}>{TIPS[new Date().getDate() % TIPS.length]}</p></div>
      {eByCat.length > 0 && <Cd title="Gastos"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 85, height: 85, flexShrink: 0 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={eByCat} dataKey="total" cx="50%" cy="50%" innerRadius={20} outerRadius={40} strokeWidth={2} stroke={T.card}>{eByCat.map((e, i) => (<Cell key={i} fill={e.color} />))}</Pie></PieChart></ResponsiveContainer></div><div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>{eByCat.slice(0, 5).map(c => (<div key={c.id} style={{ display: "flex", justifyContent: "space-between" }}><div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} /><span style={{ fontSize: 11, color: T.ts }}>{c.icon} {c.name}</span></div><span style={{ fontSize: 11, fontWeight: 600 }}>{hid($(c.total))}</span></div>))}</div></div></Cd>}
      <Cd title="Semanal"><ResponsiveContainer width="100%" height={100}><BarChart data={l4w} barGap={2}><XAxis dataKey="name" tick={{ fontSize: 10, fill: T.ts }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip contentStyle={{ borderRadius: 10, border: "none", background: T.card, color: T.text, fontSize: 11 }} formatter={v => hide ? "••" : $(v)} /><Bar dataKey="ingresos" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={14} /><Bar dataKey="gastos" fill="#FF6B6B" radius={[4, 4, 0, 0]} barSize={14} /></BarChart></ResponsiveContainer></Cd>
      <Cd title="Últimos" action={<button onClick={() => setView("history")} style={{ background: "none", border: "none", color: T.ac, fontSize: 11, cursor: "pointer" }}>Ver todo →</button>}>{ptx.length === 0 ? <p style={{ textAlign: "center", color: T.ts, fontSize: 13 }}>Sin movimientos</p> : ptx.slice(0, 5).map(t => (<TxR key={t.id} t={t} />))}</Cd>
      {(data.tickets || []).length > 0 && <Cd title="🧾 Tickets recientes">{(data.tickets || []).slice(0, 3).map(t => (<div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.cb}20`, fontSize: 12 }}><span>{t.store || "Ticket"} {t.photo && "📸"}</span><span style={{ fontWeight: 600, color: "#FF6B6B" }}>{$(t.total)}</span></div>))}<p style={{ fontSize: 11, color: T.ts, margin: "6px 0 0" }}>Total en tickets: <strong>{$(ticketTotal)}</strong></p></Cd>}
    </div>);
  }

  function HistView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📋 Historial</h2>
      <div style={{ position: "relative" }}><Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: T.ts }} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px 10px 34px", borderRadius: 12, border: `1px solid ${T.cb}`, background: T.card, fontSize: 13, color: T.text, outline: "none" }} /></div>
      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}><Pl active={fCat === "all"} onClick={() => setFCat("all")}>Todos</Pl>{CATS.map(c => (<Pl key={c.id} active={fCat === c.id} onClick={() => setFCat(c.id)}>{c.icon}</Pl>))}</div>
      {fHist.length === 0 ? <p style={{ textAlign: "center", color: T.ts }}>Sin movimientos</p> : fHist.slice(0, 50).map(t => (<div key={t.id} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ flex: 1 }}><TxR t={t} /></div><button onClick={() => delTx(t.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 3 }}><Trash2 size={13} /></button></div>))}
    </div>);
  }

  function BudgView() {
    const [ed, setEd] = useState(null); const [v, setV] = useState("");
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>💳 Presupuestos</h2>
      {CATS.map(cat => { const lim = data.budgets.find(b => b.category === cat.id); const limit = lim ? lim.limit : 0; const sp = ptx.filter(t => t.type === "expense" && t.category === cat.id).reduce((s, t) => s + t.amount, 0); const p = pc(sp, limit); const over = sp > limit && limit > 0;
        return (<Cd key={cat.id}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: limit > 0 ? 8 : 0 }}><span style={{ fontSize: 13, fontWeight: 500 }}>{cat.icon} {cat.name}</span>{ed === cat.id ? <div style={{ display: "flex", gap: 4, alignItems: "center" }}><input type="number" value={v} onChange={e => setV(e.target.value)} autoFocus style={{ width: 80, padding: "4px 8px", borderRadius: 8, border: `1px solid ${T.cb}`, fontSize: 12, background: T.card, color: T.text, outline: "none" }} /><SBtn onClick={() => { updBudget(cat.id, Number(v)); setEd(null); }} c={T.ac} ch="✓" /></div> : <button onClick={() => { setEd(cat.id); setV(limit.toString()); }} style={{ background: "none", border: "none", color: T.ts, cursor: "pointer", fontSize: 12 }}>{limit > 0 ? $(limit) : "Definir"} ✏️</button>}</div>{limit > 0 && <><PB value={p} color={over ? "#ef4444" : p > 75 ? "#f59e0b" : "#22C55E"} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}><span style={{ fontSize: 10, color: over ? "#ef4444" : T.ts }}>{$(sp)}</span><span style={{ fontSize: 10, color: T.ts }}>{Math.round(p)}%</span></div></>}</Cd>);
      })}
    </div>);
  }

  function GoalsView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🎯 Metas</h2><Btn onClick={() => setModal("addGoal")} ch={<Plus size={14} />} lbl="Nueva" /></div>
      {data.goals.length === 0 ? <p style={{ textAlign: "center", color: T.ts }}>¡Crea tu primera meta!</p> : data.goals.map(g => { const p = pc(g.saved, g.target); return (<Cd key={g.id} glow={p >= 100}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{g.icon || "🎯"} {g.name}</p><p style={{ margin: "2px 0 0", fontSize: 11, color: T.ts }}>{$(g.saved)} / {$(g.target)}</p></div><div style={{ display: "flex", gap: 4 }}><SBtn onClick={() => setModal(`qa-goal-${g.id}`)} c={T.ac} ch="+ Abonar" /><SBtn onClick={() => delGoal(g.id)} c="#ef4444" ch={<Trash2 size={12} />} /></div></div><PB value={p} color={p >= 100 ? "#22C55E" : "#45B7D1"} /><p style={{ margin: "4px 0 0", fontSize: 10, color: T.ts, textAlign: "right" }}>{p >= 100 ? "🎉 ¡Cumplida!" : `${Math.round(p)}%`}</p></Cd>); })}
    </div>);
  }

  function DebtsView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>💸 Deudas</h2><Btn onClick={() => setModal("addDebt")} ch={<Plus size={14} />} lbl="" /></div>
      {data.debts.length > 1 && <Cd title="💡 Estrategia"><p style={{ fontSize: 12, color: T.ts, margin: 0, lineHeight: 1.6 }}><strong>Avalancha:</strong> Paga primero "{data.debts.filter(d => d.paid < d.amount).sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0]?.name}" ({data.debts.filter(d => d.paid < d.amount).sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))[0]?.interestRate || 0}% interés) para ahorrar más.<br /><strong>Bola de nieve:</strong> Paga primero "{data.debts.filter(d => d.paid < d.amount).sort((a, b) => (a.amount - a.paid) - (b.amount - b.paid))[0]?.name}" (${$(Math.max((data.debts.filter(d => d.paid < d.amount).sort((a, b) => (a.amount - a.paid) - (b.amount - b.paid))[0]?.amount || 0) - (data.debts.filter(d => d.paid < d.amount).sort((a, b) => (a.amount - a.paid) - (b.amount - b.paid))[0]?.paid || 0), 0))}) para motivarte rápido.</p></Cd>}
      {data.debts.map(d => { const p = pc(d.paid, d.amount); return (<Cd key={d.id}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{d.name}</p><p style={{ margin: "2px 0", fontSize: 11, color: T.ts }}>{d.creditor}{d.interestRate > 0 ? ` · ${d.interestRate}%` : ""}</p></div><div style={{ display: "flex", gap: 4 }}><SBtn onClick={() => setModal(`qa-debt-${d.id}`)} c={T.ac} ch="Abonar" /><SBtn onClick={() => delDebt(d.id)} c="#ef4444" ch={<Trash2 size={12} />} /></div></div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.ts, marginBottom: 4 }}><span>{$(d.paid)}</span><span>Resta: {$(Math.max(d.amount - d.paid, 0))}</span></div><PB value={p} color={p >= 100 ? "#22C55E" : "#45B7D1"} /></Cd>); })}
    </div>);
  }

  function InvestView() {
    const ti = data.investments.reduce((s, i) => s + i.invested, 0);
    const tc = data.investments.reduce((s, i) => s + (i.currentValue || i.invested), 0);
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📈 Inversiones</h2><Btn onClick={() => setModal("addInv")} ch={<Plus size={14} />} lbl="" /></div>
      <Cd glow><div style={{ display: "flex", justifyContent: "space-between" }}><div><p style={{ fontSize: 11, color: T.ts, margin: 0 }}>Total</p><p style={{ fontSize: 20, fontWeight: 700, margin: "2px 0" }}>{hid($(tc))}</p></div><div style={{ textAlign: "right" }}><p style={{ fontSize: 11, color: T.ts, margin: 0 }}>Rendimiento</p><p style={{ fontSize: 16, fontWeight: 600, margin: "2px 0", color: tc - ti >= 0 ? "#22C55E" : "#ef4444" }}>{tc - ti >= 0 ? "+" : ""}{hid($(tc - ti))}</p></div></div></Cd>
      {data.investments.map(inv => (<Cd key={inv.id}><div style={{ display: "flex", justifyContent: "space-between" }}><div><p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{inv.name}</p><p style={{ margin: "2px 0", fontSize: 11, color: T.ts }}>{inv.type}</p></div><div style={{ display: "flex", gap: 4 }}><SBtn onClick={() => setModal(`qa-inv-${inv.id}`)} c={T.ac} ch="Actualizar" /><SBtn onClick={() => delInv(inv.id)} c="#ef4444" ch={<Trash2 size={12} />} /></div></div></Cd>))}
    </div>);
  }

  function TicketsView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🧾 Tickets</h2><Btn onClick={() => setModal("addTicket")} ch={<Camera size={14} />} lbl="Nuevo" /></div>
      {ticketTotal > 0 && <Cd><div style={{ textAlign: "center" }}><p style={{ fontSize: 11, color: T.ts, margin: 0 }}>Total gastado en tickets</p><p style={{ fontSize: 22, fontWeight: 700, margin: "4px 0", color: "#FF6B6B" }}>{$(ticketTotal)}</p></div></Cd>}
      {(data.tickets || []).length === 0 ? <p style={{ textAlign: "center", color: T.ts }}>Sube tu primer ticket con foto 📸</p> : (data.tickets || []).map(t => (
        <Cd key={t.id}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t.store || "Ticket"}</p><p style={{ margin: "2px 0", fontSize: 11, color: T.ts }}>{new Date(t.date).toLocaleDateString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 16, fontWeight: 700, color: "#FF6B6B" }}>{$(t.total)}</span><SBtn onClick={() => delTicket(t.id)} c="#ef4444" ch={<Trash2 size={12} />} /></div>
          </div>
          {t.photo && <img src={t.photo} alt="ticket" style={{ width: "100%", borderRadius: 10, marginBottom: 8, maxHeight: 200, objectFit: "cover" }} />}
          {t.items && t.items.length > 0 && <div>{t.items.map((it, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${T.cb}20`, fontSize: 12 }}><span>{it.name}</span><span style={{ fontWeight: 600 }}>{$(it.price)}</span></div>))}</div>}
          {t.notes && <p style={{ fontSize: 11, color: T.ts, margin: "6px 0 0", fontStyle: "italic" }}>{t.notes}</p>}
        </Cd>
      ))}
    </div>);
  }

  function MoreView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>⚙️ Más</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[{ id: "business", l: "Mi Negocio", i: "🧁" }, { id: "loan", l: "Préstamos", i: "🧮" }, { id: "edu", l: "Guía", i: "📚" }, { id: "rem", l: "Recordatorios", i: "🔔" }, { id: "medals", l: "Logros", i: "🏅" }, { id: "ret", l: "Jubilación", i: "🏖️" }, { id: "settings", l: "Ajustes", i: "⚙️" }].map(it => (<button key={it.id} onClick={() => setSub(it.id)} style={{ background: T.card, border: `1px solid ${T.cb}`, borderRadius: 16, padding: 18, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}><span style={{ fontSize: 26 }}>{it.i}</span><span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{it.l}</span></button>))}
      </div>
    </div>);
  }

  function BizView() {
    const prods = data.products || []; const sales = data.salesLog || [];
    const tdS = sales.filter(x => new Date(x.date).toDateString() === new Date().toDateString());
    const tdR = tdS.reduce((s, x) => s + x.revenue, 0);
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🧁 Negocio</h2><Btn onClick={() => setModal("addProd")} c="#F0A500" ch={<Plus size={14} />} lbl="" /></div>
      <div style={{ background: dk ? `linear-gradient(135deg,${T.card},${T.bg})` : "linear-gradient(135deg,#F0A500,#FF6B6B)", borderRadius: 16, padding: 16, color: dk ? T.text : "#fff", border: `1px solid ${T.cb}` }}><p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 2px" }}>Hoy</p><p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{$(tdR)}</p></div>
      {prods.map(p => (<Cd key={p.id}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><div><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>🧁 {p.name}</p><p style={{ margin: "2px 0", fontSize: 11, color: T.ts }}>Venta: {$(p.sellPrice)} · Stock: <span style={{ color: p.stock <= 5 ? "#ef4444" : T.text, fontWeight: 700 }}>{p.stock}</span></p></div><SBtn onClick={() => delProd(p.id)} c="#ef4444" ch={<Trash2 size={12} />} /></div>{(p.sold || 0) > 0 && <p style={{ fontSize: 12, color: T.ts, margin: "0 0 8px" }}>Vendidos: {p.sold} pz · <strong style={{ color: "#22C55E" }}>{$((p.sold || 0) * p.sellPrice)}</strong> <button onClick={() => rstSales(p.id)} style={{ background: "#ef444420", border: "none", borderRadius: 6, padding: "2px 6px", cursor: "pointer", color: "#ef4444", fontSize: 10 }}>🗑</button></p>}<div style={{ display: "flex", gap: 6 }}><button onClick={() => setModal(`sell-${p.id}`)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Vender</button><button onClick={() => setModal(`restock-${p.id}`)} style={{ flex: 1, padding: 10, borderRadius: 10, border: "none", background: "#F59E0B15", color: "#F59E0B", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Resurtir</button></div></Cd>))}
    </div>);
  }

  function LoanView() {
    const [am, setAm] = useState("50000"); const [rt, setRt] = useState("12"); const [mo, setMo] = useState("24");
    const P = Number(am) || 0; const r = Number(rt) / 100 / 12; const n = Number(mo) || 1;
    const mp = r > 0 ? P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
    const ti = mp * n - P;
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🧮 Préstamos</h2>
      <Cd>{[{ l: "Monto", v: am, s: setAm }, { l: "Tasa anual %", v: rt, s: setRt }, { l: "Meses", v: mo, s: setMo }].map(f => (<div key={f.l} style={{ marginBottom: 10 }}><label style={{ fontSize: 11, color: T.ts, display: "block", marginBottom: 3 }}>{f.l}</label><input type="number" value={f.v} onChange={e => f.s(e.target.value)} style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.cb}`, fontSize: 14, fontWeight: 700, background: T.card, color: T.text, outline: "none" }} /></div>))}</Cd>
      {P > 0 && <Cd><p style={{ fontSize: 11, color: T.ts, margin: "0 0 4px" }}>Pago mensual</p><p style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{$(mp)}</p><p style={{ fontSize: 12, color: "#FF6B6B", margin: "4px 0 0" }}>Intereses totales: {$(ti)}</p></Cd>}
    </div>);
  }

  function EduView() {
    const [oc, setOc] = useState(null); const [os, setOs] = useState(null);
    const biz = BIZ_TYPES.find(b => b.id === st.bizType) || BIZ_TYPES[0];
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📚 Guía Emprendedor</h2>
      <Cd title="Tu negocio"><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{BIZ_TYPES.map(bt => (<button key={bt.id} onClick={() => uSt({ bizType: bt.id })} style={{ padding: "6px 10px", borderRadius: 10, border: st.bizType === bt.id ? `2px solid ${T.ac}` : `1px solid ${T.cb}`, background: st.bizType === bt.id ? T.ab : "transparent", cursor: "pointer", fontSize: 11, color: T.text }}>{bt.icon} {bt.name}</button>))}</div></Cd>
      {GUIDE.map((ch, ci) => (<Cd key={ci} glow={oc === ci}><button onClick={() => { setOc(oc === ci ? null : ci); setOs(null); }} style={{ background: "none", border: "none", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: 0, color: T.text }}><div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 20 }}>{ch.i}</span><p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>{ch.t}</p></div><ChevronDown size={16} style={{ transform: oc === ci ? "rotate(180deg)" : "none", transition: "0.2s", color: T.ts }} /></button>{oc === ci && <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>{ch.s.map((sec, si) => (<div key={si}><button onClick={() => setOs(os === `${ci}-${si}` ? null : `${ci}-${si}`)} style={{ background: os === `${ci}-${si}` ? T.ab : T.bar, border: "none", width: "100%", padding: "8px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", color: T.text, fontSize: 12, fontWeight: 600 }}>{sec.t}</button>{os === `${ci}-${si}` && <div style={{ padding: "10px 12px", fontSize: 13, lineHeight: 1.8, color: T.ts, background: T.card, borderRadius: "0 0 10px 10px", border: `1px solid ${T.cb}`, borderTop: "none" }}>{sec.c.replace(/\{p\}/g, biz.p)}</div>}</div>))}</div>}</Cd>))}
    </div>);
  }

  function RemView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🔔 Recordatorios</h2><div style={{ display: "flex", gap: 4 }}><Btn onClick={() => setModal("addRem")} ch={<Plus size={14} />} lbl="" /><Btn onClick={() => setModal("addRecurring")} c="#8B5CF6" ch={<RotateCcw size={14} />} lbl="" /></div></div>
      {(data.recurring || []).length > 0 && <Cd title="🔄 Recurrentes">{(data.recurring || []).map(r => (<div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.cb}20` }}><div><p style={{ margin: 0, fontSize: 12, fontWeight: 500 }}>{r.description}</p><p style={{ margin: 0, fontSize: 10, color: T.ts }}>{r.freq} · día {r.dayOfMonth || "-"}</p></div><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{$(r.amount)}</span><button onClick={() => delRecurring(r.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}><Trash2 size={13} /></button></div></div>))}</Cd>}
      {data.reminders.map(r => (<Cd key={r.id}><div style={{ display: "flex", alignItems: "center", gap: 10, opacity: r.paid ? 0.5 : 1 }}><button onClick={() => togRem(r.id)} style={{ width: 22, height: 22, borderRadius: 7, border: r.paid ? "none" : `2px solid ${T.cb}`, background: r.paid ? "#22C55E" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{r.paid && <Check size={13} />}</button><div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 13, fontWeight: 500, textDecoration: r.paid ? "line-through" : "none" }}>{r.name}</p><p style={{ margin: 0, fontSize: 10, color: T.ts }}>Día {r.dayOfMonth}</p></div><span style={{ fontSize: 13, fontWeight: 600 }}>{$(r.amount)}</span><button onClick={() => delRem(r.id)} style={{ background: "none", border: "none", color: T.ts, cursor: "pointer" }}><Trash2 size={13} /></button></div></Cd>))}
    </div>);
  }

  function MedView() {
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🏅 Logros ({medals.length}/{MEDALS.length})</h2>
      <PB value={pc(medals.length, MEDALS.length)} color="#F59E0B" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{MEDALS.map(m => { const e = m.ck(data); return (<Cd key={m.id} glow={e}><div style={{ textAlign: "center", opacity: e ? 1 : 0.3, padding: 4 }}><div style={{ fontSize: 28 }}>{m.icon}</div><p style={{ margin: "4px 0 0", fontSize: 12, fontWeight: 600 }}>{m.name}</p><p style={{ margin: "2px 0 0", fontSize: 10, color: T.ts }}>{m.desc}</p>{e && <span style={{ fontSize: 9, color: "#22C55E", fontWeight: 600 }}>✓</span>}</div></Cd>); })}</div>
    </div>);
  }

  function RetView() {
    const r = data.retirementPlan; const yrs = Math.max(r.retireAge - r.currentAge, 1); const mr = r.annualReturn / 100 / 12; const mo = yrs * 12;
    let proj = r.currentSavings; for (let i = 0; i < mo; i++) proj = proj * (1 + mr) + r.monthlyContribution;
    const mRet = proj * 0.04 / 12; const ok = mRet >= r.monthlyExpense;
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>🏖️ Jubilación</h2>
      <Cd glow={ok}><div style={{ textAlign: "center", padding: 6 }}><p style={{ fontSize: 12, color: T.ts, margin: 0 }}>A los {r.retireAge}</p><p style={{ fontSize: 24, fontWeight: 700, margin: "4px 0", color: "#22C55E" }}>{$(proj)}</p><p style={{ fontSize: 16, fontWeight: 600, margin: 0, color: ok ? "#22C55E" : "#ef4444" }}>{$(mRet)}/mes</p></div></Cd>
      <Cd title="Plan">{[{ l: "Edad actual", k: "currentAge" }, { l: "Retiro", k: "retireAge" }, { l: "Ahorro actual", k: "currentSavings" }, { l: "Aportar/mes", k: "monthlyContribution" }, { l: "Gasto deseado", k: "monthlyExpense" }, { l: "Rendimiento %", k: "annualReturn" }].map(f => (<div key={f.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.cb}` }}><label style={{ fontSize: 12, color: T.ts }}>{f.l}</label><input type="number" value={r[f.k]} onChange={e => uRet({ [f.k]: Number(e.target.value) })} style={{ width: 85, padding: "4px 8px", borderRadius: 8, border: `1px solid ${T.cb}`, textAlign: "right", fontSize: 13, background: T.card, color: T.text, outline: "none" }} /></div>))}</Cd>
    </div>);
  }

  function SetView() {
    const fileRef = useRef(null);
    return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>⚙️ Ajustes</h2>
      <Cd>{[{ l: "Ocultar saldos", k: "hideBalances", v: st.hideBalances }, { l: "👁 Letra grande", k: "lowVision", v: st.lowVision }, { l: "✨ Decoraciones", k: "showDeco", v: st.showDeco !== false }].map(s => (<div key={s.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: `1px solid ${T.cb}` }}><span style={{ fontSize: 13 }}>{s.l}</span><button onClick={() => uSt({ [s.k]: !s.v })} style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: s.v ? T.ac : T.bar, cursor: "pointer", position: "relative" }}><div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: s.v ? 23 : 3, transition: "left 0.2s" }} /></button></div>))}</Cd>
      <Cd title="💾 Backup">
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportData} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#22C55E", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Download size={16} /> Exportar</button>
          <button onClick={() => fileRef.current && fileRef.current.click()} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Upload size={16} /> Importar</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: "none" }} onChange={e => { if (e.target.files[0]) importData(e.target.files[0]); }} />
        </div>
      </Cd>
      <Cd title="Datos"><p style={{ fontSize: 12, color: T.ts, margin: "0 0 8px" }}>{data.transactions.length} mov · {(data.products || []).length} prod · {(data.tickets || []).length} tickets</p><button onClick={() => { sv(DD); showToast("Datos borrados"); }} style={{ background: "#ef444415", color: "#ef4444", border: "none", borderRadius: 10, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600, width: "100%" }}>Borrar todo</button></Cd>
    </div>);
  }

  /* ═══════════ MODALS ═══════════ */
  function AddTxMod() {
    const [ty, setTy] = useState("expense"); const [am, setAm] = useState(""); const [ds, setDs] = useState(""); const [cat, setCat] = useState("comida"); const [mt, setMt] = useState("efectivo");
    return (<Ov onClose={() => setModal(null)}><MH title="Nuevo movimiento" onClose={() => setModal(null)} />
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}><button onClick={() => setTy("expense")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: ty === "expense" ? "#FF6B6B" : T.bar, cursor: "pointer", fontSize: 14, fontWeight: 700, color: ty === "expense" ? "#fff" : T.ts }}>− Gasto</button><button onClick={() => setTy("income")} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: ty === "income" ? "#22C55E" : T.bar, cursor: "pointer", fontSize: 14, fontWeight: 700, color: ty === "income" ? "#fff" : T.ts }}>+ Ingreso</button></div>
      <Inp label="Monto" type="number" value={am} onChange={e => setAm(e.target.value)} style={{ fontSize: 22, fontWeight: 700, textAlign: "center", color: ty === "income" ? "#22C55E" : "#FF6B6B" }} />
      <Inp label="Descripción" value={ds} onChange={e => setDs(e.target.value)} />
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: T.ts, marginBottom: 4, display: "block" }}>Categoría</label><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{CATS.map(c => (<button key={c.id} onClick={() => setCat(c.id)} style={{ padding: "4px 8px", borderRadius: 8, border: cat === c.id ? `2px solid ${c.color}` : `1px solid ${T.cb}`, background: cat === c.id ? `${c.color}15` : "transparent", cursor: "pointer", fontSize: 11, color: T.text }}>{c.icon} {c.name}</button>))}</div></div>
      <div style={{ marginBottom: 12 }}><label style={{ fontSize: 11, color: T.ts, marginBottom: 4, display: "block" }}>Método</label><div style={{ display: "flex", gap: 4 }}>{PAY_METHODS.map(m => (<button key={m.id} onClick={() => setMt(m.id)} style={{ flex: 1, padding: "6px 2px", borderRadius: 8, border: mt === m.id ? `2px solid ${T.text}` : `1px solid ${T.cb}`, background: "transparent", cursor: "pointer", fontSize: 10, textAlign: "center", color: T.text }}>{m.icon}<br />{m.name}</button>))}</div></div>
      <button onClick={() => { if (am && ds) { addTx({ type: ty, amount: Number(am), description: ds, category: cat, method: mt }); setModal(null); } }} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: ty === "income" ? "#22C55E" : "#FF6B6B", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{ty === "income" ? "Registrar +" : "Registrar −"}</button>
    </Ov>);
  }

  function AddTicketMod() {
    const [store, setStore] = useState(""); const [total, setTotal] = useState(""); const [notes, setNotes] = useState(""); const [photo, setPhoto] = useState(null); const [items, setItems] = useState([]);
    const [status, setStatus] = useState(""); // "", "compressing", "scanning", "done", "error"
    const [errMsg, setErrMsg] = useState("");
    const fileRef = useRef(null);

    // Compress image to max 800px wide for faster API calls
    const compressImage = (dataUrl) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > MAX) { h = (h * MAX) / w; w = MAX; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      });
    };

    const analyzeTicket = async (base64img) => {
      setStatus("scanning"); setErrMsg("");
      try {
        const mediaType = "image/jpeg";
        const rawBase64 = base64img.split(",")[1];
        if (!rawBase64 || rawBase64.length < 100) {
          throw new Error("Imagen inválida");
        }

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: [
                { type: "image", source: { type: "base64", media_type: mediaType, data: rawBase64 } },
                { type: "text", text: "Analiza este ticket de compra. Responde UNICAMENTE con un JSON valido, sin markdown, sin backticks, sin texto adicional. Formato: {\"store\":\"nombre tienda\",\"items\":[{\"name\":\"producto\",\"price\":10.50}],\"total\":100.00,\"notes\":\"fecha, metodo pago, etc\"}. Precios como numeros. Si no ves total, suma items." }
              ]
            }]
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error("API error " + response.status + ": " + errText.slice(0, 100));
        }

        const result = await response.json();
        const textBlocks = (result.content || []).filter(b => b.type === "text");
        if (textBlocks.length === 0) throw new Error("Sin respuesta de texto");

        const rawText = textBlocks.map(b => b.text).join("");
        // Try to extract JSON from response
        let jsonStr = rawText.replace(/```json\s?/g, "").replace(/```/g, "").trim();
        // Find first { and last }
        const fi = jsonStr.indexOf("{");
        const li = jsonStr.lastIndexOf("}");
        if (fi === -1 || li === -1) throw new Error("No se encontró JSON en la respuesta");
        jsonStr = jsonStr.slice(fi, li + 1);

        const parsed = JSON.parse(jsonStr);
        if (parsed.store) setStore(parsed.store);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items.map(it => ({ name: String(it.name || ""), price: Number(it.price) || 0 })));
        }
        if (parsed.total) setTotal(String(Number(parsed.total)));
        if (parsed.notes) setNotes(String(parsed.notes));

        setStatus("done");
        showToast("✅ Ticket leído correctamente");
      } catch (err) {
        console.error("Ticket scan error:", err);
        setStatus("error");
        setErrMsg(err.message || "Error desconocido al leer el ticket");
      }
    };

    const handlePhoto = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      setStatus("compressing");
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const raw = ev.target.result;
        const compressed = await compressImage(raw);
        setPhoto(compressed);
        analyzeTicket(compressed);
      };
      reader.readAsDataURL(file);
    };

    const addItem = () => setItems([...items, { name: "", price: 0 }]);
    const updItem = (i, k, v) => { const n = [...items]; n[i][k] = v; setItems(n); };
    const calcTotal = items.reduce((s, it) => s + (Number(it.price) || 0), 0);
    const busy = status === "compressing" || status === "scanning";

    return (<Ov onClose={() => setModal(null)}><MH title="🧾 Escanear Ticket" onClose={() => setModal(null)} />

      {/* PHOTO AREA */}
      <div onClick={() => !busy && fileRef.current && fileRef.current.click()} style={{ border: `2px dashed ${busy ? T.ac : T.cb}`, borderRadius: 14, padding: photo ? 0 : 20, textAlign: "center", cursor: busy ? "wait" : "pointer", marginBottom: 12, background: photo ? "none" : T.bar, overflow: "hidden", position: "relative" }}>
        {photo ? (
          <div style={{ position: "relative" }}>
            <img src={photo} alt="ticket" style={{ width: "100%", borderRadius: 12, maxHeight: 220, objectFit: "cover", opacity: busy ? 0.4 : 1 }} />
            {busy && <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", borderRadius: 12 }}>
              <div style={{ fontSize: 32, animation: "pulse 1s infinite" }}>🤖</div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 8 }}>{status === "compressing" ? "Preparando imagen..." : "Leyendo ticket con IA..."}</p>
              <p style={{ color: "#fff", fontSize: 11, opacity: 0.7, marginTop: 2 }}>Esto toma unos segundos</p>
            </div>}
          </div>
        ) : (
          <div>
            <Camera size={36} color={T.ts} />
            <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 600, color: T.text }}>📸 Toma foto del ticket</p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: T.ts }}>La IA lee automáticamente tienda, productos y precios</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhoto} />
      </div>
      <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.7}}`}</style>

      {/* STATUS MESSAGES */}
      {status === "done" && <div style={{ background: "#22C55E15", border: "1px solid #22C55E40", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}><p style={{ margin: 0, fontSize: 12, color: "#22C55E", fontWeight: 600 }}>✅ ¡Ticket leído! Revisa los datos y guarda</p></div>}
      {status === "error" && <div style={{ background: "#ef444415", border: "1px solid #ef444440", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}><p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>⚠️ {errMsg}</p><button onClick={() => { if (photo) analyzeTicket(photo); }} style={{ background: "#ef4444", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600, marginTop: 8 }}>🔄 Reintentar</button><p style={{ margin: "6px 0 0", fontSize: 10, color: T.ts }}>O llena los datos manualmente abajo</p></div>}

      {/* FORM */}
      <Inp label="Tienda / Lugar" value={store} onChange={e => setStore(e.target.value)} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: T.ts, marginBottom: 4, display: "block" }}>Artículos {items.length > 0 && `(${items.length})`}</label>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
            <input value={it.name} onChange={e => updItem(i, "name", e.target.value)} placeholder="Producto" style={{ flex: 2, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.cb}`, fontSize: 12, background: T.card, color: T.text, outline: "none" }} />
            <input type="number" value={it.price} onChange={e => updItem(i, "price", e.target.value)} placeholder="$" style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: `1px solid ${T.cb}`, fontSize: 12, background: T.card, color: T.text, outline: "none" }} />
            <button onClick={() => setItems(items.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <button onClick={addItem} style={{ background: T.bar, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, color: T.ts }}>+ Agregar artículo</button>
      </div>
      {items.length > 0 && <p style={{ fontSize: 14, fontWeight: 700, textAlign: "right", margin: "0 0 8px" }}>Subtotal: {$(calcTotal)}</p>}
      <Inp label="Total del ticket" type="number" value={total} onChange={e => setTotal(e.target.value)} style={{ fontSize: 20, fontWeight: 700, textAlign: "center", color: "#FF6B6B" }} />
      <Inp label="Notas" value={notes} onChange={e => setNotes(e.target.value)} />
      <button disabled={busy} onClick={() => { if (total || items.length > 0) { addTicket({ store, total: Number(total) || calcTotal, items: items.filter(it => it.name), notes, photo }); setModal(null); } }} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: busy ? T.bar : T.ac, color: busy ? T.ts : "#fff", fontSize: 14, fontWeight: 600, cursor: busy ? "wait" : "pointer" }}>
        {busy ? "Analizando..." : "Guardar Ticket"}
      </button>
    </Ov>);
  }

  function ThemeMod() {
    const [g, setG] = useState(gen);
    const p = g === "women" ? W_THEMES : M_THEMES;
    return (<Ov onClose={() => setModal(null)}><MH title="🎨 Personalizar" onClose={() => setModal(null)} />
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}><button onClick={() => setG("women")} style={{ flex: 1, padding: 11, borderRadius: 12, border: g === "women" ? `2px solid ${T.ac}` : `1px solid ${T.cb}`, background: g === "women" ? "#FFE4F020" : "transparent", cursor: "pointer", fontSize: 14, fontWeight: 700, color: T.text }}>👩 Ella</button><button onClick={() => setG("men")} style={{ flex: 1, padding: 11, borderRadius: 12, border: g === "men" ? `2px solid ${T.ac}` : `1px solid ${T.cb}`, background: g === "men" ? "#1A1A2E20" : "transparent", cursor: "pointer", fontSize: 14, fontWeight: 700, color: T.text }}>👨 Él</button></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>{p.map(t => (<button key={t.id} onClick={() => uSt({ themeId: t.id, themeGender: g })} style={{ padding: 12, borderRadius: 14, border: st.themeId === t.id && gen === g ? `3px solid ${t.ac}` : `1px solid ${t.cb}`, background: t.bg, cursor: "pointer", textAlign: "center" }}><div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 4 }}>{t.deco.map((e, i) => (<span key={i} style={{ fontSize: 13 }}>{e}</span>))}</div><p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: t.text }}>{t.name}</p></button>))}</div>
    </Ov>);
  }

  function UsersMod() {
    const [adding, setAdding] = useState(false); const [nn, setNn] = useState(""); const [ne, setNe] = useState("👤");
    return (<Ov onClose={() => setModal(null)}><MH title="👨‍👩‍👧 Perfiles" onClose={() => setModal(null)} />
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>{users.map(u => (<div key={u.id} onClick={() => { swUser(u.id); setModal(null); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, border: `2px solid ${u.id === curUid ? T.ac : T.cb}`, background: u.id === curUid ? T.ab : T.card, cursor: "pointer" }}><span style={{ fontSize: 24 }}>{u.emoji}</span><div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{u.name}</p>{u.id === curUid && <p style={{ margin: 0, fontSize: 10, color: T.ac }}>✓ Activo</p>}</div></div>))}</div>
      {adding ? <div style={{ background: T.bar, borderRadius: 12, padding: 12 }}><div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>{USER_EMOJIS.map(e => (<button key={e} onClick={() => setNe(e)} style={{ width: 28, height: 28, borderRadius: 8, border: ne === e ? `2px solid ${T.ac}` : `1px solid ${T.cb}`, background: ne === e ? T.ab : "transparent", cursor: "pointer", fontSize: 15 }}>{e}</button>))}</div><input value={nn} onChange={e => setNn(e.target.value)} placeholder="Nombre" style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 10, border: `1px solid ${T.cb}`, fontSize: 13, background: T.card, color: T.text, outline: "none", marginBottom: 8 }} /><button onClick={async () => { if (nn.trim()) { const nu = { id: uid(), name: nn.trim(), emoji: ne }; await svUsers([...users, nu]); await swUser(nu.id); setModal(null); } }} style={{ width: "100%", padding: 10, borderRadius: 10, border: "none", background: T.ac, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Crear</button></div> : <button onClick={() => setAdding(true)} style={{ width: "100%", padding: 12, borderRadius: 12, border: `2px dashed ${T.cb}`, background: "transparent", color: T.ts, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Agregar perfil</button>}
    </Ov>);
  }

  function SimpleModal({ title, fields, onSave, btnColor }) {
    const [vals, setVals] = useState({});
    return (<Ov onClose={() => setModal(null)}><MH title={title} onClose={() => setModal(null)} />
      {fields.map(f => (<Inp key={f.k} label={f.l} type={f.t} value={vals[f.k] || ""} onChange={e => setVals({ ...vals, [f.k]: e.target.value })} />))}
      <button onClick={() => { if (fields.every(f => f.t === "number" || vals[f.k])) onSave(vals); }} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: btnColor || T.ac, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Guardar</button>
    </Ov>);
  }

  function SellMod({ pid }) {
    const [q, setQ] = useState(""); const prod = (data.products || []).find(p => p.id === pid); if (!prod) return null;
    return (<Ov onClose={() => setModal(null)}><MH title={`Vender: ${prod.name}`} onClose={() => setModal(null)} />
      <p style={{ fontSize: 12, color: T.ts, margin: "0 0 8px" }}>Stock: <strong>{prod.stock}</strong></p>
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>{[1, 5, 10, 20].map(x => (<button key={x} onClick={() => setQ(x.toString())} style={{ flex: 1, padding: 8, borderRadius: 8, border: `1px solid ${T.cb}`, background: Number(q) === x ? T.ab : "transparent", cursor: "pointer", fontSize: 13, color: T.text, fontWeight: 600 }}>{x}</button>))}</div>
      <Inp label="Cantidad" type="number" value={q} onChange={e => setQ(e.target.value)} style={{ fontSize: 20, textAlign: "center", fontWeight: 700 }} />
      <button onClick={() => { if (q && Number(q) > 0 && Number(q) <= prod.stock) { logSale(prod.id, Number(q)); setModal(null); } }} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: "#22C55E", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Vender</button>
    </Ov>);
  }

  function RestockMod({ pid }) {
    const [q, setQ] = useState(""); const [tc, setTc] = useState(""); const prod = (data.products || []).find(p => p.id === pid); if (!prod) return null;
    return (<Ov onClose={() => setModal(null)}><MH title={`Resurtir: ${prod.name}`} onClose={() => setModal(null)} />
      <Inp label="Piezas" type="number" value={q} onChange={e => setQ(e.target.value)} />
      <Inp label="Costo total" type="number" value={tc} onChange={e => setTc(e.target.value)} />
      <button onClick={() => { if (q) { restock(prod.id, Number(q), Number(tc) || 0); setModal(null); } }} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: "#F59E0B", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Resurtir</button>
    </Ov>);
  }

  function QAMod({ id }) {
    const [a, setA] = useState("");
    const parts = id.split("-");
    const type = parts[0]; const eid = parts.slice(1).join("-");
    const handleSave = () => {
      const amt = Number(a); if (!amt) return;
      if (type === "goal") { const g = data.goals.find(x => x.id === eid); if (g) updGoal(eid, { saved: g.saved + amt }); }
      else if (type === "debt") { const d = data.debts.find(x => x.id === eid); if (d) updDebt(eid, { paid: d.paid + amt }); }
      else if (type === "inv") updInv(eid, { currentValue: amt });
      setModal(null);
    };
    return (<Ov onClose={() => setModal(null)}><MH title={type === "inv" ? "Actualizar valor" : "Abonar"} onClose={() => setModal(null)} />
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>{[100, 500, 1000, 5000].map(x => (<button key={x} onClick={() => setA(x.toString())} style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${T.cb}`, background: Number(a) === x ? T.ab : "transparent", cursor: "pointer", fontSize: 11, color: T.text }}>{$(x)}</button>))}</div>
      <Inp label="Monto" type="number" value={a} onChange={e => setA(e.target.value)} style={{ fontSize: 20, textAlign: "center", fontWeight: 700 }} />
      <button onClick={handleSave} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: T.ac, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Confirmar</button>
    </Ov>);
  }
}

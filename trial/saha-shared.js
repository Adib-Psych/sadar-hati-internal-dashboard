/* ============================================================
   SAHA Shared — Sadar Hati Hub
   Blok identitas/area bersama (dipakai DAST-10, SRQ-29, dst)
   + Firestore push ke collection 'submissions'.
   Konsisten dengan chemsex.html supaya semua data 1 kesatuan.
   Load SETELAH saha-data.js (window.SAHA_DATA).
   ============================================================ */
(function () {
  const D = window.SAHA_DATA || { PL_LIST: [], wilayahData: {} };

  /* ---------- Firebase (dynamic import, online-first) ---------- */
  const firebaseConfig = {
    apiKey: "AIzaSyC7127G5fsZprEGfeiqLrRqevTg6Qs2fko",
    authDomain: "sadar-hati-hub.firebaseapp.com",
    projectId: "sadar-hati-hub",
    storageBucket: "sadar-hati-hub.firebasestorage.app",
    messagingSenderId: "576423718259",
    appId: "1:576423718259:web:76600bbdf4f06892b36906"
  };
  let _push = null, _ready = false;
  (async () => {
    try {
      const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js");
      const { getFirestore, collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      _push = (rec) => addDoc(collection(db, "submissions"), rec).then(r => r.id);
      _ready = true;
      console.log("[SAHA] Firebase siap (sadar-hati-hub)");
    } catch (e) { console.error("[SAHA] Firebase init gagal:", e); }
  })();

  /* ---------- Scoped CSS ---------- */
  const CSS = `
  .saha-block{ }
  .saha-h{ font-family:'Lora',Georgia,serif; font-size:14px; font-weight:700; color:var(--wine-deep,#7a1f30);
    margin:18px 0 10px; padding-bottom:8px; border-bottom:1px solid #f0e7d8; }
  .saha-h:first-child{ margin-top:0; }
  .saha-lbl{ font-size:11.5px; font-weight:600; color:var(--slate,#64748b); text-transform:uppercase;
    letter-spacing:.3px; margin:12px 0 5px; }
  .saha-lbl .rq{ color:var(--wine,#a83244); }
  .saha-in{ width:100%; padding:11px 13px; font-size:15px; border:1.5px solid #e5e7eb; border-radius:10px;
    background:#fafafa; font-family:inherit; color:var(--navy,#1f2937); -webkit-appearance:none; appearance:none; }
  .saha-in:focus{ outline:none; border-color:var(--wine,#a83244); background:#fff; }
  select.saha-in{ background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat:no-repeat; background-position:right 12px center; background-size:18px; padding-right:38px; }
  .saha-in:disabled{ background:#f1f1f1; color:#9aa0a6; }
  .saha-static{ padding:11px 12px; background:linear-gradient(135deg,#f0f5f1,#fef7f2); border-radius:10px;
    font-weight:700; color:var(--sage-deep,#3e5538); font-size:14px; border:1.5px solid var(--sage,#5b7553); }
  .saha-chips{ display:flex; flex-wrap:wrap; gap:7px; }
  .saha-chips.saha-pl{ display:grid; grid-template-columns:repeat(3,1fr); }
  .saha-chip{ flex:0 0 auto; padding:9px 12px; font-size:13px; font-weight:600; border:1.6px solid #e5e7eb;
    border-radius:10px; background:#fff; color:var(--slate,#64748b); cursor:pointer; font-family:inherit; }
  .saha-chips:not(.saha-pl) .saha-chip{ flex:1 1 auto; text-align:center; }
  .saha-chip.sel{ border-color:var(--wine,#a83244); background:var(--wine,#a83244); color:#fff; }
  .saha-flag{ margin-top:6px; padding:8px 10px; background:#fef5ed; border-left:3px solid var(--gold,#d4a017);
    border-radius:6px; font-size:11px; color:#8a4d1f; line-height:1.5; }
  `;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  /* ---------- state ---------- */
  const val = {};

  /* ---------- build ---------- */
  function chips(field, arr) {
    return arr.map(v => `<button type="button" class="saha-chip" data-f="${field}" data-v="${String(v).replace(/"/g,'&quot;')}">${v}</button>`).join("");
  }
  function buildIdentity(containerId) {
    const el = document.getElementById(containerId);
    if (!el) { console.warn("[SAHA] container tidak ada:", containerId); return; }
    el.innerHTML = `
      <div class="saha-block">
        <div class="saha-h">1 · Identitas Laporan</div>
        <div class="saha-lbl">Tahun <span class="rq">*</span></div>
        <div class="saha-chips" data-g="tahun">${chips("tahun", ["2026", "2027", "2028"])}</div>
        <div class="saha-lbl">Nama PL <span class="rq">*</span></div>
        <div class="saha-chips saha-pl" data-g="pl">${chips("pl", D.PL_LIST)}</div>
        <div class="saha-lbl">Tanggal Laporan <span class="rq">*</span></div>
        <input type="date" class="saha-in" id="saha-tanggal">

        <div class="saha-h">2 · Area Jangkauan</div>
        <div class="saha-lbl">Provinsi</div>
        <div class="saha-static">🌾 Jawa Timur</div>
        <div class="saha-lbl">Kota / Kabupaten <span class="rq">*</span></div>
        <div class="saha-chips" data-g="kotakab">${chips("kotakab", ["Kota Malang", "Kab Malang", "Kota Batu", "Kab Pasuruan"])}</div>
        <div class="saha-lbl">Kecamatan <span class="rq">*</span></div>
        <select class="saha-in" id="saha-kec" disabled><option value="">-- pilih Kota/Kab dulu --</option></select>
        <div class="saha-lbl">Desa / Kelurahan <span class="rq">*</span></div>
        <select class="saha-in" id="saha-desa" disabled><option value="">-- pilih Kecamatan dulu --</option></select>
        <input type="text" class="saha-in" id="saha-desa-manual" placeholder="Ketik desa/kelurahan..." style="display:none;margin-top:6px;">

        <div class="saha-h">3 · Identitas Klien</div>
        <div class="saha-lbl">Nama Lengkap Klien <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-nama" placeholder="Nama lengkap sesuai KTP/kartu">
        <div class="saha-lbl">Nama Panggilan / Julukan <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-julukan" placeholder="Nickname atau alias">
        <div class="saha-lbl">4 Huruf Pertama Nama <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-huruf4" maxlength="4" placeholder="misal: BUDI" style="text-transform:uppercase;letter-spacing:2px;font-weight:700;">
        <div class="saha-lbl">Tanggal Lahir Klien</div>
        <input type="date" class="saha-in" id="saha-tgllahir">
        <div class="saha-lbl">ID KD (Kode Dampingan) — otomatis</div>
        <input type="text" class="saha-in" id="saha-idkd" readonly placeholder="terisi otomatis" style="background:#f0f5f1;font-weight:700;letter-spacing:1.5px;color:var(--sage-deep,#3e5538);font-family:'Courier New',monospace;">
        <div class="saha-flag" id="saha-idkd-flag" style="display:none;">⚠️ <strong>Placeholder tgl lahir (123456)</strong> — flag untuk backfill saat data lengkap.</div>
        <div class="saha-lbl">Jenis Kelamin <span class="rq">*</span></div>
        <div class="saha-chips" data-g="jk">${chips("jk", ["Laki-laki", "Perempuan", "Transgender"])}</div>
        <div class="saha-lbl">Usia <span class="rq">*</span></div>
        <input type="number" class="saha-in" id="saha-usia" min="10" max="99" placeholder="umur klien (tahun)">
      </div>`;
    wire(el);
  }

  /* ---------- wiring ---------- */
  function wire(el) {
    const today = new Date().toISOString().slice(0, 10);
    const tglLap = el.querySelector("#saha-tanggal");
    tglLap.value = today; val.tanggal = today;
    tglLap.addEventListener("change", e => { val.tanggal = e.target.value; });

    el.querySelectorAll(".saha-chips").forEach(g => {
      g.addEventListener("click", e => {
        const b = e.target.closest(".saha-chip"); if (!b) return;
        g.querySelectorAll(".saha-chip").forEach(x => x.classList.remove("sel"));
        b.classList.add("sel");
        val[b.dataset.f] = b.dataset.v;
        if (b.dataset.f === "kotakab") populateKec(el, b.dataset.v);
      });
    });

    const kec = el.querySelector("#saha-kec"), desa = el.querySelector("#saha-desa"), dman = el.querySelector("#saha-desa-manual");
    kec.addEventListener("change", () => { val.kecamatan = kec.value; populateDesa(el, val.kotakab, kec.value); });
    desa.addEventListener("change", () => {
      if (desa.value === "__LAINNYA__") { dman.style.display = "block"; val.desa = ""; val.desa_manual = true; }
      else { dman.style.display = "none"; val.desa = desa.value; val.desa_manual = false; }
    });
    dman.addEventListener("input", () => { val.desa = dman.value.trim(); val.desa_manual = true; });

    const h4 = el.querySelector("#saha-huruf4"), tgl = el.querySelector("#saha-tgllahir"),
      idkdEl = el.querySelector("#saha-idkd"), flag = el.querySelector("#saha-idkd-flag");
    function idkd() {
      const a = (h4.value || "").trim().toUpperCase();
      const d = tgl.value; let dd = "123456", ph = true;
      if (d) { const p = d.split("-"); dd = p[2] + p[1] + p[0].slice(2); ph = false; }
      const id = a ? (a + dd) : "";
      idkdEl.value = id; val.idkd = id; val.idkd_placeholder = ph && !!a; val.tgllahir = d || "";
      flag.style.display = (ph && !!a) ? "block" : "none";
    }
    h4.addEventListener("input", () => { h4.value = h4.value.toUpperCase(); idkd(); });
    tgl.addEventListener("change", idkd);

    ["nama", "julukan", "usia"].forEach(f => {
      const inp = el.querySelector("#saha-" + f);
      inp.addEventListener("input", () => { val[f] = inp.value.trim(); });
    });
  }

  function populateKec(el, kotakab) {
    const kec = el.querySelector("#saha-kec"), desa = el.querySelector("#saha-desa");
    const kecs = Object.keys(D.wilayahData[kotakab] || {}).sort();
    kec.innerHTML = '<option value="">-- Pilih Kecamatan --</option>' + kecs.map(k => `<option value="${k}">${k}</option>`).join("");
    kec.disabled = kecs.length === 0;
    desa.innerHTML = '<option value="">-- Pilih Kecamatan dulu --</option>'; desa.disabled = true;
    val.kecamatan = ""; val.desa = "";
  }
  function populateDesa(el, kotakab, kec) {
    const desa = el.querySelector("#saha-desa");
    const list = (((D.wilayahData[kotakab] || {})[kec]) || []).slice().sort();
    desa.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>' +
      list.map(d => `<option value="${d}">${d}</option>`).join("") +
      '<option value="__LAINNYA__">➕ Lainnya (ketik manual)</option>';
    desa.disabled = false;
  }

  /* ---------- API ---------- */
  function getIdentity() { return { ...val }; }
  const REQ = ["tahun", "pl", "tanggal", "kotakab", "kecamatan", "desa", "nama", "julukan", "idkd", "jk", "usia"];
  function isValid() { return REQ.every(k => val[k] != null && String(val[k]).trim() !== ""); }
  function missing() { return REQ.filter(k => !(val[k] != null && String(val[k]).trim() !== "")); }
  function push(rec) { return _push ? _push(rec) : Promise.reject(new Error("Firebase belum siap")); }

  window.SAHA = { buildIdentity, getIdentity, isValid, missing, push, ready: () => _ready };
})();

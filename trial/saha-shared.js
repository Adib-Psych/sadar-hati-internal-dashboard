/* ============================================================
   SAHA Shared — Sadar Hati Hub
   Blok identitas/area bersama (dipakai DAST-10, SRQ-29, IRA, Konseling, dst)
   + Firestore push ke collection 'submissions'.
   + PRE-FILL dari roster klien (saha-roster.js) — cari nama -> auto isi PL, Kab/Kota, JK, tgl lahir.
   Load SETELAH saha-data.js (window.SAHA_DATA). saha-roster.js di-load otomatis.
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
      try { retryOutbox(); } catch (e) {}
      console.log("[SAHA] Firebase siap (sadar-hati-hub)");
    } catch (e) { console.error("[SAHA] Firebase init gagal:", e); }
  })();


  /* ===== OUTBOX AUTO-RESEND (v0.33) — entri yang tertahan di HP dikirim ulang otomatis ===== */
  function retryOutbox() {
    if (!_push) return;
    let sent = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k.indexOf('__cloud') >= 0) continue;
      if (localStorage.getItem(k + '__cloud')) continue;
      let v; try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { continue; }
      if (!v || typeof v !== 'object' || !v.form || !v.pl || !v.created_at || !v.schema_version) continue;
      const t = new Date(v.created_at);
      if (isNaN(t) || (Date.now() - t.getTime()) > 7 * 24 * 3600 * 1000) continue;
      (function (kk, rec) {
        _push(rec).then(function (id) {
          try { localStorage.setItem(kk + '__cloud', id); } catch (e) {}
          console.log('[SAHA] outbox terkirim ulang:', kk);
        }).catch(function () {});
      })(k, v);
      sent++;
    }
    if (sent) console.log('[SAHA] outbox retry: mencoba kirim', sent, 'entri tertunda');
  }

  /* ---------- Roster pre-fill (load saha-roster.js) ---------- */
  let _fillDatalist = () => {};
  if (!window.SAHA_ROSTER) {
    const rs = document.createElement("script");
    rs.src = "saha-roster.js";
    rs.onload = () => { console.log("[SAHA] roster siap:", (window.SAHA_ROSTER || []).length); _fillDatalist(); };
    rs.onerror = () => console.warn("[SAHA] roster tidak dimuat (pre-fill nonaktif)");
    document.head.appendChild(rs);
  }

  /* ---------- Scoped CSS ---------- */
  const CSS = `
  .saha-block{ }
  .saha-h{ font-family:'Lora',Georgia,serif; font-size:14px; font-weight:700; color:var(--wine-deep,#7d2433);
    margin:18px 0 10px; padding-bottom:8px; border-bottom:1px solid #f0e7d8; }
  .saha-h:first-child{ margin-top:0; }
  .saha-lbl{ font-size:11.5px; font-weight:600; color:var(--slate,#6f6660); text-transform:uppercase;
    letter-spacing:.3px; margin:12px 0 5px; }
  .saha-lbl .rq{ color:var(--wine,#a83244); }
  .saha-in{ width:100%; padding:11px 13px; font-size:15px; border:1.5px solid #e7ddd3; border-radius:10px;
    background:#fbf7f2; font-family:inherit; color:var(--navy,#2c2724); -webkit-appearance:none; appearance:none; }
  .saha-in:focus{ outline:none; border-color:var(--wine,#a83244); background:#fff; }
  select.saha-in{ background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3e%3cpath d='M6 9l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat:no-repeat; background-position:right 12px center; background-size:18px; padding-right:38px; }
  .saha-in:disabled{ background:#f2ece4; color:#a89f97; }
  .saha-static{ padding:11px 12px; background:linear-gradient(135deg,#f2f2ea,#fbf7f2); border-radius:10px;
    font-weight:700; color:var(--sage-deep,#5f6e52); font-size:14px; border:1.5px solid var(--sage,#8a9a7b); }
  .saha-chips{ display:flex; flex-wrap:wrap; gap:7px; }
  .saha-chips.saha-pl{ display:grid; grid-template-columns:repeat(3,1fr); }
  .saha-chip{ flex:0 0 auto; padding:9px 12px; font-size:13px; font-weight:600; border:1.6px solid #e7ddd3;
    border-radius:10px; background:#fff; color:var(--slate,#6f6660); cursor:pointer; font-family:inherit; }
  .saha-chips:not(.saha-pl) .saha-chip{ flex:1 1 auto; text-align:center; }
  .saha-chip.sel{ border-color:var(--wine,#a83244); background:var(--wine,#a83244); color:#fff; }
  .saha-flag{ margin-top:6px; padding:8px 10px; background:#f3eef7; border-left:3px solid var(--gold,#6b4d7a);
    border-radius:6px; font-size:11px; color:#4e3859; line-height:1.5; }
  .saha-quick{ background:linear-gradient(135deg,#f2f2ea,#eef5ff); border:1.5px solid var(--sage,#8a9a7b);
    border-radius:12px; padding:12px 13px; margin-bottom:6px; }
  .saha-dhint{ font-size:10.5px; color:#6f6660; margin:4px 0 0; }
  .saha-dhint a{ color:#a83244; font-weight:700; text-decoration:none; }
  .saha-quick .saha-lbl{ margin-top:0; color:var(--sage-deep,#5f6e52); }
  .saha-quick .qok{ margin-top:7px; font-size:11.5px; color:var(--sage-deep,#5f6e52); font-weight:600; display:none; }
  `;
  const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  /* ---------- state ---------- */
  const val = {};
  let _el = null;
  const KAB_ALIAS = { "Kabupaten Malang": "Kab Malang" }; // roster label -> wilayahData key

  /* ---------- build ---------- */
  function chips(field, arr) {
    return arr.map(v => `<button type="button" class="saha-chip" data-f="${field}" data-v="${String(v).replace(/"/g,'&quot;')}">${v}</button>`).join("");
  }
  const KOTAKAB = ["Kota Malang", "Kabupaten Malang", "Kota Batu"]; /* Malang Raya saja — arsip: lihat SAHA_DATA.KOTAKAB_ARSIP */
  function buildIdentity(containerId) {
    const el = document.getElementById(containerId);
    if (!el) { console.warn("[SAHA] container tidak ada:", containerId); return; }
    _el = el;
    el.innerHTML = `
      <div class="saha-block">
        <div class="saha-quick">
          <div class="saha-lbl">⚡ Isi Cepat — cari klien lama (auto-isi)</div>
          <input type="text" class="saha-in" id="saha-cari" list="saha-roster-dl" autocomplete="off" placeholder="ketik nama klien lalu pilih...">
          <datalist id="saha-roster-dl"></datalist>
          <div class="qok" id="saha-cari-ok"></div>
        </div>

        <div class="saha-h">1 · Identitas Laporan</div>
        <div class="saha-lbl">Tahun <span class="rq">*</span></div>
        <div class="saha-chips" data-g="tahun">${chips("tahun", ["2026", "2027", "2028"])}</div>
        <div class="saha-lbl">Nama PL <span class="rq">*</span></div>
        <div class="saha-chips saha-pl" data-g="pl">${chips("pl", D.PL_LIST)}</div>
        <div class="saha-lbl">Tanggal Laporan <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-tanggal-txt" inputmode="numeric" autocomplete="off" placeholder="tt/bb/tttt — ketik angka saja" style="letter-spacing:1px;">
        <input type="date" class="saha-in" id="saha-tanggal" style="margin-top:6px;">
        <div class="saha-dhint">&#9997;&#65039; Cara cepat: ketik angka saja di kotak pertama — kalender di bawah otomatis ikut untuk cek/pilih</div>

        <div class="saha-h">2 · Area Jangkauan</div>
        <div class="saha-lbl">Provinsi</div>
        <div class="saha-static">🌾 Jawa Timur / DKI</div>
        <div class="saha-lbl">Kota / Kabupaten <span class="rq">*</span></div>
        <div class="saha-chips" data-g="kotakab">${chips("kotakab", KOTAKAB)}</div>
        <div class="saha-lbl">Kecamatan <span class="rq">*</span></div>
        <select class="saha-in" id="saha-kec" disabled><option value="">-- pilih Kota/Kab dulu --</option></select>
        <input type="text" class="saha-in" id="saha-kec-manual" placeholder="Ketik kecamatan..." style="display:none;margin-top:6px;">
        <div class="saha-lbl">Desa / Kelurahan <span style="font-size:9.5px;color:#8a9a7b;">(opsional)</span></div>
        <select class="saha-in" id="saha-desa" disabled><option value="">-- pilih Kecamatan dulu --</option></select>
        <input type="text" class="saha-in" id="saha-desa-manual" placeholder="Ketik desa/kelurahan..." style="display:none;margin-top:6px;">
        <div class="saha-dhint" id="saha-domisili-hint" style="display:none;"></div>

        <div class="saha-h">3 · Identitas Klien</div>
        <div class="saha-lbl">Status Kontak <span class="rq">*</span></div>
        <div class="saha-chips" data-g="status">${chips("status", ["Baru", "Lama"])}</div>
        <div class="saha-dhint">🆕 <strong>Baru</strong> = KD baru (isi identitas lengkap) · 🔁 <strong>Lama</strong> = pakai ⚡ Isi Cepat di atas</div>
        <div class="saha-lbl">Nama Lengkap Klien <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-nama" placeholder="Nama lengkap sesuai KTP/kartu">
        <div class="saha-lbl">Nama Panggilan / Julukan <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-julukan" placeholder="Nickname atau alias">
        <div class="saha-lbl">4 Huruf Pertama Nama <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-huruf4" maxlength="4" placeholder="misal: BUDI" style="text-transform:uppercase;letter-spacing:2px;font-weight:700;">
        <div class="saha-lbl">Tanggal Lahir Klien <span class="rq">*</span></div>
        <input type="text" class="saha-in" id="saha-tgllahir-txt" inputmode="numeric" autocomplete="off" placeholder="tt/bb/tttt — ketik angka saja" style="letter-spacing:1px;">
        <input type="date" class="saha-in" id="saha-tgllahir" style="margin-top:6px;">
        <div class="saha-dhint">&#9997;&#65039; Cara cepat: ketik angka saja (misal 31051999) — tidak perlu scroll kalender jauh</div>
        <div class="saha-lbl">ID KD (Kode Dampingan) — otomatis</div>
        <input type="text" class="saha-in" id="saha-idkd" readonly placeholder="terisi otomatis" style="background:#f2f2ea;font-weight:700;letter-spacing:1.5px;color:var(--sage-deep,#5f6e52);font-family:'Courier New',monospace;">
        <div class="saha-flag" id="saha-idkd-flag" style="display:none;">⚠️ <strong>Placeholder tgl lahir (123456)</strong> — flag untuk backfill saat data lengkap.</div>
        <div class="saha-lbl">Jenis Kelamin <span class="rq">*</span></div>
        <div class="saha-chips" data-g="jk">${chips("jk", ["Laki-laki", "Perempuan", "Transgender"])}</div>
        <div class="saha-lbl">Usia <span style="font-size:9.5px;color:#8a9a7b;">(OTOMATIS — terkunci)</span></div>
        <input type="text" class="saha-in" id="saha-usia" readonly placeholder="⚙️ otomatis dari tanggal lahir" style="background:#f2f2ea;font-weight:700;color:var(--sage-deep,#5f6e52);">
      </div>`;
    wire(el);
    _fillDatalist();
  }

  /* ---------- wiring ---------- */
  function wire(el) {
    const today = new Date().toISOString().slice(0, 10);
    const tglLap = el.querySelector("#saha-tanggal");
    tglLap.value = today; val.tanggal = today;
    tglLap.addEventListener("change", e => { val.tanggal = e.target.value; });

    /* tanggal bisa DIKETIK (feedback PL Jul 2026) */
    function wireDateTxt(txtSel, natSel, yMin, yMax) {
      const t = el.querySelector(txtSel), n = el.querySelector(natSel);
      if (!t || !n) return;
      let guard = false;
      const disp = v => (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(v || "")) ? v.split("-").reverse().join("/") : "";
      t.addEventListener("input", () => {
        let d = t.value.replace(/[^0-9]/g, "").slice(0, 8), out = d;
        if (d.length > 4) out = d.slice(0, 2) + "/" + d.slice(2, 4) + "/" + d.slice(4);
        else if (d.length > 2) out = d.slice(0, 2) + "/" + d.slice(2);
        t.value = out;
        if (d.length === 8) {
          const dd = +d.slice(0, 2), mm = +d.slice(2, 4), yy = +d.slice(4);
          if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12 && yy >= yMin && yy <= yMax) {
            t.style.borderColor = ""; t.style.background = "";
            guard = true; n.value = yy + "-" + String(mm).padStart(2, "0") + "-" + String(dd).padStart(2, "0");
            n.dispatchEvent(new Event("change", { bubbles: true })); guard = false;
            return;
          }
          t.style.borderColor = "#c0392b"; t.style.background = "#fdf0ee";
        } else { t.style.borderColor = ""; t.style.background = ""; }
        if (n.value) { guard = true; n.value = ""; n.dispatchEvent(new Event("change", { bubbles: true })); guard = false; }
      });
      n.addEventListener("change", () => { if (!guard) { t.value = disp(n.value); t.style.borderColor = ""; t.style.background = ""; } });
      t.value = disp(n.value);
    }
    const NOWY = new Date().getFullYear();
    wireDateTxt("#saha-tanggal-txt", "#saha-tanggal", 2024, NOWY + 1);
    wireDateTxt("#saha-tgllahir-txt", "#saha-tgllahir", 1940, NOWY - 10);
    el.querySelectorAll(".saha-callink").forEach(a => a.addEventListener("click", ev => {
      ev.preventDefault();
      const n2 = el.querySelector("#" + a.dataset.cal);
      n2.style.display = (n2.style.display === "none") ? "block" : "none";
    }));

    el.querySelectorAll(".saha-chips").forEach(g => {
      g.addEventListener("click", e => {
        const b = e.target.closest(".saha-chip"); if (!b) return;
        g.querySelectorAll(".saha-chip").forEach(x => x.classList.remove("sel"));
        b.classList.add("sel");
        val[b.dataset.f] = b.dataset.v;
        if (b.dataset.f === "kotakab") populateKec(el, b.dataset.v);
      });
    });

    const kec = el.querySelector("#saha-kec"), kman = el.querySelector("#saha-kec-manual"),
      desa = el.querySelector("#saha-desa"), dman = el.querySelector("#saha-desa-manual");
    kec.addEventListener("change", () => { val.kecamatan = kec.value; populateDesa(el, val.kotakab, kec.value); });
    kman.addEventListener("input", () => { val.kecamatan = kman.value.trim(); });
    desa.addEventListener("change", () => {
      if (desa.value === "__LAINNYA__") { dman.style.display = "block"; val.desa = ""; val.desa_manual = true; }
      else { dman.style.display = "none"; val.desa = desa.value; val.desa_manual = false; }
    });
    dman.addEventListener("input", () => { val.desa = dman.value.trim(); val.desa_manual = true; });

    const h4 = el.querySelector("#saha-huruf4"), tgl = el.querySelector("#saha-tgllahir");
    h4.addEventListener("input", () => { h4.value = h4.value.toUpperCase(); idkd(); });
    tgl.addEventListener("change", idkd);

    ["nama", "julukan"].forEach(f => {
      const inp = el.querySelector("#saha-" + f);
      inp.addEventListener("input", () => { val[f] = inp.value.trim(); });
    });

    const cari = el.querySelector("#saha-cari");
    if (cari) {
      cari.addEventListener("change", () => tryPrefill(el, cari.value));
      cari.addEventListener("input", () => { if ((window.SAHA_ROSTER || []).some(r => r.n === cari.value)) tryPrefill(el, cari.value); });
    }
  }

  function idkd() {
    if (!_el) return;
    const h4 = _el.querySelector("#saha-huruf4"), tgl = _el.querySelector("#saha-tgllahir"),
      idkdEl = _el.querySelector("#saha-idkd"), flag = _el.querySelector("#saha-idkd-flag");
    const a = (h4.value || "").trim().toUpperCase();
    const d = tgl.value; let dd = "123456", ph = true;
    if (d) { const p = d.split("-"); dd = p[2] + p[1] + p[0].slice(2); ph = false; }
    const id = a ? (a + dd) : "";
    idkdEl.value = id; val.idkd = id; val.idkd_placeholder = ph && !!a; val.tgllahir = d || "";
    flag.style.display = (ph && !!a) ? "block" : "none";
    /* USIA OTOMATIS dari tanggal lahir (terkunci) */
    const uEl = _el.querySelector("#saha-usia");
    if (uEl) {
      if (d) {
        const now = new Date(), b = new Date(d + "T00:00:00");
        let age = now.getFullYear() - b.getFullYear();
        if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
        if (age > 0 && age < 120) { uEl.value = age + " tahun"; val.usia = String(age); }
        else { uEl.value = ""; val.usia = ""; }
      } else { uEl.value = ""; val.usia = ""; }
    }
  }

  function populateKec(el, kotakab) {
    const kec = el.querySelector("#saha-kec"), kman = el.querySelector("#saha-kec-manual"),
      desa = el.querySelector("#saha-desa"), dman = el.querySelector("#saha-desa-manual");
    const wkey = KAB_ALIAS[kotakab] || kotakab;
    const kecs = Object.keys(D.wilayahData[wkey] || {}).sort();
    if (kecs.length) {
      kec.style.display = ""; kec.disabled = false; kman.style.display = "none"; kman.value = "";
      kec.innerHTML = '<option value="">-- Pilih Kecamatan --</option>' + kecs.map(k => `<option value="${k}">${k}</option>`).join("");
    } else {
      kec.style.display = "none"; kec.disabled = true;
      kman.style.display = "block"; kman.value = "";
    }
    val.kecamatan = ""; val.desa = "";
    desa.innerHTML = '<option value="">-- Pilih Kecamatan dulu --</option>'; desa.disabled = true;
    if (dman) { dman.style.display = "none"; dman.value = ""; }
  }
  function populateDesa(el, kotakab, kec) {
    const desa = el.querySelector("#saha-desa"), dman = el.querySelector("#saha-desa-manual");
    const wkey = KAB_ALIAS[kotakab] || kotakab;
    const list = (((D.wilayahData[wkey] || {})[kec]) || []).slice().sort();
    if (list.length) {
      desa.style.display = ""; desa.disabled = false; if (dman) dman.style.display = "none";
      desa.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>' +
        list.map(d => `<option value="${d}">${d}</option>`).join("") +
        '<option value="__LAINNYA__">➕ Lainnya (ketik manual)</option>';
    } else {
      desa.style.display = "none"; desa.disabled = true;
      if (dman) { dman.style.display = "block"; dman.value = ""; val.desa = ""; val.desa_manual = true; }
    }
  }

  /* ---------- pre-fill from roster ---------- */
  function _fillDatalistImpl() {
    if (!_el) return;
    const dl = _el.querySelector("#saha-roster-dl"); if (!dl) return;
    const R = window.SAHA_ROSTER || [];
    if (!R.length || dl.dataset.filled) return;
    dl.innerHTML = R.map(r => `<option value="${String(r.n).replace(/"/g,'&quot;')}">${(r.j || "")}${r.k ? " · " + r.k : ""}</option>`).join("");
    dl.dataset.filled = "1";
  }
  _fillDatalist = _fillDatalistImpl;

  function selChip(el, group, value) {
    if (!value) return false;
    const cont = el.querySelector('.saha-chips[data-g="' + group + '"]'); if (!cont) return false;
    let btn = [...cont.querySelectorAll(".saha-chip")].find(b => b.dataset.v === value);
    if (!btn) {
      btn = document.createElement("button"); btn.type = "button"; btn.className = "saha-chip";
      btn.dataset.f = group; btn.dataset.v = value; btn.textContent = value; cont.appendChild(btn);
    }
    cont.querySelectorAll(".saha-chip").forEach(x => x.classList.remove("sel"));
    btn.classList.add("sel"); val[group] = value;
    return true;
  }

  function tryPrefill(el, name) {
    const R = window.SAHA_ROSTER || [];
    const e = R.find(r => r.n === name); if (!e) return;
    el.querySelector("#saha-nama").value = e.n; val.nama = e.n;
    el.querySelector("#saha-julukan").value = e.j || ""; val.julukan = e.j || "";
    const h4 = el.querySelector("#saha-huruf4");
    h4.value = (e.n || "").replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase();
    el.querySelector("#saha-tgllahir").value = e.d || "";
    const _tt = el.querySelector("#saha-tgllahir-txt");
    if (_tt) _tt.value = (e.d && /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(e.d)) ? e.d.split("-").reverse().join("/") : "";
    idkd(); /* usia otomatis ikut terhitung di idkd() */
    selChip(el, "jk", e.s);
    selChip(el, "status", "Lama"); /* dari roster = KD Lama */
    const plSudah = !!val.pl;
    const plAktif = (D.PL_LIST || []).includes(e.p);
    if (!plSudah && plAktif) selChip(el, "pl", e.p);
    let areaNote = "", kecNote = "";
    if (KOTAKAB.includes(e.k)) {
      if (selChip(el, "kotakab", e.k)) {
        populateKec(el, e.k);
        /* KECAMATAN AUTO dari roster (v0.31) */
        if (e.c) {
          const ks = el.querySelector("#saha-kec");
          if (ks && [...ks.options].some(o => o.value === e.c)) {
            ks.value = e.c; ks.dispatchEvent(new Event("change", { bubbles: true }));
            kecNote = " · Kec. <strong>" + e.c + "</strong> ikut terisi — tinggal pilih Desa.";
          }
        }
      }
    }
    else if (e.k) { areaNote = " · 📁 Wilayah asal: " + e.k + " (arsip) — pilih area jangkauan saat ini (Malang Raya)."; }
    let plNote = "";
    if (e.p && !plAktif) plNote = " · ⚠️ PL asal: " + e.p + " (nonaktif) — pilih PL aktif yang menangani.";
    else if (e.p && plSudah) plNote = " · PL asal klien: " + e.p + " (pilihan PL Anda tidak diubah).";
    else if (e.p && plAktif) plNote = " · PL: " + e.p + ".";
    const dh = el.querySelector("#saha-domisili-hint");
    if (dh) {
      if (e.a) { dh.style.display = "block"; dh.innerHTML = "\ud83d\udcac Domisili di catatan M&amp;E: <strong>" + String(e.a).replace(/</g, "&lt;") + "</strong> — bantu pilih desa/kelurahan yang cocok."; }
      else { dh.style.display = "none"; dh.innerHTML = ""; }
    }
    const ok = el.querySelector("#saha-cari-ok");
    if (ok) { ok.style.display = "block"; ok.innerHTML = "✓ Terisi dari roster: <strong>" + e.n + "</strong> (KD Lama)" + kecNote + plNote + areaNote + (kecNote ? "" : " Lengkapi Kecamatan/Desa & cek datanya."); }
  }

  /* ---------- API ---------- */
  function getIdentity() { return { ...val }; }
  const REQ = ["tahun", "pl", "tanggal", "kotakab", "kecamatan", "status", "nama", "julukan", "idkd", "jk", "tgllahir"]; /* desa OPSIONAL (feedback PL 17 Jul) */
  function isValid() { return REQ.every(k => val[k] != null && String(val[k]).trim() !== ""); }
  function missing() { return REQ.filter(k => !(val[k] != null && String(val[k]).trim() !== "")); }
  const LBL = { tahun: "Tahun", pl: "Nama PL", tanggal: "Tanggal Laporan", kotakab: "Kota/Kabupaten", kecamatan: "Kecamatan", desa: "Desa/Kelurahan", status: "Status Kontak (Baru/Lama)", nama: "Nama Lengkap Klien", julukan: "Nama Panggilan", idkd: "ID KD (isi 4 Huruf Pertama)", jk: "Jenis Kelamin", tgllahir: "Tanggal Lahir (usia otomatis)" };
  function showMissing(extraLabels) {
    const items = missing().map(k => LBL[k] || k).concat(extraLabels || []);
    let box = document.getElementById("saha-missbox");
    if (!box) {
      box = document.createElement("div"); box.id = "saha-missbox";
      box.style.cssText = "position:fixed;left:12px;right:12px;bottom:86px;z-index:9999;background:#fdf0ee;border:2px solid #c0392b;border-radius:14px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.18);font-size:13px;color:#7d2433;line-height:1.6;max-height:46vh;overflow:auto;";
      document.body.appendChild(box);
    }
    box.innerHTML = "<div style=\"display:flex;justify-content:space-between;align-items:center;gap:10px;\"><strong>⚠️ Belum bisa disimpan — " + items.length + " item wajib belum terisi:</strong><button type=\"button\" style=\"border:none;background:#c0392b;color:#fff;border-radius:8px;padding:4px 10px;font-weight:700;cursor:pointer;\" onclick=\"this.closest('#saha-missbox').style.display='none'\">Tutup</button></div><div style=\"margin-top:6px;\">" + items.map(x => "• " + x).join("<br>") + "</div>";
    box.style.display = "block";
    /* tandai merah field identitas yang kosong + scroll ke yang pertama */
    if (_el) {
      let first = null;
      missing().forEach(k => {
        let t = _el.querySelector("#saha-" + (k === "tgllahir" ? "tgllahir-txt" : k)) || _el.querySelector('.saha-chips[data-g="' + k + '"]');
        if (t) { t.style.outline = "2px solid #c0392b"; t.style.outlineOffset = "2px"; setTimeout(() => { t.style.outline = ""; }, 6000); if (!first) first = t; }
      });
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return items.length;
  }
  function hideMissing() { const b = document.getElementById("saha-missbox"); if (b) b.style.display = "none"; }
  function push(rec) { return _push ? _push(rec) : Promise.reject(new Error("Firebase belum siap")); }

  window.sahaBack = function (e) { if (window.self !== window.top) { if (e) e.preventDefault(); window.parent.postMessage({ saha: 'nav', to: 'l3-master' }, '*'); return false; } return true; };
  window.sahaHome = function () { if (window.self !== window.top) { window.parent.postMessage({ saha: 'nav', to: 'l3-master' }, '*'); return; } window.location.href = 'index.html'; };

  window.SAHA = { buildIdentity, getIdentity, isValid, missing, showMissing, hideMissing, push, ready: () => _ready };
})();

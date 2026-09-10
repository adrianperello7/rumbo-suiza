/* Rumbo Suiza — client-side estimator engine.
   Everything runs in-browser; nothing is sent anywhere. Figures are rough
   public-average approximations for orientation only, not a guarantee. */
(function () {
  "use strict";

  var LANG = window.RS_LANG === "en" ? "en" : "es";

  var SECTORS = {
    tech:      { es: "Tecnología / IT",                   en: "Technology / IT",               entry: 82000, senior: 135000 },
    eng:       { es: "Ingeniería",                         en: "Engineering",                   entry: 78000, senior: 118000 },
    health:    { es: "Salud (enfermería, sanidad)",        en: "Healthcare (nursing, clinical)", entry: 74000, senior: 105000 },
    finance:   { es: "Finanzas / Banca",                   en: "Finance / Banking",              entry: 85000, senior: 145000 },
    pharma:    { es: "Farmacéutica / Ciencias de la vida", en: "Pharma / Life Sciences",         entry: 80000, senior: 125000 },
    marketing: { es: "Marketing / Ventas",                 en: "Marketing / Sales",              entry: 62000, senior: 105000 },
    legal:     { es: "Legal / Jurídico",                   en: "Legal",                          entry: 75000, senior: 120000 },
    hostel:    { es: "Hostelería / Turismo",               en: "Hospitality / Tourism",          entry: 50000, senior: 72000  },
    edu:       { es: "Educación",                          en: "Education",                      entry: 68000, senior: 96000  },
    build:     { es: "Construcción / Oficios",             en: "Construction / Trades",          entry: 62000, senior: 86000  },
    retail:    { es: "Comercio / Retail",                  en: "Retail / Commerce",              entry: 54000, senior: 74000  },
    admin:     { es: "Administración / Gestión",           en: "Administration / Management",    entry: 64000, senior: 92000  },
    other:     { es: "Otro / Generalista",                 en: "Other / Generalist",             entry: 58000, senior: 82000  }
  };

  /* traits: 1 (worst fit) – 5 (best fit) per priority a user can pick in step 3 */
  var CANTONS = [
    { id: "zh", es: "Zúrich",         en: "Zurich",           lang: "de", mult: 1.14, tags: ["tech","finance","admin","marketing","other"],
      traits: { salary: 5, cost: 2, hispanic: 4, nature: 2, urban: 5, proximity: 5 },
      note: { es: "Mayor hub económico del país; alta demanda en tecnología y finanzas, alemán (o alto suizo-alemán hablado) muy útil, inglés funciona en muchas empresas internacionales.", en: "The country's biggest economic hub; strong demand in tech and finance, German is very useful, English works in many international firms." } },
    { id: "zg", es: "Zug",            en: "Zug",              lang: "de", mult: 1.16, tags: ["tech","finance"],
      traits: { salary: 5, cost: 1, hispanic: 3, nature: 2, urban: 3, proximity: 4 },
      note: { es: "Fiscalidad muy baja, fuerte presencia de tecnológicas y cripto, comunidad muy internacional.", en: "Very low taxes, strong tech/crypto scene, highly international community." } },
    { id: "ge", es: "Ginebra",        en: "Geneva",           lang: "fr", mult: 1.12, tags: ["finance","edu","admin","legal","other"],
      traits: { salary: 4, cost: 1, hispanic: 5, nature: 2, urban: 5, proximity: 5 },
      note: { es: "Sede de organizaciones internacionales, banca privada y ONGs; francés es clave pero el inglés está muy extendido.", en: "Home to international organizations, private banking and NGOs; French matters but English is widely used." } },
    { id: "vd", es: "Vaud (Lausana)", en: "Vaud (Lausanne)",  lang: "fr", mult: 1.05, tags: ["pharma","eng","edu","hostel"],
      traits: { salary: 3, cost: 3, hispanic: 4, nature: 4, urban: 4, proximity: 4 },
      note: { es: "Polo biotecnológico y universitario (EPFL), buena vida y algo más asequible que Ginebra.", en: "Biotech and university hub (EPFL), good quality of life and somewhat cheaper than Geneva." } },
    { id: "bs", es: "Basilea",        en: "Basel",            lang: "de", mult: 1.1,  tags: ["pharma","finance","health"],
      traits: { salary: 4, cost: 2, hispanic: 3, nature: 2, urban: 4, proximity: 3 },
      note: { es: "Capital farmacéutica de Suiza (Roche, Novartis); alemán es importante en la vida diaria.", en: "Switzerland's pharma capital (Roche, Novartis); German matters day to day." } },
    { id: "ti", es: "Tesino",         en: "Ticino",           lang: "it", mult: 0.86, tags: ["hostel","retail","build","other"],
      traits: { salary: 1, cost: 5, hispanic: 3, nature: 5, urban: 2, proximity: 3 },
      note: { es: "Región de habla italiana, coste de vida más bajo, cercanía cultural y climática a España.", en: "Italian-speaking region, lower cost of living, culturally and climate-wise closer to Spain." } },
    { id: "be", es: "Berna",          en: "Bern",             lang: "de", mult: 0.98, tags: ["admin","edu","health","legal","other"],
      traits: { salary: 2, cost: 3, hispanic: 2, nature: 4, urban: 3, proximity: 3 },
      note: { es: "Capital federal, fuerte en administración pública y sanidad, ritmo de vida más tranquilo.", en: "Federal capital, strong in public administration and healthcare, calmer pace of life." } },
    { id: "vs", es: "Valais",         en: "Valais",           lang: "fr", mult: 0.92, tags: ["hostel","build","other"],
      traits: { salary: 1, cost: 4, hispanic: 2, nature: 5, urban: 1, proximity: 2 },
      note: { es: "Turismo de montaña todo el año, francés/alemán según la zona, coste de vida más bajo.", en: "Year-round mountain tourism, French/German depending on the area, lower cost of living." } }
  ];

  var PRIORITIES = {
    salary:    { es: "Salario alto",                        en: "High salary" },
    cost:      { es: "Coste de vida bajo",                  en: "Low cost of living" },
    hispanic:  { es: "Comunidad hispanohablante grande",    en: "Large Spanish-speaking community" },
    nature:    { es: "Naturaleza y vida al aire libre",     en: "Nature & outdoor living" },
    urban:     { es: "Vida urbana e internacional",         en: "Urban, international life" },
    proximity: { es: "Cercanía / vuelos directos a España", en: "Proximity / direct flights to Spain" }
  };

  var SENIORITY_FRAC = { junior: 0, mid: 0.35, senior: 0.75, lead: 1 };
  var EXP_FRAC = { "0-2": 0, "3-6": 0.35, "7-15": 0.7, "15+": 1 };

  var T = {
    es: {
      permitTitle: "Vía de residencia más probable",
      permitB: "Permiso B UE/AELC (residencia de larga duración)",
      permitBDesc: "Con un contrato indefinido o de al menos 1 año, y siendo ciudadano español (UE), tienes derecho a un Permiso B bajo el Acuerdo de Libre Circulación de Personas. Es renovable cada 5 años y da acceso a cambiar de empleo o de cantón con relativa libertad.",
      permitL: "Permiso L UE/AELC (residencia de corta duración)",
      permitLDesc: "Para contratos de entre 3 meses y 1 año se emite un Permiso L, ligado a la duración del contrato. Puede renovarse o convertirse en Permiso B si el contrato se prolonga.",
      permitJob: "Búsqueda de empleo en Suiza",
      permitJobDesc: "Como ciudadano de la UE puedes entrar sin visado y buscar trabajo hasta 3 meses (ampliable en algunos casos registrándote). En cuanto firmes un contrato, tramitarás el permiso correspondiente (L o B) según su duración.",
      permitSelf: "Permiso B UE/AELC como autónomo",
      permitSelfDesc: "El trabajo por cuenta propia también está cubierto por el acuerdo UE/AELC, pero las autoridades cantonales piden demostrar que tu actividad es viable (contratos, clientes, plan de negocio, ingresos previstos) antes de conceder el permiso.",
      salaryTitle: "Salario bruto anual estimado",
      salaryNote: "Estimación orientativa a partir de medias públicas del sector, tu experiencia y el cantón elegido. El salario real depende de la empresa, el convenio colectivo y tu negociación — puede variar con facilidad ±20%.",
      cantonTitle: "Cantones que podrían encajar contigo",
      checklistTitle: "Tu checklist personalizado de próximos pasos",
      cvTitle: "Análisis de tu CV",
      cvNone: "No se detectaron palabras clave relevantes — puedes subir tu CV en PDF o pegar el texto para un escaneo rápido, o directamente ignorar esta sección.",
      cvDisclaimer: "Esto es un escaneo de palabras clave y patrones hecho en tu navegador, no un análisis con IA. Para una revisión real de tu CV, consulta la asesoría personalizada.",
      cvYearsLabel: "Experiencia detectada en el CV",
      cvYearsValue: function (y) { return "~" + y + (y === 1 ? " año" : " años"); },
      cvTitleLabel: "Puesto detectado",
      cvSuggestLabel: "Tu CV encaja más con el sector",
      cvSuggestNote: "Distinto al sector que elegiste — puedes volver atrás y cambiarlo si quieres una estimación más ajustada.",
      cvImpactNote: function (y) { return "Detectamos ~" + y + (y === 1 ? " año" : " años") + " de experiencia real en tu CV (por fechas de tus puestos) y lo hemos usado para ajustar la horquilla salarial de arriba, junto con lo que marcaste a mano."; },
      ctaTitle: "¿Quieres una valoración real, no solo una estimación?",
      ctaBody: "Revisamos tu caso concreto — CV, expectativas salariales, cantón y trámites — y te damos un plan de acción personalizado.",
      ctaBtn: "Solicitar asesoría personalizada",
      steps: [
        { es: "Reúne tus documentos base: DNI/pasaporte en vigor, certificado de antecedentes penales, y (si aplica) tus títulos académicos con traducción jurada." },
        { es: "Confirma tu situación de contrato: si aún buscas empleo, regístrate en los portales suizos y activa alertas en tu sector." },
        { es: "En cuanto tengas contrato u oferta firme, contacta con el Contrôle des habitants / Einwohnerkontrolle de tu futuro municipio para iniciar el permiso." },
        { es: "Contrata un seguro médico obligatorio en los primeros 3 meses tras tu llegada — es un requisito legal, no opcional." },
        { es: "Empieza (o refuerza) el idioma local del cantón elegido — incluso un nivel A2-B1 cambia mucho tu integración y tus opciones laborales." }
      ],
      familySteps: {
        pareja: { es: "Si viajas en pareja, comprueba el permiso de tu pareja: si no es ciudadana UE/AELC, su proceso de residencia (reagrupación familiar) es distinto y puede tardar más — infórmate cuanto antes." },
        hijos: { es: "Si vienes con hijos, empieza pronto la búsqueda de colegio o guardería en tu cantón — las plazas (sobre todo en alemán o francés) pueden tener lista de espera." }
      }
    },
    en: {
      permitTitle: "Most likely residence pathway",
      permitB: "EU/EFTA Permit B (long-term residence)",
      permitBDesc: "With a permanent or ≥1-year contract, as a Spanish (EU) citizen you're entitled to a Permit B under the Free Movement of Persons Agreement. It's renewable every 5 years and gives you relative freedom to change jobs or canton.",
      permitL: "EU/EFTA Permit L (short-term residence)",
      permitLDesc: "For contracts between 3 months and 1 year, a Permit L is issued, tied to the contract length. It can be renewed or converted into a Permit B if the contract is extended.",
      permitJob: "Job-seeking in Switzerland",
      permitJobDesc: "As an EU citizen you can enter without a visa and look for work for up to 3 months (extendable in some cases by registering). Once you sign a contract, you'll apply for the matching permit (L or B) based on its length.",
      permitSelf: "EU/EFTA Permit B as self-employed",
      permitSelfDesc: "Self-employment is also covered under the EU/EFTA agreement, but cantonal authorities will want proof your activity is viable (contracts, clients, business plan, projected income) before granting the permit.",
      salaryTitle: "Estimated gross annual salary",
      salaryNote: "A rough estimate based on public sector averages, your experience, and the chosen canton. Real pay depends on the company, collective agreement, and your negotiation — it can easily vary ±20%.",
      cantonTitle: "Cantons that could be a good fit",
      checklistTitle: "Your personalized next-steps checklist",
      cvTitle: "Your CV analysis",
      cvNone: "No relevant keywords detected — you can upload your CV as a PDF or paste the text for a quick scan, or simply skip this section.",
      cvDisclaimer: "This is an in-browser keyword and pattern scan, not an AI analysis. For a real CV review, check out the personalized consulting service.",
      cvYearsLabel: "Experience detected in your CV",
      cvYearsValue: function (y) { return "~" + y + (y === 1 ? " year" : " years"); },
      cvTitleLabel: "Detected job title",
      cvSuggestLabel: "Your CV best matches the sector",
      cvSuggestNote: "That's different from the sector you picked — go back and change it if you want a tighter estimate.",
      cvImpactNote: function (y) { return "We detected ~" + y + (y === 1 ? " year" : " years") + " of real experience in your CV (from your job dates) and used it to adjust the salary range above, alongside what you picked manually."; },
      ctaTitle: "Want a real assessment, not just an estimate?",
      ctaBody: "We review your actual situation — CV, salary expectations, canton and paperwork — and give you a personalized action plan.",
      ctaBtn: "Request personalized consulting",
      steps: [
        { en: "Gather your base documents: valid ID/passport, criminal record certificate, and (if relevant) your qualifications with a certified translation." },
        { en: "Confirm your contract situation: if you're still job-hunting, register on Swiss job portals and set up alerts in your sector." },
        { en: "As soon as you have a contract or firm offer, contact the Einwohnerkontrolle / contrôle des habitants of your future municipality to start the permit process." },
        { en: "Take out mandatory health insurance within your first 3 months after arrival — it's a legal requirement, not optional." },
        { en: "Start (or strengthen) the local language of your chosen canton — even an A2-B1 level changes your integration and job options a lot." }
      ],
      familySteps: {
        pareja: { en: "If you're moving as a couple, check your partner's permit too: if they aren't an EU/EFTA citizen, their residence process (family reunification) is different and can take longer — look into it early." },
        hijos: { en: "If you're moving with kids, start looking for a school or daycare spot in your canton early — places (especially in German or French) can have waiting lists." }
      }
    }
  };

  var CV_KEYWORDS = {
    tech:      ["python","java","javascript","typescript","react","angular","vue","node","cloud","aws","azure","gcp","devops","docker","kubernetes","sql","nosql","software","desarrollador","programador","ingeniero de software","frontend","backend","full stack","big data","machine learning","inteligencia artificial","ciberseguridad","cybersecurity","scrum","agile","git"],
    finance:   ["excel","finanzas","contabilidad","auditoría","banking","accounting","audit","controller","finance","tesorería","treasury","riesgo financiero","risk management","inversión","investment","presupuesto","budget","sap","erp"],
    health:    ["enfermería","paciente","clínico","sanidad","nursing","clinical","healthcare","hospital","fisioterapia","physiotherapy","cuidados","medicina","matrona","midwife"],
    eng:       ["autocad","ingeniería","mecánico","engineering","mechanical","electrical","industrial","solidworks","plc","automatización","automation","estructuras","civil engineering","ingeniería civil"],
    pharma:    ["farmacéutica","biotecnología","laboratorio","laboratory","pharma","biotech","gmp","investigación clínica","clinical research","química","chemistry"],
    marketing: ["marketing","ventas","comercial","sales","seo","sem","community manager","redes sociales","social media","growth","branding","publicidad","advertising","crm"],
    legal:     ["legal","jurídico","abogado","derecho","lawyer","contratos","contracts","compliance","paralegal","notaría"],
    hostel:    ["hostelería","restauración","turismo","hospitality","hotel","tourism","chef","camarero","bartender","recepción","housekeeping","catering"],
    edu:       ["docente","profesor","teaching","education","formador","trainer","pedagogía","tutor"],
    build:     ["construcción","obra","albañil","electricista","fontanero","carpintero","construction","electrician","plumber","site manager","jefe de obra","arquitectura","architecture"],
    retail:    ["comercio","retail","tienda","dependiente","vendedor","cajero","store manager","sales assistant","cashier","atención al cliente","customer service"],
    admin:     ["administración","administrativo","secretaría","office manager","recursos humanos","human resources","project manager","gerente","director","operaciones","operations","logística","logistics"]
  };

  var JOB_TITLES = {
    tech:      ["desarrollador","desarrolladora","programador","ingeniero de software","software engineer","developer","frontend developer","backend developer","full stack developer","data scientist","data engineer","qa engineer","sysadmin","devops engineer"],
    eng:       ["ingeniero mecánico","ingeniero industrial","ingeniero eléctrico","mechanical engineer","industrial engineer","electrical engineer","project engineer"],
    health:    ["enfermera","enfermero","médico","médica","nurse","physician","auxiliar de enfermería","fisioterapeuta","physiotherapist"],
    finance:   ["contable","auditor","auditora","analista financiero","financial analyst","accountant","controller financiero","banquero","banquera"],
    pharma:    ["químico","química","farmacéutico","farmacéutica","pharmacist","chemist","biotecnólogo","biotechnologist"],
    marketing: ["responsable de marketing","marketing manager","community manager","comercial","sales representative","brand manager","growth manager"],
    legal:     ["abogado","abogada","asesor jurídico","legal counsel","lawyer","paralegal"],
    hostel:    ["camarero","camarera","cocinero","cocinera","chef","recepcionista","hotel manager","waiter"],
    edu:       ["profesor","profesora","docente","teacher","lecturer","formador"],
    build:     ["albañil","electricista","fontanero","carpintero","electrician","plumber","site manager","jefe de obra"],
    retail:    ["dependiente","dependienta","vendedor","vendedora","cajero","cajera","store manager","sales assistant"],
    admin:     ["administrativo","administrativa","secretario","secretaria","office manager","hr manager","project manager","gerente","director de operaciones"]
  };

  function fmtNumber(n) {
    var rounded = Math.round(n / 1000) * 1000;
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  }

  function scoreCantons(sectorKey, langLevels, preferredCantonId, priorities) {
    priorities = priorities || [];
    var scored = CANTONS.map(function (c) {
      var score = 0;
      if (c.tags.indexOf(sectorKey) !== -1) score += 3;
      var levelForCanton = langLevels[c.lang] || "none";
      var levelScore = { none: 0, a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 5 };
      score += (levelScore[levelForCanton] || 0);
      if (langLevels.en && langLevels.en !== "none") score += 1;
      priorities.forEach(function (p) {
        if (c.traits && c.traits[p] != null) score += c.traits[p];
      });
      if (preferredCantonId && preferredCantonId === c.id) score += 10;
      return { canton: c, score: score };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 3).map(function (s) { return s.canton; });
  }

  /* Accent/case-insensitive matching with word boundaries, so "ingenieria"
     (common in poorly-encoded PDFs) still matches "ingeniería", and short
     keywords like "sql" don't match inside unrelated words. */
  function normalize(s) {
    return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var KEYWORD_RE_CACHE = {};
  function keywordRe(kw) {
    if (!KEYWORD_RE_CACHE[kw]) {
      KEYWORD_RE_CACHE[kw] = new RegExp("(^|[^a-z0-9à-ÿ])" + escapeRe(normalize(kw)) + "([^a-z0-9à-ÿ]|$)");
    }
    return KEYWORD_RE_CACHE[kw];
  }

  function scanCV(text) {
    if (!text || text.trim().length < 10) return { keywords: [], sectorCounts: {} };
    var norm = normalize(text);
    var found = [];
    var sectorCounts = {};
    Object.keys(CV_KEYWORDS).forEach(function (sector) {
      var count = 0;
      CV_KEYWORDS[sector].forEach(function (kw) {
        if (keywordRe(kw).test(norm)) {
          count++;
          if (found.indexOf(kw) === -1) found.push(kw);
        }
      });
      if (count > 0) sectorCounts[sector] = count;
    });
    return { keywords: found, sectorCounts: sectorCounts };
  }

  function detectTitle(text) {
    if (!text) return { title: null, sectorCounts: {} };
    var norm = normalize(text);
    var best = null;
    var sectorCounts = {};
    Object.keys(JOB_TITLES).forEach(function (sector) {
      JOB_TITLES[sector].forEach(function (title) {
        if (keywordRe(title).test(norm)) {
          sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
          if (!best || title.length > best.length) best = title;
        }
      });
    });
    var titleCased = best ? best.replace(/\w\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }) : null;
    return { title: titleCased, sectorCounts: sectorCounts };
  }

  /* Sums real "YYYY - YYYY|presente" work-history ranges (merging overlaps
     so concurrent jobs aren't double-counted) instead of the old min/max
     span of every loose 4-digit number in the document — that picked up
     birth years, postal codes, etc. and made very different CVs produce
     the same experience estimate. */
  function detectYears(text) {
    if (!text) return null;
    var now = new Date().getFullYear();
    var explicitMatch = text.match(/(\d{1,2})\s*\+?\s*(años de experiencia|years? of experience|años|year|yrs)/i);
    var explicit = explicitMatch ? parseInt(explicitMatch[1], 10) : null;

    var rangeRe = /(19|20)\d{2}\s*(?:-|–|—|a|al|hasta|to)\s*((19|20)\d{2}|actualidad|presente|actual|present|current|ongoing|hoy(?:\s+en\s+d[ií]a)?|now)/gi;
    var ranges = [], m;
    while ((m = rangeRe.exec(text))) {
      var startY = parseInt(m[0].match(/(19|20)\d{2}/)[0], 10);
      var endY = /^(19|20)\d{2}$/.test(m[2]) ? parseInt(m[2], 10) : now;
      if (startY >= 1970 && startY <= now && endY >= startY && endY <= now) ranges.push([startY, endY]);
    }
    var spanBased = null;
    if (ranges.length) {
      ranges.sort(function (a, b) { return a[0] - b[0]; });
      var merged = [ranges[0].slice()];
      ranges.slice(1).forEach(function (r) {
        var last = merged[merged.length - 1];
        if (r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
        else merged.push(r.slice());
      });
      spanBased = merged.reduce(function (sum, r) { return sum + (r[1] - r[0]); }, 0);
    }
    var result = null;
    if (explicit != null && spanBased != null) result = Math.round((explicit + spanBased) / 2);
    else result = explicit != null ? explicit : spanBased;
    if (result == null) return null;
    return Math.max(0, Math.min(40, result));
  }

  /* Continuous curve rather than the same 4 buckets the "years of
     experience" pill already uses — otherwise a CV rarely changes the
     result at all when it happens to land in the same bucket you picked. */
  function yearsToFrac(y) {
    if (y == null) return null;
    return Math.max(0, Math.min(1, y / 15));
  }

  function analyzeCV(text) {
    var scan = scanCV(text);
    var titleInfo = detectTitle(text);
    var years = detectYears(text);

    var combinedCounts = {};
    Object.keys(scan.sectorCounts).forEach(function (s) { combinedCounts[s] = (combinedCounts[s] || 0) + scan.sectorCounts[s]; });
    Object.keys(titleInfo.sectorCounts).forEach(function (s) { combinedCounts[s] = (combinedCounts[s] || 0) + titleInfo.sectorCounts[s] * 2; });

    var suggestedSector = null, bestCount = 0;
    Object.keys(combinedCounts).forEach(function (s) {
      if (combinedCounts[s] > bestCount) { bestCount = combinedCounts[s]; suggestedSector = s; }
    });

    return {
      keywords: scan.keywords,
      title: titleInfo.title,
      years: years,
      suggestedSector: bestCount > 0 ? suggestedSector : null,
      suggestedSectorCount: bestCount
    };
  }

  window.RumboSuizaQuiz = {
    SECTORS: SECTORS,
    CANTONS: CANTONS,
    PRIORITIES: PRIORITIES,

    compute: function (input) {
      var t = T[LANG];
      var sector = SECTORS[input.sector] || SECTORS.other;
      var cv = analyzeCV(input.cvText);

      var fracs = [EXP_FRAC[input.experience] != null ? EXP_FRAC[input.experience] : 0];
      if (input.seniority && SENIORITY_FRAC[input.seniority] != null) fracs.push(SENIORITY_FRAC[input.seniority]);
      var cvFrac = yearsToFrac(cv.years);
      if (cvFrac != null) fracs.push(cvFrac);
      var frac = fracs.reduce(function (a, b) { return a + b; }, 0) / fracs.length;

      var base = sector.entry + (sector.senior - sector.entry) * frac;

      var cantonMatches = scoreCantons(input.sector, input.langLevels || {}, input.cantonPref, input.priorities);
      var topCanton = cantonMatches[0];
      var mult = topCanton ? topCanton.mult : 1;
      var salary = base * mult;
      var low = Math.round(salary * 0.9);
      var high = Math.round(salary * 1.15);

      var permit;
      if (input.contract === "indefinite") permit = { title: t.permitB, desc: t.permitBDesc };
      else if (input.contract === "temporary") permit = { title: t.permitL, desc: t.permitLDesc };
      else if (input.contract === "self") permit = { title: t.permitSelf, desc: t.permitSelfDesc };
      else permit = { title: t.permitJob, desc: t.permitJobDesc };

      var steps = t.steps.slice();
      if (input.family && t.familySteps[input.family]) steps = steps.concat([t.familySteps[input.family]]);

      var suggestedSectorObj = cv.suggestedSector && cv.suggestedSector !== input.sector ? SECTORS[cv.suggestedSector] : null;

      return {
        t: t,
        sectorLabel: sector[LANG],
        permit: permit,
        salaryRange: "CHF " + fmtNumber(low) + " – " + fmtNumber(high) + (LANG === "es" ? " / año" : " / year"),
        cantons: cantonMatches,
        cvKeywords: cv.keywords,
        cvYears: cv.years,
        cvTitle: cv.title,
        cvSuggestedSectorLabel: suggestedSectorObj ? suggestedSectorObj[LANG] : null,
        cvInfluencedSalary: cvFrac != null,
        steps: steps
      };
    }
  };
})();

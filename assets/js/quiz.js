/* Rumbo Suiza — client-side estimator engine.
   Everything runs in-browser; nothing is sent anywhere. Figures are rough
   public-average approximations for orientation only, not a guarantee. */
(function () {
  "use strict";

  var LANG = window.RS_LANG === "en" ? "en" : "es";

  var SECTORS = {
    tech:    { es: "Tecnología / IT",              en: "Technology / IT",                entry: 82000,  senior: 135000 },
    eng:     { es: "Ingeniería",                    en: "Engineering",                    entry: 78000,  senior: 118000 },
    health:  { es: "Salud (enfermería, sanidad)",   en: "Healthcare (nursing, clinical)",  entry: 74000,  senior: 105000 },
    finance: { es: "Finanzas / Banca",               en: "Finance / Banking",              entry: 85000,  senior: 145000 },
    pharma:  { es: "Farmacéutica / Ciencias de la vida", en: "Pharma / Life Sciences",      entry: 80000,  senior: 125000 },
    hostel:  { es: "Hostelería / Turismo",          en: "Hospitality / Tourism",           entry: 50000,  senior: 72000  },
    edu:     { es: "Educación",                     en: "Education",                      entry: 68000,  senior: 96000  },
    build:   { es: "Construcción / Oficios",        en: "Construction / Trades",           entry: 62000,  senior: 86000  },
    retail:  { es: "Comercio / Retail",             en: "Retail / Commerce",               entry: 54000,  senior: 74000  },
    admin:   { es: "Administración / Gestión",      en: "Administration / Management",     entry: 64000,  senior: 92000  },
    other:   { es: "Otro / Generalista",            en: "Other / Generalist",              entry: 58000,  senior: 82000  }
  };

  var CANTONS = [
    { id: "zh", es: "Zúrich", en: "Zurich", lang: "de", mult: 1.14, tags: ["tech","finance","admin","other"], note: { es: "Mayor hub económico del país; alta demanda en tecnología y finanzas, alemán (o alto suizo-alemán hablado) muy útil, inglés funciona en muchas empresas internacionales.", en: "The country's biggest economic hub; strong demand in tech and finance, German is very useful, English works in many international firms." } },
    { id: "zg", es: "Zug", en: "Zug", lang: "de", mult: 1.16, tags: ["tech","finance"], note: { es: "Fiscalidad muy baja, fuerte presencia de tecnológicas y cripto, comunidad muy internacional.", en: "Very low taxes, strong tech/crypto scene, highly international community." } },
    { id: "ge", es: "Ginebra", en: "Geneva", lang: "fr", mult: 1.12, tags: ["finance","edu","admin","other"], note: { es: "Sede de organizaciones internacionales, banca privada y ONGs; francés es clave pero el inglés está muy extendido.", en: "Home to international organizations, private banking and NGOs; French matters but English is widely used." } },
    { id: "vd", es: "Vaud (Lausana)", en: "Vaud (Lausanne)", lang: "fr", mult: 1.05, tags: ["pharma","eng","edu","hostel"], note: { es: "Polo biotecnológico y universitario (EPFL), buena vida y algo más asequible que Ginebra.", en: "Biotech and university hub (EPFL), good quality of life and somewhat cheaper than Geneva." } },
    { id: "bs", es: "Basilea", en: "Basel", lang: "de", mult: 1.1, tags: ["pharma","finance","health"], note: { es: "Capital farmacéutica de Suiza (Roche, Novartis); alemán es importante en la vida diaria.", en: "Switzerland's pharma capital (Roche, Novartis); German matters day to day." } },
    { id: "ti", es: "Tesino", en: "Ticino", lang: "it", mult: 0.86, tags: ["hostel","retail","build","other"], note: { es: "Región de habla italiana, coste de vida más bajo, cercanía cultural y climática a España.", en: "Italian-speaking region, lower cost of living, culturally and climate-wise closer to Spain." } },
    { id: "be", es: "Berna", en: "Bern", lang: "de", mult: 0.98, tags: ["admin","edu","health","other"], note: { es: "Capital federal, fuerte en administración pública y sanidad, ritmo de vida más tranquilo.", en: "Federal capital, strong in public administration and healthcare, calmer pace of life." } },
    { id: "vs", es: "Valais", en: "Valais", lang: "fr", mult: 0.92, tags: ["hostel","build","other"], note: { es: "Turismo de montaña todo el año, francés/alemán según la zona, coste de vida más bajo.", en: "Year-round mountain tourism, French/German depending on the area, lower cost of living." } }
  ];

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
      cvTitle: "Palabras clave detectadas en tu CV",
      cvNone: "No se detectaron palabras clave relevantes — puedes pegar tu CV para un escaneo rápido, o directamente ignorar esta sección.",
      cvDisclaimer: "Esto es un escaneo simple de palabras clave en tu navegador, no un análisis con IA. Para una revisión real de tu CV, consulta la asesoría personalizada.",
      ctaTitle: "¿Quieres una valoración real, no solo una estimación?",
      ctaBody: "Revisamos tu caso concreto — CV, expectativas salariales, cantón y trámites — y te damos un plan de acción personalizado.",
      ctaBtn: "Solicitar asesoría personalizada",
      steps: [
        { es: "Reúne tus documentos base: DNI/pasaporte en vigor, certificado de antecedentes penales, y (si aplica) tus títulos académicos con traducción jurada." },
        { es: "Confirma tu situación de contrato: si aún buscas empleo, regístrate en los portales suizos y activa alertas en tu sector." },
        { es: "En cuanto tengas contrato u oferta firme, contacta con el Contrôle des habitants / Einwohnerkontrolle de tu futuro municipio para iniciar el permiso." },
        { es: "Contrata un seguro médico obligatorio en los primeros 3 meses tras tu llegada — es un requisito legal, no opcional." },
        { es: "Empieza (o refuerza) el idioma local del cantón elegido — incluso un nivel A2-B1 cambia mucho tu integración y tus opciones laborales." }
      ]
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
      cvTitle: "Keywords detected in your CV",
      cvNone: "No relevant keywords detected — you can paste your CV for a quick scan, or simply skip this section.",
      cvDisclaimer: "This is a simple in-browser keyword scan, not an AI analysis. For a real CV review, check out the personalized consulting service.",
      ctaTitle: "Want a real assessment, not just an estimate?",
      ctaBody: "We review your actual situation — CV, salary expectations, canton and paperwork — and give you a personalized action plan.",
      ctaBtn: "Request personalized consulting",
      steps: [
        { en: "Gather your base documents: valid ID/passport, criminal record certificate, and (if relevant) your qualifications with a certified translation." },
        { en: "Confirm your contract situation: if you're still job-hunting, register on Swiss job portals and set up alerts in your sector." },
        { en: "As soon as you have a contract or firm offer, contact the Einwohnerkontrolle / contrôle des habitants of your future municipality to start the permit process." },
        { en: "Take out mandatory health insurance within your first 3 months after arrival — it's a legal requirement, not optional." },
        { en: "Start (or strengthen) the local language of your chosen canton — even an A2-B1 level changes your integration and job options a lot." }
      ]
    }
  };

  var CV_KEYWORDS = {
    tech: ["python","java","javascript","react","cloud","aws","devops","sql","software","desarrollador","programador","data"],
    finance: ["excel","finanzas","contabilidad","auditoría","banking","accounting","audit","controller","finance"],
    health: ["enfermería","paciente","clínico","sanidad","nursing","clinical","healthcare","hospital"],
    eng: ["autocad","ingeniería","mecánico","engineering","mechanical","electrical","industrial"],
    hostel: ["hostelería","restauración","turismo","hospitality","hotel","tourism","chef","camarero"],
    edu: ["docente","profesor","teaching","education","formador","trainer"]
  };

  function fmtNumber(n) {
    var rounded = Math.round(n / 1000) * 1000;
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
  }

  function scoreCantons(sectorKey, langLevels, preferredCantonId) {
    var scored = CANTONS.map(function (c) {
      var score = 0;
      if (c.tags.indexOf(sectorKey) !== -1) score += 3;
      var levelForCanton = langLevels[c.lang] || "none";
      var levelScore = { none: 0, a1: 1, a2: 2, b1: 3, b2: 4, c1: 5, c2: 5 };
      score += (levelScore[levelForCanton] || 0);
      if (langLevels.en && langLevels.en !== "none") score += 1;
      if (preferredCantonId && preferredCantonId === c.id) score += 10;
      return { canton: c, score: score };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 3).map(function (s) { return s.canton; });
  }

  function scanCV(text) {
    if (!text || text.trim().length < 10) return [];
    var lower = text.toLowerCase();
    var found = [];
    Object.keys(CV_KEYWORDS).forEach(function (sector) {
      CV_KEYWORDS[sector].forEach(function (kw) {
        if (lower.indexOf(kw) !== -1 && found.indexOf(kw) === -1) found.push(kw);
      });
    });
    return found;
  }

  window.RumboSuizaQuiz = {
    SECTORS: SECTORS,
    CANTONS: CANTONS,

    compute: function (input) {
      var t = T[LANG];
      var sector = SECTORS[input.sector] || SECTORS.other;
      var expIdx = { "0-2": 0, "3-6": 1, "7-15": 2, "15+": 3 }[input.experience] || 0;
      var frac = [0, 0.35, 0.7, 1][expIdx];
      var base = sector.entry + (sector.senior - sector.entry) * frac;

      var cantonMatches = scoreCantons(input.sector, input.langLevels || {}, input.cantonPref);
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

      return {
        t: t,
        sectorLabel: sector[LANG],
        permit: permit,
        salaryRange: "CHF " + fmtNumber(low) + " – " + fmtNumber(high) + (LANG === "es" ? " / año" : " / year"),
        cantons: cantonMatches,
        cvKeywords: scanCV(input.cvText),
        steps: t.steps
      };
    }
  };
})();

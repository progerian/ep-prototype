(function () {
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const WEEKDAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const pad = n => String(n).padStart(2, '0');
  const toKey = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const wd = d => (d.getDay() + 6) % 7;
  const longDate = k => { const d = fromKey(k); return `${WEEKDAYS[wd(d)]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };

  const TYPE_LABEL = { Committees: 'Parliamentary committees', Other: 'Special/other events' };
  const typeLabel = t => TYPE_LABEL[t] || t;
  // One fixed order for the Event types filter, whatever the view or period
  const TYPE_ORDER = ['Plenary session', 'Committees', 'Delegations', 'President’s agenda', 'Press conference', 'Other'];
  const typeRank = t => { const i = TYPE_ORDER.indexOf(t); return i < 0 ? TYPE_ORDER.length : i; };

  const WEISS = 'Strasbourg, WEISS, N-1/201';
  const brief = (time, title, desc, extra) => Object.assign({ time, title, watch: true, type: 'Press conference', loc: WEISS, desc }, extra);
  // topic: a "COMMITTEE, COMMITTEE | Title" prefix becomes tags; report keeps the rapporteur(s) bold
  const topic = (t, r, p) => { const m = /^([A-Z]+(?:, [A-Z]+)*) \| (.*)$/.exec(t); return { t: m ? m[2] : t, r, p, c: m ? m[1].split(', ') : [] }; };
  // Plenary debate: title = kind of item (Key debate, Debate…), description = the subject, procedure file pasted as a link (no collapse)
  const plen = (time, subject, kind, proc, report) => Object.assign({ time, title: kind || 'Debate', watch: true, type: 'Plenary session', loc: 'Strasbourg',
    desc: subject + (proc && !report ? ` – <a href="#">${proc}</a>` : '') },
    proc && report ? { link: [report.replace(/^Report: ?/, '') + ' – ', proc] } : {});
  const SPAAK = 'Brussels, SPAAK, 0A50';
  const pres = (time, title, loc) => ({ time, title, type: 'President’s agenda', loc: loc || 'Strasbourg' });
  const com = (time, acr, name, loc, text, watch) => ({ time, title: `${acr} | ${name}`, watch: watch !== false, type: 'Committees', loc, more: 'Show details', text, link: ['Related links: ', 'See full Committee agenda'] });

  const DATA = {
    '2026-05-19': [
      brief('08:30 – 09:00', 'Briefing EPP', 'Manfred WEBER, President'),
      brief('09:00 – 09:30', 'Briefing Greens/EFA', 'Bas EICKHOUT and Terry REINTKE, Co-Presidents'),
      { time: '09:00 – 11:30', title: 'Debates', watch: true, type: 'Plenary session', loc: 'Strasbourg', desc: 'EU cybersecurity and preparedness in view of advanced AI systems' },
      brief('09:30 – 10:00', 'Briefing The Left', 'Manon AUBRY and Martin SCHIRDEWAN, Co-Presidents'),
      brief('10:00 – 10:20', 'Briefing S&D', 'Iratxe GARCÍA PÉREZ, President'),
      brief('10:20 – 10:40', 'Briefing ECR', 'Nicola PROCACCINI and Patryk JAKI, Co-chairs'),
      brief('10:40 – 11:00', 'Briefing Renew Europe', 'Valérie HAYER, President'),
      { time: '11:30 – 12:30', title: 'Ceremony for the European Order of Merit', watch: true, type: 'Plenary session', loc: 'Strasbourg' },
      { time: '12:30 – 13:30', title: 'Votes', watch: true, type: 'Plenary session', loc: 'Strasbourg', more: 'Read more',
        topics: [
          topic('JURI | Request for the waiver of the immunity of Harald Vilimsky', 'Report: David Cormand ( A10-0015/2026 )', '2025/2138(INI)'),
          topic('JURI | Request for the waiver of the immunity of Angelika Nimbler', 'Report: Marcin Sypniewski ( A10-0015/2026 )', '2025/2138(INI)'),
          topic('JURI | Request for the waiver of the immunity of Nikos Pappas', 'Report: Marcin Sypniewski ( A10-0015/2026 )', '2025/2138(INI)'),
          topic('AGRI | Production and marketing of forest reproductive material', 'Report: Herbert Dorfmann ( A10-0015/2026 )', '2025/2138(INI)'),
          topic('TRAN | Single European railway area: use of railway infrastructure capacity', 'Report: Tilly Metz ( A10-0015/2026 )', '2025/2138(INI)')
        ],
        media: [['Press release:', 'Plenary session: results of the votes'], ['Photos:', 'EP Plenary session - Voting session'], ['Videos:', 'Voting session']] },
      { time: '13:30 – 15:00', title: 'Debates', watch: true, type: 'Plenary session', loc: 'Strasbourg', more: 'Description', text: 'Debate on the latest developments in the Union’s relations with its neighbours.' },
      brief('14:30 – 15:00', 'Briefing Patriots for Europe', 'Jordan BARDELLA, President, Kinga GÁL, Vice-President'),
      { time: '15:00 – 23:00', title: 'Debates', watch: true, type: 'Plenary session', loc: 'Strasbourg', more: 'Description', text: 'Debates and votes on topical issues, as set out in the draft agenda.' },
      brief('17:00 – 17:30', 'The Recent Illegal Interception of the Global Sumud Flotilla', null, { desc: null })
    ],
    '2026-04-06': [
      { time: '13:45 –', title: 'President Metsola participates in an event on the occasion of World Cleanup Day', type: 'President’s agenda', loc: 'Brussels' }
    ],
    '2026-04-08': [
      { time: '10:00 – 12:30', title: 'TRAN | Committee on Transport and Tourism', watch: true, type: 'Committees', loc: 'Brussels, SPAAK, 3C050', more: 'Description',
        text: 'Debates – Exchange of views with European Coordinators for the TEN-T: Ms Catherine TRAUTMANN, Mr Pawel WOJCIECHOWSKI. Votes – Registration documents for vehicles and vehicle registration data recorded in national vehicle registers.',
        media: [['Press release:', 'Transport committee: exchange of views with the TEN-T coordinators'], ['Photos:', 'TRAN - Committee on Transport and Tourism']] },
      { time: '14:30 – 16:00', title: 'SEDE + TRAN | Joint meeting of the Committee on Security and Defence and the Committee on Transport and Tourism', watch: true, type: 'Committees', loc: 'Brussels, SPAAK, 3C050', more: 'Details', text: 'Joint hearing on military mobility.' }
    ],
    '2026-04-09': [
      { time: '09:00 – 18:30', title: 'SEDE | Committee on Security and Defence', watch: true, type: 'Committees', loc: 'Brussels, ANTALL, 4Q1', link: ['Related links: ', 'See full Committee agenda'] },
      { time: '', title: 'DROI | Subcommittee on Human Rights', watch: true, type: 'Committees', loc: 'Brussels, SPINELLI, 1E-2', more: 'Description', text: 'Exchange of views on the human rights situation in selected third countries.' },
      { time: '09:30 – 10:00', title: 'The situation in Hungary', watch: true, type: 'Press conference', loc: 'Brussels, SPAAK, 0A50' },
      { time: '09:30 – 10:00', title: 'LIBE | Committee on Civil Liberties, Justice and Home Affairs', watch: true, type: 'Committees', loc: 'Brussels, SPAAK, 3C50', more: 'Description', text: 'Votes on draft reports and exchange of views with the Commission.' },
      { time: '09:30 – 17:00', title: 'REGI | Committee on Regional Development', watch: true, type: 'Committees', loc: 'Brussels, SPINELLI, 3G-3', more: 'Description', text: 'Consideration of draft opinions.' },
      { time: '10:00 – 10:30', title: 'After the Hungarian elections – What will happen to Hungary’s EU funds?', watch: true, type: 'Press conference', loc: 'Brussels, SPAAK, 0A50' },
      { time: '13:00 –', title: 'President Metsola receives Bridget Walsh, EY head of EMEIA', type: 'President’s agenda', loc: 'Brussels' },
      { time: '18:00 –', title: 'LUX Audience Award Ceremony', type: 'Other', loc: 'Brussels, SPAAK, Hemicycle' }
    ]
    ,'2026-09-28': [
      com('14:00 – 19:15', 'ECON', 'Committee on Economic and Monetary Affairs', 'Brussels, ANTALL, 6Q2', 'Debate – Monetary Dialogue with Christine LAGARDE, President of the European Central Bank – Exchange of views.'),
      com('14:30 – 15:30', 'INTA + ITRE + IMCO', 'Joint meeting of the Committee on International Trade, the Committee on Industry, Research and Energy, and the Committee on the Internal Market and Consumer Protection', 'Brussels, ANTALL, 2Q2', 'Debate – Establishing a framework of measures for the acceleration of industrial capacity and decarbonisation in strategic sectors (2026/0068(COD)) – Consideration of draft report – Rapporteurs: Anna CAVAZZINI (Greens/EFA, DE), Christophe GRUDLER (Renew, FR), Pierre JOUVET (S&D, FR).', false),
      com('14:30 – 18:30', 'SEDE', 'Committee on Security and Defence', 'Brussels, SPINELLI, 3G3', 'Debates – Exchange of views with General Alexus G. GRYNKEWICH, NATO Supreme Allied Commander Europe (SACEUR), in association with the Delegation for relations with the NATO Parliamentary Assembly. Implementation of the common security and defence policy – annual report 2026 (2026/2060(INI)) – Consideration of draft report – Rapporteur: Nathalie LOISEAU (Renew, FR). Vote – From prototypes to capabilities – enabling new defence actors to scale up (2026/2025(INI)) – Adoption of a draft report – Rapporteur: Mārtiņš STAĶIS (Greens/EFA, LV).'),
      com('14:30 – 18:30', 'LIBE', 'Committee on Civil Liberties, Justice and Home Affairs', 'Brussels, ANTALL, 4Q2', 'Debate – The priorities of the Irish Presidency of the Council of the European Union, July – December 2026 – Exchange of views with Jim O’CALLAGHAN, Minister for Justice, Home Affairs and Migration. Votes – Establishing the exchange, assistance and training programme for the protection of the euro against counterfeiting for the period 2028-2034 (the ‘Pericles V’ programme) (2025/0258(COD)) – Adoption of draft report – Rapporteur: Michael MCNAMARA (Renew, IE). Measures to facilitate consular protection for unrepresented citizens of the Union in third countries (2023/0441(CNS)) – Adoption of draft report – Rapporteur: Lena DÜPONT (EPP, DE).'),
      com('15:00 – 17:30', 'SANT', 'Committee on Public Health', 'Brussels, SPINELLI, 3E-2', 'Debate – Marking of the World Heart Day: presentation by Olivér VÁRHELYI, Commissioner for health and animal welfare, of the EU screening week. Votes – Europe’s Beating Cancer Plan (2025/2139(INI)) – Adoption of draft report – Rapporteur: Vlad VASILE-VOICULESCU (Renew, RO). EU rare disease action plan (2025/2130(INL)) – Adoption of draft report – Rapporteur: Nicolás GONZÁLEZ CASARES (S&D, ES).'),
      com('15:00 – 18:00', 'BUDG', 'Committee on Budgets', 'Brussels, SPAAK, 5B1', 'Debates – Mobilisation of the European Union Solidarity Fund to provide assistance to Malta and Italy regarding storm Harry in January 2026 and to Portugal and Spain following the storms in January and February 2026 (2026/0284(BUD)) – Consideration of draft report – Rapporteur: Lucia YAR (Renew, SK). General budget of the European Union for the financial year 2027 – all sections (2026/0196(BUD)) – Exchange of views on budgetary amendments – Co-rapporteurs: Nils UŠAKOVS (S&D, LV), Michalis HADJIPANTELA (EPP, CY). Votes – Mobilisation of the European Globalisation Adjustment Fund: EGF/2026/001 BE/Cora (2026/0197(BUD)), EGF/2026/002 ES/Galicia automotive ancillary (2026/0195(BUD)), EGF/2026/003 FI/Valmet Automotive (2026/0220(BUD)). Union support to the Common Agriculture Policy for the period from 2028 to 2034 (2025/0241(COD)) – Adoption of draft opinion – Rapporteur for the opinion: Victor NEGRESCU (S&D, RO).'),
      com('15:00 – 18:30', 'TRAN', 'Committee on Transport and Tourism', 'Brussels, SPAAK, 1A2', 'Debates – Exchange of views on ‘The Rise of Short-Term Rental Accommodation and Sustainable Tourism: Anticipating the New EU Legislative Initiative’. A regulatory framework to promote the uptake of sustainable aviation fuels (2026/2040(INI)) – Consideration of draft report – Rapporteur: Jan-Christoph OETJEN (Renew, DE).'),
      com('15:00 – 18:30', 'PETI', 'Committee on Petitions', 'Brussels, SPINELLI, 1G3', 'Workshop – Improving the Monitoring of National Minority Rights in EU Accession Countries, organised by the Policy Department for Citizens, Equality and Culture for the Committee on Petitions.'),
      com('15:00 – 19:00', 'JURI', 'Committee on Legal Affairs', 'Brussels, SPINELLI, 1E2', 'Debates – Exchange of views on the priorities of the Irish Presidency with the Minister for Justice, Home Affairs and Migration, Jim O’CALLAGHAN. Exchange of views with the European Ombudsman Teresa ANJINHO.'),
      com('15:30 – 16:30', 'SEDE + AFCO', 'Joint meeting of the Committee on Constitutional Affairs and the Committee on Security and Defence', 'Brussels, SPINELLI, 3G3', 'Debate – Institutional aspects of the Common European Defence Union (2025/2212(INI)) – Consideration of draft report – Rapporteurs: Niclas HERBST (EPP, DE), Salvatore DE MEO (EPP, IT).', false),
      com('15:30 – 19:00', 'CULT', 'Committee on Culture and Education', 'Brussels, SPINELLI, 3G2', 'Debates – Cultural and creative sectors in the age of AI (2025/2180(INI)) – Consideration of draft report – Rapporteur: Hélder SOUSA SILVA (EPP, PT). Briefing presentation “AI in Cultural and Creative Sectors” organised by the Policy Department. Exchanges of views on the European Schools system: inclusive education and wellbeing, including addressing bullying.'),
      com('15:45 – 18:30', 'IMCO', 'Committee on the Internal Market and Consumer Protection', 'Brussels, ANTALL, 4Q1', 'Debates – Public Procurement Act – Presentation by the Commission. Affordable Housing Act – Presentation by the Commission.')
    ],
    '2026-09-29': [
      pres('11:30', 'President Metsola receives Mindaugas Sinkevičius, Prime Minister of Lithuania', 'Brussels'),
      pres('14:00', 'President Metsola receives leader of the Belarusian democratic forces, Sviatlana Tsikhanouskaya', 'Brussels'),
      pres('15:00', 'President Metsola inaugurates the David Maria Sassoli Building', 'Brussels'),
      pres('16:30', 'President Metsola addresses the Regional and Minority Languages Enriching Europe’s Diversity', 'Brussels'),
      pres('17:45', 'President Metsola addresses the EU regions on the Cohesion Policy post 2027', 'Brussels'),
      brief('11:00 – 11:30', 'Erasmus+ programme for 2028-2034', 'Bogdan Andrzej ZDROJEWSKI (EPP, PL), rapporteur', { loc: SPAAK }),
      com('10:00 – 11:00', 'CULT', 'Committee on Culture and Education', 'Brussels, ANTALL, 6Q2', 'Debate – Presentation of the study on the “Teachers shortages crisis in the European Union”. Votes – General budget of the European Union for the financial year 2027 – all sections (2026/0196(BUD)) – Adoption – Rapporteur for the opinion: Hélder SOUSA SILVA (EPP, PT). Establishing the Erasmus+ programme for the period 2028-2034 (2025/0222(COD)) – Adoption of draft report – Rapporteur: Bogdan Andrzej ZDROJEWSKI (EPP, PL).')
    ],
    '2026-09-30': [
      pres('11:15', 'President Metsola receives Verona Murphy, Ceann Comhairle of Dáil Éireann of Ireland', 'Brussels'),
      pres('14:00', 'President Metsola addresses the EU Parliamentary Democracy Forum', 'Brussels'),
      pres('16:00', 'President Metsola presides over the Conference of Presidents meeting', 'Brussels'),
      brief('11:30 – 12:00', 'The situation in Ceuta', 'Estrella GALÁN (The Left, ES), Jaume ASENS LLODRÀ (Greens/EFA, ES) and Mélissa CAMARA (Greens/EFA, FR)', { loc: SPAAK })
    ],
    '2026-10-01': [
      pres('11:15', 'President Metsola addresses an event on the 40 years of the Legal Service of the European Parliament', 'Brussels'),
      brief('10:30 – 11:00', 'PFAS and TFA in the UE: Results of the blood tests', 'Cristina GUARDA (Greens/EFA, IT) and Gordan BOSANAC (Greens/EFA, FR)', { loc: SPAAK }),
      com('09:00 – 09:15', 'ENVI + SANT', 'Joint meeting of the Committee on the Environment, Climate and Food Safety and the Committee on Public Health', 'Brussels, ANTALL, 4Q2', 'Vote – Union Civil Protection Mechanism and Union support for health emergency preparedness and response (2025/0223(COD)) – Adoption of draft report – Rapporteurs: Leire PAJÍN (S&D, ES), Aurelijus VERYGA (ECR, LT).', false),
      com('09:00 – 10:30', 'AFCO', 'Committee on Constitutional Affairs', 'Brussels, SPINELLI, 5G2', 'Debates – Amendments to Parliament’s Rules of Procedure on proxy voting during pregnancy and immediately after childbirth (2026/2105(REG)) – Consideration of draft report – Rapporteur: Juan Fernando LÓPEZ AGUILAR (S&D, ES). AFCO Mission to New York and Washington DC, USA from 20-24 July 2026 – Consideration of draft mission report. Vote – Institutional aspects of artificial intelligence in the context of European integration (2025/2118(INI)) – Adoption of draft report – Rapporteur: Emmanouil KEFALOGIANNIS (EPP, EL).'),
      com('09:00 – 12:00', 'INTA', 'Committee on International Trade', 'Brussels, ANTALL, 6Q2', 'Debates – Agreement on Digital Trade between the European Union and the Republic of Korea (2025/0273(NLE)) – Consideration of draft recommendation (consent) – Rapporteur: Lina GÁLVEZ (S&D, ES). EU–Indonesia Comprehensive Economic Partnership Agreement – Consideration of draft interim report – Rapporteur: Iuliu WINKLER (EPP, RO). 44th annual report on EU Trade defence activity – Presentation by Denis REDONNET, Chief Trade Enforcement Officer. Vote – State of play of advancing EU-Africa trade and investment relations (2026/2624(RSP)) – Adoption of question for oral answer and of motion for a resolution – Author: Bernd LANGE (S&D, DE).'),
      com('09:00 – 12:30', 'REGI', 'Committee on Regional Development', 'Brussels, SPAAK, 4B1', 'Debate – Structured dialogue with Executive Vice President Raffaele FITTO on the communication on the EU strategies for outermost regions and islands and the 2026 Annual Progress Report. Votes – Cohesion policy – the driving force in implementing the EU agenda for cities (2026/2027(INI)) – Rapporteur: Denis NESCI (ECR, IT). Cohesion policy in the EU’s eastern border regions (2026/2054(INI)) – Rapporteur: Jacek PROTAS (EPP, PL).'),
      com('09:00 – 13:00', 'EMPL', 'Committee on Employment and Social Affairs', 'Brussels, ANTALL, 4Q1', 'Vote – Boosting skills in the Union – opportunities for vocational education and training in times of transition (2026/2070(INI)) – Adoption of draft report – Rapporteur: Brigitte VAN DEN BERG (Renew, NL). Interparliamentary Committee Meeting (ICM) on “The future of the European Social Fund Plus”.'),
      com('09:15 – 12:00', 'DEVE', 'Committee on Development', 'Brussels, SPAAK, 5B001', 'Votes – Amending Decision (EU) 2021/1764 on the Association of the Overseas Countries and Territories with the European Union – Adoption of draft report – Rapporteur: Barry ANDREWS (Renew, IE). Debates – The situation of international law and the risks to multilateralism, democracy and the European Union – Consideration of draft opinion – Rapporteur: Cecilia STRADA (S&D, IT).'),
      com('09:15 – 12:30', 'ENVI', 'Committee on the Environment, Climate and Food Safety', 'Brussels, ANTALL, 4Q2', 'Debate – EU Emissions Trading System including monitoring, reporting and verification of maritime transport (2026/0210(COD)) (2026/0212(COD)) – Consideration of draft report – Rapporteur: Peter LIESE (EPP, DE). Votes – European Biotech Act (2025/0406(COD)) – Adoption of draft opinion – Rapporteur for the opinion: Nicolás GONZÁLEZ CASARES (S&D, ES). UN Climate Change Conference 2026 in Antalya, Turkey (COP31) (2026/2666(RSP)). Workshop – Managing climate risks on the road to a climate-resilient Europe, organised by the Policy Department.'),
      com('09:30 – 12:00', 'AFET', 'Committee on Foreign Affairs', 'Brussels, SPAAK, 3C050', 'Vote – EU-Syria political relations – Adoption of draft report – Rapporteur: Nathalie LOISEAU (Renew, FR). Debate – Exchange of views with the UN Under-Secretary-General Jorge Moreira da Silva, Head of the UN Task Force for the Strait of Hormuz.'),
      com('09:30 – 13:00', 'CONT', 'Committee on Budgetary Control', 'Brussels, SPINELLI, 5E2', 'Debate – Exchange of views on the proposed Anti-Fraud Architecture revision process with representatives of the Commission. Vote – Discharge 2024: General budget of the EU – European Council and Council (2025/2147(DEC)) – Adoption of draft report – Rapporteur: Pasquale TRIDICO (The Left, IT).'),
      com('10:00 – 11:30', 'DEVE + FISC', 'Joint meeting with the Committee on Development and the Subcommittee on Tax Matters', 'Brussels, SPAAK, 5B1', 'Public hearing – Promoting fair taxation, combating illicit financial flows and fighting inequalities in developing countries.', false),
      com('10:00 – 12:00', 'SEDE', 'Committee on Security and Defence', 'Brussels, SPAAK, 1A2', 'Debate – Exchange of views with Andrius KUBILIUS, European Commissioner for Defence and Space, on the implementation of the Commissioner’s Defence priorities.'),
      com('12:00 – 13:00', 'AFET + DROI + DEVE', 'Joint meeting of the Committee on Foreign Affairs and the Committee on Development and on the Subcommittee on Human Rights', 'Brussels, SPAAK, 5B1', 'Sakharov Prize 2026: Presentation of candidates.'),
      { time: '', title: 'Delegation of the Committee on Civil Liberties, Justice and Home Affairs to Europol HQ – The Hague, Netherlands', type: 'Delegations', dele: ['LIBE'], loc: 'The Hague, Netherlands',
        desc: 'MEPs will assess the implementation of recent amendments to the Europol Regulation, including the operationalisation of the new European Centre Against Migrant Smuggling (ECAMS). The mission would also provide an opportunity to gather information on operational realities in view of the Commission’s proposal to further revise Europol’s mandate, presented in June 2026. The visit will reinforce parliamentary scrutiny and democratic accountability, allowing MEPs to verify that enhanced capacities do not come at the expense of fundamental rights, including the protection of personal data.' }
    ],
    '2026-10-02': [
      pres('10:45', 'President Metsola visits ASML Headquarters', 'Eindhoven, The Netherlands'),
      pres('16:00', 'Inauguration the Europa Experience in The Hague', 'The Hague, The Netherlands'),
      pres('17:00', 'President Metsola meets with the Prime Minister of the Netherlands, Rob Jetten', 'The Hague, The Netherlands'),
      brief('11:00 – 12:00', 'Pre-session briefing', null, { loc: SPAAK, desc: null })
    ]
    ,'2026-10-05': [
      com('19:00 – 20:30', 'DROI', 'Subcommittee on Human Rights', 'Strasbourg, DE MADARIAGA, S1', 'Debates – Human Rights and Democracy in the world and the European Union’s policy on the matter – annual report 2026 (2026/2059(INI)) – Consideration of draft report – Rapporteur: Isabel WISELER-LIMA (EPP, PT). A tribute to Anna Politkovskaya 20 years after her assassination – The struggle for fundamental freedoms and against impunity in Russia, in association with the Delegation to the EU-Russia Parliamentary Cooperation Committee.'),
      com('19:00 – 21:15', 'ENVI', 'Committee on the Environment, Climate and Food Safety', 'Strasbourg, CHURCHILL, 200', 'Votes – Commission Delegated Regulation establishing the certification methodologies for carbon farming activities (2026/2819(DEA)) – Adoption of motion for a resolution – Co-authors: Tiemo WÖLKEN (S&D, DE), Michael BLOSS (Greens/EFA, DE). Commission Regulation amending the REACH regulation as regards lead in gunshot (2026/2824(RPS)) – Adoption of motion for a resolution – Author: Pietro FIOCCHI (ECR, IT). Suspending the application of the rules on the appointment of an authorised representative for extended producer responsibility (2025/0395(COD)), (2025/0396(COD)) – Adoption of draft report – Rapporteur: Ingeborg TER LAAK (EPP, NL). Objection on the draft Commission Implementing Decision renewing the authorisation for products containing, consisting of or produced from genetically modified soybean (2026/2880(RSP)) – Adoption of motion for a resolution – Co-authors: Sirpa PIETIKÄINEN (EPP, FI), Biljana BORZAN (S&D, HR), Martin HÄUSLING (Greens/EFA, DE), Anja HAZEKAMP (The Left, NL).'),
      com('19:15 – 22:00', 'EUDS', 'Special Committee on the European Democracy Shield', 'Strasbourg, WEISS, S2.2', 'Debates – Exchange of views with Alain Berset, Secretary General of the Council of Europe, on the New Democratic Pact for Europe. Exchange of views with Thomas Byrne, Minister of State for European Affairs and Defence of Ireland, on the priorities of the Irish Presidency of the Council of the European Union.'),
      com('19:30 – 20:30', 'TRAN', 'Committee on Transport and Tourism', 'Strasbourg, WEISS, N1.4', 'Vote – Connecting Europe through high-speed rail (2026/2003(INI)) – Adoption of draft report – Rapporteur: Vicent MARZÀ IBAÑEZ (Greens/EFA, ES).'),
      com('20:00 – 21:00', 'AGRI', 'Committee on Agriculture and Rural Development', 'Strasbourg, DE MADARIAGA, S5', 'Vote – EU agri-food promotion policy (2025/2089(INI)) – Adoption of draft report – Rapporteur: Salvatore DE MEO (EPP, IT).')
    ]
    ,'2026-10-06': [
      ...[['09:00 – 10:30','Key debate','Preparation of the European Council meeting of 15-16 October 2026','2026/2856(RSP)'],
          ['10:30 – 12:00','Key debate','This is Europe – Debate with the Prime Minister of Portugal, Luís Montenegro','2026/2905(RSP)'],
          ['13:00 – 14:30','Debate (or at the end of the votes)','Affordable Housing Act','2026/2918(RSP)'],
          ['14:30 – 15:00','Debate','Pilot project on European Schools Alliances and its contribution to citizenship education, democratic competences and European values','2026/2713(RSP)'],
          ['16:00 – 17:30','Debate','Effective measures to protect and empower children in the digital world','2026/2915(RSP)'],
          ['18:30 – 19:15','Debate','The 2026 undemocratic elections to the Russian State Duma and its implications on civil society','2026/2907(RSP)']].map(([t,k,ti,p]) => plen(t, ti, k, p)),
      { time: '12:00 – 13:00', title: 'Votes', watch: true, watchHref: 'video-mff-replay.html', type: 'Plenary session', loc: 'Strasbourg', more: 'Show details', media: [['Press release:', 'Plenary session 5-8 October 2026: results of the votes'], ['Photos:', 'EP Plenary session - October I 2026 - Voting session'], ['Videos:', 'Voting session']], topics: [
          topic('JURI | Request for the waiver of the immunity of Matteo Ricci', 'Report: Pascale Piera ( A10-0255/2026 )', '2026/2077(IMM)'),
          topic('SEDE, ITRE | Programme for agile and rapid defence innovation (AGILE)', 'Report: Ivars Ijabs, Tonino Picula ( A10-0188/2026 )', '2026/0078(COD)'),
          topic('EMPL | Protection of workers from the risks related to exposure to carcinogens or mutagens at work', 'Report: Liesbet Sommen ( A10-0100/2026 )', '2025/0232(COD)'),
          topic('ECON | Alignment with the EU economic governance framework and further simplification of that framework', 'Report: Markus Ferber, Carla Tavares ( A10-0099/2026 )', '2025/0311(COD)'),
          topic('ECON | Economic and budgetary surveillance of Member States in the euro area experiencing or threatened with serious difficulties with respect to their financial stability', 'Report: Markus Ferber, Carla Tavares ( A10-0097/2026 )', '2025/0312(COD)'),
          topic('ECON | Funding arrangements and the use of a diversified funding strategy', 'Report: Carla Tavares, Markus Ferber ( A10-0206/2026 )', '2025/0313(APP)'),
          topic('ENVI | Simplification of certain requirements for spatial information infrastructure in the Union (INSPIRE) (Omnibus VIII on environmental legislation)', 'Report: Emma Wiesner ( A10-0233/2026 )', '2025/0393(COD)'),
          topic('EMPL | Psychosocial risks, stress and mental health at work', 'Report: Estelle Ceulemans ( A10-0225/2026 )', '2026/2023(INL)'),
          topic('ECON | The EU’s approach to corporate tax policy in a changing international environment', 'Report: Kinga Kollár ( A10-0238/2026 )', '2025/2210(INI)')] },
      plen('15:00 – 16:00', 'Question Time (Commission) – Implementation of the Methane Regulation', 'Scrutiny session'),
      plen('17:30 – 18:30', 'Recommendation on EU-China political relations', 'Debate', '2025/2117(INI)', 'Report: Hilde Vautmans ( A10-0237/2026 )'),
      plen('19:15 – 20:00', 'The state of play of advancing EU-Africa trade and investment relations', 'Debate', '2026/2624(RSP)', 'Report: ( O-000041/2026 )'),
      pres('10:00', 'Visit of the Prime Minister of Portugal Luís Montenegro: arrival'),
      pres('10:05', 'Visit of the Prime Minister of Portugal Luís Montenegro: bilateral meeting'),
      pres('10:15', 'Visit of the Prime Minister of Portugal Luís Montenegro: joint press point'),
      pres('10:30', 'This is Europe Debate'),
      pres('14:15', 'President Metsola receives Tim Cook, Executive Chair of Apple Inc.'),
      pres('16:30', 'President Metsola receives Sir William Browder, Global Magnitsky Justice Campaign'),
      brief('08:30 – 09:00', 'Briefing EPP', 'Manfred WEBER, President'),
      brief('09:00 – 09:30', 'Briefing Greens/EFA', 'Terry REINTKE, President'),
      brief('10:00 – 10:30', 'Briefing Renew Europe', 'Valérie HAYER, President and Hilde VAUTMANS (RE, BE)'),
      brief('10:30 – 11:00', 'Briefing ECR', 'Nicola PROCACCINI and Patryk JAKI, Co-chairs'),
      brief('11:00 – 11:30', 'Briefing S&D', 'Iratxe GARCÍA PÉREZ, President'),
      brief('11:30 – 12:00', 'Briefing The Left', 'Manon AUBRY and Martin SCHIRDEWAN, Co-Presidents'),
      brief('14:00 – 14:30', 'The Court of Justice of the European Union (CJEU) as a guarantor of effective legal protection for EU citizens', 'Michał WAWRYKIEWICZ (EPP, PL), Bartłomiej SIENKIEWICZ (EPP, PL), Kamila GASIUK-PIHOWICZ (EPP, PL), Magdalena ADAMOWICZ (EPP, PL) and Marta WCISŁO'),
      brief('14:30 – 15:00', 'Briefing Patriots for Europe', 'Kinga GÁL, Vice-President'),
      brief('09:00 – 10:00', 'MFF negotiations', null, { desc: null, pin: true, watchHref: 'video-mff.html', more: 'Show details', text: 'Siegfried MUREŞAN (EPP, RO) and Carla TAVARES (S&D, PT), co-rapporteurs', media: [['Photos:', 'Press conference on MFF negotiations']] })
    ],
    '2026-10-07': [
      plen('09:00 – 10:30', 'An ambitious Multiannual Financial Framework 2028 – 2034 for a strong and resilient Europe', 'Debate', '2026/2909(RSP)'),
      plen('10:30 – 11:50', 'Empowering Europeans to address the cost-of-living crisis', 'Debate', '2026/2906(RSP)'),
      { time: '12:00 – 13:00', title: 'Votes', watch: true, type: 'Plenary session', loc: 'Strasbourg', more: 'Show details', media: [['Press release:', 'Plenary session 5-8 October 2026: results of the votes'], ['Photos:', 'EP Plenary session - October I 2026 - Voting session'], ['Videos:', 'Voting session']], topics: [
          topic('TRAN | CO2 emission class of heavy-duty vehicles with trailers', 'Report: Matteo Ricci ( A10-0131/2026 )', '2023/0134(COD)'),
          topic('ENVI, PECH | Empowering France to accede to the Inter-American Convention for the Protection and Conservation of Sea Turtles', 'Report: Mélissa Camara, Pierfrancesco Maran ( A10-0095/2026 )', '2025/0349(COD)'),
          topic('LIBE | Consular protection for unrepresented citizens of the Union in third countries', 'Report: Lena Düpont ( A10-0254/2026 )', '2023/0441(CNS)'),
          topic('BUDG | Mobilisation of the European Globalisation Adjustment Fund: application EGF/2026/002 ES/Galicia automotive ancillary – Spain', 'Report: Sandra Gómez López ( A10-0242/2026 )', '2026/0195(BUD)'),
          topic('BUDG | Mobilisation of the European Globalisation Adjustment Fund: application EGF/2026/003 FI/Valmet Automotive – Finland', 'Report: Nicolae Ștefănuță ( A10-0243/2026 )', '2026/0220(BUD)'),
          topic('BUDG | Mobilisation of the European Globalisation Adjustment Fund: application EGF/2026/001 BE/Cora – Belgium', 'Report: Hélder Sousa Silva ( A10-0241/2026 )', '2026/0197(BUD)'),
          topic('AFET | Recommendation on EU-China political relations', 'Report: Hilde Vautmans ( A10-0237/2026 )', '2025/2117(INI)')] },
      plen('13:00 – 13:45', 'Topical debate requested by a political group (Greens/EFA) (Rule 169) – Urgent need for a tax on super profits of polluters', 'Debate (or at the end of the votes)'),
      plen('13:45 – 14:45', 'The upcoming EU anti-corruption strategy', 'Debate', '2026/2790(RSP)', 'Report: ( O-000031/2026 )'),
      plen('14:45 – 16:15', 'Ensuring promotion of clean energy in European policies', 'Debate', '2026/2867(RSP)'),
      plen('16:15 – 17:45', 'The need for an EU strategy to counter Islamist entryism and the influence of the Muslim Brotherhood network', 'Debate', '2026/2868(RSP)'),
      plen('17:45 – 19:00', 'Implementation of the Nature Restoration Regulation', 'Debate', '2026/2910(RSP)'),
      { time: '19:00 – 20:00', title: 'Debates', desc: 'Debates on cases of breaches of human rights, democracy and the rule of law (Rule 150)', watch: true, type: 'Plenary session', loc: 'Strasbourg', more: 'Show details', topics: [
          topic('Human rights situation in Iran, notably the cases of Taraneh Rahimi and Leila Abolhasani', '', '2026/2912(RSP)'),
          topic('Attempts by the ruling party Georgian Dream to ban opposition parties in Georgia', '', '2026/2913(RSP)'),
          topic('The cases of Ali Karimli, Anar Mammadli and other political prisoners in Azerbaijan', '', '2026/2914(RSP)')] },
      pres('14:00', 'President Metsola signs Legislative Acts'),
      pres('14:30', 'President Metsola receives Hamish Falconer, Minister for Intergovernmental Relations and European Relations of the United Kingdom'),
      pres('17:00', 'President Metsola receives Tony Murphy, President of the European Court of Auditors'),
      brief('14:30 – 15:00', 'Closing the Gap: Adding Corruption to the EU Magnitsky Sanctions Framework', 'Petras AUŠTREVIČIUS (RE, LT), Antonio LÓPEZ-ISTÚRIZ WHITE (EPP, ES) and Thijs REUTEN (S&D, NL)'),
      brief('15:00 – 15:30', 'EU-China political relations', 'Hilde VAUTMANS (RE, BE), rapporteur'),
      { time: '08:00 – 09:00', title: 'AFET | Committee on Foreign Affairs', watch: true, type: 'Committees', loc: 'Strasbourg, CHURCHILL, 200', more: 'Show details',
        text: 'Debate – Presentation of the Communication on the pre-enlargement policy reviews by Marta KOS, Commissioner for Enlargement.', link: ['Related links: ', 'See full Committee agenda'] }
    ],
    '2026-10-08': [
      plen('09:00 – 10:00', 'Escalations in the Eastern Mediterranean and the Aegean following persistent Turkish provocations', 'Debate', '2026/2908(RSP)'),
      plen('10:00 – 11:50', 'EU strategies for islands, coastal communities and outermost regions', 'Debate', '2026/2916(RSP)'),
      { time: '12:00 – 14:00', title: 'Votes', watch: true, type: 'Plenary session', loc: 'Strasbourg', more: 'Show details', media: [['Press release:', 'Plenary session 5-8 October 2026: results of the votes'], ['Photos:', 'EP Plenary session - October I 2026 - Voting session'], ['Videos:', 'Voting session']], topics: [
          topic('Objection pursuant to Rule 115(2), (3) and (4)(c): Lead in gunshot', '', '2026/2824(RPS)'),
          topic('Human rights situation in Iran, notably the cases of Taraneh Rahimi and Leila Abolhasani', '', '2026/2912(RSP)'),
          topic('Attempts by the ruling party Georgian Dream to ban opposition parties in Georgia', '', '2026/2913(RSP)'),
          topic('The cases of Ali Karimli, Anar Mammadli and other political prisoners in Azerbaijan', '', '2026/2914(RSP)'),
          topic('Pilot project on European Schools Alliances and its contribution to citizenship education', '', '2026/2713(RSP)'),
          topic('The 2026 undemocratic elections to the Russian State Duma and its implications on civil society', '', '2026/2907(RSP)'),
          topic('The state of play of advancing EU-Africa trade and investment relations', 'Report: ( O-000041/2026 )', '2026/2624(RSP)'),
          topic('The upcoming EU anti-corruption strategy', 'Report: ( O-000031/2026 )', '2026/2790(RSP)'),
          topic('The need for an EU strategy to counter Islamist entryism and the influence of the Muslim Brotherhood network', '', '2026/2868(RSP)')] },
      plen('15:00 – 16:00', 'UN Convention on the Rights of Older Persons', 'Debate', '2026/2919(RSP)'),
      pres('10:00', 'President Metsola presides over the Conference of Presidents meeting'),
      { time: '08:30 – 11:45', title: 'CONT | Committee on Budgetary Control', watch: true, type: 'Committees', loc: 'Strasbourg, WEISS, S2.2', more: 'Show details',
        text: 'Debates – European Court of Auditors Annual Report 2025: presentation by the President of the Court Tony Murphy, exchange of views in the presence of Commissioner Piotr Serafin. Discharge 2025: General budget of the EU – Commission (2026/2079(DEC)) – hearing with Commissioner Piotr Serafin on the Integrated Financial and Accountability Reporting 2025 (IFAR).', link: ['Related links: ', 'See full Committee agenda'] },
      { time: '08:45 – 11:15', title: 'JURI | Committee on Legal Affairs', watch: true, type: 'Committees', loc: 'Strasbourg, WEISS, N1.3', more: 'Show details',
        text: 'Votes – Amendments to the Decision of the European Parliament of 28 September 2005 adopting the Statute for Members of the European Parliament, regarding proxy voting (2026/2052(INL)) – Adoption of draft report – Rapporteur: Lara WOLTERS (S&D, NL).', link: ['Related links: ', 'See full Committee agenda'] },
      { time: '09:00 – 11:15', title: 'ITRE | Committee on Industry, Research and Energy', watch: true, type: 'Committees', loc: 'Strasbourg, CHURCHILL, 200', more: 'Show details',
        text: 'Debates – The Cybersecurity Act 2 (2026/0011(COD)) and the amendment of Directive (EU) 2022/2555 (2026/0012(COD)): consideration of draft reports, Rapporteur: Markéta GREGOROVÁ (Verts/ALE, CS). Exchange of views with Patrick O’DONOVAN, Minister for Culture, Communications and Sport. Vote – Amending Regulation (EU) 2024/1252 (2025/0385(COD)): adoption of draft report, Rapporteur: Mohammed CHAHIM (S&D, NL).', link: ['Related links: ', 'See full Committee agenda'] }
    ]
  };

  const $ = id => document.getElementById(id);
  const els = {
    month: $('agMonth'), weekNav: $('agWeekNav'), days: $('agWeekDays'), prev: $('agPrevWeek'), next: $('agNextWeek'),
    count: $('agCount'), list: $('agList'), types: $('agTypes'), from: $('agFrom'), to: $('agTo'),
    center: $('agCenter'), show: $('agShow'), clear: $('agClear'), back: $('agBack'), foot: $('agFoot'), filters: $('agFilters'), toggle: $('agFiltersToggle')
  };

  const params = new URLSearchParams(location.search);
  // Demo: the clock is frozen on Friday 9 October 2026, 09:30 — "today" is the 9th and the MFF press conference (09:00 – 10:00) is live whenever the page is opened.
  // ?now=2026-10-08T10:00 simulates another moment, ?now=real uses the real clock.
  const DEMO_NOW = '2026-10-09T09:30:00';
  const nowParam = params.get('now');
  const NOW = nowParam === 'real' ? new Date() : new Date(nowParam || DEMO_NOW);
  const TODAY = toKey(NOW);   // the real date; ?now=2026-05-19T10:00 simulates another day

  // Demo: the MFF press conference is on Friday 9 October (so that day has an event), pinned first of its day
  (function () {
    const src = Object.keys(DATA).map(k => ({ k, i: DATA[k].findIndex(x => x.pin) })).find(x => x.i >= 0);
    if (!src) return;
    const item = DATA[src.k].splice(src.i, 1)[0];
    (DATA['2026-10-09'] = DATA['2026-10-09'] || []).push(item);
  })();
  const state = { from: TODAY, to: TODAY, view: 'all', types: new Set(), sub: { Committees: new Set(), Delegations: new Set() }, page: 1 };
  // deep links: ?day=2026-10-08 selects a day, ?type=President’s agenda pre-selects an event type (used by the search results)
  if (/^\d{4}-\d{2}-\d{2}$/.test(params.get('day') || '')) { state.from = state.to = params.get('day'); }
  if (params.get('type')) state.types.add(params.get('type'));
  if (params.get('range') === 'week41') { state.from = '2026-10-05'; state.to = '2026-10-11'; }
  else if (params.get('range')) { state.from = '2026-04-06'; state.to = '2026-04-15'; }

  const isRange = () => state.from !== state.to;

  function scopeKeys() {
    if (!isRange()) return [state.from];
    return Object.keys(DATA).filter(k => k >= state.from && k <= state.to).sort();
  }
  function viewFilter(it) { return state.view === 'all' || it.type === 'Plenary session' || it.type === 'President’s agenda'; }
  // One timeline: every event type mixed, ordered by start time (ties keep their authored order; untimed items close the day)
  const startMin = it => { const m = /(\d{1,2}):(\d{2})/.exec(it.time || ''); return m ? +m[1] * 60 + +m[2] : 24 * 60; };
  // a pinned item (the MFF press conference, for the demo) is listed first of its day, whatever its time
  function itemsFor(k) { return (DATA[k] || []).filter(viewFilter).sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || startMin(a) - startMin(b)); }
  // "AFET | …", "SEDE + TRAN | …" -> ['AFET'], ['SEDE','TRAN']
  const acronyms = it => { const m = /^([A-Z]+(?: \+ [A-Z]+)*) \|/.exec(it.title); return m ? m[1].split(' + ') : []; };
  const NAMES = { AFET: 'Foreign Affairs', DROI: 'Human Rights', SEDE: 'Security and Defence', DEVE: 'Development', INTA: 'International Trade', CONT: 'Budgetary Control', FISC: 'Tax Matters', EMPL: 'Employment and Social Affairs', ENVI: 'Environment, Climate and Food Safety', SANT: 'Public Health', REGI: 'Regional Development', AFCO: 'Constitutional Affairs', BUDG: 'Budgets', ECON: 'Economic and Monetary Affairs', ITRE: 'Industry, Research and Energy', IMCO: 'Internal Market and Consumer Protection', TRAN: 'Transport and Tourism', CULT: 'Culture and Education', JURI: 'Legal Affairs', LIBE: 'Civil Liberties, Justice and Home Affairs', PETI: 'Petitions', AGRI: 'Agriculture and Rural Development', EUDS: 'European Democracy Shield' };
  const fullName = c => NAMES[c] || c;
  // Second level under a type: nested checkboxes (several allowed; none ticked = all). A joint meeting shows if any of its committees is ticked.
  const SUBS = { Committees: { label: 'Committees', keys: acronyms }, Delegations: { label: 'Delegations', keys: it => it.dele || [] } };
  function visible(it) {
    if (state.types.size && !state.types.has(it.type)) return false;
    const sub = SUBS[it.type], chosen = sub && state.sub[it.type];
    return !sub || chosen.size === 0 || sub.keys(it).some(c => chosen.has(c));
  }
  const subActive = () => Object.values(state.sub).some(set => set.size);

  function renderTypes() {
    const all = scopeKeys().flatMap(itemsFor);
    const counts = {};
    all.forEach(it => { counts[it.type] = (counts[it.type] || 0) + 1; });
    state.types.forEach(t => { if (!(t in counts)) counts[t] = 0; });   // filters survive a day change: a selected type stays listed (0) even if this day has none
    const row = (id, label, n, checked) => `<label class="ag-opt"><input type="radio" name="agType" data-type="${id}" ${checked ? 'checked' : ''}> ${label} (${n})</label>`;
    const nested = type => {
      const sub = SUBS[type]; if (!sub || !state.types.has(type)) { state.sub[type] && state.sub[type].clear(); return ''; }
      const cc = {};
      all.filter(it => it.type === type).forEach(it => sub.keys(it).forEach(c => { cc[c] = (cc[c] || 0) + 1; }));
      state.sub[type].forEach(c => { if (!(c in cc)) cc[c] = 0; });
      const keys = Object.keys(cc).sort((a, b) => fullName(a).localeCompare(fullName(b)));
      return keys.length ? `<div class="ag-nested" role="group" aria-label="${sub.label}">${keys.map(c => `<label class="ag-opt"><input type="checkbox" data-sub="${type}" data-key="${c}" ${state.sub[type].has(c) ? 'checked' : ''}> ${fullName(c)} (${cc[c]})</label>`).join('')}</div>` : '';
    };
    els.types.innerHTML = row('', 'All event types', all.length, state.types.size === 0) +
      Object.keys(counts).sort((a, b) => typeRank(a) - typeRank(b)).map(t => row(t, typeLabel(t), counts[t], state.types.has(t)) + nested(t)).join('');
  }

  // Live = a streamed item whose time range contains "now" on today's date. ?now=2026-10-06T10:45 simulates another moment.
  const mins = t => { const m = /(\d{1,2}):(\d{2})/.exec(t); return m ? +m[1] * 60 + +m[2] : null; };
  function isLive(it, k) {
    if (!it.watch || k !== toKey(NOW)) return false;
    const [a, b] = it.time.split('–'); const s = mins(a || ''), e = mins(b || ''), n = NOW.getHours() * 60 + NOW.getMinutes();
    return s !== null && e !== null && n >= s && n < e;
  }

  // Streaming state shown on the title line: Live (now) · Scheduled (not started yet) · Watch (finished: replay)
  function streamState(it, k) {
    if (!it.watch) return null;
    const today = toKey(NOW);
    if (k < today) return 'watch';
    if (k > today) return 'scheduled';
    const [a, b] = (it.time || '').split('–'); const st = mins(a || ''), en = mins(b || ''), n = NOW.getHours() * 60 + NOW.getMinutes();
    if (st === null) return 'scheduled';
    if (n < st) return 'scheduled';
    if (en === null) return 'watch';
    return n < en ? 'live' : 'watch';
  }

  // "Debates – A. B. Votes – C." -> bold "Debates" / "Votes" headings, one point per line (inline <br> so the 3-line clamp still counts lines)
  const SECTION = /(?:^|(?<=[.)] ))(Debates?|Votes?|Workshop|Public hearing|Interparliamentary Committee Meeting \(ICM\))\s[–-]\s/;
  function sections(text) {
    const parts = text.split(new RegExp(SECTION.source, 'g'));
    if (parts.length < 3) return text;
    let html = parts[0] ? parts[0] : '';
    for (let i = 1; i < parts.length; i += 2) {
      const points = parts[i + 1].trim().split(/(?<=[.)])\s+(?=[A-ZÀ-Ý“‘])/);
      html += (html ? '<br>' : '') + `<b class="ag-sec">${parts[i]}</b>` + points.map(pt => '<br>' + pt).join('');
    }
    return html;
  }

  function itemHTML(it, idx, k) {
    const line = (l, v) => v ? `<p class="ag-line">${l}: ${v}</p>` : '';
    const wh = it.watchHref ? toPage(it.watchHref) : '#';
    const st = streamState(it, k);
    const stDot = it.watchHref ? `<a class="click-patch" href="${wh}" aria-hidden="true" tabindex="-1"></a>` : '';   // demo hint, same destination
    const state = !st ? '' : st === 'live' ? `<span class="ag-state"><a href="${wh}" class="ag-live" aria-label="Watch ${it.title} live"><i aria-hidden="true"></i>Watch live</a>${stDot}</span>`
      : st === 'scheduled' ? `<span class="ag-state"><a href="${wh}" class="ag-sched" aria-label="Open the streaming page of ${it.title}: it has not started yet">Scheduled streaming</a>${stDot}</span>`
      : `<span class="ag-state"><a href="${wh}" class="ag-watch" aria-label="Watch ${it.title}">Watch</a>${stDot}</span>`;
    let more = '';
    const inlineText = !!(it.more && it.text && !it.topics);
    if (it.more) {
      const topics = (it.topics || []).map(t => `<p class="ag-topic"><b>${t.c.length ? t.c.join(', ') + ' | ' : ''}${t.t}${t.p && !t.r ? ` – <a href="#">${t.p}</a>` : ''}</b>${t.r ? `<span class="ag-report">${t.r}${t.p ? ` – <a href="#">${t.p}</a>` : ''}</span>` : ''}</p>`).join('');
      const text = it.text && it.topics ? `<p class="ag-topic">${it.text}</p>` : '';   // text of an item without topics is shown inline (3 lines), see below
      // with a collapse, Related links go at the very bottom of it, styled like Media coverage
      const related = it.link ? `<div class="ag-media"><a href="#">${it.link[1]}</a></div>` : '';   // just the link, no "Related links" label
      const media = it.media ? `<div class="ag-media"><b>Media coverage</b>${it.media.map(m => Array.isArray(m) ? `<p class="ag-media-row">${m[0]} ${m.slice(1).map(l => `<a href="${MEDIA_LINKS[l] || '#'}">${l}</a>${MEDIA_LINKS[l] ? `<a class="click-patch" href="${MEDIA_LINKS[l]}" aria-hidden="true" tabindex="-1"></a>` : ''}`).join(', ')}</p>` : `<a href="#">${m}</a>`).join('')}</div>` : '';
      const panel = topics + text + media + related;
      // the revealed content (topics, media coverage, related links) comes first; the Read more toggle stays at the very end
      more = `<div class="ag-more-panel" id="agm${idx}" ${it.open ? '' : 'hidden'}>${panel}</div>
        <button class="ag-link-btn ag-more" type="button" data-desc="${inlineText ? 'agd' + idx : ''}" data-panel="${panel ? 1 : 0}" aria-expanded="${it.open ? 'true' : 'false'}" aria-controls="agm${idx}"><span class="lbl-closed">Read more</span><span class="lbl-open">Close</span> <svg class="icon icon-32 ico-chev" viewBox="0 0 24 24"><polygon points="17.66 10.42 12 16.08 6.34 10.42 7.76 9.01 12 13.25 16.24 9.01 17.66 10.42"/></svg><svg class="icon icon-24 ico-close" viewBox="0 0 24 24"><polygon points="19.07 6.34 17.66 4.93 12 10.59 6.34 4.93 4.93 6.34 10.59 12 4.93 17.66 6.34 19.07 12 13.41 17.66 19.07 19.07 17.66 13.41 12 19.07 6.34"/></svg></button>`;
    }
    const link = it.link && !it.more ? `<p class="ag-line"><a href="#">${it.link[1]}</a></p>` : '';
    return `<article class="ag-item">
      ${it.time ? `<div class="ag-time">${it.time}</div>` : ''}
      <h3 class="ag-title">${it.title}${state}</h3>
      ${line('Type', it.type === 'Other' ? 'Other' : it.type)}${line('Location', it.loc)}${it.desc || inlineText ? `<p class="ag-line ag-desc" id="agd${idx}">${it.desc || sections(it.text)}</p>` : ''}${link}${more}
    </article>`;
  }

  function badge(k) {
    const d = fromKey(k);
    return `<div class="day-badge day-badge--weekday" aria-hidden="true"><small>${SHORT[wd(d)]}</small><b>${d.getDate()}</b></div>`;
  }

  // Rule: a description shows 3 lines max; only when it overflows does a "Read more" toggle appear.
  const CHEVRON = '<svg class="icon icon-32 ico-chev" viewBox="0 0 24 24"><polygon points="17.66 10.42 12 16.08 6.34 10.42 7.76 9.01 12 13.25 16.24 9.01 17.66 10.42"/></svg>';
  function clampDescriptions() {
    els.list.querySelectorAll('.ag-desc').forEach(p => {
      const art = p.closest('.ag-item');
      const old = art.querySelector('.ag-more-desc'); if (old) old.remove();
      p.classList.remove('is-open');
      const own = art.querySelector('.ag-more');
      if (own) {                                               // items with their own collapse keep it — unless there is nothing to reveal
        // description fits in 3 lines -> no Read more: what it would reveal (media coverage, related links) is simply shown
        if (own.dataset.desc && p.scrollHeight <= p.clientHeight + 1) {
          own.remove();
          const pn = art.querySelector('.ag-more-panel');
          if (pn) { if (own.dataset.panel === '0') pn.remove(); else pn.hidden = false; }
        }
        return;
      }
      if (p.scrollHeight <= p.clientHeight + 1) return;
      art.insertAdjacentHTML('beforeend', `<button class="ag-link-btn ag-more ag-more-desc" type="button" aria-expanded="false" aria-controls="${p.id}"><span class="lbl-closed">Read more</span><span class="lbl-open">Close</span> ${CHEVRON}<svg class="icon icon-24 ico-close" viewBox="0 0 24 24"><polygon points="19.07 6.34 17.66 4.93 12 10.59 6.34 4.93 4.93 6.34 10.59 12 4.93 17.66 6.34 19.07 12 13.41 17.66 19.07 19.07 17.66 13.41 12 19.07 6.34"/></svg></button>`);
    });
  }
  window.addEventListener('resize', () => clampDescriptions());

  // user journey: agenda -> photoset page; the mobile agenda opens it inside the 380px frame (mobile -> mobile)
  const toPage = f => document.querySelector('.m-frame') ? `mobile-frame.html?p=${f}` : f;
  const MEDIA_LINKS = { 'Press conference on MFF negotiations': toPage('photoset-mff.html') };
  const PAGE_SIZE = 40;   // date range: results are cut after 40 events, then paginated
  function renderList() {
    const days = scopeKeys().map(k => ({ k, items: itemsFor(k).filter(visible) })).filter(d => d.items.length);
    const n = days.reduce((t, d) => t + d.items.length, 0);
    const pages = isRange() ? Math.max(1, Math.ceil(n / PAGE_SIZE)) : 1;
    if (state.page > pages) state.page = pages;
    let shown = days;
    if (pages > 1) {
      let from = (state.page - 1) * PAGE_SIZE, to = from + PAGE_SIZE;
      shown = []; let seen = 0;
      days.forEach(d => {
        const part = d.items.slice(Math.max(0, from - seen), Math.max(0, to - seen));
        seen += d.items.length;
        if (part.length) shown.push({ k: d.k, items: part });
      });
    }
    let idx = 0;
    const groups = shown.map(({ k, items }) => `<section class="day-accordion-item ag-day-group${k === TODAY ? ' is-today' : ''}">
        <div class="day-accordion-header is-static"><div class="day-accordion-heading">${badge(k)}<h2 class="day-accordion-title">${longDate(k)}</h2></div></div>
        <div class="day-accordion-divider"><span></span></div>
        <div class="day-accordion-body"><div class="events-list">${items.map(it => itemHTML(it, idx++, k)).join(`<hr class="divider divider--dashed">`)}</div></div>
      </section>`).join('<hr class="divider">');   // solid between days, dashed between items of a day
    els.list.innerHTML = groups || ('<p class="ag-empty">No agenda items for this selection.</p>' + (isRange() ? '' : '<hr class="divider ag-empty-rule">'));   // empty day: divider before the Previous / Next day links
    clampDescriptions();
    renderPager(pages);
    // no PDF to download when there is nothing on the selected day / range
    const dlRow = $('agDownload') && $('agDownload').parentElement;
    if (dlRow) dlRow.hidden = scopeKeys().every(k => itemsFor(k).length === 0);
    els.count.textContent = `${n} agenda ${n === 1 ? 'item' : 'items'}`;   // the range is already in the H2
  }

  // Pagination: the EP component (visual-tests/pagination.html) — 1 … current±1 … last, Previous/Next
  function renderPager(pages) {
    const nav = $('agPager'); if (!nav) return;
    nav.hidden = pages < 2; nav.innerHTML = '';
    if (pages < 2) return;
    const go = n => { state.page = n; renderList(); els.count.scrollIntoView({ block: 'start' }); };
    const navBtn = (label, arrow, target, disabled) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'nav-btn'; b.disabled = disabled;
      b.setAttribute('aria-label', label);
      b.innerHTML = arrow === 'prev' ? '<span aria-hidden="true">←</span><span class="nav-label">Previous</span>' : '<span class="nav-label">Next</span><span aria-hidden="true">→</span>';
      b.addEventListener('click', () => go(target)); return b;
    };
    if (state.page > 1) nav.appendChild(navBtn('Previous page', 'prev', state.page - 1, false));   // not applicable on the first page: omitted
    const set = [...new Set([1, pages, state.page - 1, state.page, state.page + 1])].filter(x => x >= 1 && x <= pages).sort((a, b) => a - b);
    let last = 0;
    set.forEach(x => {
      if (last && x - last > 1) { const e = document.createElement('span'); e.className = 'ellipsis'; e.textContent = '…'; nav.appendChild(e); }
      const b = document.createElement('button'); b.type = 'button'; b.className = 'page-btn' + (x === state.page ? ' is-selected' : ''); b.textContent = x;
      if (x === state.page) b.setAttribute('aria-current', 'page');
      b.addEventListener('click', () => go(x)); nav.appendChild(b); last = x;
    });
    if (state.page < pages) nav.appendChild(navBtn('Next page', 'next', state.page + 1, false));   // not applicable on the last page: omitted
  }

  function monday(k) { const d = fromKey(k); d.setDate(d.getDate() - wd(d)); return d; }
  let stripFrom = null, stripTo = null, todayObserver = null;
  function buildStrip(k) {
    const start = monday(k); start.setDate(start.getDate() - 7);
    els.days.innerHTML = '';
    for (let i = 0; i < 21; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = toKey(d);
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.date = key;
      b.disabled = wd(d) > 4;
      b.innerHTML = `<span class="ag-day-box"><span class="ag-day-name">${SHORT[wd(d)]}</span><span class="ag-day-num">${d.getDate()}</span></span>`;
      b.className = 'ag-day' + (key === TODAY ? ' is-today' : '');
      b.addEventListener('click', () => { state.from = state.to = key; sync(); });
      els.days.appendChild(b);
      if (i === 0) stripFrom = key; if (i === 20) stripTo = key;
    }
    alignStrip(k);
  }
  // Wide strips (7 days) open on the week's Monday; narrow ones (mobile, 3 days) centre the selected day instead.
  function alignStrip(k, smooth) {
    const w = els.days.querySelector('.ag-day').getBoundingClientRect().width;
    const visible = Math.round(els.days.clientWidth / w);
    const idx = Array.from(els.days.children).findIndex(b => b.dataset.date === k);
    const left = visible >= 7 ? Math.floor(idx / 7) * w * 7 : Math.max(0, (idx - (visible - 1) / 2) * w);
    smooth ? els.days.scrollTo({ left, behavior: 'smooth' }) : (els.days.scrollLeft = left);
  }
  // Days with no event (for the active filters, or at all) are greyed on the timeline (still selectable)
  function markEmptyDays() {
    els.days.querySelectorAll('.ag-day').forEach(b => b.classList.toggle('is-empty', !b.disabled && !itemsFor(b.dataset.date).some(visible)));
  }
  function renderWeek() {
    els.weekNav.hidden = isRange();
    els.month.hidden = isRange();
    els.center.hidden = isRange();
    if (isRange()) return;
    els.month.textContent = `${MONTHS[fromKey(state.from).getMonth()]} ${fromKey(state.from).getFullYear()}`;
    if (!stripFrom || state.from < stripFrom || state.from > stripTo) buildStrip(state.from);
    watchToday();
    let selectedPill = null;
    els.days.querySelectorAll('.ag-day').forEach(b => {
      const sel = b.dataset.date === state.from;
      b.classList.toggle('is-selected', sel);
      if (sel) { b.disabled = false; b.setAttribute('aria-current', 'date'); selectedPill = b; } else b.removeAttribute('aria-current');
    });
    markEmptyDays();
    if (selectedPill && Math.round(els.days.clientWidth / selectedPill.getBoundingClientRect().width) < 7) selectedPill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  function watchToday() {
    if (todayObserver) todayObserver.disconnect();
    const pill = els.days.querySelector(`[data-date="${TODAY}"]`);
    if (!pill) { els.center.classList.add('is-visible'); return; }
    todayObserver = new IntersectionObserver(([e]) => els.center.classList.toggle('is-visible', e.intersectionRatio === 0), { root: els.days, threshold: [0] });
    todayObserver.observe(pill);
  }
  // Today: back to the current day — selects it (single-day view) and brings its week into view
  els.center.addEventListener('click', () => {
    state.from = state.to = TODAY; sync();
    if (!els.days.querySelector(`[data-date="${TODAY}"]`)) buildStrip(TODAY);
    watchToday();
    alignStrip(TODAY, true);
  });
  // Arrows scroll the strip day by day while held, then coast to a stop (ease-out).
  const HOLD_SPEED = 320, COAST = 500;
  [[els.prev, -1], [els.next, 1]].forEach(([btn, dir]) => {
    let raf = null, last = null;
    const hold = ts => { if (last !== null) els.days.scrollLeft += dir * HOLD_SPEED * (ts - last) / 1000; last = ts; raf = requestAnimationFrame(hold); };
    const coast = () => {
      const t0 = performance.now(); let l = t0;
      const tick = ts => { const f = Math.max(0, 1 - (ts - t0) / COAST); els.days.scrollLeft += dir * HOLD_SPEED * f * (ts - l) / 1000; l = ts; if (ts - t0 < COAST) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    };
    const start = e => { e.preventDefault(); if (raf !== null) return; last = null; raf = requestAnimationFrame(hold); };
    const stop = () => { if (raf === null) return; cancelAnimationFrame(raf); raf = null; last = null; coast(); };
    btn.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
    btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') els.days.scrollBy({ left: dir * els.days.clientWidth / 7 * 3, behavior: 'smooth' }); });
  });

  function renderFoot() {
    if (!els.foot) return;
    els.foot.innerHTML = isRange() ? '' : `<a href="#" id="agPrevDay"><svg class="icon icon-20" viewBox="0 0 24 24"><polygon points="20 11.01 7.83 11.01 11.08 7.76 9.66 6.35 4 12.01 9.66 17.67 11.07 16.25 7.83 13.01 20 13.01 20 11.01"/></svg> Previous day</a><a href="#" id="agNextDay">Next day <svg class="icon icon-20" viewBox="0 0 24 24"><polygon points="14.33 6.33 12.92 7.75 16.16 10.99 3.99 10.99 3.99 12.99 16.16 12.99 12.91 16.24 14.33 17.65 19.99 11.99 14.33 6.33"/></svg></a>`;
    const step = d => e => { e.preventDefault(); const x = fromKey(state.from); x.setDate(x.getDate() + d); state.from = state.to = toKey(x); sync(); };
    const p = $('agPrevDay'), n = $('agNextDay');
    if (p) p.addEventListener('click', step(-1));
    if (n) n.addEventListener('click', step(1));
    const dl = $('agDownload');
    if (dl) dl.textContent = isRange() ? `Download – Agenda – ${fromKey(state.from).getDate()} to ${fromKey(state.to).getDate()} ${MONTHS[fromKey(state.to).getMonth()]} ${fromKey(state.to).getFullYear()}` : `Download the full agenda – ${longDate(state.from)}`;
  }

  const updateClear = () => { els.clear.hidden = !(isRange() || state.types.size || subActive()); };
  function sync() {
    els.from.value = state.from; els.to.value = state.to;
    els.back.hidden = !isRange();
    const rg = $('agRange');
    if (rg) { rg.hidden = !isRange(); if (isRange()) { const a = fromKey(state.from), b = fromKey(state.to);
      const sameYear = a.getFullYear() === b.getFullYear();
      rg.textContent = `${a.getDate()} ${MONTHS[a.getMonth()]}${sameYear ? '' : ' ' + a.getFullYear()} – ${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`; } }
    document.body.classList.toggle('is-range', isRange());
    state.page = 1;
    renderTypes(); updateClear(); renderWeek(); renderList(); renderFoot();
  }

  els.types.addEventListener('change', e => {
    if (e.target.dataset.sub) {
      const set = state.sub[e.target.dataset.sub], k = e.target.dataset.key;
      e.target.checked ? set.add(k) : set.delete(k);
      state.page = 1; renderList(); updateClear(); markEmptyDays(); return;
    }
    const t = e.target.dataset.type;
    Object.values(state.sub).forEach(set => set.clear());
    if (t === '') state.types.clear();
    else { state.types.clear(); state.types.add(t); }
    state.page = 1; renderTypes(); renderList(); updateClear(); markEmptyDays();
  });
  document.querySelectorAll('input[name="agView"]').forEach(r => r.addEventListener('change', () => { state.view = r.value; sync(); }));
  document.querySelectorAll('.click-patch[data-for="agShow"]').forEach(b => b.addEventListener('click', () => els.show.click()));
  els.show.addEventListener('click', () => {
    let f = els.from.value || state.from, t = els.to.value || f;
    if (f === t) { const m = monday(f); f = toKey(m); m.setDate(m.getDate() + 6); t = toKey(m); }   // prototype shortcut: one date (or none picked) = that whole week
    if (t < f) { state.from = t; state.to = f; } else { state.from = f; state.to = t; }
    sync();
    if (els.toggle) closeFilters();
  });
  els.clear.addEventListener('click', e => { e.preventDefault(); if (isRange()) state.from = state.to = TODAY; state.types.clear(); Object.values(state.sub).forEach(set => set.clear()); sync(); });
  // Back to single day: land on today when it falls inside the range, otherwise on the range's first day
  els.back.addEventListener('click', e => { e.preventDefault(); state.from = state.to = (TODAY >= state.from && TODAY <= state.to) ? TODAY : state.from; sync(); });
  els.list.addEventListener('click', e => {
    const b = e.target.closest('.ag-more'); if (!b) return;
    if (b.classList.contains('ag-more-desc')) {
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      $(b.getAttribute('aria-controls')).classList.toggle('is-open', !open);
      return;
    }
    const open = b.getAttribute('aria-expanded') === 'true';
    b.setAttribute('aria-expanded', String(!open));
    $(b.getAttribute('aria-controls')).hidden = open;
    if (b.dataset.desc) $(b.dataset.desc).classList.toggle('is-open', !open);   // the first 3 lines of the text open up too
  });
  // Mobile: Filters is a full-screen cover-up dialog — focus moves in, the page behind is locked, Esc / Back closes, focus returns.
  function openFilters() { els.filters.hidden = false; document.body.style.overflow = 'hidden'; const b = $('agFiltersBack'); if (b) b.focus(); }
  function closeFilters() { els.filters.hidden = true; document.body.style.overflow = ''; if (els.toggle) els.toggle.focus(); }
  if (els.toggle) {
    els.toggle.addEventListener('click', openFilters);
    const back = $('agFiltersBack'); if (back) back.addEventListener('click', closeFilters);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !els.filters.hidden) closeFilters(); });
  }

  sync();
})();

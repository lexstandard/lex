/**
 * formats.js — format-specific field extraction for the e2e integrity simulation.
 *
 * Each extractor receives the raw file content (string) and returns a
 * normalized `ExtractedFields` object. Fields unavailable in a given format
 * are left undefined — those gaps feed directly into the coverage report.
 *
 * @typedef {Object} ExtractedFields
 * @property {string|undefined} messageId
 * @property {string|undefined} messageType
 * @property {string|undefined} leadId
 * @property {string|undefined} senderId
 * @property {string|undefined} receiverId
 * @property {string|undefined} leadStatus
 * @property {string|undefined} leadType
 * @property {string|undefined} assetClass
 * @property {string|undefined} customerName
 * @property {string|undefined} customerEmail
 * @property {number}           fieldsCaptured   — count of defined fields
 * @property {number}           totalFields      — total fields attempted
 * @property {string[]}         missingFields
 */

const ALL_FIELDS = [
  'messageId', 'messageType', 'leadId', 'senderId', 'receiverId',
  'leadStatus', 'leadType', 'assetClass', 'customerName', 'customerEmail',
];

// Known LEX lead-type values used in REF*L1 / RFF+ADE qualifiers.
const LEX_LEAD_TYPES = new Set([
  'PRIMARY', 'CART', 'TEST_DRIVE', 'POST_ORDER', 'CROSS_SELL', 'ACCESSORY',
  'PROTECTION_PLAN', 'SUBSCRIPTION', 'RETAILER_INSTALLED_OPTION', 'SERVICE_UPGRADE',
  'TRADE_IN_EVALUATION',
]);

/**
 * Computes coverage summary after field extraction.
 * Treats undefined, null, and empty string as missing — all three mean the
 * receiver could not obtain a usable value for that field.
 * @param {Record<string, string|undefined>} fields
 * @returns {ExtractedFields}
 */
function withCoverage(fields) {
  const missing = ALL_FIELDS.filter(k => !fields[k]);
  return {
    ...fields,
    fieldsCaptured: ALL_FIELDS.length - missing.length,
    totalFields:    ALL_FIELDS.length,
    missingFields:  missing,
  };
}

/**
 * Search the raw file content for a regex pattern and return capture group 1.
 * Used to extract values encoded as key:value in EDI free-text fields (PID/IMD/FTX).
 * @param {string} raw
 * @param {RegExp} pattern
 * @returns {string|undefined}
 */
function grepRaw(raw, pattern) {
  const m = raw.match(pattern);
  return m?.[1] || undefined;
}

// ── JSON format ───────────────────────────────────────────────────────────────
// The JSON e2e scenario contains multiple messages; we parse the first LEAD.

/**
 * @param {string} raw  UTF-8 JSON content
 * @returns {ExtractedFields}
 */
export function extractJsonFields(raw) {
  try {
    const scenario = JSON.parse(raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw);

    // Scenario wrapper (e2e_scenario.json)
    let lex = scenario?.lex;
    if (!lex && Array.isArray(scenario?.messages)) {
      const first = scenario.messages.find(m => m.lex?.payload?.lead);
      lex = first?.lex;
    }

    if (!lex) return withCoverage({});

    const h    = lex.header  ?? {};
    const lead = lex.payload?.lead ?? {};
    const cust = lead.customer ?? {};

    // Customer name: contacts array or direct firstName/lastName
    let customerName;
    if (cust.firstName || cust.lastName) {
      customerName = [cust.firstName, cust.lastName].filter(Boolean).join(' ') || undefined;
    } else if (Array.isArray(cust.contacts) && cust.contacts.length > 0) {
      customerName = cust.contacts[0].name;
    }

    return withCoverage({
      messageId:    h.messageId,
      messageType:  h.messageType,
      leadId:       lead.leadId,
      senderId:     h.senderId,
      receiverId:   h.receiverId,
      leadStatus:   lead.status,
      leadType:     lead.leadType,
      assetClass:   lead.assetClass ?? lead.desiredProduct?.assetClass ?? lead.desiredAsset?.assetClass,
      customerName,
      customerEmail: cust.email ?? cust.emailAddress ?? cust.contacts?.[0]?.email,
    });
  } catch {
    return withCoverage({});
  }
}

// ── XML format ────────────────────────────────────────────────────────────────
// Lightweight regex-based extraction (avoids a DOM dependency).

/**
 * Extracts the inner text of the first occurrence of <tag>…</tag>.
 * @param {string} xml
 * @param {string} tag
 * @returns {string|undefined}
 */
function xmlText(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i'));
  return m ? m[1].trim() : undefined;
}

/**
 * @param {string} raw  UTF-8 XML content
 * @returns {ExtractedFields}
 */
export function extractXmlFields(raw) {
  return withCoverage({
    messageId:    xmlText(raw, 'messageId'),
    messageType:  xmlText(raw, 'messageType'),
    leadId:       xmlText(raw, 'leadId'),
    senderId:     xmlText(raw, 'senderId'),
    receiverId:   xmlText(raw, 'receiverId'),
    leadStatus:   xmlText(raw, 'status'),
    leadType:     xmlText(raw, 'leadType'),
    assetClass:   xmlText(raw, 'assetClass'),
    customerName: (() => {
      const fn = xmlText(raw, 'firstName');
      const ln = xmlText(raw, 'lastName');
      if (fn || ln) return [fn, ln].filter(Boolean).join(' ');
      return xmlText(raw, 'contactName') ?? xmlText(raw, 'name');
    })(),
    customerEmail: xmlText(raw, 'emailAddress') ?? xmlText(raw, 'email'),
  });
}

// ── X12 EDI format ────────────────────────────────────────────────────────────
// The sample X12 files use the 850 (Purchase Order) transaction set mapped to LEX.
// Segment element delimiter is * and segment terminator is ~.

/**
 * Parses an X12 document into a map of { segmentId: [elements[]] }.
 * Returns all segments as an array for ordered iteration.
 * @param {string} raw
 * @returns {{ id: string, elements: string[] }[]}
 */
function parseX12Segments(raw) {
  return raw
    .split(/~\r?\n?/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const parts = s.split('*');
      return { id: parts[0], elements: parts.slice(1) };
    });
}

/**
 * @param {string} raw  X12 EDI content
 * @returns {ExtractedFields}
 */
export function extractX12Fields(raw) {
  const segs = parseX12Segments(raw);

  const find  = (id)  => segs.find(s => s.id === id);
  const findAll = (id) => segs.filter(s => s.id === id);

  // ISA: sender (ISA-06) / receiver (ISA-08) / interchange control number (ISA-13)
  // ISA-13 is the best surrogate for a messageId in X12 — UUIDs are not native.
  const isa = find('ISA');
  const senderId   = isa?.elements[5]?.trim();
  const receiverId = isa?.elements[7]?.trim();
  const messageId  = isa?.elements[12]?.trim() || undefined;  // ISA-13 control number

  // BEG: purchase order
  //   BEG*00*SA*<PO/LeadId>**<Date>*<Status>   ← automotive/aviation pattern
  //   BEG*00*RQ/SA*<DomainRef>**<Date>         ← all other industries (LID is in REF*L1)
  const beg = find('BEG');

  // REF segments — build qualifier→value map
  const refs = findAll('REF');
  const refMap = {};
  for (const r of refs) {
    if (r.elements[0]) refMap[r.elements[0]] = r.elements[1];
  }

  // leadId: REF*L1 carries the LEX LID- identifier in most industries;
  //         automotive/aviation put it directly in BEG element[2].
  const refL1Value = refMap['L1'];
  const leadId = (refL1Value && refL1Value.startsWith('LID-'))
    ? refL1Value
    : beg?.elements[2] || undefined;

  // leadType: REF*L1 is used for lead type in automotive/aviation-style profiles
  //           (value = PRIMARY, CART, …). In other profiles REF*ADE carries it,
  //           mirroring the EDIFACT RFF+ADE convention. Reject any value that
  //           looks like a LEX lead ID (starts with LID-) to avoid misclassification.
  const leadType =
    (refL1Value && LEX_LEAD_TYPES.has(refL1Value))       ? refL1Value  :
    (refMap['ADE'] && LEX_LEAD_TYPES.has(refMap['ADE'])) ? refMap['ADE'] :
    undefined;

  // leadStatus: BEG element[5] in automotive/aviation-style files.
  //             Maritime, heavy-equipment, real-estate, technology do not encode it.
  const leadStatus = beg?.elements[5] || undefined;

  // assetClass: embedded as 'assetClass:MARITIME_VESSEL' in PID free-text.
  //             Automotive/aviation files do not use this keyword → undefined.
  const assetClass = grepRaw(raw, /assetClass:([A-Z_0-9]+)/i);

  // N1: party identification — N1*BY = buyer/customer
  const n1All = findAll('N1');
  const n1By  = n1All.find(n => n.elements[0] === 'BY');

  // PER: first contact segment — PER*<role>*<Name>*<qual>*<value>…
  const per = find('PER');
  const customerName  = per?.elements[1] || n1By?.elements[1] || undefined;
  const customerEmail = (() => {
    if (!per) return undefined;
    for (let i = 2; i < per.elements.length - 1; i += 2) {
      if (per.elements[i] === 'EM') return per.elements[i + 1] || undefined;
    }
    return undefined;
  })();

  return withCoverage({
    messageId,
    messageType: 'LEAD',          // all sample X12 files are LEX LEAD messages
    leadId,
    senderId,
    receiverId,
    leadStatus,
    leadType,
    assetClass,
    customerName,
    customerEmail,
  });
}

// ── EDIFACT format ────────────────────────────────────────────────────────────
// The sample EDIFACT files use ORDERS:D:96A mapped to LEX.
// Component separator ':' element separator '+' segment terminator "'"

/**
 * Parses an EDIFACT document into segments.
 * @param {string} raw
 * @returns {{ id: string, elements: string[][] }[]}
 */
function parseEdifactSegments(raw) {
  return raw
    .split("'")
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const parts = s.split('+');
      const id = parts[0];
      const elements = parts.slice(1).map(e => e.split(':'));
      return { id, elements };
    });
}

/**
 * @param {string} raw  EDIFACT content
 * @returns {ExtractedFields}
 */
export function extractEdifactFields(raw) {
  const segs = parseEdifactSegments(raw);

  const find    = (id)  => segs.find(s => s.id === id);
  const findAll = (id)  => segs.filter(s => s.id === id);

  // UNB: sender (idx 1) / receiver (idx 2) / interchange control reference (idx 4)
  // UNB-5 (interchange control reference) is the best surrogate for messageId.
  const unb = find('UNB');
  const senderId   = unb?.elements[1]?.[0];
  const receiverId = unb?.elements[2]?.[0];
  const messageId  = unb?.elements[4]?.[0] || undefined;  // UNB-5 control reference

  // BGM: document number — contains LEX leadId for automotive/aviation (LID- prefix)
  //      or a broker/domain reference for other industries (RFF+CR holds the LID).
  const bgm = find('BGM');
  const bgmDocNumber = bgm?.elements[1]?.[0];

  // RFF: reference segments — RFF+<qual>:<value> where qualifier and value are
  //      both components of the first element composite.
  const rffs = findAll('RFF');
  const rffMap = {};
  for (const r of rffs) {
    const qual  = r.elements[0]?.[0];
    const value = r.elements[0]?.[1];
    if (qual) rffMap[qual] = value;
  }

  // leadId: prefer BGM document number when it starts with LID-;
  //         otherwise use RFF+CR (the LEX canonical lead ID qualifier).
  const leadId = (bgmDocNumber?.startsWith('LID-'))
    ? bgmDocNumber
    : rffMap['CR'] || undefined;

  const leadType   = rffMap['ADE'] || undefined;  // RFF+ADE:<LeadType> — automotive/aviation only
  const leadStatus = rffMap['CT']  || undefined;  // RFF+CT:<Status>    — automotive/aviation only

  // assetClass: embedded as 'assetClass:MARITIME_VESSEL' / 'assetClass:REAL_ESTATE' etc.
  // in IMD free-text.  The ':' component separator splits the token mid-word in the
  // parsed segments, so we search the raw file content for the full 'assetClass:VALUE'
  // pattern instead.  Automotive/aviation IMD lines do not use this keyword.
  const assetClass = grepRaw(raw, /assetClass:([A-Z_0-9]+)/i);

  // NAD+BY: buyer/customer party.
  // Party name is at composite position 3 when a party ID is present (e.g. CUST-001::92),
  // but falls to position 4 when there is no party ID (NAD+BY++++ format).
  const nads = findAll('NAD');
  const nadBy = nads.find(n => n.elements[0]?.[0] === 'BY');
  const customerName = nadBy?.elements[3]?.[0] || nadBy?.elements[4]?.[0] || undefined;

  // COM: communication detail — COM+<value>:EM (email qualifier)
  const coms = findAll('COM');
  const emailCom = coms.find(c => c.elements[0]?.[1] === 'EM');
  const customerEmail = emailCom?.elements[0]?.[0] || undefined;

  return withCoverage({
    messageId,
    messageType: 'LEAD',
    leadId,
    senderId,
    receiverId,
    leadStatus,
    leadType,
    assetClass,
    customerName,
    customerEmail,
  });
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * Extract structured fields from raw content based on format.
 * @param {'json'|'xml'|'x12'|'edifact'} format
 * @param {string} raw
 * @returns {ExtractedFields}
 */
export function extractFields(format, raw) {
  switch (format) {
    case 'json':    return extractJsonFields(raw);
    case 'xml':     return extractXmlFields(raw);
    case 'x12':     return extractX12Fields(raw);
    case 'edifact': return extractEdifactFields(raw);
    default:        return withCoverage({});
  }
}

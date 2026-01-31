const { test, expect } = require('@playwright/test');

// Configuration
const CONFIG = {
  url: 'https://www.swifttranslator.com/',
timeouts: {
  pageLoad: 3000,
  afterClear: 600,
  betweenTests: 800,
  stableOutputTimeout: 20000,
  stableWindowMs: 900,
  pollIntervalMs: 200,
},
  selectors: {
    inputFieldAriaName: 'Input Your Singlish Text Here.',
    outputContainer:
      'div.w-full.h-80.p-3.rounded-lg.ring-1.ring-slate-300.whitespace-pre-wrap',
  },
};

// --- Normalization helpers (fixes "random" failures) ---
function normalizeText(str = '') {
  return String(str)
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width chars
    .replace(/[\r\n\t]+/g, ' ')            // newlines/tabs => space
    .replace(/\s+/g, ' ')                 // collapse spaces
    .trim();
}

// Test Data (from your Excel IT23224698.xlsx)
// NOTE: positives should PASS, negatives are expected to FAIL (as per sheet design)
const TEST_DATA = {
  positive: [
    {
      tcId: "Pos_Fun_0001",
      name: "Convert simple daily sentence",
      input: "mata bath onee.",
      expected: "මට බත් ඔනේ.",
      category: "· Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0002",
      name: "Convert a short daily greeting phrase",
      input: "aayuboovan!",
      expected: "ආයුබෝවන්!",
      category: "·   Greeting preserved.",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0003",
      name: "Convert compound sentence",
      input: "api kaeema kanna yanavaa saha passe chithrapatayakuth balanavaa.",
      expected: "අපි කෑම කන්න යනවා සහ පස්සෙ චිත්‍රපටයකුත් බලනවා.",
      category: "·   Daily language usage",
      length: "M",
    },
    {
      tcId: "Pos_Fun_0004",
      name: "Convert simple daily sentence",
      input: "oyaa hari, ehenam api yamu.",
      expected: "ඔයා හරි, එහෙනම් අපි යමු.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0005",
      name: "Compound sentence conversion",
      input: "oyaa enavaanam mama balan innavaa, naethnam mama yanavaa.",
      expected: "ඔයා එනවානම් මම බලන් ඉන්නවා, නැත්නම් මම යනවා.",
      category: "·   Mixed Singlish + English",
      length: "M",
    },
    {
      tcId: "Pos_Fun_0006",
      name: "Convert question form",
      input: "oyaa kohedha inne?",
      expected: "ඔයා කොහෙද ඉන්නේ?",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0007",
      name: "Convert negation sentence",
      input: "mata epaa eeka.",
      expected: "මට එපා ඒක.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0008",
      name: "Convert time-related sentence",
      input: "heta api kolabata yamu.",
      expected: "හෙට අපි කොලබට යමු.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0009",
      name: "Convert polite request",
      input: "karunaakaralaa poddak balanna.",
      expected: "කරුනාකරලා පොඩ්ඩක් බලන්න.",
      category: "·   Greeting / request / response",
      length: "S",
    },
    {
      tcId: "Pos_Fun_00010",
      name: "Convert past tense statement",
      input: "mama iiyee gedhara giyaa.",
      expected: "මම ඊයේ ගෙදර ගියා.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0011",
      name: "Convert future tense plan",
      input: "api heta yannae.",
      expected: "අපි හෙට යන්නැ.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0012",
      name: "Convert short confirmation",
      input: "ovu hari.",
      expected: "ඔවු හරි.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0013",
      name: "Convert thanks",
      input: "sthuuthi!",
      expected: "ස්තූති!",
      category: "·   Greeting / response",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0014",
      name: "Convert apology",
      input: "samaavenna.",
      expected: "සමාවෙන්න.",
      category: "·   Greeting / response",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0015",
      name: "mixed language sentence",
      input: "Zoom meeting ekak thiyennee.",
      expected: "Zoom meeting එකක් තියෙන්නේ.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0016",
      name: "Sentence with Place names",
      input: "siiyaa Colombo yanna hadhannee.",
      expected: "සීයා Colombo යන්න හදන්නේ.",
      category: "·   Names/places/common English words",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0017",
      name: "sentence with contrast",
      input: "vaessa unath api yanna epaeyi.",
      expected: "වැස්ස උනත් අපි යන්න එපැයි.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0018",
      name: "Multiple Spaces handling",
      input: "mama gedhara yanavaa.",
      expected: "මම ගෙදර යනවා.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0019",
      name: "Convert sentence about meeting",
      input: "api hamuvemu.",
      expected: "අපි හමුවෙමු.",
      category: "·   Daily language usage",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0020",
      name: "Currency and numbers",
      input: "Rs.2000",
      expected: "Rs.2000",
      category: "·   Standard currency format and numeric values preserved",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0021",
      name: "Convert mixed english words",
      input: "mata Facebook account eka login karanna bae.",
      expected: "මට Facebook account එක login කරන්න බැ.",
      category: "·   Mixed Singlish + English",
      length: "M",
    },
    {
      tcId: "Pos_Fun_0022",
      name: "Convert place name preservation",
      input: "nimeelaa Kandy giyaa.",
      expected: "නිමේලා Kandy ගියා.",
      category: "·   Names / places / common English words",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0023",
      name: "Convert punctuation handling",
      input: "supiri!",
      expected: "සුපිරි!",
      category: "·   Punctuation / numbers",
      length: "S",
    },
    {
      tcId: "Pos_Fun_0024",
      name: "Medium length conversation",
      input: "mama heta office yanavaa eehindha mata adha raee kanna baee. oyaa mata raee eka kavanna puluvandha",
      expected: "මම හෙට office යනවා ඒහින්ද මට අද රෑ කන්න බෑ. ඔයා මට රෑ එක කවන්න පුලුවන්ද",
      category: "·   Daily language usage",
      length: "M",
    },
  ],

  negative: [
    {
      tcId: "Neg_Fun_0001",
      name: "Missing spaces input",
      input: "mamagedharayanavaa",
      expected: "මම ගෙදර යනවා",
      category: "· Typographical error handling",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0002",
      name: "Joined words input",
      input: "apipassekathakaramu",
      expected: "අපි පස්සේ කතා කරමු",
      category: "· Typographical error handling",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0003",
      name: "Extra spaces stress test",
      input: "mata     oonee  eeka",
      expected: "මට ඕනෑ ඒක",
      category: "· Formatting (spaces/line breaks)",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0004",
      name: "Sinhala input in singlish box",
      input: "මම ගෙදර යනවා කමල්ටත් කියන්න",
      expected: "මමගෙදර යනවා කමල්ටත් කියන්න",
      category: "· Formatting (spaces/line breaks)",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0005",
      name: "Slang phrase",
      input: "machaang supiriyaane",
      expected: "මචාන්ග් සුපිරියානේ",
      category: "· Slang / informal language",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0006",
      name: "Colloquial expression",
      input: "adooo mokakkdha mee",
      expected: "අඩෝඕ මොකක්ක්ද මේ",
      category: "· Slang / informal language",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0007",
      name: "English word joined with singlish",
      input: "mamaWhatsAppekagiyaa",
      expected: "මම WhatsApp එකගියා",
      category: "· Mixed Singlish + English",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0008",
      name: "Abbreviation in sentence",
      input: "mata ASAP eeka oonee",
      expected: "මට ASAP ඒක ඕනෑ",
      category: "· Names / places / common English words",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0009",
      name: "Question without spaces",
      input: "oyaakohedhainnee",
      expected: "ඔයා කොහෙද ඉන්නේ",
      category: "· Typographical error handling",
      length: "S",
    },
    {
      tcId: "Neg_Fun_0010",
      name: "Line break stress test",
      input: "mama\ngedhara\nyanavaa",
      expected: "mama\ngedhara\nyanavaa",
      category: "· Formatting (spaces/line breaks)",
      length: "M",
    },
  ],

  ui: {
    tcId: "Ui_Fun_0001",
    name: "Real-time conversion on keystroke",
    input: "api",
    expectedContains: "අපි",
    category: "· Empty/cleared input handling",
    length: "S",
  },
};

// Page Object
class TranslatorPage {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto(CONFIG.url, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(CONFIG.timeouts.pageLoad);
  }

  get input() {
    return this.page.getByRole('textbox', { name: CONFIG.selectors.inputFieldAriaName });
  }

  get output() {
    return this.page
      .locator(CONFIG.selectors.outputContainer)
      .filter({ hasNot: this.page.locator('textarea') })
      .first();
  }

  async clear() {
    await this.input.clear();
    await this.page.waitForTimeout(CONFIG.timeouts.afterClear);
  }

  // ✅ key fix: wait until output becomes stable (prevents partial reads)
  async waitForStableOutput() {
    const start = Date.now();
    let last = normalizeText(await this.output.textContent());
    let lastChange = Date.now();

    while (Date.now() - start < CONFIG.timeouts.stableOutputTimeout) {
      await this.page.waitForTimeout(CONFIG.timeouts.pollIntervalMs);
      const current = normalizeText(await this.output.textContent());

      if (current && current !== last) {
        last = current;
        lastChange = Date.now();
      }

      if (current && Date.now() - lastChange >= CONFIG.timeouts.stableWindowMs) {
        return;
      }
    }

    throw new Error('Output did not stabilize in time');
  }

  async translate(text) {
    await this.clear();
    await this.input.fill(text);

    // wait until output is non-empty, then stable
    await expect(this.output).not.toHaveText('', { timeout: 10000 });
    await this.waitForStableOutput();

    return normalizeText(await this.output.textContent());
  }
}

// Tests
test.describe('SwiftTranslator - Excel Test Suite (fixed stability + normalization)', () => {
  let t;

  test.beforeEach(async ({ page }) => {
    t = new TranslatorPage(page);
    await t.navigate();
  });

  test.describe('Positive Functional Tests (Expected PASS = 24)', () => {
    for (const tc of TEST_DATA.positive) {
      test(`${tc.tcId} - ${tc.name}`, async () => {
        const actual = await t.translate(tc.input);
        const expected = normalizeText(tc.expected);
        expect(actual).toBe(expected);
        await t.page.waitForTimeout(CONFIG.timeouts.betweenTests);
      });
    }
  });

  test.describe('Negative Functional Tests (Expected FAIL = 10)', () => {
    // Intentionally strict equals (so these should FAIL, matching your sheet goal)
    for (const tc of TEST_DATA.negative) {
      test(`${tc.tcId} - ${tc.name}`, async () => {
        const actual = await t.translate(tc.input);
        const expected = normalizeText(tc.expected);
        expect(actual).toBe(expected); // <-- keep as toBe() so the test FAILS if translator differs
        await t.page.waitForTimeout(CONFIG.timeouts.betweenTests);
      });
    }
  });

  test.describe('UI Functionality Tests (Expected PASS = 1)', () => {
    test(`${TEST_DATA.ui.tcId} - ${TEST_DATA.ui.name}`, async () => {
      await t.clear();

      // type slowly to trigger real-time output
      await t.input.pressSequentially(TEST_DATA.ui.input, { delay: 150 });

      // output should contain Sinhala word quickly
      await expect(t.output).toContainText(TEST_DATA.ui.expectedContains, { timeout: 10000 });
    });
  });
});

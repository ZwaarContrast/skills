# Content clarity

What makes product text clear for the people it is written for: reading level, plain language, scannability, terminology, voice, inclusive and global wording, numbers and dates, and how to measure them. Read when: the product has screens, onboarding, help, emails or docs carrying more than a handful of labels. (Error-message wording, button labels and form copy: see web.md. Type size: see visual.md; contrast: A11Y-14.)
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## Who: set the audience first

Decide who the readers are before judging a single sentence, and state that audience in the finding. Look at: who the marketing site or README addresses, what sign-up asks for (company, role, licence number), how it is priced (per seat suggests B2B), the domain (government, health, finance, kids), how many locales ship, and any age limit. If the signals disagree, or the public uses the product, judge against the general-public line. Each rule below pairs an audience with its target.

- **TEXT-1** General public: aim no higher than a reading age of 9; the UK Home Office keeps that ceiling for specialist readers as well. In US grades, NN/g puts general audiences at 6th-8th grade and a broad consumer audience at 8th grade. Check: score each screen (Measure); for UK public-sector or GOV.UK-style products flag anything above grade 4 (reading age 9 by the conversion table the Home Office links [33]), for other general-public products anything above grade 8 (NN/g). [6][7][8]
- **TEXT-2** Lower-literacy readers (public services, health, benefits, mass-market products): 6th grade on the homepage, main category pages and landing pages, 8th grade on the rest; lead with the main point, keep one column and static text, because these readers go through text word by word instead of skimming. Check: grade by page type; key pages with two text columns or content reachable only through fly-out menus. [9]
- **TEXT-3** Professionals and experts (B2B, clinical, legal, developer tools): 10th-12th grade is fine; beyond 12th grade even highly educated readers have to work too hard. Experts still prefer short, skimmable text, and GOV.UK reports that highly literate readers favour plain English too, so "our users are experts" never justifies dense copy. Check: any screen scoring above grade 12; long unbroken paragraphs in expert tools. [1][7][8]
- **TEXT-4** Experts: keep a technical term only when you are sure this audience knows it, and move explanations meant for secondary readers into another layer (link, tooltip, glossary) so they do not slow down the main flow. Check: unexplained acronyms during onboarding; inline definitions experts must wade through on every visit. [7]
- **TEXT-5** Children: match each child's own school grade and design for one narrow age band (3-5, 6-8 or 9-12); NN/g saw children reject content pitched one grade off their own and skip long blocks of instructions. Check: a single set of copy aimed at ages 3 to 12; instructions longer than a few lines. [10]
- **TEXT-6** Readers with cognitive or learning disabilities (health, care, public services, any WCAG AAA target): apply TEXT-12, TEXT-13, TEXT-19, TEXT-32 and TEXT-46. Where text demands more than lower secondary education (7-9 years of schooling), offer supplemental content or an easier version (WCAG 3.1.5, AAA). Check: long or complex text with no summary, illustration or easy-read alternative next to it. [22][23]

## Plain language (every audience)

- **TEXT-7** Break up any sentence longer than 25 words (GOV.UK); NN/g targets roughly 15-20 words. Check: words per sentence from Measure; list each sentence above 25 words. [1][7]
- **TEXT-8** Give each sentence a single idea; when a sentence carries subordinate clauses or exceptions, split them into sentences of their own. Check: sentences chained with repeated and/or/but, or carrying except, unless, provided that. [17]
- **TEXT-9** Keep paragraphs to 5 sentences or fewer (GOV.UK), each about one topic and opening with it. digital.gov sets 150 words as the usual ceiling and 250 words as the absolute limit. Check: count sentences and words per paragraph. [1][17]
- **TEXT-10** Prefer active voice so the reader can see who does what; passive is acceptable where the law makes one step follow another. Use indicative mood in explanations and imperative in procedures. Check: read for passives with no actor (is/are/was/were/be/been + past participle); steps written as descriptions instead of commands. [1][16][24]
- **TEXT-11** Prefer present tense and plain verbs; turn nouns built from verbs back into verbs ("make a decision" becomes "decide", "provide assistance" becomes "help"). Check: grep `(make|provide|perform|conduct) (a |an )?\w+(ion|ment|ance)` for candidates, then read. [16][23]
- **TEXT-12** Pick short everyday words over formal ones ("buy" over "purchase", "use" over "utilise/utilize", "start" over "commence"; delete "in order to"). COGA points to the 1500 most common words as a vocabulary guide. Check: run the GOV.UK words-to-avoid list and the digital.gov substitution table against the locale files. [1][5][18][23]
- **TEXT-13** Keep sentence structure simple: state positives without double negatives and do not nest one clause inside another. Check: grep `not (un|in|dis)\w+` and `cannot not`; read for "not ... unless". [23]
- **TEXT-14** Talk to the reader directly as "you". Check: text about the reader that says "the user", "users" or "customers". [4][23]
- **TEXT-15** Explain a specialist term at its first appearance and leave out buzzwords. For words used in a special or narrow sense, idioms and jargon included, offer a way to find the definition (WCAG 3.1.3): inline at first use, a linked definition or a glossary. Check: a term that appears before its definition, or never gets one. [1][20]
- **TEXT-16** Write about half as many words as print would use; in NN/g testing, concise text scored 58% better and the concise, scannable and objective version 124% better. Check: welcome text and empty states that restate what the interface already shows. [11]
- **TEXT-17** Stay objective and drop promotional adjectives: objective wording tested 27% better, and GOV.UK warns that adjectives make text sound emotive and like spin. Check: "powerful", "seamless", "simply", "easy", "world-class" on task screens. [4][11]
- **TEXT-18** Leave "please" and "please note" out of instructions. Check: grep -i `please note|please`. [4]
- **TEXT-19** Say things literally and concretely; if a metaphor or simile stays, explain it. Check: read for idioms such as "ballpark", "touch base", "under the hood". [23]

## Scannability

- **TEXT-20** Lead with what matters most (inverted pyramid): the conclusion opens the page and each paragraph opens with its key sentence. Most people skim: NN/g found 79% of test users always scanned a new page and 16% read word by word, and GOV.UK says users read 20-28% of a page. Check: the screen's main answer or action comes only after background text. [2][11][13]
- **TEXT-21** Get the key points into the first two paragraphs. Check: screenshot; the key point sits after paragraph 2 or below the fold. [12]
- **TEXT-22** Write headings that describe their section: no generic ones ("Introduction", "Overview", "Details"), no questions, and the most informative words first so the opening two words identify the section. Check: list every h2-h4; flag generic, clever or question headings. [2][11][12]
- **TEXT-23** Give the page one H1 as its title with H2-H4 beneath; the text must make sense even if the headings are removed. Check: `document.querySelectorAll('h1').length !== 1`; skipped heading levels. [2]
- **TEXT-24** Turn sets of items and processes into bulleted or numbered lists, and replace complex sentences and paragraphs with lists or tables. Check: a sentence that runs through 3+ items or steps inline. [12][24]
- **TEXT-25** Open long pages with a summary, and do not restate it in the first paragraph. Check: help or docs pages without a summary, or with the summary repeated. [2]
- **TEXT-26** Let link text name the destination or action, with the relevant words first; avoid "click here", "more" and "learn more"; a one-word link needs a word of 3 or more syllables. Check: grep link text `>(click here|here|more|learn more|read more)<`. [3][29]
- **TEXT-27** Do not make text depend on seeing the layout ("in the sidebar", "the button on the right", "see below"). Check: grep -i `(sidebar|on the (left|right)|above|below|red|green) `. [29]

## Terminology and consistency

- **TEXT-28** Name each concept with one word throughout, and never reuse one word for two concepts. Check: build a term list from the locale files (e.g. "workspace/project/space", "delete/remove", "sign in/log in") and flag synonyms for the same object or action. [24]
- **TEXT-29** Use the readers' vocabulary rather than the team's: choose the word the audience knows best and the words they would type into a search engine; swap invented brand names for plain terms, or at least pair them. Check: product-coined nouns in navigation and headings with no plain-word gloss. [7]
- **TEXT-30** Do not coin words or stretch existing words to new meanings. Check: internal code names, database field names or enum values showing in the UI (`snake_case`, `camelCase`, ALLCAPS_ENUM in visible text). [23]
- **TEXT-31** Write an abbreviation out in full at its first use on a page and use the short form after that; only well-known ones (BBC, NHS, UK) or ones search data shows people know may skip this. WCAG 3.1.4 (AAA) needs a way to reach the expansion, such as the full form right before or after first use; `<abbr>` by itself is only advisory. Check: regex `\b[A-Z]{2,}\b` per screen, then confirm each has an expansion earlier on the same page. [5][21]
- **TEXT-32** For cognitive-disability audiences, drop or explain uncommon acronyms, abbreviations and jargon; for global audiences, keep to common abbreviations (USB) or those in a glossary. Check: acronyms from TEXT-31 that are neither expanded nor in the product's glossary, on screens serving these audiences. [23][24]
- **TEXT-33** Keep one word per level of obligation: "must" (not "shall") for requirements, and "must not", "may", "should" for the rest. Check: grep `\bshall\b` in terms, policies and settings help. [18]
- **TEXT-34** Capitalise sentence-style in headings, titles and UI labels (first word and proper nouns only); no all caps for emphasis or for long text; no capitals inside words unless a brand has them. Check: Title Case Headings in locale strings; `text-transform: uppercase` on body text. [5][26]

## Global English

- **TEXT-35** For non-native readers and machine translation (global products, more than one locale), apply this rule and TEXT-36 to TEXT-40. Start by cutting idioms, colloquialisms and references that only one culture gets (sports, holidays, local history). Check: read for them; grep a short idiom list. [24]
- **TEXT-36** Keep the normal subject-verb-object order and keep the "that", "who" and articles that help translation. Check: telegraphic strings whose meaning is unclear (a label such as "Access denied" can read better as "Access is denied"). [24]
- **TEXT-37** Break up modifier stacks (long runs of nouns and adjectives in front of a noun). Check: 4+ nouns or adjectives in a row before the head noun. [24]
- **TEXT-38** Join no more than three phrases or clauses with and/or/but, and preferably no more than two. Check: count coordinating conjunctions per sentence. [24]
- **TEXT-39** Use few sentence fragments, and make the role of -ing and -ed words clear with a determiner or a form of "be". Check: verbless fragments in body text; ambiguous -ed/-ing phrases such as "added functionality" with no article. [24]
- **TEXT-40** Talk about months or quarters rather than seasons; if a season must appear, say which hemisphere. Check: grep -i `(spring|summer|autumn|fall|winter) (release|sale|update)`. [25]

## Inclusive language

- **TEXT-41** Keep wording gender-neutral: "you", singular "they", role names (reader, customer); no "he/she" or "s/he" for a generic person; neutral nouns (chair, staff, workforce). Check: grep -iw `he|she|his|her|he/she|s/he|chairman|manpower|mankind|salesman`. [5][27]
- **TEXT-42** Put the person before the disability (people who are blind, not "the blind"), leave out words that signal pity ("suffering from", "stricken with"), and mention a disability only when it matters. Check: grep -i `suffer|stricken|wheelchair-bound|handicapped`. [27]
- **TEXT-43** Replace terms carrying racial, military or historical baggage: primary/subordinate for master/slave, perimeter network for DMZ, "stop responding" for "hang". Check: grep -iw `master|slave|whitelist|blacklist|kill|abort|hang` in UI strings. [27]
- **TEXT-44** In examples, vary names and roles, pick places that are not disputed, avoid generalising about people or regions, and avoid slang or appropriated phrases ("spirit animal"). Check: sample data, placeholder names, onboarding personas. [27]

## Numbers, dates and units

- **TEXT-45** Write numbers in digits ("23", and 2 to 9 too); add a comma above 999 ("9,000"); write ranges as "500 to 900" rather than "500-900" outside tables. The sources disagree on a number that opens a sentence: GOV.UK writes it out, NN/g keeps digits. Check: grep spelled-out numbers `\b(two|three|four|five|six|seven|eight|nine|ten)\b` near units. [5][15]
- **TEXT-46** Write large numbers as digits plus a magnitude word ("24 billion", "138 billion" with the currency symbol); explain trillions for most readers and billions for less numerate or international ones. COGA asks for alternatives to numbers and numerical ideas. Check: raw figures longer than 7 digits in the UI; percentages or rates given to a public audience with no plain comparison. [5][15][23]
- **TEXT-47** State exact figures when they are known; use words only for amounts that are not specific facts ("thousands of"). Check: vague quantities ("many", "a number of", "lots of") where the product holds the real count. [15]
- **TEXT-48** Give dates with the month as a word and without ordinals: "4 June 2017" (GOV.UK) or "January 5, 2018" (Microsoft); never all-digit dates like 05/01/2018 for an international audience; "to" rather than a dash in date and time ranges; "on or before" for deadlines. Check: grep `\d{1,2}/\d{1,2}/\d{2,4}` and `toLocaleDateString()` with no explicit month format. [5][25]
- **TEXT-49** Make times easy to read: "5:30pm" rather than "1730hrs", "midday"/"midnight" rather than "12pm"/"00:00", "11:59pm" for a cut-off; add the time zone when it matters (events, deadlines) unless the time is already shown in the reader's local time. Check: deadlines with no time zone in a product used across regions. [5][25]
- **TEXT-50** Money: use the currency symbol and show ".00" only when there are pence or cents (GOV.UK: 75.50 is fine, 75.00 is not); pair "%" with a number. Check: grep `\.00\b` in rendered prices. [5]

## Voice and tone

- **TEXT-51** Hold one voice across the product and shift tone to match the reader's emotional state and the subject; Mailchimp frames voice as constant and tone as changing. Check: compare onboarding, billing, error and email copy for a voice that changes between them. [14][28]
- **TEXT-52** Leave humour out where readers are frustrated or see the message repeatedly (errors, retries, failures), since NN/g found it can annoy; Mailchimp's default when in doubt is to stay serious. Error-message content and blame: see web.md. Check: jokes, puns or emoji on error, payment, data-loss or security screens. [14][28]
- **TEXT-53** Stay away from the extremes of NN/g's four tone dimensions (formal-casual, serious-funny, respectful-irreverent, matter-of-fact-enthusiastic), and suit tone to the brand and domain (a bank's error message should not be playful). Check: exclamation marks and slang in finance, health or legal flows. [14]
- **TEXT-54** For public health or risk messages, use the CDC Clear Communication Index (20 scored items, among them one main message placed at the top, active voice, common numbers, number meaning, behavioural recommendation); OADC recommends a score of 90 or more out of 100, agreed by two reviewers. Check: a health or risk page without one main message at the top or without a clear action for the reader; score it on the Index sheet. [30]

## Destructive verbs

- **TEXT-55** "Delete" means the thing is gone from the system (perhaps to a trash first); "Remove" means it leaves this list, view or collection but still exists. Pair them the way people expect — Create with Delete, Add with Remove — and use the same verb for one action on the button, the menu, the confirmation and the toast that follows.
  Check: grep the labels and copy; a "Remove" that destroys data, a "Delete" that only hides it, or one action named differently in two places. [34][35][36]

## Measure

Reading is the method; readability formulas only screen. NN/g notes they count word and sentence length, which only approximates difficulty, and that grade levels are approximate as well [8]. W3C fell back on reading level because it found no way to test for clear language directly, and says no Easy to Read version suits everyone [22]. digital.gov tests understanding with people: paraphrase testing for short pages, usability testing for longer content and forms, and at least two rounds [19]. Put a formula score next to the actual sentence as supporting evidence, never on its own.

1. Collect the visible text per screen. Running app (Playwright, documented, not run here): `const text = await page.locator('main, body').first().innerText();` — `innerText()` returns the element's `innerText`, so hidden elements drop out [32]. With no running app, read the locale files (`locales/*.json`, `*.po`, `*.strings`, `strings.xml`) and judge each string in its context.
2. Score it with `textstat` (PyPI, v0.7.13; run here) [31]. Save one screen's text as `page.txt`, then:
   ```
   uv run --with textstat python -c "import sys,textstat as t; s=open(sys.argv[1]).read(); print('FK grade', t.flesch_kincaid_grade(s), '| ease', t.flesch_reading_ease(s), '| consensus', t.text_standard(s, float_output=True), '| words/sentence', round(t.lexicon_count(s)/t.sentence_count(s),1))" page.txt
   ```
   Verified output for one 16-word legalese sentence: `FK grade 23.8 | ease -47.3 | consensus 13.0`. Compare grades with TEXT-1 to TEXT-3. textstat reports US grades; the conversion table the Home Office links puts US ages 8-11 at grades 3-6 and ages 13-14 at about grade 8 [33], so reading age 9 is about grade 4. Either line only screens; reading decides.
3. Caveats from the textstat page: `flesch_reading_ease` has no floor (negative scores happen); `smog_index` needs 3 or more sentences and was normed on 30-sentence samples; every function implements en_US, and `textstat.set_lang("de")` etc. changes syllable rules only where a variant exists. Score prose only: labels, navigation, tables and code distort sentence counts, and a page of short UI strings scores deceptively easy.
4. Grep starters (find candidates, then read each): sentences over 25 words (split step 2's text on `[.!?]`); acronyms `\b[A-Z]{2,}\b`; words to avoid (TEXT-12); link text (TEXT-26); gendered and biased terms (TEXT-41 to TEXT-43); numeric dates (TEXT-48). Passive voice and jargon have no dependable grep: `\b(is|are|was|were|be|been|being)\s+\w+ed\b` returns candidates with many false positives (adjectives) and misses irregular participles, so confirm each by reading.

## Sources

Contains public sector information licensed under the Open Government Licence v3.0 (https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
Credit: the Microsoft Writing Style Guide, Copyright Microsoft Corporation, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Credit: W3C documents [20]-[23], Copyright World Wide Web Consortium, the W3C Software and Document License (https://www.w3.org/copyright/software-license/); no W3C text is reproduced.

[1] GOV.UK — Writing to GOV.UK standards: Use clear language — https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-language/
[2] GOV.UK — Writing to GOV.UK standards: Create a clear structure — https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/clear-structure/
[3] GOV.UK — Writing to GOV.UK standards: Add links — https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/add-links/
[4] GOV.UK — Writing to GOV.UK standards: Use the right tone — https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/writing-guidelines/right-tone/
[5] GOV.UK — A to Z style guide — https://guidance.publishing.service.gov.uk/writing-to-gov-uk-standards/style-guides/a-to-z-style-guide/
[6] UK Home Office Design System — Readability — https://design.homeoffice.gov.uk/accessibility/written-content/readability
[7] Nielsen Norman Group — Plain Language Is for Everyone, Even Experts — https://www.nngroup.com/articles/plain-language-experts/
[8] Nielsen Norman Group — Legibility, Readability, and Comprehension — https://www.nngroup.com/articles/legibility-readability-comprehension/
[9] Nielsen Norman Group — Writing for Lower-Literacy Users — https://www.nngroup.com/articles/writing-for-lower-literacy-users/
[10] Nielsen Norman Group — Children's Websites: Usability Issues — https://www.nngroup.com/articles/childrens-websites-usability-issues/
[11] Nielsen Norman Group — How Users Read on the Web — https://www.nngroup.com/articles/how-users-read-on-the-web/
[12] Nielsen Norman Group — F-Shaped Pattern of Reading on the Web — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
[13] Nielsen Norman Group — Inverted Pyramid — https://www.nngroup.com/articles/inverted-pyramid/
[14] Nielsen Norman Group — The Four Dimensions of Tone of Voice — https://www.nngroup.com/articles/tone-of-voice-dimensions/
[15] Nielsen Norman Group — Show Numbers as Numerals — https://www.nngroup.com/articles/web-writing-show-numbers-as-numerals/
[16] digital.gov — Plain language: Writing for understanding — https://digital.gov/guides/plain-language/writing
[17] digital.gov — Plain language: Clear and short — https://digital.gov/guides/plain-language/writing/clear-short
[18] digital.gov — Plain language: Familiar terms — https://digital.gov/guides/writing-understanding/familiar-terms
[19] digital.gov — Plain language: Test for understanding — https://digital.gov/guides/plain-language/test
[20] W3C — Understanding SC 3.1.3 Unusual Words — https://www.w3.org/WAI/WCAG22/Understanding/unusual-words.html
[21] W3C — Understanding SC 3.1.4 Abbreviations — https://www.w3.org/WAI/WCAG22/Understanding/abbreviations.html
[22] W3C — Understanding SC 3.1.5 Reading Level — https://www.w3.org/WAI/WCAG22/Understanding/reading-level.html
[23] W3C COGA — Making Content Usable for People with Cognitive and Learning Disabilities (4.4.1-4.4.5, 4.4.13) — https://www.w3.org/TR/coga-usable/
[24] Microsoft Writing Style Guide — Global communications: Writing tips — https://learn.microsoft.com/en-us/style-guide/global-communications/writing-tips
[25] Microsoft Writing Style Guide — Time and place — https://learn.microsoft.com/en-us/style-guide/global-communications/time-place
[26] Microsoft Writing Style Guide — Capitalization — https://learn.microsoft.com/en-us/style-guide/capitalization
[27] Microsoft Writing Style Guide — Bias-free communication — https://learn.microsoft.com/en-us/style-guide/bias-free-communication
[28] Mailchimp Content Style Guide — Voice and tone — https://styleguide.mailchimp.com/voice-and-tone/
[29] Mailchimp Content Style Guide — Writing for accessibility — https://styleguide.mailchimp.com/writing-for-accessibility/
[30] CDC — Clear Communication Index (and How to Use the Index) — https://www.cdc.gov/ccindex/index.html , https://www.cdc.gov/ccindex/tool/how-to-use.html
[31] textstat on PyPI — https://pypi.org/project/textstat/
[32] Playwright — Locator.innerText — https://playwright.dev/docs/api/class-locator#locator-inner-text
[33] Readable — Flesch Reading Ease and Flesch-Kincaid Grade Level (conversion table linked from [6]) — https://readable.com/readability/flesch-reading-ease-flesch-kincaid-grade-level/
[34] Microsoft Writing Style Guide, delete — https://learn.microsoft.com/en-us/style-guide/a-z-word-list-term-collections/d/delete
[35] Microsoft Writing Style Guide, remove — https://learn.microsoft.com/en-us/style-guide/a-z-word-list-term-collections/r/remove
[36] UX Magazine, UI copy: Remove vs Delete (Alex Zlatkus, 2020; practitioner article) — https://uxmag.com/articles/ui-copy-remove-vs-delete2-banner

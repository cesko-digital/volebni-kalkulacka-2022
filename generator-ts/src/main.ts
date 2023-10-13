// import the necessary modules
import * as process from 'process';
import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';
import {
  instanceToPlain,
  instanceToInstance,
  ClassConstructor,
  plainToClass,
} from 'class-transformer';

import {
  type CUrl,
  type CalculatorRowData,
  Calculators,
  type QuestionsPoolRowData,
  QuestionsPool,
  // Calculator,
  Questions,
  type QuestionRowData,
  type CandidatesPoolRowData,
  CandidatesPool,
  type CandidatesRowData,
  Candidates,
  type DistrictsPoolRowData,
  DistrictsPool,
  type DistrictsRowData,
  Districts,
  type AnswersRowData,
  Answers,
  CalculatorRow,
  QuestionsRow,
  QuestionsPoolRow,
  L10ns,
  L10nsRowData,
} from './input/types';

import {
  convertToQuestionsPoolRow,
  convertToQuestionsRow,
  convertToCalculatorRow,
  convertToCandidatesPoolRow,
  convertToCandidatesRow,
  convertToDistrictsPoolRow,
  convertToDistrictsRow,
  convertToAnswersRow,
  convertToL10nsRow,
} from './input/converters';

import { isEmptyColumn, isEmptyValue } from './utils';

import { initGoogleForms, createForm, getForm } from './form';

const DEFAULT_CACHE_LIFETIME = 1e10;
const DEFAULT_CACHE_DIR = path.join(__dirname, '.cache');
const DEFAULT_CALCULATORS_URL =
  'https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw/view#gid=0';

// Function to parse command-line arguments
function parseCommandLineArgs(): {
  cacheLifetime: number;
  cacheDir: string;
  calculatorsUrl: CUrl;
} {
  const cacheLifetimeArgIndex = process.argv.indexOf('--cache-lifetime');
  const cacheDirArgIndex = process.argv.indexOf('--cache-dir');
  const calculatorsUrlArgIndex = process.argv.indexOf('--calculators-url');

  const cacheLifetime =
    cacheLifetimeArgIndex !== -1
      ? parseInt(process.argv[cacheLifetimeArgIndex + 1])
      : DEFAULT_CACHE_LIFETIME;
  const cacheDir =
    cacheDirArgIndex !== -1
      ? process.argv[cacheDirArgIndex + 1]
      : DEFAULT_CACHE_DIR;
  const calculatorsUrl =
    calculatorsUrlArgIndex !== -1
      ? process.argv[calculatorsUrlArgIndex + 1]
      : DEFAULT_CALCULATORS_URL;

  return { cacheLifetime, cacheDir, calculatorsUrl };
}

async function fetchGoogleSpreadsheet(
  url: CUrl,
  jwt: JWT,
): Promise<GoogleSpreadsheet> {
  console.log('Fetching GoogleSpreadsheet: ', url);
  const key = extractKey(url);
  if (key === undefined) {
    throw new Error(`Cannot extract spreadsheet key from URL: '${url}'`);
  }

  const doc = new GoogleSpreadsheet(key, jwt);

  await doc.loadInfo(); // loads document properties and worksheets
  console.log('Fetched GoogleSpreadsheet: ', url, '; Title: ', doc.title);
  return doc;
}

function skipQuestionRowData(
  row: GoogleSpreadsheetRow<QuestionRowData>,
): boolean {
  return (
    isEmptyColumn<QuestionRowData>(row, 'Uuid') ||
    isEmptyColumn<QuestionRowData>(row, 'Name')
  );
}

async function extractQuestions(url: CUrl, jwt: JWT): Promise<Questions> {
  const questions = new Questions();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  for (let sI = 0; sI < doc.sheetCount; sI++) {
    const sheet = doc.sheetsByIndex[sI];
    await sheet.loadHeaderRow();
    const title = sheet.title;

    const questionRows = await sheet.getRows<QuestionRowData>();
    for (let i = 0; i < questionRows.length; i++) {
      const r = questionRows[i];
      if (skipQuestionRowData(r)) {
        console.log('Skipping QuestionRowData: ', i);
        continue;
      }
      console.log(
        'Question: ',
        title,
        '/',
        i,
        '; ',
        r.get('Name'),
        '; ',
        r.get('Uuid'),
      );
      questions.append(title, convertToQuestionsRow(i, r));
    }
  }

  return questions;
}

function skipQuestionsPoolRowData(
  row: GoogleSpreadsheetRow<QuestionsPoolRowData>,
): boolean {
  return (
    isEmptyColumn<QuestionsPoolRowData>(row, 'Uuid') ||
    isEmptyColumn<QuestionsPoolRowData>(row, 'Name')
  );
}

async function extractQuestionPool(
  url: CUrl,
  jwt: JWT,
): Promise<QuestionsPool> {
  const pool = new QuestionsPool();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  const sheet = doc.sheetsByTitle['Questions'];
  await sheet.loadHeaderRow();

  const poolRows = await sheet.getRows<QuestionsPoolRowData>();
  for (let i = 0; i < poolRows.length; i++) {
    const r = poolRows[i];
    if (skipQuestionsPoolRowData(r)) {
      console.log('Skipping QuestionsPoolRowData: ', i);
      continue;
    }
    console.log('QuestionPool: ', i, '; ', r.get('Name'), '; ', r.get('Uuid'));
    pool.append(convertToQuestionsPoolRow(i, r));
  }

  return pool;
}

function skipCandidatesPoolRowData(
  row: GoogleSpreadsheetRow<CandidatesPoolRowData>,
): boolean {
  return (
    isEmptyColumn<CandidatesPoolRowData>(row, 'Uuid') ||
    isEmptyColumn<CandidatesPoolRowData>(row, 'Name')
  );
}

async function extractCandidatesPool(
  url: CUrl,
  jwt: JWT,
): Promise<CandidatesPool> {
  const pool = new CandidatesPool();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  const sheet = doc.sheetsByTitle['Candidates'];
  await sheet.loadHeaderRow();

  const poolRows = await sheet.getRows<CandidatesPoolRowData>();
  for (let i = 0; i < poolRows.length; i++) {
    const r = poolRows[i];
    if (skipCandidatesPoolRowData(r)) {
      console.log('Skipping CandidatesPoolRowData: ', i);
      continue;
    }
    console.log(
      'CandidatesPool: ',
      i,
      '; ',
      r.get('Name'),
      '; ',
      r.get('Uuid'),
    );
    pool.append(convertToCandidatesPoolRow(i, r));
  }

  return pool;
}

function skipCandidatesRowData(
  row: GoogleSpreadsheetRow<CandidatesRowData>,
): boolean {
  return (
    isEmptyColumn<CandidatesRowData>(row, 'Uuid') ||
    isEmptyColumn<CandidatesRowData>(row, 'Name')
  );
}

async function extractCandidates(url: CUrl, jwt: JWT): Promise<Candidates> {
  const candidates = new Candidates();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  for (let sI = 0; sI < doc.sheetCount; sI++) {
    const sheet = doc.sheetsByIndex[sI];
    await sheet.loadHeaderRow();
    const title = sheet.title;

    const candidatesRows = await sheet.getRows<CandidatesRowData>();
    for (let i = 0; i < candidatesRows.length; i++) {
      const r = candidatesRows[i];
      if (skipCandidatesRowData(r)) {
        console.log('Skipping CandidatesRowData: ', i);
        continue;
      }
      console.log(
        'Candidates: ',
        title,
        '/',
        i,
        '; ',
        r.get('Name'),
        '; ',
        r.get('Uuid'),
      );
      candidates.append(title, convertToCandidatesRow(i, r));
    }
  }

  return candidates;
}

function skipDistrictsPoolRowData(
  row: GoogleSpreadsheetRow<DistrictsPoolRowData>,
): boolean {
  return (
    isEmptyColumn<DistrictsPoolRowData>(row, 'Uuid') ||
    isEmptyColumn<DistrictsPoolRowData>(row, 'Name')
  );
}

async function extractDistrictsPool(
  url: CUrl,
  jwt: JWT,
): Promise<DistrictsPool> {
  const pool = new DistrictsPool();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  const sheet = doc.sheetsByTitle['Districts'];
  await sheet.loadHeaderRow();

  const poolRows = await sheet.getRows<DistrictsPoolRowData>();
  for (let i = 0; i < poolRows.length; i++) {
    const r = poolRows[i];
    if (skipDistrictsPoolRowData(r)) {
      console.log('Skipping DistrictsPoolRowData: ', i);
      continue;
    }
    console.log('DistrictsPool: ', i, '; ', r.get('Key'), '; ', r.get('Uuid'));
    pool.append(convertToDistrictsPoolRow(i, r));
  }

  return pool;
}

function skipDistrictsRowData(
  row: GoogleSpreadsheetRow<DistrictsRowData>,
): boolean {
  return (
    isEmptyColumn<DistrictsRowData>(row, 'Uuid') ||
    isEmptyColumn<DistrictsRowData>(row, 'Key')
  );
}

async function extractDistricts(url: CUrl, jwt: JWT): Promise<Districts> {
  const districts = new Districts();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  for (let sI = 0; sI < doc.sheetCount; sI++) {
    const sheet = doc.sheetsByIndex[sI];
    await sheet.loadHeaderRow();
    const title = sheet.title;

    const districtsRows = await sheet.getRows<DistrictsRowData>();
    for (let i = 0; i < districtsRows.length; i++) {
      const r = districtsRows[i];
      if (skipDistrictsRowData(r)) {
        console.log('Skipping DistrictsRowData: ', i);
        continue;
      }
      console.log(
        'Districts: ',
        title,
        '/',
        i,
        '; ',
        r.get('Key'),
        '; ',
        r.get('Uuid'),
      );
      districts.append(title, convertToDistrictsRow(i, r));
    }
  }

  return districts;
}

function skipL10nsRowData(row: GoogleSpreadsheetRow<L10nsRowData>): boolean {
  return (
    isEmptyColumn<L10nsRowData>(row, 'Form - email') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - party name') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - person name') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - secret code') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - secret code - description') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - is important') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - comment') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - yes') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - no') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - skip') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - motto') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - motto - description') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - to authors') ||
    isEmptyColumn<L10nsRowData>(row, 'Form - description')
  );
}

async function extractL10ns(url: CUrl, jwt: JWT): Promise<L10ns> {
  const l10ns = new L10ns();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  for (let sI = 0; sI < doc.sheetCount; sI++) {
    const sheet = doc.sheetsByIndex[sI];
    await sheet.loadHeaderRow();
    const title = sheet.title;

    const l10nsRows = await sheet.getRows<L10nsRowData>();
    for (let i = 0; i < l10nsRows.length; i++) {
      const r = l10nsRows[i];
      if (skipL10nsRowData(r)) {
        console.log('Skipping L10nsRowData: ', i);
        continue;
      }
      console.log('L10ns: ', title);
      l10ns.set(title, convertToL10nsRow(i, r));
    }
  }

  return l10ns;
}

function skipAnswersRowData(
  row: GoogleSpreadsheetRow<Partial<AnswersRowData>>,
): boolean {
  return isEmptyColumn<AnswersRowData>(row, 'Secret code');
}

async function extractAnswers(url: CUrl, jwt: JWT): Promise<Answers> {
  const answers = new Answers();
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  for (let sI = 0; sI < doc.sheetCount; sI++) {
    const sheet = doc.sheetsByIndex[sI];
    await sheet.loadHeaderRow();
    const title = sheet.title;

    const answersRows = await sheet.getRows<Partial<AnswersRowData>>();
    for (let i = 0; i < answersRows.length; i++) {
      const r = answersRows[i];
      if (skipAnswersRowData(r)) {
        console.log('Skipping CandidatesRowData: ', i);
        continue;
      }
      console.log(
        'Answers: ',
        title,
        '/',
        i,
        '; ',
        r.get('Secret code'),
        '; ',
        r.get('Email'),
      );
      answers.append(title, convertToAnswersRow(i, r));
    }
  }

  return answers;
}

function skipCalculatorRowData(
  row: GoogleSpreadsheetRow<CalculatorRowData>,
): boolean {
  return (
    isEmptyColumn<CalculatorRowData>(row, 'Election name') ||
    isEmptyColumn<CalculatorRowData>(row, 'Questions pool') ||
    isEmptyColumn<CalculatorRowData>(row, 'Questions spreadsheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'Questions sheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'Questions sheet - candidates') ||
    isEmptyColumn<CalculatorRowData>(row, 'Candidates pool') ||
    isEmptyColumn<CalculatorRowData>(row, 'Candidates spreadsheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'Candidates sheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'Districts pool') ||
    isEmptyColumn<CalculatorRowData>(row, 'Districts spreadsheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'Districts sheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'L10ns spreadsheet') ||
    isEmptyColumn<CalculatorRowData>(row, 'L10ns sheet')
  );
}

async function extractCalculators(url: CUrl, jwt: JWT): Promise<Calculators> {
  console.log('Extracting calculators from: ', url);
  const doc = await fetchGoogleSpreadsheet(url, jwt);

  const calculators = new Calculators();

  const sheet = doc.sheetsByTitle['Calculators'];
  await sheet.loadHeaderRow();

  const calculatorRows = await sheet.getRows<CalculatorRowData>();
  for (let i = 0; i < calculatorRows.length; i++) {
    const r = calculatorRows[i];

    if (skipCalculatorRowData(r)) {
      console.log('Skipping CalculatorRowData: ', i);
      continue;
    }

    console.log(
      'Calculator: ',
      i,
      ': ElectionName: ',
      r.get('Election name'),
      ', District Name: ',
      r.get('District name'),
    );

    const questionPoolUrl = r.get('Questions pool');
    let questionsPool = calculators.getQuestionPool(questionPoolUrl);
    if (questionsPool === undefined) {
      questionsPool = await extractQuestionPool(questionPoolUrl, jwt);
      calculators.setQuestionsPool(questionPoolUrl, questionsPool);
    }

    const questionsUrl = r.get('Questions spreadsheet');
    let questions = calculators.getQuestions(questionsUrl);
    if (questions === undefined) {
      questions = await extractQuestions(questionsUrl, jwt);
      calculators.setQuestions(questionsUrl, questions);
    }

    const candidatesPoolUrl = r.get('Candidates pool');
    let candidatesPool = calculators.getCandidatesPool(candidatesPoolUrl);
    if (candidatesPool === undefined) {
      candidatesPool = await extractCandidatesPool(candidatesPoolUrl, jwt);
      calculators.setCandidatesPool(candidatesPoolUrl, candidatesPool);
    }

    const candidatesUrl = r.get('Candidates spreadsheet');
    let candidates = calculators.getCandidates(candidatesUrl);
    if (candidates === undefined) {
      candidates = await extractCandidates(candidatesUrl, jwt);
      calculators.setCandidates(candidatesUrl, candidates);
    }

    const districtsPoolUrl = r.get('Districts pool');
    let districtsPool = calculators.getDistrictsPool(districtsPoolUrl);
    if (districtsPool === undefined) {
      districtsPool = await extractDistrictsPool(districtsPoolUrl, jwt);
      calculators.setDistrictsPool(districtsPoolUrl, districtsPool);
    }

    const districtsUrl = r.get('Districts spreadsheet');
    let districts = calculators.getDistricts(districtsUrl);
    if (districts === undefined) {
      districts = await extractDistricts(districtsUrl, jwt);
      calculators.setDistricts(districtsUrl, districts);
    }

    const l10nsUrl = r.get('L10ns spreadsheet');
    let l10ns = calculators.getL10ns(l10nsUrl);
    if (l10ns === undefined) {
      l10ns = await extractL10ns(l10nsUrl, jwt);
      calculators.setL10ns(l10nsUrl, l10ns);
    }

    const answersCandidatesUrl = r.get('Answers spreadsheet - candidates');
    let answersCandidates = calculators.getAnswers(answersCandidatesUrl);
    if (
      answersCandidates === undefined &&
      !isEmptyColumn(r, 'Answers spreadsheet - candidates')
    ) {
      answersCandidates = await extractAnswers(answersCandidatesUrl, jwt);
      calculators.setAnswers(answersCandidatesUrl, answersCandidates);
    }

    const answersExpertsUrl = r.get('Answers spreadsheet - experts');
    let answersExperts = calculators.getAnswers(answersExpertsUrl);
    if (
      answersExperts === undefined &&
      !isEmptyColumn(r, 'Answers spreadsheet - experts')
    ) {
      answersExperts = await extractAnswers(answersExpertsUrl, jwt);
      calculators.setAnswers(answersExpertsUrl, answersExperts);
    }

    calculators.appendCalculator(convertToCalculatorRow(i, r));

    // console.log(calculatorRows[i]);
  }

  return calculators;
}

// Main function
function main() {
  // Parse command-line arguments
  const { cacheLifetime, cacheDir, calculatorsUrl } = parseCommandLineArgs();

  console.log('Cache Lifetime:', cacheLifetime);
  console.log('Cache Dir:', cacheDir);
  console.log('Calculators URL:', calculatorsUrl);

  const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/forms',
  ];

  const jwtFromEnv = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY,
    scopes: SCOPES,
  });

  const calculatorsKey = extractKey(calculatorsUrl);
  console.log(
    'Processing calculators from: ',
    calculatorsKey,
    ' (',
    calculatorsUrl,
    ')',
  );

  (async function () {
    const cacheFile = path.join(cacheDir, calculatorsKey + '.json');
    console.log('Using cache file: ', cacheFile);

    // extract calculators
    let calculators = new Calculators();
    if (shouldFetchData(cacheFile, cacheLifetime)) {
      calculators = await extractCalculators(calculatorsUrl, jwtFromEnv);
      storeData(cacheFile, calculators);
    } else {
      calculators = loadData(Calculators, cacheFile);
    }
    console.log('Calculators stats: ', calculators.stats());

    // create Google Forms
    await createForms(calculators);
  })();
}

// Call the main function
main();

function extractKey(url: CUrl): string | undefined {
  const regex = /.*\/d\/([a-zA-Z0-9_-]+)\/?.*/;
  const match = url.match(regex);

  // console.log('URL: ', url, '; Match: ', match);
  // console.log(match);

  if (match && match[1]) {
    return match[1];
  } else {
    return undefined;
  }
}
function constructQuestions(
  calculator: CalculatorRow,
  pool: QuestionsPool,
  questions: QuestionsRow[],
): QuestionsPoolRow[] {
  if (questions === undefined) {
    console.error(calculator);
    throw new Error(`No questions for calculator on row: ${calculator.Pos}`);
  }

  const res = new Array<QuestionsPoolRow>(questions.length);

  const used = new Set<string>();

  // 1. set the questions to their Order
  for (const q of questions) {
    if (q.Order !== undefined && q.Order >= 1 && q.Order <= questions.length) {
      const index = q.Order - 1;
      if (res[index] === undefined) {
        res[index] = pool.questions[q.Uuid];
        used.add(q.Uuid);
      }
    }
  }

  // 2. Fill the remaining positions based on their position
  if (used.size != questions.length) {
    let usePos = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      console.log(`${q.Uuid}: ${q.Uuid in used}; ${used.has(q.Uuid)}`);
      if (!used.has(q.Uuid)) {
        while (res[usePos] !== undefined && usePos < questions.length) {
          usePos++;
          console.log(usePos);
        }
        res[usePos] = pool.questions[q.Uuid];
        used.add(q.Uuid);
      }
    }
  }

  if (used.size != res.length || res.length != questions.length) {
    console.log(res);
    throw new Error(
      `Function not implemented properly - used: ${used.size}; res: ${res.length}; questions: ${questions.length}.`,
    );
  }

  return res;
}

function shouldFetchData(cacheFile: string, cacheLifetime: number): boolean {
  try {
    const cacheStats = fs.statSync(cacheFile);
    new Date().getTime();
    if (cacheStats.mtimeMs + cacheLifetime * 1e6 < new Date().getTime()) {
      console.log(
        'Cache file is too old: ',
        cacheStats.mtime,
        ' refetching data',
      );
      return true;
    }
  } catch (error) {
    console.log('Cannot read input file: ', error);
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    return true;
  }
  return false;
}

function storeData<T>(file: string, data: T) {
  const calculatorsJson = JSON.stringify(instanceToPlain<T>(data), null, 2);
  try {
    fs.writeFileSync(file, calculatorsJson, 'utf-8');
    console.log('Data were cached in: ', file);
  } catch (writeError) {
    console.error('Error writing to file:', writeError);
    throw writeError;
  }
}

function loadData<T>(cls: ClassConstructor<T>, file: string): T {
  try {
    const data = fs.readFileSync(file, 'utf8');
    try {
      const jsonData = JSON.parse(data);
      return plainToClass(cls, jsonData);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw parseError;
    }
  } catch (readError) {
    console.error('Error while reading file: ', readError);
    throw readError;
  }
}

async function createForms(calculators: Calculators) {
  const googleForms = initGoogleForms();

  for (const calculator of calculators.calculators) {
    console.log(
      `Generating form for ${
        calculator.Pos
      }: ${calculator.key()} - candidate: ${
        calculator.QuestionsFormCandidates
      }, expert: ${calculator.QuestionsFormExperts}`,
    );
    if (!calculator.hasForms()) {
      const questions = constructQuestions(
        calculator,
        calculators.getQuestionPool(calculator.QuestionsPool),
        calculators.getQuestions(calculator.QuestionsSpreadsheet).questions[
          calculator.QuestionsSheetCandidates
        ],
      );

      // Create form for candidates
      if (isEmptyValue(calculator.QuestionsFormCandidates)) {
        const form = await createForm(
          googleForms,
          calculator,
          calculators.getL10ns(calculator.L10nsSpreadsheet).l10ns[
            calculator.L10nsSheet
          ],
          questions,
          'candidate',
        );
        console.log(
          `${calculator.Pos} - candidate - Form: https://docs.google.com/forms/d/${form.formId}; Sheet: ${form.linkedSheetId}`,
        );
      }

      // Create form for experts
      if (isEmptyValue(calculator.QuestionsFormCandidates)) {
        const form = await createForm(
          googleForms,
          calculator,
          calculators.getL10ns(calculator.L10nsSpreadsheet).l10ns[
            calculator.L10nsSheet
          ],
          questions,
          'expert',
        );

        console.log(
          `${calculator.Pos} - expert - Form: https://docs.google.com/forms/d/${form.formId}; Sheet: ${form.linkedSheetId}`,
        );
      }
    }

    const formC = await getForm(
      googleForms,
      calculator,
      extractKey(calculator.QuestionsFormCandidates),
    );
    console.log(
      `Get: ${calculator.Pos} - candidate - Form: https://docs.google.com/forms/d/${formC.formId}; Sheet: ${formC.linkedSheetId}`,
    );
    const formE = await getForm(
      googleForms,
      calculator,
      extractKey(calculator.QuestionsFormExperts),
    );
    console.log(
      `Get: ${calculator.Pos} - expert - Form: https://docs.google.com/forms/d/${formE.formId}; Sheet: ${formE.linkedSheetId}`,
    );
  }
}

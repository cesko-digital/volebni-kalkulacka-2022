import { isEmptyValue } from '../utils';
import { Type } from 'class-transformer';

type CBool = 'Yes' | 'No';
type CKey = string;
export type CUrl = string;
type CDateTime = string;
type CSheetName = string;
type CCandidateType = 'Person' | 'Party' | 'Coalition';

/**
 * This type represents rows from the input Google Sheet that
 * represents all existing calculators.
 *
 * https://docs.google.com/spreadsheets/d/1rEtloBTzS_fZyeIX9wYYW32Pg2NeJNYj6oQbyIyTTvw/view#gid=0
 */
export type CalculatorRowData = {
  'Election name': string;
  'Election key': CKey;

  'District name': string;
  'District key': CKey;
  Name: string;
  Description: string;
  'Show description'?: CBool;
  Round: string;
  Variant: string;
  'Election from': CDateTime;
  'Election to': CDateTime;
  'Questions pool': CUrl;
  'Questions spreadsheet': CUrl;
  'Questions sheet': CSheetName;
  'Questions sheet - candidates': CSheetName;
  'Questions form - candidates': CUrl;
  'Questions form - experts': CUrl;
  'L10ns spreadsheet': CUrl;
  'L10ns sheet': CSheetName;
  'Answers spreadsheet - candidates': CUrl;
  'Answers sheet - candidates': CSheetName;
  'Answers spreadsheet - experts': CUrl;
  'Answers sheet - experts': CSheetName;
  'Candidates pool': CUrl;
  'Candidates spreadsheet': CUrl;
  'Candidates sheet': CSheetName;
  'Districts pool': CUrl;
  'Districts spreadsheet': CUrl;
  'Districts sheet': CSheetName;
};

export class CalculatorRow {
  Pos: number;
  ElectionName: string;
  ElectionKey: CKey;

  DistrictName: string;
  DistrictKey: CKey;
  Name: string;
  Description: string;
  ShowDescription?: CBool;
  Round: string;
  Variant: string;
  ElectionFrom: CDateTime;
  ElectionTo: CDateTime;
  QuestionsPool: CUrl;
  QuestionsSpreadsheet: CUrl;
  QuestionsSheet: CSheetName;
  QuestionsSheetCandidates: CSheetName;
  QuestionsFormCandidates: CUrl;
  QuestionsFormExperts: CUrl;
  L10nsSpreadsheet: CUrl;
  L10nsSheet: CSheetName;
  AnswersSpreadsheetCandidates: CUrl;
  AnswersSheetCandidates: CSheetName;
  AnswersSpreadsheetExperts: CUrl;
  AnswersSheetExperts: CSheetName;
  CandidatesPool: CUrl;
  CandidatesSpreadsheet: CUrl;
  CandidatesSheet: CSheetName;
  DistrictsPool: CUrl;
  DistrictsSpreadsheet: CUrl;
  DistrictsSheet: CSheetName;

  constructor(data: Partial<CalculatorRow>) {
    // Why is this always undefined? And only in this function?
    console.log('Constructing CalculatorRow: ' + data);
    if (data === undefined) {
      return;
    }
    this.Pos = data.Pos;
    this.ElectionName = data.ElectionName;
    this.ElectionKey = data.ElectionKey;
    this.DistrictName = data.DistrictName;
    this.DistrictKey = data.DistrictKey;
    this.Name = data.Name;
    this.Description = data.Description;
    this.ShowDescription = data.ShowDescription;
    this.Round = data.Round;
    this.Variant = data.Variant;
    this.ElectionFrom = data.ElectionFrom;
    this.ElectionTo = data.ElectionTo;
    this.QuestionsPool = data.QuestionsPool;
    this.QuestionsSpreadsheet = data.QuestionsSpreadsheet;
    this.QuestionsSheet = data.QuestionsSheet;
    this.QuestionsSheetCandidates = data.QuestionsSheetCandidates;
    this.QuestionsFormCandidates = data.QuestionsFormCandidates;
    this.QuestionsFormExperts = data.QuestionsFormExperts;
    this.L10nsSpreadsheet = data.L10nsSpreadsheet;
    this.L10nsSheet = data.L10nsSheet;
    this.AnswersSpreadsheetCandidates = data.AnswersSpreadsheetCandidates;
    this.AnswersSheetCandidates = data.AnswersSheetCandidates;
    this.AnswersSpreadsheetExperts = data.AnswersSpreadsheetExperts;
    this.AnswersSheetExperts = data.AnswersSheetExperts;
    this.CandidatesPool = data.CandidatesPool;
    this.CandidatesSpreadsheet = data.CandidatesSpreadsheet;
    this.CandidatesSheet = data.CandidatesSheet;
    this.DistrictsPool = data.DistrictsPool;
    this.DistrictsSpreadsheet = data.DistrictsSpreadsheet;
    this.DistrictsSheet = data.DistrictsSheet;
  }

  key(): string {
    return `${this.ElectionKey}--${this.DistrictKey}--${this.Round}--${this.Variant}`;
  }

  hasForms(): boolean {
    return (
      !isEmptyValue(this.QuestionsFormExperts) &&
      !isEmptyValue(this.QuestionsFormCandidates)
    );
  }
}

export type QuestionsPoolRowData = {
  Uuid: string;
  Name: string;
  Question: string;
  Description: string;
  Tags: string;
  Note: string;
  Order: string;
};

export class QuestionsPoolRow {
  Pos: number;
  Uuid: string;
  Name: string;
  Question: string;
  Description: string;
  Tags: string[];
  Note: string;
  Order: number;

  constructor(data: Required<QuestionsPoolRow>) {
    this.Pos = data.Pos;
    this.Uuid = data.Uuid;
    this.Name = data.Name;
    this.Question = data.Question;
    this.Description = data.Description;
    this.Tags = data.Tags;
    this.Note = data.Note;
    this.Order = data.Order || NaN;
  }
}

export type QuestionRowData = {
  Uuid: string;
  Name: string;
  Order: string;
};

export class QuestionsRow {
  Pos: number;
  Uuid: string;
  Name: string;
  Order: number;

  constructor(data: Required<QuestionsRow>) {
    this.Pos = data.Pos;
    this.Uuid = data.Uuid;
    this.Name = data.Name;
    this.Order = data.Order || NaN;
  }
}

export class QuestionsPool {
  @Type(() => QuestionsPoolRow)
  questions: Record<string, QuestionsPoolRow>;

  constructor() {
    this.questions = {};
  }

  append(row: QuestionsPoolRow) {
    this.questions[row.Uuid] = row;
  }

  contains(row: QuestionsPoolRow): boolean {
    return row.Uuid in this.questions;
  }
}

export class Questions {
  @Type(() => QuestionsRow)
  questions: Record<string, QuestionsRow[]>;

  constructor() {
    this.questions = {};
  }

  append(title: string, row: QuestionsRow) {
    if (!(title in this.questions)) {
      this.questions[title] = [];
    }
    this.questions[title].push(row);
  }
}

// Candidates - BEGIN

export type CandidatesPoolRowData = {
  Uuid: string;
  Name: string;
  Abbriviation: string;
  'First name': string;
  'Last name': string;
  Type: CCandidateType;
};

export class CandidatesPoolRow {
  Pos: number;
  Uuid: string;
  Name: string;
  Abbriviation: string;
  FirstName: string;
  LastName: string;
  Type: CCandidateType;

  constructor(data: Required<CandidatesPoolRow>) {
    this.Pos = data.Pos;
    this.Uuid = data.Uuid;
    this.Name = data.Name;
    this.Abbriviation = data.Abbriviation;
    this.FirstName = data.FirstName;
    this.LastName = data.LastName;
    this.Type = data.Type || 'Person';
  }
}

export class CandidatesPool {
  @Type(() => CandidatesPoolRow)
  candidates: Record<string, CandidatesPoolRow>;

  constructor() {
    this.candidates = {};
  }

  append(row: CandidatesPoolRow) {
    this.candidates[row.Uuid] = row;
  }

  contains(row: CandidatesPoolRow): boolean {
    return row.Uuid in this.candidates;
  }
}

export type CandidatesRowData = {
  Uuid: string;
  Name: string;
  'Secret code': string;
  'Member of': string;
  Members: string;
};

export class CandidatesRow {
  Pos: number;
  Uuid: string;
  Name: string;
  SecretCode: string;
  MemberOf: string;
  Members: string;

  constructor(data: Required<CandidatesRow>) {
    this.Pos = data.Pos;
    this.Uuid = data.Uuid;
    this.Name = data.Name;
    this.SecretCode = data.SecretCode;
    this.MemberOf = data.MemberOf;
    this.Members = data.Members;
  }
}

export class Candidates {
  @Type(() => CandidatesRow)
  candidates: Record<string, CandidatesRow[]>;

  constructor() {
    this.candidates = {};
  }

  append(title: string, row: CandidatesRow) {
    if (!(title in this.candidates)) {
      this.candidates[title] = [];
    }
    this.candidates[title].push(row);
  }
}

// Candidates - END

// Districts - BEGIN

export type DistrictsPoolRowData = {
  Uuid: string;
  Name: string;
  Key: string;
  Description: string;
};

export class DistrictsPoolRow {
  Pos: number;
  Uuid: string;
  Name: string;
  Key: string;
  Description: string;

  constructor(data: Required<DistrictsPoolRow>) {
    this.Pos = data.Pos;
    this.Uuid = data.Uuid;
    this.Name = data.Name;
    this.Key = data.Key;
    this.Description = data.Description;
  }
}

export class DistrictsPool {
  @Type(() => DistrictsPoolRow)
  districts: Record<string, DistrictsPoolRow>;

  constructor() {
    this.districts = {};
  }

  append(row: DistrictsPoolRow) {
    this.districts[row.Uuid] = row;
  }

  contains(row: DistrictsPoolRow): boolean {
    return row.Uuid in this.districts;
  }
}

export type DistrictsRowData = {
  Uuid: string;
  Key: string;
};

export class DistrictsRow {
  Pos: number;
  Uuid: string;
  Key: string;

  constructor(data: Required<DistrictsRow>) {
    this.Pos = data.Pos;
    this.Uuid = data.Uuid;
    this.Key = data.Key;
  }
}

export class Districts {
  @Type(() => DistrictsRow)
  districts: Record<string, DistrictsRow[]>;

  constructor() {
    this.districts = {};
  }

  append(title: string, row: DistrictsRow) {
    if (!(title in this.districts)) {
      this.districts[title] = [];
    }
    this.districts[title].push(row);
  }
}

// Districts - END

export type AnswersRowData = {
  Timestamp: string;
  'Secret code': string;
  Email: string;
};

export class AnswersRow {
  Pos: number;
  Timestamp: string;
  SecretCode: string;
  Email: string;
  Data: Record<string, string>;

  constructor(data: Required<AnswersRow>) {
    this.Pos = data.Pos;
    this.Timestamp = data.Timestamp;
    this.Email = data.Email;
    this.SecretCode = data.SecretCode;
  }
}

export class Answers {
  @Type(() => AnswersRow)
  answers: Record<string, AnswersRow[]>;

  constructor() {
    this.answers = {};
  }

  append(title: string, row: AnswersRow) {
    if (!(title in this.answers)) {
      this.answers[title] = [];
    }
    this.answers[title].push(row);
  }
}

// L10ns - BEGIN

export type L10nsRowData = {
  'Form - email': string;
  'Form - person name': string;
  'Form - party name': string;
  'Form - secret code': string;
  'Form - secret code - description': string;
  'Form - is important': string;
  'Form - comment': string;
  'Form - yes': string;
  'Form - no': string;
  'Form - skip': string;
  'Form - motto': string;
  'Form - motto - description': string;
  'Form - to authors': string;
  'Form - description': string;
};

export class L10nsRow {
  Pos: number;
  FormEmail: string;
  FormPersonName: string;
  FormPartyName: string;
  FormSecretCode: string;
  FormSecretCodeDescription: string;
  FormIsImportant: string;
  FormComment: string;
  FormYes: string;
  FormNo: string;
  FormSkip: string;
  FormMotto: string;
  FormMottoDescription: string;
  FormToAuthors: string;

  FormDescription: string;

  constructor(data: Required<L10nsRow>) {
    this.Pos = data.Pos;
    this.FormEmail = data.FormEmail;
    this.FormPersonName = data.FormPersonName;
    this.FormPartyName = data.FormPartyName;
    this.FormSecretCode = data.FormSecretCode;
    this.FormSecretCodeDescription = data.FormSecretCodeDescription;
    this.FormIsImportant = data.FormIsImportant;
    this.FormComment = data.FormComment;
    this.FormYes = data.FormYes;
    this.FormNo = data.FormNo;
    this.FormSkip = data.FormSkip;
    this.FormMotto = data.FormMotto;
    this.FormMottoDescription = data.FormMottoDescription;
    this.FormToAuthors = data.FormToAuthors;
    this.FormDescription = data.FormDescription;
  }
}

export class L10ns {
  @Type(() => L10nsRow)
  l10ns: Record<string, L10nsRow>;

  constructor() {
    this.l10ns = {};
  }

  set(title: string, row: L10nsRow) {
    this.l10ns[title] = row;
  }
}

// L10ns - END

export class Calculators {
  @Type(() => CalculatorRow)
  calculators: CalculatorRow[];

  @Type(() => QuestionsPool)
  questionsPools: Record<string, QuestionsPool>;
  @Type(() => Questions)
  questions: Record<string, Questions>;

  @Type(() => CandidatesPool)
  candidatesPools: Record<string, CandidatesPool>;
  @Type(() => Candidates)
  candidates: Record<string, Candidates>;

  @Type(() => DistrictsPool)
  districtsPools: Record<string, DistrictsPool>;
  @Type(() => Districts)
  districts: Record<string, Districts>;

  @Type(() => L10ns)
  l10ns: Record<string, L10ns>;

  @Type(() => Answers)
  answers: Record<string, Answers>;

  constructor() {
    this.calculators = [];
    this.questionsPools = {};
    this.questions = {};
    this.candidatesPools = {};
    this.candidates = {};
    this.districtsPools = {};
    this.districts = {};
    this.l10ns = {};
    this.answers = {};
  }

  appendCalculator(calculator: CalculatorRow) {
    this.calculators.push(calculator);
  }

  getQuestionPool(url: CUrl): QuestionsPool | undefined {
    return this.questionsPools[url];
  }

  setQuestionsPool(url: CUrl, pool: QuestionsPool) {
    this.questionsPools[url] = pool;
  }

  getQuestions(url: CUrl): Questions | undefined {
    return this.questions[url];
  }

  setQuestions(url: CUrl, questions: Questions) {
    this.questions[url] = questions;
  }

  // Candidates - BEGIN

  getCandidatesPool(url: CUrl): CandidatesPool | undefined {
    return this.candidatesPools[url];
  }

  setCandidatesPool(url: CUrl, pool: CandidatesPool) {
    this.candidatesPools[url] = pool;
  }

  getCandidates(url: CUrl): Candidates | undefined {
    return this.candidates[url];
  }

  setCandidates(url: CUrl, candidates: Candidates) {
    this.candidates[url] = candidates;
  }

  // Candidates - END

  // Districts - BEGIN

  getDistrictsPool(url: CUrl): DistrictsPool | undefined {
    return this.districtsPools[url];
  }

  setDistrictsPool(url: CUrl, pool: DistrictsPool) {
    this.districtsPools[url] = pool;
  }

  getDistricts(url: CUrl): Districts | undefined {
    return this.districts[url];
  }

  setDistricts(url: CUrl, districts: Districts) {
    this.districts[url] = districts;
  }

  // Districts - END

  // L10ns - BEGIN

  getL10ns(url: CUrl): L10ns | undefined {
    return this.l10ns[url];
  }

  setL10ns(url: CUrl, districts: L10ns) {
    this.l10ns[url] = districts;
  }

  // L10ns - END

  getAnswers(url: CUrl): Answers | undefined {
    return this.answers[url];
  }

  setAnswers(url: CUrl, answers: Answers) {
    this.answers[url] = answers;
  }

  stats(): Record<string, number> {
    return {
      calculatorsCount: this.calculators.length,
      questionsPoolsCount: Object.keys(this.questionsPools).length,
      questionsCount: Object.keys(this.questions).length,
      candidatesPoolsCount: Object.keys(this.candidatesPools).length,
      candidatesCount: Object.keys(this.candidates).length,
      districtsPoolsCount: Object.keys(this.districtsPools).length,
      districtsCount: Object.keys(this.districts).length,
    };
  }
}

/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * List of one or more questions
 *
 * @minItems 1
 */
export type Questions = [Question, ...Question[]];
/**
 * Unique identifier of a question in the format of UUID
 */
export type ID = string;
/**
 * Title of a question
 */
export type Title = string;
/**
 * A statment to agree or disagree with, should not be phrased as a question with question mark
 */
export type Statement = string;
/**
 * A detailed description or an explanation of a question
 */
export type Detail = string;

/**
 * Question for a calculator
 */
export interface Question {
  id: ID;
  title: Title;
  statement: Statement;
  detail?: Detail;
  [k: string]: unknown;
}
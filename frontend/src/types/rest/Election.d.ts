/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type Id = string;
export type Key = string;
export type Name = string;
export type Description = string;
/**
 * An enumeration.
 */
export type ElectionTypeRest =
  | 'senatni'
  | 'prezidentske'
  | 'snemovni'
  | 'krajske'
  | 'municipalni'
  | 'undefined';

export interface ElectionRest {
  id: Id;
  key: Key;
  name: Name;
  description: Description;
  type: ElectionTypeRest;
  [k: string]: unknown;
}

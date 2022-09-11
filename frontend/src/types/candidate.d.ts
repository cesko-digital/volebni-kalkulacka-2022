/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * A representation of candidate
 */
export interface Candidate {
  /**
   * UUID
   */
  id: string;
  /**
   * Candidate's name
   */
  name: string;
  /**
   * Candidate type
   */
  type: "party" | "coalition" | "person";
  /**
   * Longer description.
   */
  description: string;
  /**
   * Candidate's motto.
   */
  motto?: string;
  /**
   * Image
   */
  img_url?: string;
  contact?: Contact;
  /**
   * If the type is party, then this array should have single element. If the type is coalition, then there should be multiple parties. If the type is party, then there should be at most one party.
   */
  parties?: Party[];
  [k: string]: unknown;
}
/**
 * A representation of contact
 */
export interface Contact {
  /**
   * Websites
   */
  webs?: {
    /**
     * URL
     */
    url: string;
    /**
     * Label for the URL
     */
    label?: string;
    [k: string]: unknown;
  }[];
  /**
   * Emails
   */
  emails?: {
    /**
     * email
     */
    email: string;
    /**
     * Label for the email
     */
    label?: string;
    [k: string]: unknown;
  }[];
  /**
   * Twitter handle
   */
  twitter?: string;
  /**
   * Instagram handle
   */
  instagram?: string;
  /**
   * Facebook handle
   */
  facebook?: string;
  /**
   * Tiktok handle
   */
  tiktok?: string;
  [k: string]: unknown;
}
/**
 * A representation of party
 */
export interface Party {
  /**
   * UUID
   */
  id: string;
  /**
   * Party name
   */
  name: string;
  /**
   * Longer description.
   */
  description: string;
  /**
   * abbreviation
   */
  abbreviation?: string;
  /**
   * Image
   */
  img_url?: string;
  contact?: Contact;
  [k: string]: unknown;
}

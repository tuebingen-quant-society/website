import type { Locale } from "@/i18n";

export type LocalizedText = Record<Locale, string>;

export type CareerField = {
  title: LocalizedText;
  summary: LocalizedText;
  work: LocalizedText;
  methods: LocalizedText;
};

export type Employer = {
  name: string;
  area: LocalizedText;
  href: string;
  roles: LocalizedText;
};

export type EventListing = {
  name: string;
  kind: LocalizedText;
  href: string;
  audience: LocalizedText;
  details: LocalizedText;
  dateLabel: LocalizedText;
  /** ISO timestamp in UTC after the application deadline or event end. */
  activeThrough: string;
  status: "open" | "upcoming";
};

export type BeginnerResource = {
  name: string;
  href: string;
  description: LocalizedText;
  access: LocalizedText;
};

export type StudentSociety = {
  name: string;
  university: string;
  href: string;
  format: LocalizedText;
};

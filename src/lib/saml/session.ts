import type { Profile } from "@node-saml/node-saml";
import { ATTRIBUTE_NAMES, SESSION_TTL_SECONDS } from "./constants";

export type SamlUser = {
  subject: string;
  email: string;
  affiliations: string[];
};

export type SessionPayload = {
  user: SamlUser;
  expiresAt: number;
};

function scalar(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string" && item.trim());
    return typeof first === "string" ? first.trim() : null;
  }
  return null;
}

function list(value: unknown): string[] {
  if (typeof value === "string") return value.split(";").map((item) => item.trim()).filter(Boolean);
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && !!item.trim());
  }
  return [];
}

function isStudentAffiliation(value: string) {
  const delimiter = value.indexOf("@");
  return (
    delimiter > 0 &&
    value.slice(0, delimiter).trim().toLowerCase() === "student" &&
    value.slice(delimiter + 1).trim().length > 0
  );
}

export function userFromProfile(profile: Profile): SamlUser {
  const subject = scalar(profile[ATTRIBUTE_NAMES.pairwiseId]);
  const email = scalar(profile[ATTRIBUTE_NAMES.mail]);
  const affiliations = list(profile[ATTRIBUTE_NAMES.affiliation]);
  if (!subject || !email || affiliations.length === 0) {
    throw new Error("Required SAML attributes are missing");
  }
  if (!affiliations.some(isStudentAffiliation)) {
    throw new Error("Student affiliation is required");
  }
  return { subject, email, affiliations };
}

export function createSessionPayload(user: SamlUser): SessionPayload {
  return {
    user,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1_000,
  };
}

export function isValidSession(value: unknown): value is SessionPayload {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<SessionPayload>;
  return (
    typeof session.expiresAt === "number" &&
    session.expiresAt > Date.now() &&
    typeof session.user?.subject === "string" &&
    typeof session.user.email === "string" &&
    Array.isArray(session.user.affiliations)
  );
}

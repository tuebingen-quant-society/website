import type { EventListing } from "./public-directory-types";
import { events as eventListings } from "@/i18n/opportunity-directory";

export function currentEvents(now = new Date()): EventListing[] {
  return eventListings.filter((event) => new Date(event.activeThrough) >= now);
}

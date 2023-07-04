import { Temporal } from "@js-temporal/polyfill";
import ICAL from "ical.js";

function processDate(prop: ICAL.Property) {
  const type = prop.type;
  const value = prop.getFirstValue();
  switch (prop.type) {
    case "date":
      return Temporal.PlainDate.from(value);
    case "date-time":
      const tz = prop.getParameter("tzid") as string || "Etc/UTC";
      try {
        return Temporal.PlainDateTime.from(value).toZonedDateTime(tz);
      } catch {
        return Temporal.Instant.from(value).toZonedDateTimeISO(tz);
      }
    default:
      throw Error(`invalid type: ${type}`);
  }
}

export default class Item {
  uid: string;
  summary: string;
  start: Temporal.ZonedDateTime | Temporal.PlainDate;
  end: Temporal.ZonedDateTime | Temporal.PlainDate;
  raw: object;

  constructor(props: ICAL.Property[]) {
    this.raw = props;
    props.forEach((prop) => {
      switch (prop.name) {
        case "uid":
          this.uid = prop.getFirstValue();
          break;
        case "summary":
          this.summary = prop.getFirstValue();
          break;
        case "dtstart":
          this.start = processDate(prop);
          break;
        case "dtend":
          this.end = processDate(prop);
          break;
      }
    });
  }
}

// moment-config.ts
import moment from "moment"

moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: (input: string) => {
      return input === "a few seconds" ? "just now" : `${input} ago`
    },
    s: "a few seconds",
    ss: "%d seconds",
    m: "a min",
    mm: "%d min",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
})

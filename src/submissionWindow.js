export const REDDIT_GAMES_RULES_URL = "https://redditgameswithahook.devpost.com/rules";
export const SUBMISSION_START_ISO = "2026-06-17T18:00:00-07:00";
export const SUBMISSION_END_ISO = "2026-07-15T18:00:00-07:00";
export const WINNER_ANNOUNCEMENT_ISO = "2026-07-29T12:00:00-07:00";

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function wholeDaysUntil(from, to) {
  const ms = to.getTime() - from.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 86400000);
}

function phaseFor(now, start, end, winners) {
  if (now < start) return "upcoming";
  if (now <= end) {
    return wholeDaysUntil(now, end) <= 2 ? "closing-soon" : "open";
  }
  if (now <= winners) return "closed";
  return "results-window";
}

function detailFor(phase, daysRemaining) {
  if (phase === "upcoming") {
    return "Submissions have not opened yet.";
  }
  if (phase === "open") {
    return `Submissions close July 15, 2026 at 6:00 PM Pacific; ${daysRemaining} days remain.`;
  }
  if (phase === "closing-soon") {
    return `Submissions close July 15, 2026 at 6:00 PM Pacific; ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remain.`;
  }
  if (phase === "closed") {
    return "Submissions are closed; wait for judging or public result signals.";
  }
  return "Winner announcement window has passed; check the public results page.";
}

export function createSubmissionWindowStatus({
  now = new Date(),
  start = SUBMISSION_START_ISO,
  end = SUBMISSION_END_ISO,
  winners = WINNER_ANNOUNCEMENT_ISO,
  sourceUrl = REDDIT_GAMES_RULES_URL,
} = {}) {
  const nowDate = toDate(now);
  const startDate = toDate(start);
  const endDate = toDate(end);
  const winnersDate = toDate(winners);
  const phase = phaseFor(nowDate, startDate, endDate, winnersDate);
  const daysRemaining = wholeDaysUntil(nowDate, endDate);
  return {
    phase,
    open: phase === "open" || phase === "closing-soon",
    daysRemaining,
    sourceUrl,
    startIso: startDate.toISOString(),
    endIso: endDate.toISOString(),
    winnersIso: winnersDate.toISOString(),
    detail: detailFor(phase, daysRemaining),
  };
}

export function submissionWindowGateStatus(status) {
  if (status?.open) return "ready";
  return status?.phase === "upcoming" ? "waiting" : "blocked";
}

export function formatSubmissionWindowStatus(status) {
  return [
    `Submission window: ${status.phase}`,
    status.detail,
    `Rules source: ${status.sourceUrl}`,
  ].join("\n");
}

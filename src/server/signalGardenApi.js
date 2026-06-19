import { createDailyPuzzle } from "../game/puzzle.js";
import { createProposal, summarizeConsensus, toCommunityPayload } from "../game/proposals.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

function badRequest(message) {
  return json({ error: message }, 400);
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function sanitizePlan(plan) {
  if (!Array.isArray(plan)) {
    return [];
  }
  return plan
    .filter((move) => Number.isInteger(move.x) && Number.isInteger(move.y))
    .filter((move) => move.mirror === "slash" || move.mirror === "backslash")
    .slice(0, 5)
    .map((move) => ({ x: move.x, y: move.y, mirror: move.mirror }));
}

function createPuzzleForDay(day) {
  return createDailyPuzzle(new Date(`${day}T00:00:00.000Z`));
}

export function createSignalGardenApi({ store, today = () => new Date().toISOString().slice(0, 10), now = () => new Date().toISOString() }) {
  if (!store) {
    throw new Error("store is required");
  }

  async function init(day = today()) {
    const puzzle = createPuzzleForDay(day);
    const proposals = await store.list(puzzle.id);
    const consensus = summarizeConsensus(puzzle, proposals);
    return {
      type: "init",
      puzzle,
      consensus,
      payload: toCommunityPayload(puzzle, proposals),
    };
  }

  async function submitProposal({ day = today(), plan, author = "local-player" }) {
    const puzzle = createPuzzleForDay(day);
    const proposal = createProposal({
      puzzle,
      plan: sanitizePlan(plan),
      author,
      createdAt: now(),
    });
    const proposals = await store.save(proposal);
    return {
      type: "proposal",
      proposal,
      consensus: summarizeConsensus(puzzle, proposals),
      payload: toCommunityPayload(puzzle, proposals),
    };
  }

  async function archive(day) {
    const puzzle = createPuzzleForDay(day);
    const proposals = await store.list(puzzle.id);
    return {
      type: "archive",
      day,
      consensus: summarizeConsensus(puzzle, proposals),
      payload: toCommunityPayload(puzzle, proposals),
    };
  }

  async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "GET" && path === "/api/init") {
      return json(await init(url.searchParams.get("day") || today()));
    }

    if (request.method === "POST" && path === "/api/proposal") {
      const body = await readJson(request);
      if (!body) {
        return badRequest("Expected JSON body");
      }
      return json(
        await submitProposal({
          day: body.day || today(),
          plan: body.plan,
          author: body.author,
        }),
      );
    }

    if (request.method === "GET" && path.startsWith("/api/archive/")) {
      const day = decodeURIComponent(path.slice("/api/archive/".length));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        return badRequest("Expected archive day as YYYY-MM-DD");
      }
      return json(await archive(day));
    }

    return json({ error: "Not found" }, 404);
  }

  return {
    init,
    submitProposal,
    archive,
    handleRequest,
  };
}


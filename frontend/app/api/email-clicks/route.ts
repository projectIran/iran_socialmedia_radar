import { NextResponse } from "next/server";
import { getStore } from "@netlify/blobs";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const STORE_NAME = "email-clicks";
const BLOB_KEY = "counts";
const LOCAL_DIR = join(process.cwd(), ".data");
const LOCAL_FILE = join(LOCAL_DIR, "email-clicks.json");

type ClickCounts = Record<string, number>;

async function readCountsNetlify(): Promise<ClickCounts> {
  const store = getStore(STORE_NAME);
  const data = await store.get(BLOB_KEY, { type: "json" });
  return (data as ClickCounts) ?? {};
}

async function writeCountsNetlify(counts: ClickCounts): Promise<void> {
  const store = getStore(STORE_NAME);
  await store.setJSON(BLOB_KEY, counts);
}

async function readCountsLocal(): Promise<ClickCounts> {
  try {
    const raw = await readFile(LOCAL_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeCountsLocal(counts: ClickCounts): Promise<void> {
  await mkdir(LOCAL_DIR, { recursive: true });
  await writeFile(LOCAL_FILE, JSON.stringify(counts, null, 2));
}

const isNetlify = !!process.env.NETLIFY;

async function readCounts(): Promise<ClickCounts> {
  if (isNetlify) return readCountsNetlify();
  return readCountsLocal();
}

async function writeCounts(counts: ClickCounts): Promise<void> {
  if (isNetlify) return writeCountsNetlify(counts);
  return writeCountsLocal(counts);
}

export async function GET() {
  try {
    const counts = await readCounts();
    return NextResponse.json(counts);
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  let body: { handle: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.handle) {
    return NextResponse.json(
      { error: "Missing required field: handle" },
      { status: 400 }
    );
  }

  const handle = body.handle.replace(/^@/, "").toLowerCase();

  try {
    const counts = await readCounts();
    counts[handle] = (counts[handle] ?? 0) + 1;
    await writeCounts(counts);
    return NextResponse.json({ handle, count: counts[handle] });
  } catch (e) {
    return NextResponse.json(
      { error: "Storage unavailable" },
      { status: 503 }
    );
  }
}

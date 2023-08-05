import express from "express";
import Delta from "quill-delta";
import jwt from "jsonwebtoken";
import { authenticateToken } from "./middleware/auth";
import { plainTextDeltaToString, stringToPlainTextDelta } from "./util/util";
import authRouter from "./controller/auth.controller";
import documentRouter from "./controller/document.controller";

export const app = express();

// Use express built-in JSON middleware to automatically parse JSON request bodies
app.use(express.json());
app.use("/api/v1", authRouter, documentRouter);

// JWT secret key
// Supposed to be stored in the .env file in production
const SECRET_KEY = "secret";

// In-memory data store
interface Store {
  users: Record<string, User>;
  doc: Doc;
  changes: Record<number, string>;
}

interface Doc {
  content: string;
  version: number;
}

const localDB: Store = {
  users: {},
  doc: { content: "", version: 0 },
  changes: {},
};

class User {
  constructor(public email: string, public name: string) {
    this.email = email;
    this.name = name;
  }
}

class Doc {
  constructor(public content: string, public version: number) {
    this.content = content;
    this.version = version;
  }
}

interface ChangeDto {
  version: number;
  index: number;
  insertion: string | undefined;
  deletionLength: number | undefined;
}

interface RegisterDto {
  email: string;
  name: string;
}

interface RegisterResponse {
  token: string;
}

app.post("/register", (req, res) => {
  const { email, name } = req.body as RegisterDto;

  // Check for missing fields
  if (!email || !name) {
    return res.status(400).json({ error: "Email and name are required." });
  }

  // Update or add user
  localDB.users[email] = new User(email, name);

  // Generate and return JWT
  const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token } as RegisterResponse);
});

app.delete("/doc", authenticateToken, (req, res) => {
  localDB.doc.content = "";
  localDB.doc.version = 0;
  localDB.changes = {};
  res.json({ content: "", version: 0 });
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/doc", authenticateToken, (req, res) => {
  res.json(localDB.doc);
});

interface ChangeResponse {
  content: string;
  version: number;
}

const isDeletionLength = (
  deletionLength: number | undefined
): deletionLength is number => {
  return deletionLength !== undefined && deletionLength >= 0;
};

const isInsertion = (insertion: string | undefined): insertion is string => {
  return insertion !== undefined && insertion.length >= 0;
};

interface HandleUpdateRes {
  content: string;
  invertedDelta: Delta;
}

const handleUpdateToLatestVersion = (
  latestDocDelta: Delta,
  delta: Delta
): HandleUpdateRes => {
  const newDocDelta = latestDocDelta.compose(delta);
  const newDocContent = plainTextDeltaToString(newDocDelta);
  const inverted = delta.invert(latestDocDelta);

  return {
    content: newDocContent,
    invertedDelta: inverted,
  };
};

const handleUpdateToPreviousVersion = (
  latestDocDelta: Delta,
  currLatestVer: number,
  version: number,
  delta: Delta,
  changes: Record<number, string>
): HandleUpdateRes => {
  let tempDelta = new Delta();
  Object.assign(tempDelta, latestDocDelta);

  for (let i = currLatestVer - 1; i >= version; i--) {
    const change = changes[i];
    const changeDelta = new Delta(JSON.parse(change));
    tempDelta = tempDelta.compose(changeDelta);
  }

  const diff = tempDelta.diff(latestDocDelta);
  const transform = diff.transform(delta, false);
  const newDocDelta = latestDocDelta.compose(transform);
  const newDocContent = plainTextDeltaToString(newDocDelta);

  const inverted = latestDocDelta.diff(newDocDelta).invert(latestDocDelta);
  return { content: newDocContent, invertedDelta: inverted };
};

const createDelta = (
  index: number,
  insertion: string | undefined,
  deletionLength: number | undefined
): Delta => {
  const delta = new Delta();

  if (isInsertion(insertion)) {
    delta.retain(index).insert(insertion);
  }

  if (isDeletionLength(deletionLength)) {
    delta.retain(index).delete(deletionLength);
  }

  return delta;
};

app.post("/change", authenticateToken, (req, res) => {
  let response;

  const { version, index, insertion, deletionLength } = req.body as ChangeDto;

  const delta = createDelta(index, insertion, deletionLength);

  const latestDocDelta = stringToPlainTextDelta(localDB.doc.content);

  if (version === localDB.doc.version) {
    response = handleUpdateToLatestVersion(latestDocDelta, delta);
  } else {
    response = handleUpdateToPreviousVersion(
      latestDocDelta,
      localDB.doc.version,
      version,
      delta,
      localDB.changes
    );
  }

  localDB.changes[localDB.doc.version] = JSON.stringify(response.invertedDelta);
  localDB.doc.version += 1;
  localDB.doc.content = response.content;

  return res.json({
    content: localDB.doc.content,
    version: localDB.doc.version,
  });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

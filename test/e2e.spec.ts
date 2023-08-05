import { app } from "../src/index";
import supertest from "supertest";

const request = supertest(app);

describe("GET /", () => {
  it("should return Hello World!", async () => {
    await request
      .get("/")
      .set("Accept", "application/json")
      .expect("Hello, world!")
      .expect(200);
  });
});

describe("POST /register", () => {
  it("should return 400 if missing fields", async () => {
    await request
      .post("/register")
      .set("Accept", "application/json")
      .expect({ error: "Email and name are required." })
      .expect(400);
  });
  it("should return 400 if missing email", async () => {
    await request
      .post("/register")
      .send({ name: "test" })
      .set("Accept", "application/json")
      .expect({ error: "Email and name are required." })
      .expect(400);
  });
  it("should return 400 if missing name", async () => {
    await request
      .post("/register")
      .send({ email: "test@test.com" })
      .set("Accept", "application/json")
      .expect({ error: "Email and name are required." })
      .expect(400);
  });
  it("should successfully register user", async () => {
    const res = await request
      .post("/register")
      .send({ email: "test@test.com", name: "test" })
      .set("Accept", "application/json")
      .expect(200);
  });
});

describe("GET /doc", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request
      .post("/register")
      .send({ email: "test@test.com", name: "test" });
    token = res.body.token;
  });
  it("should return 401 if missing token", async () => {
    await request
      .get("/doc")
      .set("Accept", "application/json")
      .expect({ error: "Missing token." })
      .expect(401);
  });
  it("should return 403 if invalid token", async () => {
    await request
      .get("/doc")
      .set("Accept", "application/json")
      .set("Authorization", 'Bearer "invalidtoken"')
      .expect({ error: "Invalid token." })
      .expect(403);
  });
  it("should return doc if valid token", async () => {
    await request
      .get("/doc")
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });
});

describe("POST /change", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request
      .post("/register")
      .send({ email: "test@test.com", name: "test" });
    token = res.body.token;
  });
  //close server after test
  it("should return 401 if missing token", async () => {
    await request
      .post("/change")
      .set("Accept", "application/json")
      .expect({ error: "Missing token." })
      .expect(401);
  });
  it("should return 403 if invalid token", async () => {
    await request
      .post("/change")
      .set("Accept", "application/json")
      .set("Authorization", "Bearer invalidtoken")
      .expect({ error: "Invalid token." })
      .expect(403);
  });

  describe("Testing scenario 1", () => {
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should add X to index 2 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 2, insertion: "X" })
        .expect({ content: "ABXCDE", version: 2 })
        .expect(200);
    });
    it("should successfully add Y to index 4 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 4, insertion: "Y" })
        .expect({ content: "ABXCDYE", version: 3 })
        .expect(200);
    });
  });

  describe("Testing scenario 2", () => {
    it("should clear doc content", async () => {
      await request
        .delete("/doc")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect({ content: "", version: 0 })
        .expect(200);
    });
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should add X to index 4 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 4, insertion: "X" })
        .expect({ content: "ABCDXE", version: 2 })
        .expect(200);
    });
    it("should successfully add Y to index 1 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 1, insertion: "Y" })
        .expect({ content: "AYBCDXE", version: 3 })
        .expect(200);
    });
  });

  describe("Testing scenario 3", () => {
    it("should clear doc content", async () => {
      await request
        .delete("/doc")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect({ content: "", version: 0 })
        .expect(200);
    });
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should insert X at index 1 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 1, insertion: "X" })
        .expect({ content: "AXBCDE", version: 2 })
        .expect(200);
    });
    it("should insert Y at index 2 with version 2", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 2, index: 2, insertion: "Y" })
        .expect({ content: "AXYBCDE", version: 3 })
        .expect(200);
    });
    it("should insert Z at index 4 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 4, insertion: "Z" })
        .expect({ content: "AXYBCDZE", version: 4 })
        .expect(200);
    });
  });
  describe("Testing scenario 4", () => {
    it("should clear doc content", async () => {
      await request
        .delete("/doc")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect({ content: "", version: 0 })
        .expect(200);
    });
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should delete 2 characters from index 1 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 1, deletionLength: 2 })
        .expect({ content: "ADE", version: 2 })
        .expect(200);
    });
    it("should insert XYZ at index 4 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 4, insertion: "XYZ" })
        .expect({ content: "ADXYZE", version: 3 })
        .expect(200);
    });
  });

  describe("Testing scenario 5", () => {
    it("should clear doc content", async () => {
      await request
        .delete("/doc")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect({ content: "", version: 0 })
        .expect(200);
    });
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should insert XY at index 2 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 2, insertion: "XY" })
        .expect({ content: "ABXYCDE", version: 2 })
        .expect(200);
    });
    it("should delete 2 characters from index 2 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 3, deletionLength: 2 })
        .expect({ content: "ABXYC", version: 3 })
        .expect(200);
    });
  });

  describe("Testing scenario 6", () => {
    it("should clear doc content", async () => {
      await request
        .delete("/doc")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect({ content: "", version: 0 })
        .expect(200);
    });
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should delete 1 character from index 1 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 1, deletionLength: 1 })
        .expect({ content: "ACDE", version: 2 })
        .expect(200);
    });
    it("should delete 1 character from index 2 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 3, deletionLength: 1 })
        .expect({ content: "ACE", version: 3 })
        .expect(200);
    });
  });

  describe("Testing scenario 7", () => {
    it("should clear doc content", async () => {
      await request
        .delete("/doc")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .expect({ content: "", version: 0 })
        .expect(200);
    });
    it("should set doc content to ABCDE", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 0, index: 0, insertion: "ABCDE" })
        .expect({ content: "ABCDE", version: 1 })
        .expect(200);
    });
    it("should insert XY at index 2 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 2, insertion: "XY" })
        .expect({ content: "ABXYCDE", version: 2 })
        .expect(200);
    });
    it("should delete 3 characters from index 1 with version 1", async () => {
      await request
        .post("/change")
        .set("Accept", "application/json")
        .set("Authorization", `Bearer ${token}`)
        .send({ version: 1, index: 1, deletionLength: 3 })
        .expect({ content: "AXYE", version: 3 })
        .expect(200);
    });
  });
});

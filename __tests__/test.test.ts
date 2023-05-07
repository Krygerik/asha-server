import {testServer} from "./common";

describe("API для тестирования", () => {
    it("GET /api/test", async () => {
        const res = await testServer.get("/api/test");

        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('Get request successfull');
    });
    it("POST /api/test", async () => {
        const res = await testServer.post("/api/test");

        expect(res.status).toEqual(200);
        expect(res.body.message).toEqual('Post request successfull');
    });
});
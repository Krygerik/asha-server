import {testServer} from "./common";

describe("Ладдерные запросы", () => {
    it("POST /api/ladder/create", async () => {
        const res = await testServer.post("/api/ladder/create").send({discord_ids: []});

        expect(res.status).toEqual(400);
        expect(res.body.STATUS).toEqual('FAILURE');
        expect(res.body.MESSAGE).toEqual('not_enough_data');
    });
});
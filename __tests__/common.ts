import app from "../src";
import * as request from "supertest";

export const testServer = request(app);

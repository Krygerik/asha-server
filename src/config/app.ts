import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as express from "express";
import * as mongoose from "mongoose";
import {TestRoutes} from '../routes/testRoutes';
import {GameRoutes} from '../routes/gameRoutes';
import {CommonRoutes} from '../routes/commonRoutes';
import {MappingNicknameToGameRoutes} from "../routes/mappingNicknameToGameRoutes";

class App {
    public app: express.Application;
    public mongoUrl: string = 'mongodb://AdminSokratik:Her0EsF!ve@localhost:27017/admin';

    private testRoutes: TestRoutes = new TestRoutes();
    private gameRoutes: GameRoutes = new GameRoutes();
    private mappingNicknameToGameRoutes: MappingNicknameToGameRoutes = new MappingNicknameToGameRoutes();
    private commonRoutes: CommonRoutes = new CommonRoutes();

    constructor() {
        this.app = express();
        this.config();
        this.mongoSetup();
        this.testRoutes.route(this.app);
        this.gameRoutes.route(this.app);
        this.mappingNicknameToGameRoutes.route(this.app);
        this.commonRoutes.route(this.app);
    }

    private config(): void {
        this.app.use(cors({ origin: false }));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private mongoSetup(): void {
        mongoose.connect(
            this.mongoUrl,
            { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }
        )
    }
}

export default new App().app;

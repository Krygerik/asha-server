import app from "./config/app";
import {EEnvironment} from "./constants";

if (process.env.NODE_ENV !== EEnvironment.UnitTests) {
  app.listen(process.env.APP_PORT, () => {
    console.log('Express server listening on port ' + process.env.APP_PORT);
  })
}

export default app;
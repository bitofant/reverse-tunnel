import config from "./config";
import logger from 'standalone-logger';
import TunnelServer from "./tunnel/server";
import TunnelClient from "./tunnel/client";
const log = logger(module);

// log(config.isServer ? 'server' : 'client');
log(config);


if (config.isServer) {
  new TunnelServer();
} else {
  new TunnelClient();
}

import config from "../config";
import logger from 'standalone-logger';
import { Socket } from "net";
import { writeFileSync } from "fs";
const log = logger(module);


class TunnelClient {
  private halfopenTunnelCount = 0;

  constructor () {
    this.establishTunnel();
  }

  private establishTunnel () {
    const tunnel = new Socket();
    this.halfopenTunnelCount++;
    tunnel.connect({
      host: config.tunnelHost,
      port: config.tunnelPort
    }, () => {
      log('tunnel half-open');
      const localConnection = new Socket();
      var connected = false;
      tunnel.once('data', data => {
        this.halfopenTunnelCount--;
        connected = true;
        localConnection.connect({
          host: config.host,
          port: config.port
        }, () => {
          log('tunnel open, piping');
          localConnection.write(data);
          tunnel.pipe(localConnection);
          localConnection.pipe(tunnel);
          // localConnection.on('end', () => {
          //   log(' ::: ::: ::: LOCAL END ::: ::: :::');
          // });
        });
        this.establishTunnel();
      });
      tunnel.on('end', () => {
        if (!connected) {
          if (--this.halfopenTunnelCount <= 0) this.establishTunnel();
        }
      });
    });
    tunnel.on('error', err => {
      if (process.env.KUBERNETES_SERVICE_HOST) {
        writeFileSync('/dev/termination-log', [err.name, err.message, err.stack].join('\n'), 'utf8');
      } else {
        log(err);
      }
      process.exit(1);
    });
  }

}

export default TunnelClient;

import config from "../config";
import logger from 'standalone-logger';
import { Socket, Server } from "net";
const log = logger(module);


class TunnelServer {
  private endpointerListener : Server|null = null;
  private tunnelListener : Server|null = null;

  private readonly openTunnels : Socket[] = [];
  private readonly waitingForTunnel : Array<(value: Socket) => void> = [];

  constructor () {
    this.openEndpointListener ();
    this.openTunnelListener ();
  }

  private onEndpointConnection (socket: Socket) {
    const t1 = Date.now();
    log('new connection');
    this.fetchNextTunnel()
      .then(tunnel => {
        tunnel.pipe(socket);
        socket.pipe(tunnel);
        log(`  - tunnel established after ${Date.now()-t1}ms`);
      })
      .catch(err => {
        log(err);
      });
  }

  private onTunnelConnection (socket: Socket) {
    log('new tunnel connection');
    if (this.waitingForTunnel.length > 0) {
      let fn = this.waitingForTunnel.shift();
      if (fn) fn (socket);
    } else {
      this.openTunnels.push(socket);
      socket.on('error', err => {
        log(err);
        let index = this.openTunnels.indexOf(socket);
        if (index >= 0) this.openTunnels.splice(index, 1);
      });
      setTimeout(() => {
        let index = this.openTunnels.indexOf(socket);
        if (index >= 0) {
          this.openTunnels.splice(index, 1);
          try {
            socket.end();
          } catch (err) {}
        }
      }, 120000)
    }
  }

  private fetchNextTunnel () : Promise<Socket> {
    return new Promise<Socket> (resolve => {
      if (this.openTunnels.length > 0) {
        resolve(this.openTunnels.pop());
      } else {
        this.waitingForTunnel.push(resolve);
      }
    });
  }

  private openEndpointListener () {
    this.tryClose(this.endpointerListener);
    this.endpointerListener = new Server (s => this.onEndpointConnection(s));
    this.endpointerListener.listen(config.port, () => {
      log('listening for connections on :' + config.port);
    });
    this.endpointerListener.on('error', err => {
      log(err);
      this.openEndpointListener();
    });
  }
  
  private openTunnelListener () {
    this.tryClose(this.tunnelListener);
    this.tunnelListener = new Server (s => this.onTunnelConnection(s));
    this.tunnelListener.listen(config.tunnelPort, () => {
      log('listening for incoming tunnels on :' + config.tunnelPort);
    });
    this.tunnelListener.on('error', err => {
      log(err);
      this.openTunnelListener();
    });
  }

  private tryClose (server : Server|null) {
    if (server === null) return;
    try {
      server.close();
    } catch (err) {}
  }

}

export default TunnelServer;

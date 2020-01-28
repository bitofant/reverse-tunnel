function env<T> (name: string, def: T, mapper: (s: string) => T) {
  const v = process.env[name];
  if (typeof (v) === 'string') {
    return mapper (v);
  }
  return def;
}


const config = {
  host: env('HOST', '', String),
  port: env('PORT', 8080, parseInt),
  tunnelHost: env('TUNNEL_HOST', '', String),
  tunnelPort: env('TUNNEL_PORT', 15627, parseInt),
  isServer: !process.env.TUNNEL_HOST || !process.env.HOST
};

if (process.env.NODE_ENV === 'development') {
  if (process.env.npm_config_argv) {
    config.isServer = process.env.npm_config_argv.includes ('server');
    if (!config.isServer) {
      // ensure the server is up before trying to connect
      const t = Date.now() + 100;
      while (true) if (Date.now() > t) break;
    }
  }
}

export default config;

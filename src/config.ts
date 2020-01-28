function env<T> (name: string, def: T, mapper: (s: string) => T) {
  const v = process.env[name];
  if (typeof (v) === 'string') {
    return mapper (v);
  }
  return def;
}


const config = {
  host: env('HOST', '127.0.0.1', String),
  port: env('PORT', 8080, parseInt),
  tunnelPort: env('TUNNEL_PORT', 15627, parseInt),
  isServer: env('SERVER', false, v => !['false','no'].includes(v.toLowerCase()))
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

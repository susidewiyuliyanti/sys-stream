interface Hyperdrive {
  connectionString: string;
}

type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string | undefined>;
  waitUntil?: (promise: Promise<unknown>) => void;
  next?: () => Promise<Response>;
}) => Response | Promise<Response>;

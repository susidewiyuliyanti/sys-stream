import { Client } from 'pg';

export interface Env {
  HYPERDRIVE: Hyperdrive;
  JWT_SECRET: string;
}

export async function getDbClient(
  env: Env
): Promise<Client> {
  if (!env.HYPERDRIVE?.connectionString) {
    throw new Error(
      'HYPERDRIVE connection string is not configured.'
    );
  }

  const client = new Client({
    connectionString:
      env.HYPERDRIVE.connectionString,
  });

  await client.connect();

  return client;
}

export async function withDb<T>(
  env: Env,
  callback: (client: Client) => Promise<T>
): Promise<T> {
  const client = await getDbClient(env);

  try {
    return await callback(client);
  } finally {
    await client.end().catch(() => {});
  }
}

export function json(
  data: unknown,
  status = 200
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type':
          'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function readJson<T = any>(
  request: Request
): Promise<T> {
  try {
    return await request.json();
  } catch {
    return {} as T;
  }
}

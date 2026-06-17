/**
 * Página de inicio temporal: verifica EN VIVO que la conexión a Supabase
 * funciona. Hace una petición al servidor de Supabase usando tu URL y tu
 * anon key. Cuando ya tengas tu app real, puedes reemplazar esta página.
 */

type CheckResult = {
  ok: boolean;
  detail: string;
};

async function checkSupabase(): Promise<CheckResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      ok: false,
      detail:
        "Faltan variables de entorno (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    };
  }

  try {
    // /auth/v1/health responde 200 si la URL y la anon key son válidas.
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: anonKey },
      cache: "no-store",
    });

    if (res.ok) {
      return { ok: true, detail: `Conexión correcta (HTTP ${res.status}).` };
    }
    return {
      ok: false,
      detail: `El servidor de Supabase respondió HTTP ${res.status}. Revisa la URL y la anon key.`,
    };
  } catch (err) {
    return {
      ok: false,
      detail: `No se pudo contactar a Supabase: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
}

export default async function Home() {
  const result = await checkSupabase();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-semibold">Abogado Demo</h1>

      <div
        className={`flex items-center gap-3 rounded-lg border px-5 py-4 ${
          result.ok
            ? "border-green-500/40 bg-green-500/10"
            : "border-red-500/40 bg-red-500/10"
        }`}
      >
        <span className="text-2xl">{result.ok ? "✅" : "❌"}</span>
        <div>
          <p className="font-medium">
            {result.ok ? "Supabase conectado" : "Supabase NO conectado"}
          </p>
          <p className="text-sm opacity-80">{result.detail}</p>
        </div>
      </div>

      <p className="max-w-md text-center text-sm opacity-60">
        Esta es una página de prueba. La conexión se verifica en el servidor
        usando tu Project URL y tu anon key.
      </p>
    </main>
  );
}

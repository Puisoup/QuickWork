import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SupabaseTestPage() {
  let response: { ok: true; data: unknown } | { ok: false; error: string } = {
    ok: false,
    error: "Unknown",
  };

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.from("todos").select("id,name").limit(5);
    if (error) {
      response = { ok: false, error: error.message };
    } else {
      response = { ok: true, data };
    }
  } catch (e) {
    response = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Supabase Test</h1>
      <p style={{ marginBottom: 12 }}>Route: <code>/supabase-test</code></p>
      <pre
        style={{
          background: "#0b1020",
          color: "white",
          padding: 16,
          borderRadius: 8,
          whiteSpace: "pre-wrap",
        }}
      >
        {JSON.stringify(response, null, 2)}
      </pre>
      <p style={{ marginTop: 12, color: "#555" }}>
        Wenn hier ein Tabellenfehler kommt: euer Projekt braucht eine <code>todos</code>-Tabelle
        oder wir passen den Query auf euren echten Tabellen-Namen an.
      </p>
    </div>
  );
}


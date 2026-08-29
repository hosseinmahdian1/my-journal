export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = await context.request.json();
    const { endpoint, headers, body: reqBody, activeProvider } = body as any;

    if (!endpoint || !reqBody) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: headers || { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return new Response(JSON.stringify({ error: `API Error: ${res.status}`, details: errorText }), { status: res.status });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), { status: 500 });
  }
};

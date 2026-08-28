interface Env {}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });
    
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch calendar data" }), { status: 500 });
    }

    const data: any[] = await res.json();
    
    // Transform to match the app's EconomicEvent structure
    const events = data.map((item, index) => {
      // The date is provided like: '2026-08-23T18:45:00-04:00'
      // It is already in ISO-ish format with offset. We can pass it directly.
      const d = new Date(item.date);
      let time = "All Day";
      if (!item.date.includes("00:00:00") && !isNaN(d.getTime())) {
        time = d.toISOString(); // keep it as ISO string for frontend to parse
      }

      return {
        id: `ff-live-${index}`,
        title: item.title,
        currency: item.country, // country maps to currency in FF (e.g. USD, EUR)
        date: item.date,
        time: time,
        impact: item.impact, // High, Medium, Low, Non-Economic
        forecast: item.forecast || "-",
        previous: item.previous || "-",
        actual: item.actual || "Pending"
      };
    });

    return new Response(JSON.stringify(events), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // cache for 5 minutes
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

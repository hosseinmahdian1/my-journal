async function test() {
  const assets = [
    { name: 'GOLD', label: 'XAUUSD' },
    { name: 'EURO FX', label: 'EURUSD' },
    { name: 'BRITISH POUND', label: 'GBPUSD' },
    { name: 'JAPANESE YEN', label: 'USDJPY' }
  ];

  for (const a of assets) {
    try {
      const url = `https://publicreporting.cftc.gov/resource/6dca-aqww.json?$where=contract_market_name='${encodeURIComponent(a.name)}'&$order=report_date_as_yyyy_mm_dd DESC&$limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.length > 0) {
        const d = data[0];
        const noncommLong = parseInt(d.noncomm_positions_long_all, 10) || 0;
        const noncommShort = parseInt(d.noncomm_positions_short_all, 10) || 0;
        const net = noncommLong - noncommShort;
        const changeLong = parseInt(d.change_in_noncomm_long_all, 10) || 0;
        const changeShort = parseInt(d.change_in_noncomm_short_all, 10) || 0;
        const netChange = changeLong - changeShort;
        const total = noncommLong + noncommShort || 1;
        const instLongPct = Math.round((noncommLong / total) * 100);
        const instShortPct = 100 - instLongPct;

        console.log(`✅ [CFTC Real API] ${a.label} (${a.name}): Report Date=${d.report_date_as_yyyy_mm_dd.split('T')[0]}, Long=${noncommLong.toLocaleString()}, Short=${noncommShort.toLocaleString()}, Net=${net > 0 ? '+' : ''}${net.toLocaleString()}, Net Weekly Change=${netChange > 0 ? '+' : ''}${netChange.toLocaleString()} contracts, Institutional Bias=${instLongPct}% Long / ${instShortPct}% Short`);
      } else {
        console.log(`❌ No data for ${a.name}`);
      }
    } catch (e) {
      console.error(`Error fetching ${a.name}:`, e.message);
    }
  }
}

test();

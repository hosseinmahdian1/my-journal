const fetch = require('node-fetch'); // or native fetch
const params = new URLSearchParams();
params.append("$where", "market_and_exchange_names='GOLD - COMMODITY EXCHANGE INC.'");
const url = "https://publicreporting.cftc.gov/resource/6dca-aqww.json?" + params.toString();
console.log(url);
fetch(url).then(r=>r.json()).then(j => console.log(j.length)).catch(console.error);

import handler from '../netlify/functions/sync-market-data.mts';

const res = await handler(new Request('http://localhost/'), {} as never);
console.log('--- RESPOSTA ---');
console.log(await res.text());
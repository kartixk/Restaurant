const dns = require('dns').promises;

const prefixes = ['kartikeya'];
const middles = ['1psrn', 'lpsrn', '1psr', 'lpsr'];
const suffixes = ['v', 'rv', ''];
const base = 'mongodb.net';

async function check() {
    for (const p of prefixes) {
        for (const m of middles) {
            for (const s of suffixes) {
                const host = s ? `${p}.${m}.${s}.${base}` : `${p}.${m}.${base}`;
                const host2 = s ? `${p}.${m}${s}.${base}` : `${p}.${m}.${base}`;

                for (const h of [host, host2]) {
                    try {
                        const srv = await dns.resolveSrv(`_mongodb._tcp.${h}`);
                        console.log(`✅ FOUND SRV for ${h}:`, srv);
                        return;
                    } catch (err) {
                        // console.log(`❌ Failed ${h}: ${err.code}`);
                    }
                }
            }
        }
    }
    console.log("❌ All common variants failed.");
}

check();

const dns = require('dns').promises;

const variants = [
    'kartikeya.1psrnv.mongodb.net',
    'kartikeya.lpsrnv.mongodb.net',
    'kartikeya.1psrn.v.mongodb.net',
    'kartikeya.lpsrn.v.mongodb.net',
    'kartikeya.1psrn.mongodb.net',
    'kartikeya.lpsrn.mongodb.net'
];

async function check() {
    for (const v of variants) {
        try {
            const srv = await dns.resolveSrv(`_mongodb._tcp.${v}`);
            console.log(`✅ FOUND SRV for ${v}:`, srv);
            return;
        } catch (err) {
            console.log(`❌ Failed ${v}: ${err.code}`);
        }
    }
}

check();

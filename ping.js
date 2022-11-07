const skeldjs = require("@skeldjs/client");
const { AcknowledgePacket } = require("@skeldjs/protocol");
const protocol = require("@skeldjs/protocol");
const { sleep } = require("@skeldjs/util");

(async () => {
    const client = new skeldjs.SkeldjsClient("2022.9.2.0s", "weakeyes", { authMethod: skeldjs.AuthMethod.None, useHttpMatchmaker: false });
    console.log("Connecting..");
    // @ts-ignore
    await client.connect("127.0.0.1", 22023);

    console.log("Pinging..");

    clearInterval(client.pingInterval);
    while (true) {
        const start = process.hrtime.bigint();
        const nonce = client.getNextNonce();
        client.send(new protocol.PingPacket(nonce));
        await client.decoder.waitf(AcknowledgePacket, p => p.nonce === nonce);
        const end = process.hrtime.bigint();
        const us = ((end - start) / 1000n);
        console.log("%sms", Number(us) / 1000);
        await sleep(50);
    }
})();
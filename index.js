// @ts-check

const skeldjs = require("@skeldjs/client");
const { GameCode, Vector2, sleep } = require("@skeldjs/util");
const threads = require("worker_threads");
const cliArgparse = require("cli-argparse");

if (threads.isMainThread) {
    (async () => {
        const argv = cliArgparse(process.argv);

        const num_threads = parseInt(argv.options.threads) || 2;
        const all_threads = [];
    
        for (let i = 0; i < num_threads; i++) {
            const worker_thread = new threads.Worker(__filename, {
                env: {
                    THREAD_ID: i.toString(),
                    NUM_ROOMS: argv.options.rooms || 3,
                    IP_ADDR: argv.options.ip || "127.0.0.1"
                }
            });
            all_threads.push(worker_thread);
        }
    })();
} else {
    (async () => {
        /**
         * @type {skeldjs.SkeldjsClient[][]}
         */
        const rooms = [];
        // @ts-ignore
        const numRooms = parseInt(process.env.NUM_ROOMS);
        for (let i = 0; i < numRooms; i++) {
            const client = new skeldjs.SkeldjsClient("2022.9.2.0s", "weakeyes", { authMethod: skeldjs.AuthMethod.None, useHttpMatchmaker: false });
            console.log("Connecting..");
            // @ts-ignore
            await client.connect(process.env.IP_ADDR, 22023);
            console.log("Creating..");
            const gameCode = await client.createGame({ maxPlayers: 50 });
            console.log("Created %s, joining clients..", GameCode.convertIntToString(gameCode));
            client.myPlayer?.control?.setName("a");
            client.myPlayer?.control?.setColor(skeldjs.Color.Blue);
            client.myPlayer?.control?.setHat(skeldjs.Hat.NoHat);
            client.myPlayer?.control?.setSkin(skeldjs.Skin.None);
            client.myPlayer?.control?.setPet(skeldjs.Pet.EmptyPet);
            client.myPlayer?.control?.setVisor(skeldjs.Visor.EmptyVisor);
            client.myPlayer?.control?.setNameplate(skeldjs.Nameplate.NoPlate);
            await sleep(500);
            const room = [];
            rooms.push(room);
            room.push(client);

            for (let j = 0; j < 14; j++) {
                const joinClient = new skeldjs.SkeldjsClient("2022.9.2.0s", "weakeyes", { authMethod: skeldjs.AuthMethod.None, useHttpMatchmaker: false });
                // @ts-ignore
                await joinClient.connect(process.env.IP_ADDR, 22023);
                try {
                    await joinClient.joinGame(gameCode);
                } catch (e) {
                    continue;
                }
                joinClient.myPlayer?.control?.setName("a");
                joinClient.myPlayer?.control?.setColor(skeldjs.Color.Blue);
                joinClient.myPlayer?.control?.setHat(skeldjs.Hat.NoHat);
                joinClient.myPlayer?.control?.setSkin(skeldjs.Skin.None);
                joinClient.myPlayer?.control?.setPet(skeldjs.Pet.EmptyPet);
                joinClient.myPlayer?.control?.setVisor(skeldjs.Visor.EmptyVisor);
                joinClient.myPlayer?.control?.setNameplate(skeldjs.Nameplate.NoPlate);
                console.log("(%s/%s) [%s] joined %s/%s", i + 1, numRooms, GameCode.convertIntToString(gameCode), j + 2, 15);
                room.push(joinClient);
                await sleep(500);
            }
        }

        let i = -1;
        setInterval(async () => {
            i = ++i % rooms[0].length;
            for (const room of rooms) {
                for (const client of room) {
                    client.myPlayer?.transform?.move(Math.random() * 30 - 15, Math.random() * 30 - 15, new Vector2(2.5, 0));
                }
            }
        }, 1000 / 10);
    })();
}
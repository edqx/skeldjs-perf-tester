const skeldjs = require("@skeldjs/client");
const { Int2Code, sleep } = require("@skeldjs/util");
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
                    THREAD_ID: i,
                    NUM_ROOMS: argv.options.rooms || 3
                }
            });
            all_threads.push(worker_thread);
        }
    })();
} else {
    (async () => {
        /**
         * @type {skeldjs.SkeldjsClient[]}
         */
        const rooms = [];
        const numRooms = parseInt(process.env.NUM_ROOMS);
        for (let i = 0; i < numRooms; i++) {
            const client = new skeldjs.SkeldjsClient("2021.6.30", { attemptAuth: false });
            await client.connect("127.0.0.1", "weakeyes", 22023);
            const gameCode = await client.createGame({ maxPlayers: 15 });
            console.log("Created %s, joining clients..", Int2Code(gameCode));
            client.me.control.setName("a");
            client.me.control.setColor(skeldjs.Color.Blue);
            const room = [];
            rooms.push(room);
            room.push(client);

            for (let i = 0; i < 14; i++) {
                const joinClient = new skeldjs.SkeldjsClient("2021.6.30", { attemptAuth: false });
                await joinClient.connect("127.0.0.1", "weakeyes", 22023);
                await joinClient.joinGame(gameCode);
                joinClient.me.control.setName("a");
                joinClient.me.control.setColor(skeldjs.Color.Blue);
                console.log("[%s] joined %s/%s", Int2Code(gameCode), i + 2, 15);
                room.push(joinClient);
            }
        }

        let i = -1;
        setInterval(async () => {
            i = ++i % rooms[0].length;
            for (const room of rooms) {
                for (const client of room) {
                    client.me?.transform.move(Math.random() * 5, Math.random() * 5);
                }
            }
        }, 1000 / 13);
    })();
}
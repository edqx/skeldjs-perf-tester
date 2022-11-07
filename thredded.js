const skeldjs = require("@skeldjs/client");
const { Int2Code } = require("@skeldjs/util");
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
                    NUM_ROOMS: argv.options.rooms || 3,
                    ROOM_ID: argv.options.room,
                    IP_ADDR: argv.options.ip || "127.0.0.1"
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
        const clients = [];
        console.log("Joining clients..");

        for (let i = 0; i < 8; i++) {
            const joinClient = new skeldjs.SkeldjsClient("2021.6.30", { attemptAuth: false });
            await joinClient.connect(process.env.IP_ADDR, "weakeyes", 22023);
            await joinClient.joinGame(process.env.ROOM_ID);
            //joinClient.me.control.setName("a");
            //joinClient.me.control.setColor(skeldjs.Color.Blue);
            console.log("[%s] joined %s/%s", Int2Code(joinClient.code), i + 2, 15);
            clients.push(joinClient);
        }

        setInterval(async () => {
            for (const client of clients) {
                client.me?.transform.move(Math.random() * 5, Math.random() * 5);
            }
        }, 1000 / 13);
    })();
}
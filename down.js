const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

// Pubsub option must be passed to all components
const ipfsOptions = {
    start: true,
    EXPERIMENTAL: {
      pubsub: true,
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        ]
      },
    }
  }

// Create IPFS instance and pass the pubsub option in
const ipfs = new IPFS(ipfsOptions)
console.log('IPFS ✅')

// Handle errors
ipfs.on('error', (e) => console.error(e))

// Start working with OrbitDB once the IPFS instance is ready
ipfs.on('ready', async () => {

    // Create OrbitDB instance on the IPFS instance
    const orbitdb = new OrbitDB(ipfs)
    console.log('OrbitDB ✅')

    // Load address from file / get from HTTP request for easy access
    const db = await orbitdb.open('/orbitdb/QmeMGMDPmYbuYtFmJtu86NfGcSVgKm515VqcrCDqGah3ZC/fav_emoji')
    await db.load()

    // UNCOMMENT FOR LIVE MULTI-MACHINE REPLICATION
    //db.events.on('replicated', async () => {

        console.log('Database ready 🎉')

        // SHow full database with tautology mapper
        console.log(db.query((doc) => doc))

        // Get all docs by regex filter
        console.log('All people with an \'a\' in their name:')
        const lPeople = db.query((doc) => doc.name.match(/a/))
        for (i = 0; i < lPeople.length; i++) {
            let lPerson = lPeople[i];
            console.log(lPerson);
        }

        // Filter docs
        console.log('Let\'s get rid of under 18s.')
        const youngsters = db.query((doc) => doc.age < 18)
        for (i = 0; i < youngsters.length; i++) {
            let youngster = youngsters[i].name
            await db.del(youngster)
            console.log(youngster + ' has been removed.')
        }

        // Show remianing database with tautology mapper
        console.log('Remaining files in the database:')
        console.log(db.query((doc) => doc))

        // Disconnect
        await orbitdb.disconnect()
        ipfs.stop(() => {})
        console.log('IPFS connection closed ❌')
    
    // UNCOMMENT FOR LIVE MULTI-MACHINE REPLICATION
    //})

})

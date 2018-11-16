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

    // Create our docs type database using index-by-name option
    const db = await orbitdb.docs('fav_emoji', {
        indexBy: 'name',
        write: ['*'] // Allow anyone write access
    })

    // Get our OrbitDB address so others can access it
    // Write to file / send by HTTP for access in other components
    const address = db.address.toString()
    console.log('Address: ' + address)

    // Add three documents, e.g. representing people
    await db.put({ _id: 'ID1', name: 'Alice', age: 17, emoji: '🐳' })
    await db.put({ _id: 'ID2', name: 'Bob', age: 18, emoji: '💰' })
    await db.put({ _id: 'ID3', name: 'Carol', age: 19, emoji: '😂' })
    console.log('3 users have been added to the database.')

    // Get a doc
    console.log("Alice's file looks like this:")
    const profile = db.get('Alice')
    console.log(profile)

    // COMMENT THIS BLOCK OUT TO REMAIN A PEER (NODE/HOST) SO OTHERS CAN REPLICATE
    // Disconnect
    await orbitdb.disconnect()
    ipfs.stop(() => {})
    console.log('IPFS connection closed ❌')

})

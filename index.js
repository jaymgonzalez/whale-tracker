const ethers = require('ethers')
const twitterCLient = require('./twitterClient.js')
const tokenInfo = require('./tokenInfo')
const exchangesWallets = require('./exchangesWallets.js')

const rpcURL = 'https://cloudflare-eth.com/'
const provider = new ethers.providers.JsonRpcProvider(rpcURL)

const TRANSFER_THRESHOLD = 5000000000000

const tweet = async (tweet) => {
  try {
    await twitterCLient.v1.tweet(tweet)
    const date = dateNow()
    console.log(`tweet sent at ${date}`)
  } catch (err) {
    console.error(err)
  }
}

const contractCreation = (address, abi, provider) => {
  const contract = new ethers.Contract(address, abi, provider)
  return contract
}

const dateNow = () =>
  new Date().toISOString().replace('T', ' ').substring(0, 16)

const messageInTweet = (amount, name, data, date, from, to) =>
  `🚨🚨 New Whale Transfer 🚨🚨
  $${(amount.toNumber() / 1000000)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${name} on ${date} UTC${
    from ? ` from ${from.toUpperCase()}` : ''
  }${to ? ` to ${to.toUpperCase()}` : ''}: https://etherscan.io/tx/${
    data.transactionHash
  } `

const txFromToExchange = (txAddress) => {
  for (const exchangeWallets of Object.entries(exchangesWallets)) {
    for (const exchangeWallet of exchangeWallets[1]) {
      if (exchangeWallet === txAddress.toLowerCase()) return exchangeWallets[0]
    }
  }
}

const main = async () => {
  for (const token of Object.entries(tokenInfo)) {
    const contract = contractCreation(token[1].address, token[1].abi, provider)

    const name = token[0].toUpperCase()

    console.log(
      `Whale tracker started!\nListening for large transactions on ${name}`
    )

    contract.on('Transfer', (from, to, amount, data) => {
      if (amount.toNumber() >= TRANSFER_THRESHOLD) {
        const txFrom = txFromToExchange(from)
        const txTo = txFromToExchange(to)
        const date = dateNow()
        const message = messageInTweet(amount, name, data, date, txFrom, txTo)
        tweet(message)
      }
    })
  }
}

main()

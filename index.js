const ethers = require('ethers')
const twitterCLient = require('./twitterClient.js')
const tokenInfo = require('./tokenInfo')
const exchangesWallets = require('./exchangesWallets.js')

const rpcURL = 'https://cloudflare-eth.com/'
const provider = new ethers.providers.JsonRpcProvider(rpcURL)

const TRANSFER_THRESHOLD = 1000000000000

const tweet = async (tweet) => {
  try {
    await twitterCLient.v1.tweet(tweet)
    console.log('tweet sent!')
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
  `New whale transfer for $${(amount.toNumber() / 1000000)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${name}: https://etherscan.io/tx/${
    data.transactionHash
  } on ${date} UTC ${from ? `from exchange ${from.toUpperCase()}` : ''} ${
    to ? `to exchange ${to.toUpperCase()}` : ''
  }`

const txFromToExchange = (txAddress) => {
  let exchange
  for (const exchangeWallets of Object.entries(exchangesWallets)) {
    for (const exchangeWallet of exchangeWallets[1]) {
      if (exchangeWallet == txAddress) {
        exchange = exchangeWallets[0]
        break
      }
    }
    if (exchange != undefined) break
  }
  console.log(exchange)
  return exchange
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
        // tweet(message)
        console.log(message)
      }
    })
  }
}

main()

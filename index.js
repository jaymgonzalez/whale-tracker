const ethers = require('ethers')
const twitterCLient = require('./twitterClient.js')
const token_info = require('./token_info')

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

const messageInTweet = (amount, name, data, date) =>
  `New whale transfer for $${(amount.toNumber() / 1000000)
    .toFixed(2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${name}: https://etherscan.io/tx/${
    data.transactionHash
  } on ${date} UTC`

const main = async () => {
  for (const token of Object.entries(token_info)) {
    const contract = contractCreation(token[1].address, token[1].abi, provider)

    const name = token[0].toUpperCase()

    console.log(
      `Whale tracker started!\nListening for large transactions on ${name}`
    )

    contract.on('Transfer', (from, to, amount, data) => {
      if (amount.toNumber() >= TRANSFER_THRESHOLD) {
        const date = dateNow()
        const message = messageInTweet(amount, name, data, date)
        tweet(message)
      }
    })
  }
}

main()

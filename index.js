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

const main = async () => {
  const name = await contract.name()

  console.log(
    `Whale tracker started!\nListening for large transactions on ${name}`
  )

  const date = new Date().toISOString().replace('T', ' ').substring(0, 16)

  contract.on('Transfer', (from, to, amount, data) => {
    // const message = `New whale transfer for $${(amount.toNumber() / 1000000)
    //   .toFixed(2)
    //   .toString()
    //   .replace(
    //     /\B(?=(\d{3})+(?!\d))/g,
    //     ','
    //   )} ${name}: https://etherscan.io/tx/${
    //   data.transactionHash
    // } on ${date} UTC`
    // if (amount.toNumber() >= TRANSFER_THRESHOLD) {
    //   tweet(message)
    // }
  })
}

main()

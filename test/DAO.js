const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
  let token, dao
  let deployer, funder

  beforeEach(async () => {

    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    funder = accounts[1]
    invester1 = accounts[2]
    recipient = accounts[3]


    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Dapp University', 'DAPP', '1000000')

    const DAO = await ethers.getContractFactory('DAO')
    dao = await DAO.deploy(token.address, '500000000000000000000001')


    await funder.sendTransaction({ to: dao.address, value: ether(100) })

    })
  describe('Deployment', () => {
    it('sends ether to dao treasury', async () => {
      expect(await ethers.provider.getBalance(dao.address)).to.equal(ether(100))
    })

    it('returns token address', async () => {
      expect(await dao.token()).to.equal(token.address)
    })
    it('returns quorum', async () => {
      expect(await dao.quorum()).to.equal('500000000000000000000001')
    })

  })

  describe('Proposal creation', () => {
    let transaction, result

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await dao.connect(investor1).createProposal('Proposal1', ether(100), receipient.address)
        result = transaction.wait()
      })

      it('updated proposal count', async () => {
        expect(await dao.proposalCount()).to.equal(1)
      })

    })
    describe('Failure', () => {

    })

  })
})

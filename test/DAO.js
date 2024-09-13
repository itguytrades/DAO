const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('DAO', () => {
  let token, dao
  let deployer, funder,
  investor1,
  investor2,
  investor3,
  investor4,
  investor5,
  user

  beforeEach(async () => {

    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    funder = accounts[1]
    investor1 = accounts[2]
    investor2 = accounts[3]
    investor3 = accounts[4]
    investor4 = accounts[5]
    investor5 = accounts[6]
    recipient = accounts[7]
    user = accounts[8]


    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Dapp University', 'DAPP', '1000000')

    const DAO = await ethers.getContractFactory('DAO')
    dao = await DAO.deploy(token.address, '500000000000000000000001')

    transaction = await token.connect(deployer).transfer(investor1.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor2.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor3.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor4.address, tokens(200000))
    await transaction.wait()

    transaction = await token.connect(deployer).transfer(investor5.address, tokens(200000))
    await transaction.wait()

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
        transaction = await dao.connect(investor1).createProposal('Proposal1', ether(100), recipient.address)
        result = transaction.wait()
      })

      it('updated proposal count', async () => {
        expect(await dao.proposalCount()).to.equal(1)
      })
      it('updated proposal mapping', async () => {
        const proposal = await dao.proposals(1)
        expect(proposal.id).to.equal(1)
        expect(proposal.amount).to.equal(ether(100))
        expect(proposal.recipient).to.equal(recipient.address)
      })
      it('emits a propose event', async () => {
        await expect(transaction).to.emit(dao, 'Propose')
          .withArgs(1, ether(100), recipient.address, investor1.address)
      })
    })
    describe('Failure', () => {
      it('rejects invalid amount', async () => {
        await expect(dao.connect(investor1).createProposal('Proposal 1', ether(1000), recipient.address)).to.be.reverted

      })

      it('rejects non-investor', async () => {
        await expect(dao.connect(user).createProposal('Proposal 1', ether(1000), recipient.address)).to.be.reverted
      })
      it('', async () => {
 
      })

    })
  })

  describe('Voting', () => {
    let transaction, result

      beforeEach(async () => {
        transaction = await dao.connect(investor1).createProposal('Proposal1', ether(100), recipient.address)
        result = transaction.wait()
      })

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await dao.connect(investor1).vote(1)
        result = transaction.wait()
      })

      it('updated vote count', async () => {
        const proposal = await dao.proposals(1)
        expect(proposal.votes).to.equal(tokens(200000))
      })
      it('emits a vote event', async () => {
        await expect(transaction).to.emit(dao, 'Vote')
          .withArgs(1, investor1.address)
      })
    })
    describe('Failure', () => {

      it('rejects non-investor', async () => {
        await expect(dao.connect(user).vote(1)).to.be.reverted
      })
      it('rejects double voting', async () => {
        transaction = await dao.connect(investor1).vote(1)
        await transaction.wait()

        await expect(dao.connect(investor1).vote(1)).to.be.reverted
    })
  })
})
  describe('Governance', () => {
    let transaction, result

    describe('Success', () => {

      beforeEach(async () => {
        transaction = await dao.connect(investor1).createProposal('Proposal1', ether(100), recipient.address)
        result = transaction.wait()

        transaction = await dao.connect(investor1).vote(1)
        result = transaction.wait()

        transaction = await dao.connect(investor2).vote(1)
        result = transaction.wait()

        transaction = await dao.connect(investor3).vote(1)
        result = transaction.wait()


        transaction = await dao.connect(investor1).finalizeProposal(1)
        result = transaction.wait()


      })

      it('it updates the proposal to finalized', async () => {
        const proposal = await dao.proposals(1)
        expect(proposal.finalized).to.equal(true)
      })
      it('', async () => {

      })
    })
    describe('Failure', () => {

      it('', async () => {
 
      })
      it('', async () => {
 
    })
    })
  })
})

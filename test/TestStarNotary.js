const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    let newStar = await instance.tokenIdToStarInfo.call(tokenId)
    console.log(newStar)
    assert.equal(newStar, 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    let tokenID = 6
    let name = "SuperStar"
    await instance.createStar(name, tokenID, {from: accounts[0]})
    let contractName = await instance.name.call()
    let contractSymbol = await instance.symbol.call()
    let matches = contractName == "Stars" && contractSymbol == "STA"
    assert.isTrue(matches)
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let owner1 = accounts[0]
    let owner2 = accounts[1]
    await instance.createStar("SuperStar", 7, {from: owner1})
    await instance.createStar("SuperStar", 8, {from: owner2})
    await instance.exchangeStars(7, 8)
    newOwner1 = await instance.ownerOf.call(7)
    newOwner2 = await instance.ownerOf.call(8)
    let exchanged = newOwner2 === owner1 && newOwner1 === owner2
    assert.isTrue(exchanged)
});

it('lets a user transfer a star', async() => {
  let instance = await StarNotary.deployed();
  let owner2 = accounts[1]
  await instance.createStar("SuperStar", 9, {from: owner})
  await instance.transferStar(owner2, 9)
  let newOwner = await instance.ownerOf.call(9)
  let transferred = newOwner === owner2
  assert.isTrue(transferred)
  
});

it('lookUptokenIdToStarInfo test', async() => {
  let instance = await StarNotary.deployed();
  let tokenID = 10
  let name = "SuperStar"
  let symbol = "SS"
  await instance.createStar(name, tokenID, {from: accounts[0]})
  let newStarName = await instance.lookUptokenIdToStarInfo.call(tokenID)
  assert.equal(newStarName, name)
});
const mansi19IT032 = artifacts.require("./mansi19IT032.sol");
const mansi19IT032TOKENSALE = artifacts.require("./mansi19IT032TOKENSALE.sol");
const tokenPrice = 1000000000000000; // in wei
module.exports = function (deployer) {
  deployer.deploy(mansi19IT032,1000000).then(()=>{
    return deployer.deploy(mansi19IT032TOKENSALE,mansi19IT032.address,tokenPrice);
  });
};
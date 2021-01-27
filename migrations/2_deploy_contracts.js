const StarNotary = artifacts.require("StarNotary");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(StarNotary, "Stars", "STA");
};

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokensAvailable: 750000,
  
    init: function() {
      console.log("App initialized...")
      return App.initWeb3();
    },
  
    initWeb3: function() {
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        web3 = new Web3(App.web3Provider);
      }
      return App.initContracts();
    },
  
    initContracts: function() {
      $.getJSON("mansi19IT032TOKENSALE.json", function(mansi19IT032TOKENSALE) {
        App.contracts.mansi19IT032TOKENSALE = TruffleContract(mansi19IT032TOKENSALE);
        App.contracts.mansi19IT032TOKENSALE.setProvider(App.web3Provider);
        App.contracts.mansi19IT032TOKENSALE.deployed().then(function(mansi19IT032TOKENSALE) {
          console.log("mansi19IT032 Token Sale Address:", mansi19IT032TOKENSALE.address);
        });
      }).done(function() {
        $.getJSON("mansi19IT032.json", function(mansi19IT032) {
          App.contracts.mansi19IT032 = TruffleContract(mansi19IT032);
          App.contracts.mansi19IT032.setProvider(App.web3Provider);
          App.contracts.mansi19IT032.deployed().then(function(mansi19IT032) {
            console.log("mansi19IT032 Token Address:", mansi19IT032.address);
         
            App.listenForEvents();
            return App.render();
         
          });
    
        });
      })
    },
  
    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.mansi19IT032TOKENSALE.deployed().then(function(instance) {
        instance.Sell({}, {
          fromBlock: 0,
          toBlock: 'latest',
        }).watch(function(error, event) {
          console.log("event triggered", event);
          App.render();
        })
      })
    },
  
    render: function() {
      if (App.loading) {
        return;
      }
      App.loading = true;
  
      var loader  = $('#loader');
      var content = $('#content');
  
      loader.show();
      content.hide();
    
  
  // Load account data
      if(web3.currentProvider.enable){
        //For metamask
        web3.currentProvider.enable().then(function(acc){
            App.account = acc[0];
          $('#accountAddress').html("Your Account: " +  App.account);
        });
    } else{
        App.account = web3.eth.accounts[0];
        $('#accountAddress').html("Your Account: " +  App.account);
    }
  
  
      // Load token sale contract
      App.contracts.mansi19IT032TOKENSALE.deployed().then(function(instance) {
        Sahil19IT071TokenSaleInstance = instance;
        return Sahil19IT071TokenSaleInstance.tokenPrice();
      }).then(function(tokenPrice) {
        App.tokenPrice = tokenPrice;
        $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
        return Sahil19IT071TokenSaleInstance.tokensSold();
      }).then(function(tokensSold) {
        console.log("Token Sold ");
        App.tokensSold = tokensSold.toNumber();
        $('.tokens-sold').html(App.tokensSold);
        $('.tokens-available').html(App.tokensAvailable);
  
        var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $('#progress').css('width', progressPercent + '%');
  
        // Load token contract
        App.contracts.mansi19IT032.deployed().then(function(instance) {
          const Sahil19IT071Instance = instance;
          return Sahil19IT071Instance.balanceOf(App.account);
        }).then(function(balance) {
          $('.mansi032-balance').html(balance.toNumber());
          App.loading = false;
          loader.hide();
          content.show();
        })
      });
    },
  
    buyTokens: function() {
      $('#content').hide();
      $('#loader').show();
      const numberOfTokens = $('#numberOfTokens').val();
      App.contracts.mansi19IT032TOKENSALE.deployed().then(function(instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000 // Gas limit
        });
      }).then(function(result) {
        console.log("Tokens bought...")
        $('form').trigger('reset') // reset number of tokens in form
        // Wait for Sell event
      });
    }
  }
  
  $(function() {
    $(window).load(function() {
      App.init();
    })
  });
let provider = false

let Divies = {
	balance: null,
	address: '0xc7029Ed9EBa97A096e72607f4340c34049C7AF48',
	ABI: ABIs.divies,
	contract: null,
	
	getBalance: async fn => {return new Promise((resolve, reject) =>  {
		Divies.contract.balances((error, result) => {
			if (!error) {
				resolve(result)	
			} else {
				reject('Unexpected Error: ' + error)
			}
		})
	})}
	
}

const ConnectTo = {
	metamask: async fn => {
		
/*  old script pre-mm auth days 		
		if (typeof web3 !== 'undefined') {
			// use the current connected provider from metamask
			return Promise.resolve(new Web3(web3.currentProvider))
		} else {
			console.log('metamask not detected')
			console.log('please visit https://metamask.io to install browser extension')
			// no web3 provider, halt promise
			return Promise.reject('failed: metamask not detected')
		}
*/
	// check for window.ethereum to determine if user has newer MM
		if (window.ethereum) {
			// create a instance of web3 from metamask
			let _provider = new Web3(ethereum);
				
			// request permission from user to share MM info with site 
			try {
				await ethereum.enable();
				
				// if successful, return web 3 instance to caller
				return _provider;
			}
			
			catch(err) {
				// user refused permission 
				console.log('metamask security authorization rejected')
				console.log('please reload and give permission to access MetaMask')
				return Promise.reject('failed: metamask permission not granted');
			}
		
		// older mm versions 
		} else if (window.web3) {
			return new Web3(window.web3.currentProvider);
		
		// mm not installed 
		} else { 
			console.log('metamask not detected')
			console.log('please visit https://metamask.io to install browser extension')
			// no web3 provider, halt promise
			return Promise.reject('failed: metamask not detected')
		}
		
	},

	account: async fn => {return new Promise((resolve, reject) => {
		provider.eth.getAccounts((error, accounts) => {
			if (!error) {
				if (accounts[0] !== undefined) {
					provider.eth.defaultAccount = accounts[0]
					resolve()
				} else {
					console.log('no account detected')
					console.log('please log into metamask')
					reject('failed: no account detected')
				}
			} else {
				reject('Unexpected Error: ' + error)
			}
		})
	})}, 
	
	divies: async fn => {return new Promise((resolve, reject) => {
		Divies.contract = provider.eth.contract(Divies.ABI).at(Divies.address)
		resolve()
	})}
};

// ************* connection script *************
async function connect() {return new Promise((resolve, reject) => {
	async function run() {
		try {
			// connect to metamask
			console.log('connecting to metamask...')
			provider = await ConnectTo.metamask()
			console.log('...success')
			
			// check to see if metamask is logged in & grab account
			console.log('checking login status...')
			await ConnectTo.account()
			console.log('...success')
			console.log('...connected to: ' + provider.eth.defaultAccount)
			
			// connect to Divies
			console.log('connecting to Divies contract...')
			await ConnectTo.divies()
			console.log('...success')
			console.log('...Divies contract at: ' + Divies.address)
			
			//finished
			resolve()
		}
		
		catch (error) {
			reject(error)
		}
	}
	
	run()
})};

//**** on load *****
jQuery(async fn => {
	try {
		await connect()
		
		result = await Divies.getBalance()
		Divies.balance = result.div(1e18)
		
		$('#balance_trunc').html(Math.trunc(Divies.balance) + ' eth')
		$('#balance_full').html(Divies.balance + ' eth<br>')
	}
	
	catch (error) {
		console.log(error)
		console.log('stopped')
	}
})

$('#refreshData').click(async fn => {
	try {
		result = await Divies.getBalance()
		Divies.balance = result.div(1e18)
		
		$('#balance_trunc').html(Math.trunc(Divies.balance) + ' eth')
		$('#balance_full').html('<br>' + Divies.balance + ' eth<br>')
	}
	
	catch (error) {
		console.log(error)
		console.log('stopped')
	}
})

$('#DoNotPush').click( fn => {
	console.log('calling Divies.contract.distribute(_percent)...')
	
	let _percent = $('#Percent').val()
	
	new Promise((resolve, reject) => {
		Divies.contract.distribute(_percent, (error) => {
			if (!error) {
				resolve()
			} else {
				reject(handleMetamaskError(error))
			}
		})
	})
	.catch(function(error) {
		console.log(error)
	})
})
	
		

function numbersOnly(num){
	if ( /[^0-9]+/.test(num.value) ){
		num.value = num.value.replace(/[^0-9]*/g,"")
	}
	if (num.value > 99)
		num.value = 99
	else if (num.value < 1)
		num.value = 1
}
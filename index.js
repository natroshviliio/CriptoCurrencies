let dataApi = {
	params: {
		url: 'https://api.coingecko.com/api/v3/coins/markets',
		currency: 'usd',
		page: '',
		ids: '',
	},
	get: function (
		url = this.params.url,
		currency = this.params.currency,
		page = this.params.page,
		ids = this.params.ids,
		sparkline = '',
	) {
		return `${url}?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&page=${page}&${sparkline}`;
	},
};

// CONVERTING
let convCC = {
	coinName: '',
	coinSymbol: '',
	coinValue: 0,
	currSymbol: '',
	currValue: 0,
	coinIco: '',
	coinInputValue: 0.0,
	currencyInputValue: 0.0,
	sparkline: [],
	sparklineMin: 0,
	sparklineMax: 0,
};

let currencies = ['USD', 'AUD', 'EUR', 'CAD'];
let converterSearchCur = [];
let converterTop10 = [];
let searchResult = [];

// OTHER
let trendingCurrencies = [];
let trendingCoins = [];
let marketData = [];

//TABLE LIST
let tableList = {
	marketCapRank: 0,
	coinName: '',
	priceToUsd: 0,
	change1h: 0,
	change24h: 0,
	change7d: 0,
	chaneg24hVolume: 0,
	last7Days: 0,
};

const currencyBoard = document.querySelector('.currency-board');
const converterBoard = document.querySelector('.converter-board');
const cb = document.getElementById('cb');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

const coinListPager = document.querySelector('.coinlist-pager');

//DATA FETCH
class fetchData {
	constructor(dataApi) {
		this.dataApi = dataApi;
	}

	async fetchMarketData(length, arr) {
		let response;
		let data;
		for (let i = 1; i < length; i++) {
			response = await fetch(
				`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&page${i}&per_page=250`,
			);
			data = await response.json();
			arr.push(...data);
		}
	}

	async fetchWithTrending() {
		trendingCurrencies = [];
		let response = await fetch('https://api.coingecko.com/api/v3/search/trending');
		let data = await response.json();
		async function getTrending(length, idIndex, i) {
			if (length > 0) {
				const temp = idIndex[i].item.id;
				const response2 = await fetch(
					`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${temp}`,
				);
				const data2 = await response2.json();
				trendingCurrencies.push(...data2);
				i = i + 1;
				return await getTrending(length - 1, idIndex, i);
			}
		}
		await getTrending(data.coins.length, data.coins, 0);
	}

	async fetchTopCurrencies() {
		let response = await fetch(
			this.dataApi.get(
				dataApi.params.url,
				dataApi.params.currency,
				dataApi.params.page,
				dataApi.params.ids,
				'sparkline=true',
			),
		);

		let data = await response.json();
		for (let d of data) {
			if (d.market_cap_rank <= 10) {
				converterTop10.push(d);
			}
		}
	}

	async fetchCurrencyFromCurrencyName() {
		let response = await fetch(
			this.dataApi.get(
				dataApi.params.url,
				dataApi.params.currency,
				dataApi.params.page,
				dataApi.params.ids,
				'sparkline=true',
			),
		);

		const data = await response.json();
		const temp = data.find((x) => x.name === convCC.coinName);

		convCC = {
			coinName: temp.name,
			coinSymbol: temp.symbol.toUpperCase(),
			coinValue: 1 / temp.current_price,
			currSymbol: this.dataApi.params.currency.toUpperCase(),
			currValue: temp.current_price,
			coinIco: temp.image,
			sparkline: temp.sparkline_in_7d.price,
			coinInputValue: convCC.coinInputValue,
			currencyInputValue: convCC.coinInputValue * temp.current_price,
			sparklineMin: Math.min(...temp.sparkline_in_7d.price),
			sparklineMax: Math.max(...temp.sparkline_in_7d.price),
		};
	}

	async fetchCurrencyFromCoinName() {
		let response = await fetch(
			this.dataApi.get(
				dataApi.params.url,
				dataApi.params.currency,
				dataApi.params.page,
				dataApi.params.ids,
				'sparkline=true',
			),
		);

		const data = await response.json();
		const temp = data.find((x) => x.id === this.dataApi.params.ids);

		convCC = {
			coinName: temp.name,
			coinSymbol: temp.symbol.toUpperCase(),
			coinValue: 1 / temp.current_price,
			currSymbol: this.dataApi.params.currency.toUpperCase(),
			currValue: temp.current_price,
			coinIco: temp.image,
			sparkline: temp.sparkline_in_7d.price,
			coinInputValue: convCC.coinInputValue,
			currencyInputValue: convCC.coinInputValue * temp.current_price,
			sparklineMin: Math.min(...temp.sparkline_in_7d.price),
			sparklineMax: Math.max(...temp.sparkline_in_7d.price),
		};
	}

	async fetchFromPage() {}
}

async function searchCoin(name) {
	let response;
	let data;
	if (name.length > 2) {
		response = await fetch(`https://api.coingecko.com/api/v3/search?query=${name}`);
		data = await response.json();
	}
	if (data?.coins.length > 0) {
		for (d of data.coins) {
			searchResult.push(d);
		}
	} else {
		searchResult = converterTop10;
	}
}

async function countPages() {
	let response = await fetch('https://api.coingecko.com/api/v3/coins/list');
	const pages = await response.json();
	return pages.length;
}

const pages = (async () => await countPages())();

(async () => {
	const f = new fetchData(dataApi);
	await f.fetchTopCurrencies();
	await f.fetchWithTrending();

	trendingCurrencies.map((d, i) => {
		const {
			name,
			symbol,
			image,
			low_24h,
			high_24h,
			current_price,
			price_change_percentage_24h,
			price_change_24h,
			market_cap_rank,
		} = d;

		currencyBoard.insertAdjacentHTML(
			'beforeend',
			addTrendingCurrencies(
				name,
				symbol,
				current_price.toString().includes('e') ? current_price.toFixed(10) : current_price,
				price_change_percentage_24h.toFixed(3) == 0 ? 0 : price_change_percentage_24h.toFixed(3),
				price_change_24h.toFixed(3) == 0 ? 0 : price_change_24h.toFixed(3),
				image,
				low_24h,
				high_24h,
				i + 1,
			),
		);
	});

	searchResult = converterTop10;

	const temp = converterTop10.filter((d) => d.market_cap_rank === 1)[0];

	convCC = {
		coinName: temp.name,
		coinSymbol: temp.symbol.toUpperCase(),
		coinValue: 1 / temp.current_price,
		currSymbol: 'USD',
		currValue: temp.current_price,
		coinIco: temp.image,
		sparkline: temp.sparkline_in_7d.price,
		sparklineMin: Math.min(...temp.sparkline_in_7d.price),
		sparklineMax: Math.max(...temp.sparkline_in_7d.price),
	};

	converterBoard.insertAdjacentHTML('afterbegin', addConverter(convCC));
	currencyFunc();

	coinListPager.insertAdjacentHTML('beforebegin', createTable());
})();

let inputCoin;
let inputCur;

function currencyFunc() {
	inputCoin = document.getElementById('inputcoin');
	inputCur = document.getElementById('inputcur');
	inputCoin.min = 0;
	inputCur.min = 0;

	//CONVERTER
	inputCoin.addEventListener('keydown', (e) => {
		if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
			e.preventDefault();
		}
	});
	inputCur.addEventListener('keydown', (e) => {
		if (e.key === '-' || e.key === '+' || e.key === 'e') {
			e.preventDefault();
		}
	});
	inputCoin.addEventListener('keyup', (e) => {
		//#region THIS IS A RESTRICTION FOR MOBILE DEVICES BUT NEED TO FIX SOMETHING GETTING WRONG
		// inputCoin.value === '' && e.key === 'Backspace'
		// 	? (inputCoinValue = '')
		// 	: inputCoin.value !== ''
		// 	? (inputCoinValue = inputCoin.value)
		// 	: inputCoin.value;

		// inputCoin.value = inputCoinValue;
		//#endregion

		inputCur.value = (inputCoin.value * convCC.currValue).toFixed(8);
	});

	inputCur.addEventListener('keyup', (e) => {
		//#region THIS IS A RESTRICTION FOR MOBILE DEVICES BUT NEED TO FIX SOMETHING GETTING WRONG
		// inputCur.value === '' && e.key === 'Backspace'
		// 	? (inputCurValue = '')
		// 	: inputCur.value !== ''
		// 	? (inputCurValue = inputCur.value)
		// 	: '';

		// inputCur.value = inputCurValue;
		//#endregion

		inputCoin.value = (inputCur.value * convCC.coinValue).toFixed(8);
	});

	const selectCoin = document.getElementById('select-coin');
	const selectCurr = document.getElementById('select-curr');
	const coinlist = document.querySelector('.coinlist');
	const currlist = document.querySelector('.currlist');

	selectCoin.addEventListener('click', () => {
		coinlist.classList.toggle('d-flex');
	});

	selectCurr.addEventListener('click', () => {
		currlist.classList.toggle('d-flex');
	});

	const a = document.querySelector('.converter-footer svg');
	const b = document.getElementById('conv-stat');
	convStaticWidth = parseFloat(window.getComputedStyle(a).getPropertyValue('width'));
	convStaticHeight = parseFloat(window.getComputedStyle(a).getPropertyValue('height'));

	b.setAttribute('points', linearChart(convStaticWidth, convStaticHeight, convCC.sparkline));
}

function linearChart(convStaticWidth, convStaticHeight, sparklineArr) {
	const convStaticHeightPoint = convStaticHeight / convCC.sparklineMax;
	const convStaticWidthPoint = convStaticWidth / sparklineArr.length;
	let CSWPIncreement = 0;
	const convHeightMinPoint = convStaticHeight / (convStaticHeight - convCC.sparklineMin * convStaticHeightPoint);

	let points = ``;
	for (let i = 0; i < sparklineArr.length; i++) {
		const spY = (convStaticHeight - sparklineArr[i] * convStaticHeightPoint) * convHeightMinPoint;
		points += `${CSWPIncreement},${spY} `;
		if (i === sparklineArr.length - 1) points += `${convStaticWidth},${spY}`;
		CSWPIncreement += convStaticWidthPoint;
	}

	return points;
}

const loginButton = document.getElementById('logn');

loginButton.onclick = (e) => {
	e.preventDefault();
};
const loginButtonMob = document.getElementById('logn-mob');

loginButtonMob.onclick = (e) => {
	e.preventDefault();
};

cb.addEventListener('mousemove', (e) => {
	if (document.body.clientWidth > 1000) {
		if (e.target.className === 'currency-board' && e.offsetX > -11 && e.offsetX < 0) {
			prevBtn.classList.add('d-block');
		}
		prevBtn.addEventListener('mouseleave', () => {
			prevBtn.classList.remove('d-block');
		});
		const cbw = parseInt(window.getComputedStyle(cb).getPropertyValue('width'));
		if (e.target.className === 'currency-board' && e.offsetX > cbw - 25 && e.offsetX < cbw) {
			nextBtn.classList.add('d-block');
		}
		nextBtn.addEventListener('mouseleave', () => {
			nextBtn.classList.remove('d-block');
		});

		let st1;
		nextBtn.onmousedown = () => {
			cb.scrollLeft += 305;
			st1 = setInterval(() => {
				cb.scrollLeft += 305;
			}, 300);
		};
		nextBtn.onmouseup = () => clearInterval(st1);
		prevBtn.onmousedown = () => {
			cb.scrollLeft -= 305;
			st2 = setInterval(() => {
				cb.scrollLeft -= 305;
			}, 300);
		};
		prevBtn.onmouseup = () => clearInterval(st2);
	}
});

//JSX
function addTrendingCurrencies(name, abr, curUS, pcp_24h, pc_24h, iconUrl, min, max, count) {
	let priceChangeP = pcp_24h > 0 ? `+${pcp_24h}` : pcp_24h;
	let priceChange = pc_24h > 0 ? `+${pc_24h}` : pc_24h;
	let currentColor;
	//Percent Change
	if (pcp_24h > 0) {
		priceChangeP = `+${pcp_24h}%`;
		currentColor = 'c-progress';
	} else if (pcp_24h < 0) {
		priceChangeP = `${pcp_24h}%`;
		currentColor = 'c-degress';
	} else {
		priceChangeP = ``;
	}
	//Price Change
	if (pc_24h > 0) {
		priceChange = `+${pc_24h}$`;
		currentColor = 'c-progress';
	} else if (pc_24h < 0) {
		priceChange = `${pc_24h}$`;
		currentColor = `c-degress`;
	} else {
		priceChange = ``;
	}
	const topcurr = `
				<div class="topcur">
					<div class="choiceoper">
						<a href="#">more</a>
					</div>
					<div class="topcur-header">
						<div class="topcur-header-img" style="background-image:url('${iconUrl}')"></div>
						<h3>${name}</h3>
						<h2>${abr.toUpperCase()}</h2>
					</div>
					<div class="topcur-body">
						<h1>$${curUS}</h1>
						<div class="p-change ${currentColor}">
							<p>${priceChangeP}</p>
							<span>${priceChange}</span>
						</div>
					</div>
					<div class="topcur-foot">
						<div class="topcur-foot-inf max">
							<p>$${max}</p>
							<span>max | 24h</span>
						</div>
						<div class="topcur-foot-inf min">
							<p>$${min}</p>
							<span>min | 24h</span>
						</div>
					</div>
					<div class="topcur-pager"><p>${count}</p></div>
				</div>`;

	return topcurr;
}

function addConverter(convCurrency) {
	let {
		coinName,
		coinSymbol,
		coinValue,
		currSymbol,
		currValue,
		coinIco,
		sparkline,
		coinInputValue,
		currencyInputValue,
	} = convCurrency;
	coinSymbol = coinSymbol.length > 5 ? coinSymbol.substring(0, 5) + '..' : coinSymbol;

	coinValue = coinValue.toString().includes('e') ? coinValue.toFixed(10) : coinValue;
	currValue = currValue.toString().includes('e') ? currValue.toFixed(10) : currValue;
	let cSparkline = Object.create(sparkline).sort();
	const fourValue =
		sparkline.length !== 0
			? [
					cSparkline[cSparkline.length - 1],
					cSparkline[Math.trunc(cSparkline.length * (3 / 4))],
					cSparkline[Math.trunc(cSparkline.length * (2 / 4))],
					cSparkline[0],
			  ]
			: [];
	const converter = `
				<div id='inner-conv'>
					<div class="converter-icon" style="background-image: url('${coinIco}')"></div>
                    <div class="converter-header">
                        <h3>1 ${coinSymbol} = ${currValue} ${currSymbol}</h3>
                    </div>
                    <div class="converter-header">
                        <h3>1 ${currSymbol} = ${coinValue} ${coinSymbol}</h3>
                    </div>
                    <div class="converter-body">
                        <div class="group-collection">
                            <div class="input-group">
                                <label id="select-coin" for="">${coinSymbol}<span>▼</span></label>
                                <input id="inputcoin" type="number" value=${coinInputValue}>
                            </div>
                            <div class="item-list coinlist">
                                <input autocomplete="off" id='coinsearch' type="text" placeholder="Search coin">
                                <ul>
                                    ${searchResult
																			.map((coin) => {
																				let { name, id, symbol } = coin;
																				shortName = name.length > 8 ? name.substring(0, 8) + '...' : name;
																				shortSymbol = symbol.length > 6 ? symbol.substring(0, 6) + '...' : symbol;
																				return `<li title='${name}' data-coinnm='${id}' id='coinlst'>${shortName}  <span>${shortSymbol.toUpperCase()}</span></li>`;
																			})
																			.join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="group-collection">
                            <div class="input-group">
                                <label id="select-curr" for="">${currSymbol}<span>▼</span></label>
                                <input id="inputcur" type="number" value=${currencyInputValue}>
                            </div>
                            <div class="item-list text-center currlist">
                                <ul>
                                    ${currencies
																			.map((curr) => {
																				return `<li data-curnm='${curr}' id='currlst'>${curr}</li>`;
																			})
																			.join('')}
                                </ul>
                            </div>
                        </div>
                	</div>
					<div class="converter-footer">
                    	<div class="converter-statistic">
                        	<svg>
                            	<polyline id="conv-stat" style="fill:none;stroke:white;stroke-width:0.8" />
                        	</svg>
							<div class="spk-grids">
								${[...new Array(28)]
									.map((_, i) => {
										return (i + 1) % 7 !== 0
											? i + 1 < 22
												? `<div class="grid-item grid-right grid-bottom"></div>`
												: `<div class="grid-item grid-right"></div>`
											: i + 1 !== 28
											? `<div class="grid-item grid-bottom"></div>`
											: `<div class="grid-item"></div>`;
									})
									.join('')}
							</div>
							<div class="spk-inf pos-left bg-black">7 days</div>
							${
								((a = -20),
								fourValue.length > 0
									? fourValue
											.map((inf) => {
												a += 20;
												return `<div class="spk-inf pos-right c-yellow spk-st" style="top: ${a}px">${inf}</div>`;
											})
											.join('')
									: '<div class="spk-inf pos-right bg-black c-orange">no result</div>')
							}
                    	</div>
                	</div>
				</div>
				`;
	return converter;
}
let searchBool = true;
converterBoard.addEventListener('click', (e) => {
	if (e.target.id === 'currlst') {
		(async () => {
			document.getElementById('inner-conv').remove();
			dataApi.params.currency = e.target.dataset.curnm.toLowerCase();
			convCC.coinInputValue = parseFloat(inputCoin.value);
			convCC.currencyInputValue = parseFloat(inputCur.value);
			const f = new fetchData(dataApi);
			await f.fetchCurrencyFromCurrencyName();
			converterBoard.insertAdjacentHTML('afterbegin', addConverter(convCC));
			currencyFunc();
		})();
	}
	if (e.target.id === 'coinsearch') {
		const coinSearch = document.getElementById('coinsearch');
		coinSearch.addEventListener('keyup', () => {
			if (searchBool) {
				setTimeout(() => {
					(async () => {
						searchBool = false;
						searchResult = [];
						await searchCoin(coinSearch.value);
						document.querySelector('.coinlist ul').remove();
						const searchList = `${searchResult
							.map((coin) => {
								let { name, id, symbol } = coin;
								shortName = name.length > 8 ? name.substring(0, 8) + '...' : name;
								shortSymbol = symbol.length > 6 ? symbol.substring(0, 6) + '...' : symbol;
								return `<li title='${name}' data-coinnm='${id}' id='coinlst'>${shortName}  <span>${shortSymbol.toUpperCase()}</span></li>`;
							})
							.join('')}`;
						const UL = document.createElement('ul');
						document.querySelector('.coinlist').append(UL);
						document.querySelector('.coinlist ul').insertAdjacentHTML('beforeend', searchList);
						searchBool = true;
					})();
				}, 500);
			}
		});
	}
});

converterBoard.addEventListener('click', (e) => {
	if (e.target.id === 'coinlst') {
		(async () => {
			document.getElementById('inner-conv').remove();
			dataApi.params.ids = e.target.dataset.coinnm.toLowerCase();
			convCC.coinInputValue = parseFloat(inputCoin.value);
			convCC.currencyInputValue = parseFloat(inputCur.value);
			const f = new fetchData(dataApi);
			await f.fetchCurrencyFromCoinName();
			converterBoard.insertAdjacentHTML('afterbegin', addConverter(convCC));
			currencyFunc();
		})();
	}
});

function createTable() {
	let coinsTable = `
		<div class="coin-table">
            <table>
                <tr>
                    <th>#</th>
                    <th>Coin</th>
                    <th>Price</th>
                    <th>1h</th>
                    <th>24h</th>
                    <th>7d</th>
                    <th>24h Volume</th>
                    <th>Last 7 Days</th>
                </tr>
                <tr>
                    <td>1</td>
                    <td>Bitcoin</td>
                    <td>23,581</td>
                    <td>-0.3%</td>
                    <td>-0.6%</td>
                    <td>-2.5%</td>
                    <td>$14,177,926,270</td>
                    <td>ioane</td>
                </tr>
            </table>
        </div>
		
	`;
	return coinsTable;
}

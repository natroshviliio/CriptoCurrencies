const url = 'https://api.coingecko.com/api/v3/coins/';
let dataArr = [];
let converterCurrency = {
	coinName: '',
	coinSymbol: '',
	coinValue: 0,
	currSymbol: '',
	currValue: 0,
};

const currencyBoard = document.querySelector('.currency-board');
const cb = document.getElementById('cb');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
(async () => {
	let response = await fetch(url);
	let data = await response.json();
	for (let d of data) {
		dataArr.push(d);
	}
	dataArr.sort((curr, next) => curr.market_data.market_cap_rank - next.market_data.market_cap_rank, 0);
	const topCurrData = dataArr.filter((_, i) => i < 10);
	console.log(topCurrData);
	topCurrData.map((d, i) => {
		const { name, symbol, market_data, image } = d;
		const { low_24h, high_24h, current_price } = market_data;
		currencyBoard.insertAdjacentHTML(
			'beforeend',
			addTopCurrencies(
				name,
				symbol,
				current_price.usd,
				current_price.eur,
				image.large,
				low_24h.usd,
				high_24h.usd,
				i,
			),
		);
	});
	const temp = dataArr.filter((d) => d.market_data.market_cap_rank === 1)[0];
	converterCurrency = {
		coinName: temp.name,
		coinSymbol: temp.symbol.toUpperCase(),
		coinValue: 1 / temp.market_data.current_price.usd,
		currSymbol: 'USD',
		currValue: temp.market_data.current_price.usd,
	};
	addConverter(converterCurrency);
})();

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

const inputCoin = document.getElementById('inputcoin');
const inputCur = document.getElementById('inputcur');

//CONVERTER
inputCoin.addEventListener('keyup', () => {
	const currPrice = dataArr.find((d) => d.id === 'bitcoin').market_data.current_price.usd;
	inputCur.value = (inputCoin.value * currPrice).toFixed(3);
});

inputCur.addEventListener('keyup', () => {
	const currPrice = dataArr.find((d) => d.id === 'bitcoin').market_data.current_price.usd;
	inputCoin.value = (inputCur.value * (1 / currPrice)).toFixed(6);
});

function addTopCurrencies(name, abr, curUS, curEUR, iconUrl, min, max, count) {
	const topcurr = `
		<div class="topcur">
			<div class="choiceoper">
				<a href="#">Buy</a>
				<a href="#">Exchange</a>
			</div>
            <div class="topcur-header">
                <div class="topcur-header-img" style="background-image:url('${iconUrl}')"></div>
                <h3>${name}</h3>
                <h2>${abr.toUpperCase()}</h2>
            </div>
            <div class="topcur-body">
                <h1>$${curUS}</h1>
                <h1>€${curEUR}</h1>
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
			<div class="topcur-pager"><p>${count + 1}</p></div>
        </div>`;

	return topcurr;
}

function addConverter({ coinName, coinSymbol, coinValue, currSymbol, currValue }) {
	console.log(coinName, coinSymbol, coinValue, currSymbol, currValue);
}

const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=';
const currency = 'usd';
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
	let response = await fetch(url + currency);
	let data = await response.json();
	for (let d of data) {
		dataArr.push(d);
	}
	const topCurrData = dataArr.filter((d) => d.market_cap_rank <= 10);
	topCurrData.map((d) => {
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
			addTopCurrencies(
				name,
				symbol,
				current_price,
				price_change_percentage_24h.toFixed(4),
				price_change_24h.toFixed(4),
				image,
				low_24h,
				high_24h,
				market_cap_rank,
			),
		);
	});
	const temp = dataArr.filter((d) => d.market_cap_rank === 1)[0];
	converterCurrency = {
		coinName: temp.name,
		coinSymbol: temp.symbol.toUpperCase(),
		coinValue: 1 / temp.current_price,
		currSymbol: 'USD',
		currValue: temp.current_price,
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
	const currPrice = dataArr.find((d) => d.id === 'bitcoin').current_price;
	inputCur.value = (inputCoin.value * currPrice).toFixed(3);
});

inputCur.addEventListener('keyup', () => {
	const currPrice = dataArr.find((d) => d.id === 'bitcoin').current_price;
	inputCoin.value = (inputCur.value * (1 / currPrice)).toFixed(6);
});

function addTopCurrencies(name, abr, curUS, pcp_24h, pc_24h, iconUrl, min, max, count) {
	const priceChangeP = pcp_24h >= 0 ? `+${pcp_24h}` : pcp_24h;
	const priceChange = pc_24h >= 0 ? `+${pc_24h}` : pc_24h;
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
				<div class="p-change ${pcp_24h >= 0 ? 'progress' : 'degress'}">
					<p>${priceChangeP}%</p>
					<span>${priceChange}$</span>
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

function addConverter({ coinName, coinSymbol, coinValue, currSymbol, currValue }) {
	console.log(coinName, coinSymbol, coinValue, currSymbol, currValue);
}

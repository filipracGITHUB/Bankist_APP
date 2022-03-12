//'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2022-02-13T17:01:17.194Z',
    '2022-02-15T23:36:17.929Z',
    '2022-02-14T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const locale = navigator.language;
/////////////////////////////////////////////////
// Functions
const formatMovementDates = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();
  // const hour = date.getHours();
  // const min = date.getMinutes();
  // return `${day}/${month}/${year}, ${hour}:${min}`;
  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: `currency`,
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDates(date, locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    // In each call, print the reamining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      labelWelcome.textContent = `Log in to get started`;
      clearInterval(timer);
      containerApp.style.opacity = 0;
    }
    // decrease 1s
    time--;
  };
  // Set time to 5 minutes
  let time = 300;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// EXPERIMENTING WITH API

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    // Create current date and time

    const now = new Date();
    const options = {
      hour: `numeric`,
      minute: `numeric`,
      day: `numeric`,
      month: `long`,
      year: `numeric`,
    };

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(
      now
    );
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();
    //timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    // reset timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 2500);
    // Add movement
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
///////////////////////////////////////////////////////////////
//------ CONVERTING AND CHECKING NUMBERS LECTURE 1
// console.log(23 === 23.0);

// // Base 10 = 0 to 9
// // Binary base 2 = 0, 1

// console.log(0.1 + 0.2);
// console.log(0.1 + 0.2 === 0.3); // false cuz its 0.300000004

// // Conversion
// console.log(Number('23'));
// console.log(+'23');

// // Parsing

// console.log(Number.parseInt(`30px`, 10));
// console.log(Number.parseInt(`e23`, 10)); // NaN , it cant start with a letter
// console.log(`--------------------------------------------------------------`);
// console.log(Number.parseInt(`2.5rem    `));
// console.log(Number.parseFloat(`    2.5rem`)); // are also global functions!
// console.log(`--------------------------------------------------------------`);

// // CHeck if value is NaN (Not a Number)
// console.log(Number.isNaN(23 / 0));
// console.log(`--------------------------------------------------------------`);
// // Checking if value is a number
// console.log(Number.isFinite(20));
// console.log(Number.isFinite('20'));
// console.log(Number.isFinite(+'20'));
// console.log(Number.isFinite(23 / 0)); //BEST WAY OF CHECKING IF VALUE IS A NUMBER
// console.log(`--------------------------------------------------------------`);
// console.log(Number.isInteger(23));
// console.log(Number.isInteger(23.0));
// console.log(Number.isInteger(23 / 0));
// ///////////////////////////////////////////////////////////////////////////////////////////
// ----------------- MATH AND ROUNDING ---------------- LECTURE2

// console.log(Math.sqrt(25));

// console.log(25 ** (1 / 2));

// console.log(8 ** (1 / 3));

// // max value
// console.log(Math.max(5, 18, 23, 11, 2)); // works like this

// console.log(Math.max(5, 18, '23', 11, 2)); // works like this too

// console.log(Math.max(5, 18, '23px', 11, 2)); // doesnt work like this, doesnt do parsing!!!

// // min value

// console.log(Math.min(5, 18, 23, 11, 2));

// console.log(Math.PI * Number.parseFloat(`10px`) ** 2);

// console.log(Math.trunc(Math.random() * 6) + 1);

// const randomInt = (min, max) =>
//   Math.floor(Math.random() * (max - min) + 1) + min;
// // 0....1
// console.log(randomInt(10, 20));
// console.log(`--------------`);
// // Rounding integers
// console.log(`--------------`);
// console.log(Math.trunc(23.3));
// console.log(`--------------`);
// // rounding to the nearest number example: 23.4 is 23 and 23.6 is 24 :D
// console.log(Math.round(23.6));
// console.log(`--------------`);
// // more rounding methods
// console.log(Math.ceil(23.3));
// console.log(Math.ceil(23.6));
// console.log(`--------------`);
// console.log(Math.floor(23.3));
// console.log(Math.floor(23.6));

// console.log(Math.trunc(-23.3));
// console.log(Math.floor(-23.6));

// // rounding decimals
// console.log((2.7).toFixed(0));
// console.log((2.7).toFixed(3));
// console.log(+(2.345).toFixed(2));
// //////////////////////////////////////////////////////////////////////////////////
// // --------------- THE REMAINDER OPERATOR ------------------------------------------
// console.log(5 % 2);
// console.log(5 / 2); // 5 = 2*2+1

// console.log(8 % 3);
// console.log(8 / 3); // 8 = 2*3 +2

// console.log(6 % 2);
// console.log(6 / 2);

// console.log(7 % 2);
// console.log(7 / 2);

// const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(23));
// console.log(isEven(514));

// labelBalance.addEventListener(`click`, function () {
//   [...document.querySelectorAll(`.movements__row`)].forEach(function (row, i) {
//     if (i % 2 === 0) row.style.backgroundColor = `orangered`;

//     if (i % 3 === 0) row.style.backgroundColor = `blue`;
//   });
// });
//////////////////////////////////////////////////////////////////////////////////
// ---------------------- NUMERIC SEPARATORS ------------------------------------

// const diameter = 287_460_000_000;
// console.log(diameter);

// const priceCents = 345_99;
// console.log(priceCents);

// console.log(Number(`230_000`)); // u should use numeric separators only on numbers, not in string
///////////////////////////////////////////////////////////////
// ------------------------------ BIG INT ----------------------------
// console.log(2 ** 53 - 1);
// console.log(Number.MAX_SAFE_INTEGER);

// console.log(42424213512512523692362346723n);

// console.log(BigInt(48384302));

// //operators
// console.log(10000n + 10000n);
// //console.log(Math.sqrt(16n)); cant
// console.log(2315125126161261n * 12312312312213n);

// const huge = 21259120512551n;
// const num = 23;
// console.log(huge * BigInt(num));

// // EXCEPTIONS
// console.log(20n > 15);
// console.log(20n === 20);
// console.log(typeof 20n);
// console.log(20n == `20`);

// console.log(huge + ` is REALLY big!!!`);

// // DIVISIONS
// console.log(10n / 3n);
// console.log(10 / 3);

//////////////////////////////////////////////////////////////////////////////////////////
// ----------------------------------------------- DATES AND TIME -----------------------

// create a date

// 1.
// const now = new Date();
// console.log(now);

// //2.
// console.log(new Date(`Aug 02 2020 18:05:41`));
// console.log(new Date(`December 24,2015`));

// console.log(new Date(account1.movementsDates[0]));
// console.log(new Date(2037, 10, 19, 15, 23, 5));

// console.log(new Date(0));

// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// working with dates

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth()); // 0 based
// console.log(future.getDate());
// console.log(future.getDay()); //in number
// console.log(future.getHours());
// console.log(future.getMinutes());
// console.log(future.getSeconds());
// console.log(future.toISOString());
// console.log(future.getTime());
// console.log(new Date(2142253380000));

// console.log(Date.now());

// future.setFullYear(2040);
// console.log(future);
////////////////////////////////////////////////////////////////////////////////////
// ------------------------------- OPERATIONS WITH DATES ------------------------------------

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(+future);

// const calcDaysPassed = (date1, date2) =>
//   Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
// console.log(days1);
//////////////////////////////////////////////////////////////////////////////////////////
// ------------------------------- INTERNATIONALIZING NUMBERS (INTL) ----------------------

// const num = 3884764.23;
// const options = {
//   style: `currency`,
//   unit: `celsius`,
//   currency: `EUR`,
//   //useGrouping: true,
// };
// console.log('US:', new Intl.NumberFormat(`en-US`, options).format(num));
// console.log('GERMANY:', new Intl.NumberFormat(`de-DE`, options).format(num));
// console.log('SYRIA:', new Intl.NumberFormat(`ar-SY`, options).format(num));
////////////////////////////////////////////////////////////////////////////////////////
//----------------------- setTimeout and setInterval --------------------------------------

// const ing = [`olives`, ``];

// const timer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2}`),
//   1000 * 5,
//   ...ing
// );
// if (ing.includes(`spinach`))
// clearTimeout(timer);

// setInterval(() => {
//   const now = new Date();
//   const clock = new Intl.DateTimeFormat(locale, {
//     hour: `numeric`,
//     minute: `numeric`,
//     second: `numeric`,
//   }).format(now);
//   console.log(clock);
// }, 1000);

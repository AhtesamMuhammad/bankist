'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

const account1 = {
  owner: 'Ahtesam Muhammad',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-11-18T21:31:17.178Z',
    '2024-12-23T07:42:02.383Z',
    '2025-02-25T09:15:04.904Z',
    '2025-02-22T10:17:24.185Z',
    '2024-05-08T14:11:59.604Z',
    '2024-07-25T17:01:17.194Z',
    '2024-07-28T23:36:17.929Z',
    '2025-02-20T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'es-ES', // de-DE
};

const account2 = {
  owner: 'Jonas Schmedtman',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2024-11-01T13:15:33.035Z',
    '2024-11-30T09:48:16.867Z',
    '2024-12-25T06:04:23.907Z',
    '2025-02-25T14:18:46.235Z',
    '2024-02-05T16:33:06.386Z',
    '2025-02-24T14:43:26.374Z',
    '2024-06-25T18:49:59.371Z',
    '2024-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

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

const formLogin = document.querySelector('.login');
const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');
const btnLogout = document.querySelector('.logout__btn');


const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);
accounts.forEach(acc => console.log(acc.owner, acc.username));

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
      formLogin.style.opacity = 1;
      btnLogout.style.display = 'none'
    }
    time--;
  };

  let time = 120;
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

let currentAccount, timer;

const setTimer = function () {
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
};

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  inputLoginPin.style.color = '#444';

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value.trim()
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    containerApp.style.opacity = 1;
    formLogin.style.opacity = 0;
    btnLogout.style.display = 'block';

    // welcome menssage
    const name = currentAccount.owner.split(' ')[0];
    labelWelcome.textContent = `Welcome back, ${name}`;

    // date login
    const dateNow = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(dateNow);

    // clean input
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); //

    setTimer();

    updateUI(currentAccount);
  } else {
    inputLoginPin.style.color = 'red';
    console.log('password incorrect');
  }
});

btnLogout.addEventListener('click', function (e) {
  e.preventDefault();
  currentAccount = null;
  labelWelcome.textContent = `Log in to get started`;
  containerApp.style.opacity = 0;
  formLogin.style.opacity = 1;
  btnLogout.style.display = 'none';
});


const numberFormat = (value, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);

const printBalance = function (account) {
  account.balance = account.movements.reduce((acc, cur) => acc + cur, 0);
  labelBalance.textContent = numberFormat(
    account.balance,
    account.locale,
    account.currency
  );
};

const updateUI = acc => {
  printBalance(acc);
  displayMovement(acc);
  calcDisplaySummary(acc);
};

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (24 * 60 * 60 * 1000));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovement = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const combineMovsDetails = acc.movements.map((mov, i) => ({
    movement: mov,
    movementDate: new Date(acc.movementsDates[i]),
  }));

  combineMovsDetails.sort((a, b) => a.movementDate - b.movementDate);

  if (sort) combineMovsDetails.sort((a, b) => a.movement - b.movement);
  // const movs = sort ? co.toSorted((a, b) => a - b) : acc.movements;

  combineMovsDetails.forEach(function (obj, i) {
    const { movement, movementDate } = obj;

    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const displayDate = formatMovementDate(movementDate, acc.locale); // Formatear fecha

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } deposit</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${numberFormat(
            movement,
            acc.locale,
            acc.currency
          )}</div>
        </div>
  `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplaySummary = function (account) {
  const income = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = numberFormat(
    income,
    account.locale,
    account.currency
  );

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = numberFormat(out, account.locale, account.currency);

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumInterest.textContent = numberFormat(
    interest,
    account.locale,
    account.currency
  );
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receive = accounts.find(acc => acc.username === inputTransferTo.value);
  console.log(amount, receive);

  if (
    amount > 0 &&
    receive &&
    currentAccount.balance >= amount &&
    receive?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());

    receive.movements.push(amount);
    receive.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferAmount.blur();
  }
  setTimer();
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov > amount * 0.1)) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 2500);
  }

  inputLoanAmount.value = '';
  setTimer();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
});

let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();

  btnSort.classList.toggle('active-sort');
  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
  setTimer();
});

const date1 = new Date(2025, 1, 1);
const date2 = new Date(2025, 2, 20);

const calcDayPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (24 * 60 * 60 * 1000);
const passedDays = calcDayPassed(date1, date2);
console.log(passedDays);



/////////////////////////////////////////////////

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 1;

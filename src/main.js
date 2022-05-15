
const createForm = () => {

  const container = document.querySelector('.container');
  const form = document.createElement('form');
  const input = document.createElement('input');
  const button = document.createElement('button');
  const welcomeMessage = document.createElement('h1');
  const errorMessage = document.createElement('p');
  const timerWrapper = document.createElement('label');
  const timerCheckbox = document.createElement('input');
  const timerText = document.createElement('span');

  localStorage.clear();
  // по клику на кнопку записываем размер таблицы в локальное хранилище и создаем игровое поле
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value <= 10 && input.value >= 2 && !isNaN(input.value) && input.value % 2 == 0) {
      localStorage.setItem('tableSize', input.value);
      form.classList.remove('form-appear');
      setTimeout(() => {
        form.remove();
      }, 300)
      createGameTable();
      valuesForCards();
    } else {
      errorMessage.classList.add('error');
      input.value = 4;
    }
  })

  timerText.addEventListener('click', () => {
    timerText.classList.toggle('form__timer-block--active');
    localStorage.setItem('timer', !timerCheckbox.checked);
  })


  form.classList.add('form');
  input.classList.add('form__input');
  welcomeMessage.classList.add('form__title');
  errorMessage.classList.add('form__text');
  button.classList.add('form__btn');
  timerWrapper.classList.add('form__timer-block');
  timerCheckbox.classList.add('form__checkbox');

  errorMessage.innerHTML = 'Введите четное число от 2 до 10';
  button.innerHTML = 'Начать игру!';
  welcomeMessage.innerHTML = 'ИГРА В ПАРЫ';
  timerCheckbox.type = 'checkbox';
  timerText.textContent = 'Включить таймер (1 минута)'

  form.append(welcomeMessage)
  form.append(errorMessage);
  form.append(input);
  form.append(button)
  form.append(timerWrapper)
  timerWrapper.append(timerCheckbox);
  timerWrapper.append(timerText)
  container.append(form);

  setTimeout(() => {
    form.classList.add('form-appear')
  }, 500)

};

const createGameTable = () => {
  const container = document.querySelector('.container');
  // получаем размер таблицы из хранилища
  const tableSize = localStorage.getItem('tableSize');

  // создаем саму таблицу
  const table = document.createElement('table');
  table.classList.add('game-table');
  container.append(table)

  // наполняем таблицу
  for (let i = 0; i < tableSize; i++) {
    const gameTr = document.createElement('tr');
    for (let j = 0; j < tableSize; j++) {
      const gameTd = document.createElement('td');
      gameTd.classList.add('game-item')
      gameTr.append(gameTd);
    }
    table.append(gameTr);
  }

  // добавлям таймер при активном чекбоксе
  if(localStorage.getItem('timer') === 'true') {
    addTimer();
  }

  setTimeout(() => {
    table.classList.add('game-table-appear')
  }, 300);
}


const addTimer = () => {
  const gameTable = document.querySelector('.game-table');
  const timer = document.createElement('p');
  let timerCount = '60';

  timer.innerHTML = `Осталось: ${timerCount} секунд`;
  timer.classList.add('table-timer');
  gameTable.append(timer);

  const timerCountFunc = () => {
    if (timerCount > 0) {
      timer.innerHTML = `Осталось: ${timerCount} секунд`;
      timerCount--;
    } else if (timerCount == 0) {
      gameTable.style.pointerEvents = 'none';
      gameTable.style.opacity = '0.5';
      timer.innerHTML = 'Время вышло!';
      replay();
      clearInterval(window.timerId);
    }
  }
  window.timerId = setInterval(timerCountFunc, 1000);
}

const valuesForCards = () => {
  const cardsList = document.querySelectorAll('td');
  const tableSize = localStorage.getItem('tableSize');
  let cardsNumbers = [];
  // пушим массив значений для карточек на основе tableSize
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= tableSize * (tableSize / 2); j++) {
      cardsNumbers.push(j);
    }
  }

  // перемешиваем массив со значениями карточек
  shuffleFisherYates(cardsNumbers);

  // присваиваем значения карточкам в дата-атрибут и вешаем на каждую карточку обработчик
  for (let i = 0; i < cardsList.length; i++) {
    cardsList[i].dataset.num = cardsNumbers[i];
    cardsList[i].addEventListener('click', checkCards);
  }

}

const shuffleFisherYates = (array) => {
  // перемешиваем массив значений для карточек
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function checkCards() {
  // предотвращаем преждевременное нажатие на карточки
  if (lockClick) return;
  // сразу снимаем обработчик события чтобы не допустить повторного нажатия на ту же карточку
  this.removeEventListener('click', checkCards);
  // присваиваем обе карточки в переменные для их сравнения
  if (!activeCard) {
    activeCard = true;
    firstCard = this;
    this.innerHTML = this.dataset.num;
    return;
  }

  secondCard = this;
  activeCard = false;
  this.innerHTML = this.dataset.num;
  matchCheck();
}

const matchCheck = () => {
  const tableSize = localStorage.getItem('tableSize');
  const cardsPair = tableSize * (tableSize / 2);
  // при совпадении карточек убираем обработчик событий. При несовпадении очищаем карточки
  if (firstCard.dataset.num === secondCard.dataset.num) {
    // проверяем количество угаданных пар, если все то завершаем игру
    if (gameCount() === cardsPair) {
     replay();
     clearInterval(window.timerId);
    }
    disableCards();
    return;
  }

  clearCardsValue();
}

const disableCards = () => {
  firstCard.removeEventListener('click', checkCards);
  secondCard.removeEventListener('click', checkCards);
}

const clearCardsValue = () => {
  // возвращаем удалённые обработчики
  firstCard.addEventListener('click', checkCards);
  secondCard.addEventListener('click', checkCards);

  lockClick = true;
  setTimeout(() => {
    firstCard.innerHTML = '';
    secondCard.innerHTML = '';
    lockClick = false;
  }, 1000);
}

// функция-счётчик для проверки на завершённость игры
const endGameCount = () => {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

// функция создания кнопки когда все пары карт открыты
const replay = () => {
  const gameContainer = document.querySelector('.container');
  const replayButton = document.createElement('button');
  replayButton.innerHTML = 'Сыграть ещё раз';
  replayButton.classList.add('form__replay-btn');
  setTimeout(() => {
    replayButton.classList.add('form__replay-btn--appear');
  }, 200)


  gameContainer.append(replayButton);
  replayButton.addEventListener('click', () => {
    location.reload();
  })
}

// счётчик угаданных пар
let gameCount = endGameCount();
// флаг для предотвращения преждевременного нажатия
let lockClick = false;
let activeCard = false;
let firstCard, secondCard;

window.addEventListener('DOMContentLoaded', createForm);

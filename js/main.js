const addPhotoBtn = document.querySelector('.add-photo');
const cardsContainer = document.querySelector('.cards-container');
const reader = new FileReader();

let album = JSON.parse(localStorage.getItem('album')) || [];

window.addEventListener('load', onLoad);
addPhotoBtn.addEventListener('click', loadImg);
cardsContainer.addEventListener('click', clickHandler);
cardsContainer.addEventListener('mouseover', mouseOverHandler);
cardsContainer.addEventListener('mouseout', mouseOutHandler);

function onLoad() {
  var oldAlbum = album;
  album = [];
  oldAlbum.forEach( (photo) => {
    var recreatedPhoto = new Photo(photo.title, photo.caption, photo.image, photo.id, photo.favorite);
    album.push(recreatedPhoto);
    createCard(recreatedPhoto);
  });
  var hearts = cardsContainer.querySelectorAll('.favorite');
  hearts.forEach( (heart) => {
    if (JSON.parse(heart.dataset.favorite)) {
      activate(heart);
    }
  });
}

function loadImg(e) {
  e.preventDefault();
  var imageInput = document.querySelector('#image-input');
  if (imageInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]); 
    reader.onload = addPhoto;
  }
}

function addPhoto(e) {
  var title = document.querySelector('.title');
  var caption = document.querySelector('.caption');
  var newPhoto = new Photo(title.value, caption.value, e.target.result, Date.now());

  album.push(newPhoto);
  createCard(newPhoto);
  newPhoto.saveToStorage(album);

  clearInput(title);
  clearInput(caption);
}

function clearInput(element) {
  element.value = '';
}

function createCard(photo) {
  var card = `<section class="card" data-id="${photo.id}">
        <h2 contenteditable="true">${photo.title}</h2>
        <figure>
          <img src=${photo.image} />
          <figcaption contenteditable="true">
            ${photo.caption}
          </figcaption>
        </figure>
        <footer>
          <img class="delete" src="media/delete.svg" alt="delete button"/>
          <img class="favorite" data-favorite="${photo.favorite}" src="media/favorite.svg" alt="favorite button"/>
        </footer>
      </section>`
  cardsContainer.innerHTML += card;
}

function clickHandler(e) {
  let card = e.target.closest('.card');

  if (!card) return;

  let id = Number(card.dataset.id);

  if (e.target.className === 'delete') {
    let trashPhoto = findPhoto(id);
    trashPhoto.deleteFromStorage(id);
    trashPhoto.saveToStorage();
    card.remove();
  }

  if (e.target.className === 'favorite') {
    let lovedPhoto = findPhoto(id);
    lovedPhoto.toggleFavorite();
    e.target.dataset.favorite = !JSON.parse(e.target.dataset.favorite); 
    lovedPhoto.favorite ? activate(e.target) : deactivate(e.target);
    lovedPhoto.saveToStorage();
  }
}

function mouseOverHandler(e) {
  if (e.target.className === 'delete') {
    activate(e.target);
  }
  if (e.target.className === 'favorite') {
    activate(e.target);
  }
}

function mouseOutHandler(e) {
  if (e.target.className === 'delete') {
    deactivate(e.target);
  }
  if (e.target.className === 'favorite') {
    deactivate(e.target);
  }
}

function findPhoto(id) {
  return album.find( (photo) => photo.id === id);
}

function activate(element) {
  var src = element.getAttribute('src').split('.');
  if (!src[0].includes('-')) {
    element.setAttribute('src', `${src[0]}-active.svg`);
  }
}

function deactivate(element) {
  var favorite = false;
  if (element.dataset.favorite) {
    favorite = JSON.parse(element.dataset.favorite);
  }
  var src = element.getAttribute('src').split('-');
  if (!favorite && !src[0].includes('.svg')) {
    element.setAttribute('src', `${src[0]}.svg`);
  }
}
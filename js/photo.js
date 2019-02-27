class Photo {
  constructor(title, caption, image, id, favorite) {
    this.title = title;
    this.caption = caption;
    this.image = image;
    this.id = id;
    this.favorite = favorite || false;
  }

  saveToStorage() {
    localStorage.setItem('album', JSON.stringify(album));
  }

  deleteFromStorage() {
    var i = album.findIndex( (photo) => photo.id === this.id);
    album.splice(i, 1);
    this.saveToStorage();
  }

  updatePhoto() {
    this.saveToStorage();
  }

  toggleFavorite() {
    this.favorite = !this.favorite;
    this.saveToStorage();
  }
}
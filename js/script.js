document.addEventListener("DOMContentLoaded", function () {
 
    const submitForm = document.getElementById("form-add");

    const searchForm = document.getElementById("form-search");

    const searchInput = document.getElementById("inputSearch");
 
    // Untuk memasukkan buku baru
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBooks();
    });

    // pencarian buku
    searchForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const searchBookTitle = document.getElementById("inputSearch").value;
        showFindResult(searchBookTitle);
    });

    // Mengosongkan kolom pencarian buku
    searchInput.addEventListener("input", function (event) {
        if(event.target.value === ''){
            booksFound = [];
            document.dispatchEvent(new Event(RENDER_EVENT));
        }
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
});

const books = [];
const RENDER_EVENT = "render-book";

const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
 
// Memeriksa apakah local storage bisa digunakan
function isStorageExist() {
  if(typeof(Storage) === undefined){
      alert("Browser tidak mendukung local storage");
      return false
  }
  return true;
}

// Fungsi untuk men generate ID dari timestamp
function generateId() {
    return +new Date();
}

// Fumgsi untuk men generate objek buku
function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

// Fungsi untuk menambahkan buku
function addBooks() {
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = document.getElementById("inputBookYear").value;
    let bookBoolean = document.querySelector("#inputBookIsComplete").checked;
  
    const generatedID = generateId();

    let booksObject = generateBookObject(generatedID, title, author, year, bookBoolean);;
    
    books.push(booksObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// Fungsi untuk menampilkan buku hasil pencarian
function showFindResult(BookTitle) {
    const uncompletedBookList = document.getElementById("incompleteBookshelfList");
    uncompletedBookList.innerHTML = "";

    const completedBookList = document.getElementById("completeBookshelfList");
    completedBookList.innerHTML = "";


    findResult = findBookList(BookTitle);

    if(findResult.length !== 0) {
        for(booksItem of findResult) {
            const booksElement = makeBooks(booksItem);
    
            if(booksItem.isCompleted == false)
                uncompletedBookList.append(booksElement);
            else
                completedBookList.append(booksElement);
        }
    }

}

// Fungsi untuk menampung buku hasil pencarian
function findBookList(BookTitle) {
    const booksFound = [];
    for(booksItem of books) {
        if(booksItem.title.toLowerCase().search(BookTitle.toLowerCase()) !== -1) {
            booksFound.push(booksItem);
            
        }
    }
    return booksFound.length !== 0 ? booksFound : [];

}

// Render Event = event untuk merender website
document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById("incompleteBookshelfList");
    uncompletedBookList.innerHTML = "";

    const completedBookList = document.getElementById("completeBookshelfList");
    completedBookList.innerHTML = "";

    for(booksItem of books){
        const booksElement = makeBooks(booksItem);
    
        if(booksItem.isCompleted == false)
            uncompletedBookList.append(booksElement);
        else
            completedBookList.append(booksElement);
    }
});

// Saved event = event untuk mengambil data dan menampilkan pada console
document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});

// fungsi untuk mengambil data pada local storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
   
    let data = JSON.parse(serializedData);
   
    if(data !== null){
        for(book of data){
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

// fungsi untuk membuat objek buku dan menampilkannya di HTML
function makeBooks(booksObject) {
 
    const textTitle = document.createElement("h2");
    textTitle.innerText = booksObject.title;
  
    const textAuthor = document.createElement("p");
    textAuthor.innerText = "Penulis : " + booksObject.author;

    const textYear = document.createElement("p");
    textYear.innerText = "Tahun : " + booksObject.year;
  
    const textContainer = document.createElement("div");
    textContainer.classList.add("inner")
    textContainer.append(textTitle, textAuthor, textYear);
  
    const container = document.createElement("div");
    container.classList.add("item", "shadow")
    container.append(textContainer);
    container.setAttribute("id", `book-${booksObject.id}`);
  
    if(booksObject.isCompleted){
 
        const undoButton = document.createElement("button");
        undoButton.classList.add("undo-button");
        undoButton.addEventListener("click", function () {
            undoBookFromCompleted(booksObject.id);
        });
   
        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.addEventListener("click", function () {
            removeBook(booksObject.id);
        });
   
        container.append(undoButton, trashButton);
    } else {
   
        const checkButton = document.createElement("button");
        checkButton.classList.add("check-button");
        checkButton.addEventListener("click", function () {
            addBookToCompleted(booksObject.id);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("trash-button");
        trashButton.addEventListener("click", function () {
            removeBook(booksObject.id);
        });
   
        container.append(checkButton, trashButton);
    }
   
   
    return container;

}

// fungsi untuk memindahkan buku ke kategori "Selesai Dibaca"
function addBookToCompleted(bookId) {
 
    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;
    
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// fungsi untuk mencari buku
function findBook(bookId){

    for(bookItem of books){
        if(bookItem.id === bookId){
            return bookItem
        }
    }
    return null
}

// fungsi untuk menghapus buku
function removeBook(bookId) {

    const bookTarget = findBookIndex(bookId);
    if(bookTarget === -1) return;
    books.splice(bookTarget, 1);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}
   
// fungsi untuk memindahkan buku ke kategor "Belum Selesai Dibaca"
function undoBookFromCompleted(bookId){

    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;
   
   
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

// fungsi mencari index buku
function findBookIndex(bookId) {
    
    for(index in books){
        if(books[index].id === bookId){
            return index
        }
    }
    return -1
}

// fungsi menyimpan data
function saveData() {
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}
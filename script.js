let books = [];
let currentEditSubmitHandler = null;

class Book {
  constructor(title, author, pages, read) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = Math.max(0, pages);
    this.read = Math.max(0, Math.min(read, pages)); // Ensure we have sensible data here
  }
  createElement() {
    // Create the main book element container
    const bookElement = document.createElement("article");
    bookElement.className = "book";
    bookElement.id = `book-${this.id}`;

    // Create and append the title span
    const titleSpan = document.createElement("span");
    titleSpan.textContent = `Title: ${this.title}`;
    bookElement.appendChild(titleSpan);

    // Create and append the author span
    const authorSpan = document.createElement("span");
    authorSpan.textContent = `Author: ${this.author}`;
    bookElement.appendChild(authorSpan);

    // Create and append the pages span
    const pagesSpan = document.createElement("span");
    pagesSpan.textContent = `Pages: ${this.pages}`;
    pagesSpan.className = "total-pages";
    bookElement.appendChild(pagesSpan);

    // Create and append the read pages span
    const readSpan = document.createElement("span");
    readSpan.textContent = `Read: ${this.read}`;
    readSpan.className = "pages-read";
    bookElement.appendChild(readSpan);

    const progress = document.createElement("progress");
    progress.id = "page-progress";
    progress.min = "0";
    progress.max = "100";
    progress.value = this.pages == 0 ? 0 : (100 * this.read) / this.pages;
    bookElement.appendChild(progress);

    bookElement.addEventListener("click", () => {
      displayEditModal(bookElement);
    });

    return bookElement;
  }
}

// Utility
function safeAddEventListener(selector, eventType, handler) {
  const element = document.querySelector(selector);
  if (!element) return;

  // Remove the event listener if it was previously added
  element.removeEventListener(eventType, handler);
  // Add the event listener
  element.addEventListener(eventType, handler);
}

function closeModal(modal) {
  // Clear content
  document.querySelector(".modal #title").value = "";
  document.querySelector(".modal #author").value = "";
  document.querySelector(".modal #pages").value = "";
  document.querySelector(".modal #read").value = "";
  modal.style.opacity = 0; // Fade out
  setTimeout(() => {
    modal.style.display = "none";
  }, 500); // Wait for the fade-out to finish
}

function displayBooks() {
  let mainElement = document.querySelector("main");
  let addButton = document.querySelector("#book-add");

  let oldBooks = document.querySelectorAll(".book");
  oldBooks.forEach((book) => book.remove());

  books.forEach((newBook) => {
    let bookElement = newBook.createElement();
    mainElement.insertBefore(bookElement, addButton);
    updateProgress(bookElement);
  });
}

function updateProgress(bookElement) {
  const total = parseInt(
    bookElement.querySelector(".total-pages").textContent.split(": ")[1],
    10
  );
  const read = parseInt(
    bookElement.querySelector(".pages-read").textContent.split(": ")[1],
    10
  );
  const readPercentage = (read / total) * 100;

  // Apply the read percentage to the --read-percentage custom property
  bookElement.style.setProperty("--read-percentage", `${readPercentage}%`);
}

function displayEditModal(bookElement) {
  let modal = document.querySelector("#editBookModal");
  modal.style["display"] = "block";
  requestAnimationFrame(() => {
    modal.style.opacity = 1; // Fade in
  });
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal(modal);
    }
  };

  safeAddEventListener("#editBookModal .close-button", "click", () =>
    closeModal(modal)
  );

  let book = undefined;
  for (index in books) {
    let id = books[index].id;
    if (bookElement.id === `book-${id}`) {
      book = books[index];
      break;
    }
  }

  if (!book) {
    return;
  }

  // Fill modal with current information
  document.querySelector("#editBookModal #editTitle").value = book.title;
  document.querySelector("#editBookModal #editAuthor").value = book.author;
  document.querySelector("#editBookModal #editPages").value = book.pages;
  document.querySelector("#editBookModal #editRead").value = book.read;

  const editButton = document.querySelector(
    "#editBookModal input.submit-button"
  );
  if (currentEditSubmitHandler) {
    editButton.removeEventListener("click", currentEditSubmitHandler);
  }

  currentEditSubmitHandler = (e) => {
    e.preventDefault();

    let title = document.querySelector("#editBookModal #editTitle").value;
    let author = document.querySelector("#editBookModal #editAuthor").value;
    let pages = document.querySelector("#editBookModal #editPages").value;
    let read = document.querySelector("#editBookModal #editRead").value;

    if (
      !(
        title &&
        author &&
        pages &&
        read &&
        parseInt(pages) >= 0 &&
        parseInt(read) >= 0
      )
    ) {
      alert("Invalid Form!");
      return;
    }

    book.title = title;
    book.author = author;
    book.pages = pages;
    book.read = read;
    saveBooks();
    displayBooks();
    closeModal(modal);
  };

  editButton.addEventListener("click", currentEditSubmitHandler);

  safeAddEventListener("#editBookModal button.submit-button", "click", (e) => {
    e.preventDefault();
    let uuid = book.id;

    books = books.filter((book) => book.id !== uuid);
    saveBooks();
    displayBooks();
    closeModal(modal);
  });
}

function saveBooks() {
  localStorage.setItem("books", JSON.stringify(books));
}

/*
Init
*/
document.addEventListener("DOMContentLoaded", function () {
  // Load books from localStorage
  const savedBooks = localStorage.getItem("books");
  if (savedBooks) {
    books = JSON.parse(savedBooks).map(
      (bookData) =>
        new Book(bookData.title, bookData.author, bookData.pages, bookData.read)
    );
  }

  // Update the UI with loaded books
  displayBooks();
});

/*
Get DOM elements
*/
let addButton = document.querySelector("#book-add");
let closeButton = document.querySelector("#addBookModal .close-button");
let submitButton = document.querySelector("#addBookModal .submit-button");
let modal = document.querySelector("#addBookModal");

/*
Setup the book submission form
*/
safeAddEventListener("#book-add", "click", () => {
  modal.style["display"] = "block";
  requestAnimationFrame(() => {
    modal.style.opacity = 1; // Fade in
  });
  safeAddEventListener("#addBookModal .close-button", "click", () =>
    closeModal(modal)
  );

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      closeModal(modal);
    }
  };
});

safeAddEventListener("#addBookModal .submit-button", "click", (e) => {
  e.preventDefault();

  let title = document.querySelector(".modal #title").value;
  let author = document.querySelector(".modal #author").value;
  let pages = document.querySelector(".modal #pages").value;
  let read = document.querySelector(".modal #read").value;

  if (!title || !author || !pages || !read) {
    alert("Invalid form");
    return;
  }

  books.push(new Book(title, author, pages, read));
  saveBooks();
  displayBooks();
  closeModal(modal);
});

// Setup edit modal

document.addEventListener("DOMContentLoaded", function () {
  const bookForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Muat buku dari localStorage saat halaman dimuat
  loadBooks();

  // Event listener untuk form tambah buku
  bookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  // Event listener untuk form pencarian buku
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  // Fungsi untuk menambahkan buku baru
  function addBook() {
    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = parseInt(document.getElementById("bookFormYear").value);
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    // Validasi input
    if (!title || !author || isNaN(year)) {
      alert("Harap isi semua field dengan benar.");
      return;
    }

    const submitButton = document.getElementById("bookFormSubmit");
    const isEdit = submitButton.dataset.editId;

    if (isEdit) {
      // Jika sedang dalam mode edit, simpan perubahan
      const book = {
        id: +isEdit, // Gunakan ID yang sama
        title,
        author,
        year,
        isComplete,
      };
      saveBook(book);
      submitButton.textContent = "Masukkan Buku ke rak Belum selesai dibaca";
      delete submitButton.dataset.editId; // Hapus ID edit
    } else {
      // Jika tidak, tambahkan buku baru
      const book = {
        id: +new Date(), // Generate unique ID menggunakan timestamp
        title,
        author,
        year,
        isComplete,
      };
      saveBook(book);
    }

    refreshBooks(); // Perbarui tampilan
    bookForm.reset(); // Reset form
  }

  // Fungsi untuk menyimpan buku ke localStorage
  function saveBook(book) {
    let books = getBooks(); // Ambil data buku yang sudah ada
    const index = books.findIndex((b) => b.id === book.id); // Cari indeks buku jika ada

    if (index !== -1) {
      books[index] = book; // Jika buku sudah ada, perbarui data
    } else {
      books.push(book); // Jika buku baru, tambahkan ke array
    }

    localStorage.setItem("books", JSON.stringify(books)); // Simpan ke localStorage
  }

  // Fungsi untuk mengambil semua buku dari localStorage
  function getBooks() {
    const books = localStorage.getItem("books"); // Ambil data dari localStorage
    return books ? JSON.parse(books) : []; // Jika tidak ada data, kembalikan array kosong
  }

  // Fungsi untuk memuat buku dari localStorage saat halaman dimuat
  function loadBooks() {
    const books = getBooks(); // Ambil data buku dari localStorage
    refreshBooks(books); // Tampilkan setiap buku
  }

  // Fungsi untuk menampilkan buku di halaman
  function renderBook(book) {
    const bookElement = document.createElement("div");
    bookElement.setAttribute("data-bookid", book.id);
    bookElement.setAttribute("data-testid", "bookItem");

    bookElement.innerHTML = `
      <h3 data-testid="bookItemTitle">${book.title}</h3>
      <p data-testid="bookItemAuthor">Penulis: ${book.author}</p>
      <p data-testid="bookItemYear">Tahun: ${book.year}</p>
      <div>
        <button data-testid="bookItemIsCompleteButton">${
          book.isComplete ? "Belum selesai dibaca" : "Selesai dibaca"
        }</button>
        <button data-testid="bookItemDeleteButton">Hapus Buku</button>
        <button data-testid="bookItemEditButton">Edit Buku</button>
      </div>
    `;

    // Event listener untuk tombol "Selesai dibaca/Belum selesai dibaca"
    const isCompleteButton = bookElement.querySelector(
      '[data-testid="bookItemIsCompleteButton"]'
    );
    isCompleteButton.addEventListener("click", function () {
      toggleBookStatus(book.id);
    });

    // Event listener untuk tombol "Hapus Buku"
    const deleteButton = bookElement.querySelector(
      '[data-testid="bookItemDeleteButton"]'
    );
    deleteButton.addEventListener("click", function () {
      deleteBook(book.id);
    });

    // Event listener untuk tombol "Edit Buku"
    const editButton = bookElement.querySelector(
      '[data-testid="bookItemEditButton"]'
    );
    editButton.addEventListener("click", function () {
      editBook(book.id);
    });

    // Tambahkan buku ke daftar yang sesuai (selesai/belum selesai dibaca)
    if (book.isComplete) {
      completeBookList.appendChild(bookElement);
    } else {
      incompleteBookList.appendChild(bookElement);
    }
  }

  // Fungsi untuk mengubah status buku (selesai/belum selesai dibaca)
  function toggleBookStatus(id) {
    let books = getBooks(); // Ambil data buku yang sudah ada
    const index = books.findIndex((book) => book.id === id); // Cari indeks buku
    books[index].isComplete = !books[index].isComplete; // Ubah status buku
    localStorage.setItem("books", JSON.stringify(books)); // Simpan kembali ke localStorage
    refreshBooks(); // Perbarui tampilan
  }

  // Fungsi untuk menghapus buku
  function deleteBook(id) {
    let books = getBooks(); // Ambil data buku yang sudah ada
    books = books.filter((book) => book.id !== id); // Hapus buku dengan ID yang sesuai
    localStorage.setItem("books", JSON.stringify(books)); // Simpan kembali ke localStorage
    refreshBooks(); // Perbarui tampilan
  }

  // Fungsi untuk mengedit buku
  function editBook(id) {
    let books = getBooks(); // Ambil data buku yang sudah ada
    const index = books.findIndex((book) => book.id === id); // Cari indeks buku
    const book = books[index]; // Ambil buku yang akan diedit

    // Isi form dengan data buku
    document.getElementById("bookFormTitle").value = book.title;
    document.getElementById("bookFormAuthor").value = book.author;
    document.getElementById("bookFormYear").value = book.year;
    document.getElementById("bookFormIsComplete").checked = book.isComplete;

    // Ubah teks tombol submit untuk menunjukkan bahwa ini adalah edit
    const submitButton = document.getElementById("bookFormSubmit");
    submitButton.textContent = "Simpan Perubahan";
    submitButton.dataset.editId = id; // Simpan ID buku yang sedang diedit
  }

  // Fungsi untuk mencari buku berdasarkan judul
  function searchBook() {
    const searchTitle = document
      .getElementById("searchBookTitle")
      .value.toLowerCase(); // Ambil input pencarian
    const books = getBooks(); // Ambil data buku dari localStorage
    const filteredBooks = books.filter((book) =>
      book.title.toLowerCase().includes(searchTitle)
    ); // Filter buku

    if (filteredBooks.length === 0) {
      alert("Tidak ada buku yang ditemukan dengan judul tersebut.");
    }

    refreshBooks(filteredBooks); // Tampilkan hasil pencarian
  }

  // Fungsi untuk memperbarui tampilan buku
  function refreshBooks(books = getBooks()) {
    incompleteBookList.innerHTML = ""; // Kosongkan daftar "Belum selesai dibaca"
    completeBookList.innerHTML = ""; // Kosongkan daftar "Selesai dibaca"
    books.forEach((book) => renderBook(book)); // Tampilkan setiap buku
  }
});

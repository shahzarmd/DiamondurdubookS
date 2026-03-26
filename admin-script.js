// Admin Dashboard JavaScript
let books = [];
let categories = [];
let settings = {};
let nextId = 7; // Start from 7 because we have 6 initial books

// Load data from localStorage
function loadData() {
    const storedBooks = localStorage.getItem('pdf_library_books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        // Initial books data
        books = [
            {
                id: 1,
                title: "Pride and Prejudice",
                author: "Jane Austen",
                year: 1813,
                category: "fiction",
                description: "A classic novel that follows the character development of Elizabeth Bennet...",
                pdfUrl: "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm",
                views: 1245,
                downloads: 342,
                addedDate: "2024-01-15"
            },
            {
                id: 2,
                title: "A Brief History of Time",
                author: "Stephen Hawking",
                year: 1988,
                category: "science",
                description: "A landmark volume in science writing...",
                pdfUrl: "https://www.fisica.net/relatividade/stephen_hawking_a_brief_history_of_time.pdf",
                views: 2341,
                downloads: 892,
                addedDate: "2024-01-20"
            },
            {
                id: 3,
                title: "Meditations",
                author: "Marcus Aurelius",
                year: 180,
                category: "philosophy",
                description: "A series of personal writings by Marcus Aurelius...",
                pdfUrl: "https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long/downloads/marcus-aurelius_meditations_george-long.epub",
                views: 987,
                downloads: 234,
                addedDate: "2024-01-25"
            },
            {
                id: 4,
                title: "The Art of War",
                author: "Sun Tzu",
                year: 500,
                category: "history",
                description: "An ancient Chinese military treatise...",
                pdfUrl: "https://www.gutenberg.org/files/132/132-h/132-h.htm",
                views: 1567,
                downloads: 456,
                addedDate: "2024-02-01"
            },
            {
                id: 5,
                title: "Frankenstein",
                author: "Mary Shelley",
                year: 1818,
                category: "fiction",
                description: "A story of a scientist who creates a sapient creature...",
                pdfUrl: "https://www.gutenberg.org/files/84/84-h/84-h.htm",
                views: 876,
                downloads: 234,
                addedDate: "2024-02-05"
            },
            {
                id: 6,
                title: "The Origin of Species",
                author: "Charles Darwin",
                year: 1859,
                category: "science",
                description: "A work of scientific literature...",
                pdfUrl: "https://www.gutenberg.org/files/1228/1228-h/1228-h.htm",
                views: 1123,
                downloads: 345,
                addedDate: "2024-02-10"
            }
        ];
        nextId = 7;
        saveBooks();
    }
    
    const storedCategories = localStorage.getItem('pdf_library_categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        categories = [
            { id: 1, name: "Fiction", slug: "fiction", count: 0 },
            { id: 2, name: "Non-Fiction", slug: "non-fiction", count: 0 },
            { id: 3, name: "Science", slug: "science", count: 0 },
            { id: 4, name: "History", slug: "history", count: 0 },
            { id: 5, name: "Philosophy", slug: "philosophy", count: 0 }
        ];
        saveCategories();
    }
    
    const storedSettings = localStorage.getItem('pdf_library_settings');
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
    } else {
        settings = {
            siteTitle: "PDF Library",
            siteDescription: "Free digital library for public domain books and educational resources.",
            itemsPerPage: 12,
            enableDownloads: true,
            enablePdfViewer: true
        };
        saveSettings();
    }
}

// Save books to localStorage
function saveBooks() {
    localStorage.setItem('pdf_library_books', JSON.stringify(books));
}

// Save categories to localStorage
function saveCategories() {
    localStorage.setItem('pdf_library_categories', JSON.stringify(categories));
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('pdf_library_settings', JSON.stringify(settings));
}

// Update category counts
function updateCategoryCounts() {
    categories.forEach(category => {
        category.count = books.filter(book => book.category === category.slug).length;
    });
    saveCategories();
}

// Display books table
function displayBooksTable() {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    
    const searchTerm = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    
    let filteredBooks = books;
    if (searchTerm) {
        filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredBooks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No books found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredBooks.map(book => `
        <tr>
            <td>${book.id}</td>
            <td><strong>${escapeHtml(book.title)}</strong></td>
            <td>${escapeHtml(book.author)}</td>
            <td>${book.year}</td>
            <td><span class="category-badge">${escapeHtml(book.category)}</span></td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editBook(${book.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Update dashboard stats
function updateDashboardStats() {
    const totalBooks = document.getElementById('totalBooks');
    const totalViews = document.getElementById('totalViews');
    const totalDownloads = document.getElementById('totalDownloads');
    
    if (totalBooks) totalBooks.textContent = books.length;
    
    const viewsSum = books.reduce((sum, book) => sum + (book.views || 0), 0);
    const downloadsSum = books.reduce((sum, book) => sum + (book.downloads || 0), 0);
    
    if (totalViews) totalViews.textContent = viewsSum.toLocaleString();
    if (totalDownloads) totalDownloads.textContent = downloadsSum.toLocaleString();
    
    displayRecentActivity();
}

// Display recent activity
function displayRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const recentBooks = [...books].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)).slice(0, 5);
    
    if (recentBooks.length === 0) {
        activityList.innerHTML = '<div class="activity-item">No recent activity</div>';
        return;
    }
    
    activityList.innerHTML = recentBooks.map(book => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-plus-circle"></i>
            </div>
            <div class="activity-details">
                <div class="activity-text">
                    Added "${escapeHtml(book.title)}" by ${escapeHtml(book.author)}
                </div>
                <div class="activity-time">${book.addedDate}</div>
            </div>
        </div>
    `).join('');
}

// Display categories
function displayCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    updateCategoryCounts();
    
    categoriesList.innerHTML = categories.map(category => `
        <div class="category-card">
            <div class="category-info">
                <h3>${escapeHtml(category.name)}</h3>
                <p>${category.count} books</p>
                <small>slug: ${category.slug}</small>
            </div>
            <div class="category-actions">
                <button class="btn-edit" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Add new book
function addBook(bookData) {
    const newBook = {
        id: nextId++,
        ...bookData,
        views: 0,
        downloads: 0,
        addedDate: new Date().toISOString().split('T')[0]
    };
    books.push(newBook);
    saveBooks();
    updateCategoryCounts();
    displayBooksTable();
    updateDashboardStats();
    displayCategories();
    showNotification('Book added successfully!', 'success');
}

// Edit book
function editBook(id)

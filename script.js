// Diamond Urdu Books - Public Website JavaScript
let books = [];
let categories = [];
let settings = {};

// Load data from localStorage
function loadData() {
    const storedBooks = localStorage.getItem('diamond_urdu_books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        // Sample Urdu books data
        books = [
            {
                id: 1,
                title: "دیوان غالب",
                author: "مرزا اسد اللہ خان غالب",
                year: 1821,
                category: "شاعری",
                description: "مرزا غالب کا مشہور دیوان جس میں ان کی مشہور غزلیات شامل ہیں۔ غالب اردو شاعری کے سب سے بڑے شاعر مانے جاتے ہیں۔",
                pdfUrl: "https://www.rekhta.org/ebooks/deewan-e-ghalib-ghalib-ebooks",
                views: 15420,
                downloads: 5432,
                addedDate: "2024-01-15"
            },
            {
                id: 2,
                title: "پیر کامل",
                author: "عمران سیریز",
                year: 2004,
                category: "ناول",
                description: "عمران سیریز کا مشہور ناول جو روحانیت اور محبت کے موضوع پر لکھا گیا ہے۔",
                pdfUrl: "https://www.urdu-novels.com/peer-e-kamil",
                views: 28500,
                downloads: 12345,
                addedDate: "2024-01-20"
            },
            {
                id: 3,
                title: "راجہ گدھ",
                author: "بیگم اختر ریاض الدین",
                year: 1956,
                category: "ناول",
                description: "کلاسیکی اردو ناول جو پنجاب کی ثقافت اور روایات کو پیش کرتا ہے۔",
                pdfUrl: "https://www.urdu-novels.com/raja-gidh",
                views: 9870,
                downloads: 3245,
                addedDate: "2024-01-25"
            },
            {
                id: 4,
                title: "آخری شام",
                author: "منٹو",
                year: 1950,
                category: "کہانیاں",
                description: "سعادت حسن منٹو کے مشہور افسانوں کا مجموعہ جو تقسیم ہند کے پس منظر میں لکھے گئے۔",
                pdfUrl: "https://www.rekhta.org/ebooks/aakhri-shaam-saadat-hasan-manto-ebooks",
                views: 12500,
                downloads: 4321,
                addedDate: "2024-02-01"
            },
            {
                id: 5,
                title: "باغ و بہار",
                author: "میر امن دہلوی",
                year: 1803,
                category: "ادب",
                description: "اردو نثر کی پہلی کتاب جو قصہ چہار درویش کے نام سے بھی مشہور ہے۔",
                pdfUrl: "https://www.rekhta.org/ebooks/bagh-o-bahar-mir-amman-ebooks",
                views: 8760,
                downloads: 2345,
                addedDate: "2024-02-05"
            },
            {
                id: 6,
                title: "تاریخ فرشتہ",
                author: "محمد قاسم فرشتہ",
                year: 1606,
                category: "تاریخ",
                description: "ہندوستان کی تاریخ پر اہم ترین کتاب جسے فارسی میں لکھا گیا تھا۔",
                pdfUrl: "https://www.rekhta.org/ebooks/tareekh-e-farishta-ebooks",
                views: 6540,
                downloads: 1876,
                addedDate: "2024-02-10"
            }
        ];
        saveBooks();
    }
    
    const storedCategories = localStorage.getItem('diamond_urdu_categories');
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    } else {
        categories = [
            { id: 1, name: "ادب", slug: "ادب", count: 0, icon: "fa-book" },
            { id: 2, name: "شاعری", slug: "شاعری", count: 0, icon: "fa-pen-fancy" },
            { id: 3, name: "تاریخ", slug: "تاریخ", count: 0, icon: "fa-landmark" },
            { id: 4, name: "اسلامیات", slug: "اسلامیات", count: 0, icon: "fa-mosque" },
            { id: 5, name: "ناول", slug: "ناول", count: 0, icon: "fa-book-open" },
            { id: 6, name: "کہانیاں", slug: "کہانیاں", count: 0, icon: "fa-star" }
        ];
        saveCategories();
    }
    
    const storedSettings = localStorage.getItem('diamond_urdu_settings');
    if (storedSettings) {
        settings = JSON.parse(storedSettings);
    } else {
        settings = {
            siteTitle: "Diamond Urdu Books",
            siteDescription: "علم و ادب کا خزانہ - مفت اردو ڈیجیٹل لائبریری",
            itemsPerPage: 12,
            featuredCount: 6,
            enableDownloads: true,
            enablePdfViewer: true
        };
        saveSettings();
    }
    
    updateCategoryCounts();
}

// Save functions
function saveBooks() {
    localStorage.setItem('diamond_urdu_books', JSON.stringify(books));
}

function saveCategories() {
    localStorage.setItem('diamond_urdu_categories', JSON.stringify(categories));
}

function saveSettings() {
    localStorage.setItem('diamond_urdu_settings', JSON.stringify(settings));
}

// Update category counts
function updateCategoryCounts() {
    categories.forEach(category => {
        category.count = books.filter(book => book.category === category.name).length;
    });
    saveCategories();
}

// Display categories
function displayCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="filterByCategory('${cat.name}')">
            <i class="fas ${cat.icon}"></i>
            <h3>${cat.name}</h3>
            <span>${cat.count} کتابیں</span>
        </div>
    `).join('');
    
    // Populate category filter dropdown
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.innerHTML = '<option value="all">تمام موضوعات</option>' +
            categories.map(cat => `<option value="${cat.name}">${cat.name}</option>`).join('');
    }
}

// Display books
function displayBooks(booksToShow = books) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;
    
    if (booksToShow.length === 0) {
        booksGrid.innerHTML = '<div class="no-results"><i class="fas fa-book-open"></i><p>کوئی کتاب نہیں ملی۔ براہ کرم دوسری تلاش کریں۔</p></div>';
        return;
    }
    
    booksGrid.innerHTML = booksToShow.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author"><i class="fas fa-user"></i> ${escapeHtml(book.author)}</p>
                <p class="book-year"><i class="fas fa-calendar"></i> ${book.year}</p>
                <span class="book-category">${escapeHtml(book.category)}</span>
            </div>
        </div>
    `).join('');
    
    // Add click event to book cards
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.id);
            const book = books.find(b => b.id === bookId);
            if (book) {
                openBookModal(book);
            }
        });
    });
}

// Display featured books
function displayFeaturedBooks() {
    const featuredGrid = document.getElementById('featuredBooks');
    if (!featuredGrid) return;
    
    const featured = [...books].sort((a, b) => b.views - a.views).slice(0, settings.featuredCount || 6);
    
    featuredGrid.innerHTML = featured.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover">
                <i class="fas fa-book"></i>
            </div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author"><i class="fas fa-user"></i> ${escapeHtml(book.author)}</p>
                <p class="book-year"><i class="fas fa-calendar"></i> ${book.year}</p>
                <span class="book-category">${escapeHtml(book.category)}</span>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('#featuredBooks .book-card').forEach(card => {
        card.addEventListener('click', () => {
            const bookId = parseInt(card.dataset.id);
            const book = books.find(b => b.id === bookId);
            if (book) openBookModal(book);
        });
    });
}

// Update stats
function updateStats() {
    const totalBooksCount = document.getElementById('totalBooksCount');
    const totalDownloads = document.getElementById('totalDownloads');
    
    if (totalBooksCount) totalBooksCount.textContent = books.length;
    
    const downloadsSum = books.reduce((sum, book) => sum + (book.downloads || 0), 0);
    if (totalDownloads) totalDownloads.textContent = downloadsSum.toLocaleString();
    
    // Random readers count (for demo)
    const totalReaders = document.getElementById('totalReaders');
    if (totalReaders) totalReaders.textContent = Math.floor(Math.random() * 10000 + 5000).toLocaleString();
}

// Filter and sort books
function filterAndSortBooks() {
    let filtered = [...books];
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );
    }
    
    const category = document.getElementById('categoryFilter')?.value || 'all';
    if (category !== 'all') {
        filtered = filtered.filter(book => book.category === category);
    }
    
    const sort = document.getElementById('sortFilter')?.value || 'title';
    switch(sort) {
        case 'title':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            filtered.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'year':
            filtered.sort((a, b) => b.year - a.year);
            break;
    }
    
    displayBooks(filtered);
}

// Filter by category
function filterByCategory(categoryName) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = categoryName;
        filterAndSortBooks();
    }
    
    // Scroll to books section
    document.getElementById('books')?.scrollIntoView({ behavior: 'smooth' });
}

// Open book modal
function openBookModal(book) {
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalAuthor').textContent = book.author;
    document.getElementById('modalYear').textContent = book.year;
    document.getElementById('modalCategory').textContent = book.category;
    document.getElementById('modalDescription').textContent = book.description || 'کوئی تعارف دستیاب نہیں';
    
    const readOnlineBtn = document.getElementById('readOnlineBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    readOnlineBtn.onclick = () => openPdfViewer(book);
    downloadBtn.onclick = () => downloadPdf(book);
    
    document.getElementById('bookModal').style.display = 'block';
    
    // Increment views
    book.views = (book.views || 0) + 1;
    saveBooks();
}

// Open PDF viewer
function openPdfViewer(book) {
    document.getElementById('pdfTitle').textContent = book.title;
    const pdfFrame = document.getElementById('pdfFrame');
    pdfFrame.src = book.pdfUrl;
    document.getElementById('pdfModal').style.display = 'block';
    document.getElementById('bookModal').style.display = 'none';
}

// Download PDF
function downloadPdf(book) {
    if (settings.enableDownloads !== false) {
        window.open(book.pdfUrl, '_blank');
        
        // Increment downloads
        book.downloads = (book.downloads || 0) + 1;
        saveBooks();
        updateStats();
    } else {
        alert('ڈاؤن لوڈ کی سہولت فی الحال دستیاب نہیں ہے۔');
    }
}

// Helper function
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    displayCategories();
    displayFeaturedBooks();
    displayBooks();
    updateStats();
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterAndSortBooks);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndSortBooks);
    }
    
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.addEventListener('change', filterAndSortBooks);
    }
    
    // Modal close
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => document.getElementById('bookModal').style.display = 'none';
    }
    
    const closePdfBtn = document.querySelector('.close-pdf');
    if (closePdfBtn) {
        closePdfBtn.onclick = () => {
            document.getElementById('pdfModal').style.display = 'none';
            document.getElementById('pdfFrame').src = '';
        };
    }
    
    window.onclick = (event) => {
        if (event.target === document.getElementById('bookModal')) {
            document.getElementById('bookModal').style.display = 'none';
        }
        if (event.target === document.getElementById('pdfModal')) {
            document.getElementById('pdfModal').style.display = 'none';
            document.getElementById('pdfFrame').src = '';
        }
    };
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = () => {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            }
        };
    }
});

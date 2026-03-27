// ========== Data Management ==========
let books = [];
let categories = [];
let settings = {};
let currentUser = null;
let users = [];
let userRatings = {};
let userReviews = {};
let userProgress = {};
let userFavorites = [];
let userReadingLists = {};

function loadData() {
    // Books
    const storedBooks = localStorage.getItem('diamond_urdu_books');
    if (storedBooks) books = JSON.parse(storedBooks);
    else {
        books = [
            { id: 1, title: "دیوان غالب", author: "مرزا غالب", year: 1821, category: "شاعری", description: "غالب کا مشہور دیوان", pdfUrl: "https://www.rekhta.org/ebooks/deewan-e-ghalib", views: 15420, downloads: 5432, addedDate: "2024-01-15" },
            { id: 2, title: "پیر کامل", author: "عمران سیریز", year: 2004, category: "ناول", description: "روحانیت اور محبت", pdfUrl: "https://www.urdu-novels.com/peer-e-kamil", views: 28500, downloads: 12345, addedDate: "2024-01-20" }
        ];
        saveBooks();
    }
    // Categories
    const storedCats = localStorage.getItem('diamond_urdu_categories');
    if (storedCats) categories = JSON.parse(storedCats);
    else categories = [
        { id: 1, name: "ادب", icon: "fa-book", count: 0 },
        { id: 2, name: "شاعری", icon: "fa-pen-fancy", count: 0 },
        { id: 3, name: "تاریخ", icon: "fa-landmark", count: 0 },
        { id: 4, name: "اسلامیات", icon: "fa-mosque", count: 0 },
        { id: 5, name: "ناول", icon: "fa-book-open", count: 0 }
    ];
    updateCategoryCounts();
    // Users
    const storedUsers = localStorage.getItem('diamond_users');
    if (storedUsers) users = JSON.parse(storedUsers);
    const storedCurrent = localStorage.getItem('diamond_current_user');
    if (storedCurrent) currentUser = JSON.parse(storedCurrent);
    // Other user data
    const storedRatings = localStorage.getItem('diamond_ratings');
    if (storedRatings) userRatings = JSON.parse(storedRatings);
    const storedReviews = localStorage.getItem('diamond_reviews');
    if (storedReviews) userReviews = JSON.parse(storedReviews);
    const storedProgress = localStorage.getItem('diamond_progress');
    if (storedProgress) userProgress = JSON.parse(storedProgress);
    const storedFavs = localStorage.getItem('diamond_favorites');
    if (storedFavs) userFavorites = JSON.parse(storedFavs);
    const storedLists = localStorage.getItem('diamond_lists');
    if (storedLists) userReadingLists = JSON.parse(storedLists);
    else userReadingLists = { default: { name: "پسندیدہ", books: [] } };
    // Settings
    const storedSettings = localStorage.getItem('diamond_urdu_settings');
    if (storedSettings) settings = JSON.parse(storedSettings);
    else settings = { siteTitle: "Diamond Urdu Books", itemsPerPage: 12, featuredCount: 6, enableDownloads: true, enablePdfViewer: true };
}

function saveBooks() { localStorage.setItem('diamond_urdu_books', JSON.stringify(books)); }
function saveCategories() { localStorage.setItem('diamond_urdu_categories', JSON.stringify(categories)); }
function saveSettings() { localStorage.setItem('diamond_urdu_settings', JSON.stringify(settings)); }
function saveUserData() {
    localStorage.setItem('diamond_users', JSON.stringify(users));
    localStorage.setItem('diamond_current_user', JSON.stringify(currentUser));
    localStorage.setItem('diamond_ratings', JSON.stringify(userRatings));
    localStorage.setItem('diamond_reviews', JSON.stringify(userReviews));
    localStorage.setItem('diamond_progress', JSON.stringify(userProgress));
    localStorage.setItem('diamond_favorites', JSON.stringify(userFavorites));
    localStorage.setItem('diamond_lists', JSON.stringify(userReadingLists));
}

function updateCategoryCounts() {
    categories.forEach(c => c.count = books.filter(b => b.category === c.name).length);
    saveCategories();
}

// ========== UI Rendering ==========
function displayCategories() {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    grid.innerHTML = categories.map(c => `
        <div class="category-card" onclick="filterByCategory('${c.name}')">
            <i class="fas ${c.icon}"></i>
            <h3>${c.name}</h3>
            <span>${c.count} کتابیں</span>
        </div>
    `).join('');
    const catFilter = document.getElementById('categoryFilter');
    if (catFilter) catFilter.innerHTML = '<option value="all">تمام</option>' + categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
}

function displayBooks(booksToShow = books) {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    if (!booksToShow.length) { grid.innerHTML = '<div class="no-results">کوئی کتاب نہیں ملی</div>'; return; }
    grid.innerHTML = booksToShow.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover"><i class="fas fa-book"></i></div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author"><i class="fas fa-user"></i> ${escapeHtml(book.author)}</p>
                <p class="book-year"><i class="fas fa-calendar"></i> ${book.year}</p>
                <span class="book-category">${book.category}</span>
                <div class="book-rating">${renderStars(getBookAverageRating(book.id))} (${Object.keys(userRatings[book.id] || {}).length})</div>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const book = books.find(b => b.id == card.dataset.id);
            if (book) openBookModal(book);
        });
    });
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star" style="color: ${i <= Math.round(rating) ? '#ffc107' : '#ddd'}"></i>`;
    }
    return stars;
}

function displayFeaturedBooks() {
    const featured = [...books].sort((a,b) => (b.views||0) - (a.views||0)).slice(0, settings.featuredCount);
    const grid = document.getElementById('featuredBooks');
    if (!grid) return;
    grid.innerHTML = featured.map(book => `
        <div class="book-card" data-id="${book.id}">
            <div class="book-cover"><i class="fas fa-book"></i></div>
            <div class="book-info">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">${escapeHtml(book.author)}</p>
                <span class="book-category">${book.category}</span>
            </div>
        </div>
    `).join('');
    document.querySelectorAll('#featuredBooks .book-card').forEach(card => {
        card.addEventListener('click', () => {
            const book = books.find(b => b.id == card.dataset.id);
            if (book) openBookModal(book);
        });
    });
}

function updateStats() {
    document.getElementById('totalBooksCount').innerText = books.length;
    const totalDownloads = books.reduce((s,b) => s + (b.downloads||0), 0);
    document.getElementById('totalDownloads').innerText = totalDownloads.toLocaleString();
    document.getElementById('totalReaders').innerText = Math.floor(Math.random() * 5000 + 1000).toLocaleString();
}

// ========== Book Functions ==========
function getBookAverageRating(bookId) {
    if (!userRatings[bookId]) return 0;
    const ratings = Object.values(userRatings[bookId]);
    return ratings.length ? ratings.reduce((a,b)=>a+b,0)/ratings.length : 0;
}

function openBookModal(book) {
    document.getElementById('modalTitle').innerText = book.title;
    document.getElementById('modalAuthor').innerText = book.author;
    document.getElementById('modalYear').innerText = book.year;
    document.getElementById('modalCategory').innerText = book.category;
    document.getElementById('modalDescription').innerText = book.description || 'کوئی تعارف نہیں';
    const readBtn = document.getElementById('readOnlineBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    readBtn.onclick = () => openPdfViewer(book);
    downloadBtn.onclick = () => downloadPdf(book);
    document.getElementById('bookModal').style.display = 'block';
    book.views = (book.views||0) + 1;
    saveBooks();
    // Extra actions
    const extraDiv = document.querySelector('.book-extra-actions') || document.createElement('div');
    extraDiv.className = 'book-extra-actions';
    extraDiv.style.display = 'flex';
    extraDiv.style.gap = '1rem';
    extraDiv.style.marginTop = '1rem';
    extraDiv.innerHTML = `
        <button class="btn-secondary" onclick="toggleFavorite(${book.id})"><i class="fas fa-heart"></i> ${isFavorite(book.id) ? 'پسندیدہ سے ہٹائیں' : 'پسندیدہ میں شامل کریں'}</button>
        <button class="btn-secondary" onclick="openProgressModal(${book.id})"><i class="fas fa-chart-line"></i> پیشرفت</button>
        <button class="btn-secondary" onclick="openReviewModal(${book.id})"><i class="fas fa-star"></i> جائزہ</button>
        <button class="btn-secondary" onclick="openAddToListModal(${book.id})"><i class="fas fa-list"></i> لسٹ میں شامل کریں</button>
        <button class="btn-secondary" onclick="shareBook(${book.id})"><i class="fas fa-share-alt"></i> شیئر کریں</button>
    `;
    const modalBody = document.querySelector('#bookModal .modal-body');
    if (!modalBody.querySelector('.book-extra-actions')) modalBody.appendChild(extraDiv);
}

function openPdfViewer(book) {
    document.getElementById('pdfTitle').innerText = book.title;
    document.getElementById('pdfFrame').src = book.pdfUrl;
    document.getElementById('pdfModal').style.display = 'block';
    document.getElementById('bookModal').style.display = 'none';
}

function downloadPdf(book) {
    if (settings.enableDownloads) window.open(book.pdfUrl, '_blank');
    else alert('ڈاؤن لوڈ کی سہولت بند ہے');
}

// ========== User Functions ==========
function registerUser(name, email, password) {
    if (users.find(u => u.email === email)) { showNotification('ای میل پہلے سے رجسٹر ہے', 'error'); return false; }
    const newUser = { id: Date.now(), name, email, password, joinDate: new Date().toISOString() };
    users.push(newUser);
    currentUser = newUser;
    saveUserData();
    updateUIForLoggedInUser();
    showNotification('رجسٹریشن کامیاب!', 'success');
    return true;
}

function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) { showNotification('غلط ای میل یا پاس ورڈ', 'error'); return false; }
    currentUser = user;
    saveUserData();
    updateUIForLoggedInUser();
    showNotification('لاگ ان کامیاب!', 'success');
    return true;
}

function logoutUser() {
    currentUser = null;
    saveUserData();
    updateUIForLoggedInUser();
    showNotification('لاگ آؤٹ کر دیا گیا', 'info');
}

function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) { userMenu.style.display = 'inline-block'; document.getElementById('userName').innerText = currentUser.name; }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function toggleFavorite(bookId) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    const index = userFavorites.findIndex(f => f.userId === currentUser.id && f.bookId === bookId);
    if (index === -1) {
        userFavorites.push({ userId: currentUser.id, bookId, added: new Date().toISOString() });
        showNotification('پسندیدہ میں شامل', 'success');
    } else {
        userFavorites.splice(index, 1);
        showNotification('پسندیدہ سے ہٹا دیا', 'info');
    }
    saveUserData();
}

function isFavorite(bookId) {
    return userFavorites.some(f => f.userId === currentUser?.id && f.bookId === bookId);
}

function rateBook(bookId, rating) {
    if (!currentUser) return;
    if (!userRatings[bookId]) userRatings[bookId] = {};
    userRatings[bookId][currentUser.id] = rating;
    saveUserData();
}

function addReview(bookId, comment) {
    if (!currentUser) return;
    if (!userReviews[bookId]) userReviews[bookId] = [];
    userReviews[bookId].push({ userId: currentUser.id, userName: currentUser.name, comment, date: new Date().toISOString() });
    saveUserData();
}

function saveReadingProgress(bookId, page, totalPages) {
    if (!currentUser) return;
    if (!userProgress[currentUser.id]) userProgress[currentUser.id] = {};
    userProgress[currentUser.id][bookId] = { page, totalPages, lastRead: new Date().toISOString() };
    saveUserData();
}

function createReadingList(name) {
    if (!currentUser) return;
    const id = Date.now().toString();
    userReadingLists[id] = { name, books: [], created: new Date().toISOString() };
    saveUserData();
    return id;
}

function addToList(listId, bookId) {
    if (!currentUser) return;
    if (userReadingLists[listId] && !userReadingLists[listId].books.includes(bookId)) {
        userReadingLists[listId].books.push(bookId);
        saveUserData();
    }
}

function shareBook(bookId) {
    const book = books.find(b => b.id == bookId);
    if (!book) return;
    const text = `میں "${book.title}" پڑھ رہا ہوں - Diamond Urdu Books`;
    if (navigator.share) navigator.share({ title: book.title, text, url: window.location.href });
    else alert('شیئرنگ سپورٹ نہیں ہے');
}

// ========== Filter/Search ==========
function filterAndSortBooks() {
    let filtered = [...books];
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    if (search) filtered = filtered.filter(b => b.title.includes(search) || b.author.includes(search) || b.category.includes(search));
    const cat = document.getElementById('categoryFilter')?.value;
    if (cat && cat !== 'all') filtered = filtered.filter(b => b.category === cat);
    const sort = document.getElementById('sortFilter')?.value;
    if (sort === 'title') filtered.sort((a,b)=>a.title.localeCompare(b.title));
    else if (sort === 'author') filtered.sort((a,b)=>a.author.localeCompare(b.author));
    else if (sort === 'year') filtered.sort((a,b)=>b.year - a.year);
    else if (sort === 'rating') filtered.sort((a,b)=>getBookAverageRating(b.id) - getBookAverageRating(a.id));
    // advanced filters
    const yearFrom = parseInt(document.getElementById('yearFrom')?.value);
    const yearTo = parseInt(document.getElementById('yearTo')?.value);
    const minRating = parseFloat(document.getElementById('minRating')?.value);
    if (!isNaN(yearFrom)) filtered = filtered.filter(b => b.year >= yearFrom);
    if (!isNaN(yearTo)) filtered = filtered.filter(b => b.year <= yearTo);
    if (minRating > 0) filtered = filtered.filter(b => getBookAverageRating(b.id) >= minRating);
    displayBooks(filtered);
}

function filterByCategory(cat) {
    const catFilter = document.getElementById('categoryFilter');
    if (catFilter) catFilter.value = cat;
    filterAndSortBooks();
    document.getElementById('books').scrollIntoView({ behavior: 'smooth' });
}

// ========== Modal Helpers ==========
function openReviewModal(bookId) {
    const book = books.find(b => b.id == bookId);
    if (!book) return;
    document.getElementById('reviewBookInfo').innerHTML = `<h3>${book.title}</h3><p>${book.author}</p>`;
    document.getElementById('selectedRating').value = 0;
    document.getElementById('reviewComment').value = '';
    const stars = document.querySelectorAll('#ratingStars i');
    stars.forEach(star => {
        star.classList.remove('active', 'fas');
        star.classList.add('far');
        star.onclick = () => {
            const rating = star.dataset.rating;
            document.getElementById('selectedRating').value = rating;
            stars.forEach(s => {
                if (s.dataset.rating <= rating) { s.classList.add('active', 'fas'); s.classList.remove('far'); }
                else { s.classList.remove('active', 'fas'); s.classList.add('far'); }
            });
        };
    });
    document.getElementById('submitReviewBtn').onclick = () => {
        const rating = parseInt(document.getElementById('selectedRating').value);
        const comment = document.getElementById('reviewComment').value;
        if (rating) rateBook(bookId, rating);
        if (comment.trim()) addReview(bookId, comment);
        document.getElementById('reviewModal').style.display = 'none';
        showNotification('جائزہ محفوظ کر لیا گیا', 'success');
    };
    document.getElementById('reviewModal').style.display = 'block';
}

function openProgressModal(bookId) {
    const book = books.find(b => b.id == bookId);
    if (!book) return;
    const progress = userProgress[currentUser?.id]?.[bookId] || { page: 0, totalPages: 200 };
    document.getElementById('progressBookInfo').innerHTML = `<h3>${book.title}</h3>`;
    const slider = document.getElementById('pageSlider');
    const pageSpan = document.getElementById('pageNumber');
    const totalSpan = document.getElementById('totalPages');
    totalSpan.innerText = progress.totalPages;
    slider.value = progress.page;
    pageSpan.innerText = progress.page;
    slider.oninput = () => pageSpan.innerText = slider.value;
    document.getElementById('saveProgressBtn').onclick = () => {
        saveReadingProgress(bookId, parseInt(slider.value), progress.totalPages);
        document.getElementById('progressModal').style.display = 'none';
        showNotification('پیشرفت محفوظ', 'success');
    };
    document.getElementById('progressModal').style.display = 'block';
}

function openAddToListModal(bookId) {
    const book = books.find(b => b.id == bookId);
    if (!book) return;
    document.getElementById('addToListBookTitle').innerText = book.title;
    const container = document.getElementById('userLists');
    container.innerHTML = '';
    for (const [id, list] of Object.entries(userReadingLists)) {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.style.margin = '0.5rem';
        btn.innerText = list.name;
        btn.onclick = () => { addToList(id, bookId); document.getElementById('addToListModal').style.display = 'none'; showNotification('کتاب لسٹ میں شامل', 'success'); };
        container.appendChild(btn);
    }
    document.getElementById('createNewListFromAdd').onclick = () => {
        const name = prompt('نئی لسٹ کا نام');
        if (name) {
            const newId = createReadingList(name);
            addToList(newId, bookId);
            document.getElementById('addToListModal').style.display = 'none';
        }
    };
    document.getElementById('addToListModal').style.display = 'block';
}

function showFavorites() {
    if (!currentUser) return;
    const favBooks = books.filter(b => userFavorites.some(f => f.userId === currentUser.id && f.bookId === b.id));
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content"><div class="modal-header"><h2>پسندیدہ کتابیں</h2><span class="close">&times;</span></div><div class="modal-body"><div class="books-grid" id="favGrid"></div></div></div>`;
    document.body.appendChild(modal);
    const grid = modal.querySelector('#favGrid');
    if (!favBooks.length) grid.innerHTML = '<p>کوئی پسندیدہ کتاب نہیں</p>';
    else grid.innerHTML = favBooks.map(b => `<div class="book-card" data-id="${b.id}"><div class="book-cover"><i class="fas fa-book"></i></div><div class="book-info"><h3>${escapeHtml(b.title)}</h3><p>${b.author}</p></div></div>`).join('');
    grid.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const book = books.find(b => b.id == card.dataset.id);
            if (book) openBookModal(book);
            modal.remove();
        });
    });
    modal.querySelector('.close').onclick = () => modal.remove();
    modal.style.display = 'block';
}

function showReadingHises as user's favorites
    const favoriteBooks = userFavorites.filter(f => f.userId === currentUser.id).map(f => books.find(b => b.id === f.bookId)).filter(b => b);
    const favoriteCategories = favoriteBooks.map(b => b.category);
    const categoryCounts = {};
    favoriteCategories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });
    const topCategory = Object.keys(categoryCounts).sort((a,b) => categoryCounts[b] - categoryCounts[a])[0];
    if (!topCategory) return books.slice(0, 6);
    const recommended = books.filter(b => b.category === topCategory && !userFavorites.some(f => f.bookId === b.id));
    return recommended.slice(0, 6);
}

// ==================== MODAL HANDLERS ====================
function setupUserModals() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (loginBtn) loginBtn.onclick = () => loginModal.style.display = 'block';
    if (showRegister) showRegister.onclick = (e) => { e.preventDefault(); loginModal.style.display = 'none'; registerModal.style.display = 'block'; };
    if (showLogin) showLogin.onclick = (e) => { e.preventDefault(); registerModal.style.display = 'none'; loginModal.style.display = 'block'; };
    
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (loginUser(email, password)) loginModal.style.display = 'none';
    });
    
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        if (registerUser(name, email, password)) registerModal.style.display = 'none';
    });
    
    document.querySelectorAll('.close-login, .close-register, .close-review, .close-progress, .close-lists, .close-addtolist').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
}

function openReviewModal(book) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    document.getElementById('reviewBookInfo').innerHTML = `<h3>${book.title}</h3><p>${book.author}</p>`;
    document.getElementById('selectedRating').value = getUserRating(book.id);
    document.getElementById('reviewComment').value = '';
    // Update star display
    const stars = document.querySelectorAll('#ratingStars i');
    stars.forEach(star => {
        star.classList.remove('active');
        star.classList.add('far');
        if (parseInt(star.dataset.rating) <= getUserRating(book.id)) {
            star.classList.add('active');
            star.classList.remove('far');
            star.classList.add('fas');
        }
    });
    document.getElementById('submitReviewBtn').onclick = () => {
        const rating = parseInt(document.getElementById('selectedRating').value);
        const comment = document.getElementById('reviewComment').value;
        if (rating > 0) rateBook(book.id, rating);
        if (comment.trim()) addReview(book.id, comment);
        document.getElementById('reviewModal').style.display = 'none';
    };
    document.getElementById('reviewModal').style.display = 'block';
}

function openProgressModal(book) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    const progress = getReadingProgress(book.id);
    const currentPage = progress ? progress.page : 0;
    const totalPages = 200; // Placeholder - ideally from book data
    document.getElementById('progressBookInfo').innerHTML = `<h3>${book.title}</h3>`;
    const slider = document.getElementById('pageSlider');
    const pageSpan = document.getElementById('pageNumber');
    const totalSpan = document.getElementById('totalPages');
    totalSpan.textContent = totalPages;
    slider.value = currentPage;
    pageSpan.textContent = currentPage;
    slider.oninput = () => pageSpan.textContent = slider.value;
    document.getElementById('saveProgressBtn').onclick = () => {
        saveReadingProgress(book.id, parseInt(slider.value), totalPages);
        document.getElementById('progressModal').style.display = 'none';
    };
    document.getElementById('progressModal').style.display = 'block';
}

function openAddToListModal(book) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    document.getElementById('addToListBookTitle').innerText = book.title;
    const container = document.getElementById('userLists');
    container.innerHTML = '';
    for (const [id, list] of Object.entries(userReadingLists)) {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.style.margin = '0.5rem';
        btn.innerHTML = list.name;
        btn.onclick = () => { addToList(id, book.id); document.getElementById('addToListModal').style.display = 'none'; };
        container.appendChild(btn);
    }
    document.getElementById('createNewListFromAdd').onclick = () => {
        const name = prompt('نئی لسٹ کا نام');
        if (name) {
            const newId = createReadingList(name);
            addToList(newId, book.id);
        }
        document.getElementById('addToListModal').style.display = 'none';
    };
    document.getElementById('addToListModal').style.display = 'block';
}

function showUserProfile() {
    if (!currentUser) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>پروفائل</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body user-profile">
                <h3>${currentUser.name}</h3>
                <p>${currentUser.email}</p>
                <div class="profile-stats">
                    <div class="stat-box"><i class="fas fa-heart"></i><div>${userFavorites.filter(f => f.userId === currentUser.id).length}</div><span>پسندیدہ</span></div>
                    <div class="stat-box"><i class="fas fa-star"></i><div>${Object.values(userRatings).filter(r => r[currentUser.id]).length}</div><span>ریٹنگز</span></div>
                    <div class="stat-box"><i class="fas fa-book"></i><div>${Object.keys(userProgress[currentUser.id] || {}).length}</div><span>پڑھی گئی</span></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    modal.querySelector('.close').onclick = () => modal.remove();
}

function showFavorites() {
    if (!currentUser) return;
    const favoriteBooks = books.filter(b => userFavorites.some(f => f.userId === currentUser.id && f.bookId === b.id));
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>پسندیدہ کتابیں</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="books-grid" id="favoritesGrid"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const grid = modal.querySelector('#favoritesGrid');
    if (favoriteBooks.length === 0) grid.innerHTML = '<p>کوئی پسندیدہ کتاب نہیں</p>';
    else {
        grid.innerHTML = favoriteBooks.map(book => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-cover"><i class="fas fa-book"></i></div>
                <div class="book-info">
                    <h3 class="book-title">${escapeHtml(book.title)}</h3>
                    <p class="book-author">${escapeHtml(book.author)}</p>
                    <span class="book-category">${book.category}</span>
                </div>
            </div>
        `).join('');
        grid.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = parseInt(card.dataset.id);
                const book = books.find(b => b.id === bookId);
                if (book) openBookModal(book);
                modal.remove();
            });
        });
    }
    modal.style.display = 'block';
    modal.querySelector('.close').onclick = () => modal.remove();
}

function showReadingHistory() {
    if (!currentUser) return;
    const progress = userProgress[currentUser.id] || {};
    const historyBooks = Object.keys(progress).map(bookId => {
        const book = books.find(b => b.id == bookId);
        if (!book) return null;
        return { ...book, progress: progress[bookId] };
    }).filter(b => b);
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>پڑھنے کی تاریخ</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div id="historyList"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const list = modal.querySelector('#historyList');
    if (historyBooks.length === 0) list.innerHTML = '<p>کوئی تاریخ نہیں</p>';
    else {
        list.innerHTML = historyBooks.map(book => `
            <div class="reading-list-item">
                <div><strong>${escapeHtml(book.title)}</strong><br><small>صفحہ ${book.progress.page} / ${book.progress            },
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
// ==================== USER SYSTEM ====================
let currentUser = null;
let users = [];
let userRatings = {};
let userReviews = {};
let userProgress = {};
let userFavorites = [];
let userReadingLists = {};

function loadUserData() {
    const storedUsers = localStorage.getItem('diamond_users');
    if (storedUsers) {
        users = JSON.parse(storedUsers);
    } else {
        // Demo user
        users = [];
    }
    
    const storedCurrentUser = localStorage.getItem('diamond_current_user');
    if (storedCurrentUser) {
        currentUser = JSON.parse(storedCurrentUser);
        updateUIForLoggedInUser();
    }
    
    const storedRatings = localStorage.getItem('diamond_ratings');
    if (storedRatings) userRatings = JSON.parse(storedRatings);
    else userRatings = {};
    
    const storedReviews = localStorage.getItem('diamond_reviews');
    if (storedReviews) userReviews = JSON.parse(storedReviews);
    else userReviews = {};
    
    const storedProgress = localStorage.getItem('diamond_progress');
    if (storedProgress) userProgress = JSON.parse(storedProgress);
    else userProgress = {};
    
    const storedFavorites = localStorage.getItem('diamond_favorites');
    if (storedFavorites) userFavorites = JSON.parse(storedFavorites);
    else userFavorites = [];
    
    const storedLists = localStorage.getItem('diamond_lists');
    if (storedLists) userReadingLists = JSON.parse(storedLists);
    else userReadingLists = { default: { name: "پسندیدہ", books: [] } };
}

function saveUserData() {
    localStorage.setItem('diamond_users', JSON.stringify(users));
    localStorage.setItem('diamond_current_user', JSON.stringify(currentUser));
    localStorage.setItem('diamond_ratings', JSON.stringify(userRatings));
    localStorage.setItem('diamond_reviews', JSON.stringify(userReviews));
    localStorage.setItem('diamond_progress', JSON.stringify(userProgress));
    localStorage.setItem('diamond_favorites', JSON.stringify(userFavorites));
    localStorage.setItem('diamond_lists', JSON.stringify(userReadingLists));
}

function registerUser(name, email, password) {
    if (users.find(u => u.email === email)) {
        showNotification('یہ ای میل پہلے سے رجسٹر ہے', 'error');
        return false;
    }
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        joinDate: new Date().toISOString()
    };
    users.push(newUser);
    currentUser = newUser;
    saveUserData();
    updateUIForLoggedInUser();
    showNotification('رجسٹریشن کامیاب! خوش آمدید', 'success');
    return true;
}

function loginUser(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        showNotification('غلط ای میل یا پاس ورڈ', 'error');
        return false;
    }
    currentUser = user;
    saveUserData();
    updateUIForLoggedInUser();
    showNotification('لاگ ان کامیاب!', 'success');
    return true;
}

function logoutUser() {
    currentUser = null;
    saveUserData();
    updateUIForLoggedInUser();
    showNotification('لاگ آؤٹ کر دیا گیا', 'info');
}

function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    if (currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'inline-block';
            document.getElementById('userName').textContent = currentUser.name;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (userMenu) userMenu.style.display = 'none';
    }
}

// ==================== BOOK RATINGS & REVIEWS ====================
function rateBook(bookId, rating) {
    if (!currentUser) {
        showNotification('براہ کرم پہلے لاگ ان کریں', 'warning');
        return false;
    }
    if (!userRatings[bookId]) userRatings[bookId] = {};
    userRatings[bookId][currentUser.id] = rating;
    saveUserData();
    updateBookRatingDisplay(bookId);
    return true;
}

function addReview(bookId, comment) {
    if (!currentUser) {
        showNotification('براہ کرم پہلے لاگ ان کریں', 'warning');
        return false;
    }
    if (!userReviews[bookId]) userReviews[bookId] = [];
    userReviews[bookId].push({
        userId: currentUser.id,
        userName: currentUser.name,
        comment: comment,
        date: new Date().toISOString()
    });
    saveUserData();
    showNotification('آپ کا جائزہ شامل کر دیا گیا', 'success');
    return true;
}

function getBookAverageRating(bookId) {
    if (!userRatings[bookId]) return 0;
    const ratings = Object.values(userRatings[bookId]);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return sum / ratings.length;
}

function getUserRating(bookId) {
    if (!currentUser || !userRatings[bookId]) return 0;
    return userRatings[bookId][currentUser.id] || 0;
}

function updateBookRatingDisplay(bookId) {
    const avg = getBookAverageRating(bookId);
    // Update star display in book cards
    document.querySelectorAll(`.book-card[data-id="${bookId}"] .book-rating`).forEach(el => {
        if (el) {
            el.innerHTML = '';
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('i');
                star.className = i <= Math.round(avg) ? 'fas fa-star' : 'far fa-star';
                el.appendChild(star);
            }
            el.appendChild(document.createTextNode(` (${Object.keys(userRatings[bookId] || {}).length})`));
        }
    });
}

// ==================== READING PROGRESS ====================
function saveReadingProgress(bookId, page, totalPages) {
    if (!currentUser) return;
    if (!userProgress[currentUser.id]) userProgress[currentUser.id] = {};
    userProgress[currentUser.id][bookId] = {
        page: page,
        totalPages: totalPages,
        lastRead: new Date().toISOString()
    };
    saveUserData();
    showNotification('پیشرفت محفوظ کر لی گئی', 'success');
}

function getReadingProgress(bookId) {
    if (!currentUser || !userProgress[currentUser.id]) return null;
    return userProgress[currentUser.id][bookId];
}

// ==================== FAVORITES ====================
function toggleFavorite(bookId) {
    if (!currentUser) {
        showNotification('پسندیدہ میں شامل کرنے کے لیے لاگ ان کریں', 'warning');
        return false;
    }
    const index = userFavorites.findIndex(f => f.userId === currentUser.id && f.bookId === bookId);
    if (index === -1) {
        userFavorites.push({ userId: currentUser.id, bookId: bookId, added: new Date().toISOString() });
        showNotification('پسندیدہ میں شامل کر دیا گیا', 'success');
    } else {
        userFavorites.splice(index, 1);
        showNotification('پسندیدہ سے ہٹا دیا گیا', 'info');
    }
    saveUserData();
    return index === -1;
}

function isFavorite(bookId) {
    return userFavorites.some(f => f.userId === currentUser?.id && f.bookId === bookId);
}

// ==================== READING LISTS ====================
function createReadingList(listName) {
    if (!currentUser) return;
    const listId = Date.now().toString();
    userReadingLists[listId] = {
        name: listName,
        books: [],
        created: new Date().toISOString()
    };
    saveUserData();
    showNotification(`"${listName}" لسٹ بن گئی`, 'success');
    return listId;
}

function addToList(listId, bookId) {
    if (!currentUser) return;
    if (userReadingLists[listId] && !userReadingLists[listId].books.includes(bookId)) {
        userReadingLists[listId].books.push(bookId);
        saveUserData();
        showNotification('کتاب لسٹ میں شامل کر دی گئی', 'success');
    }
}

function removeFromList(listId, bookId) {
    if (userReadingLists[listId]) {
        userReadingLists[listId].books = userReadingLists[listId].books.filter(b => b !== bookId);
        saveUserData();
    }
}

// ==================== SOCIAL SHARING ====================
function shareBook(book) {
    const shareData = {
        title: book.title,
        text: `میں "${book.title}" پڑھ رہا ہوں - Diamond Urdu Books`,
        url: window.location.href
    };
    if (navigator.share) {
        navigator.share(shareData).catch(console.log);
    } else {
        // Fallback
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text + ' ' + shareData.url)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
        // Show custom share modal
        showShareModal(book, { whatsapp: whatsappUrl, facebook: facebookUrl, twitter: twitterUrl });
    }
}

function showShareModal(book, urls) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>کتاب شیئر کریں</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="share-buttons">
                    <a href="${urls.whatsapp}" target="_blank" class="btn-share whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    <a href="${urls.facebook}" target="_blank" class="btn-share facebook"><i class="fab fa-facebook"></i> Facebook</a>
                    <a href="${urls.twitter}" target="_blank" class="btn-share twitter"><i class="fab fa-twitter"></i> Twitter</a>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    modal.querySelector('.close').onclick = () => modal.remove();
}

// ==================== BOOK RECOMMENDATIONS ====================
function getRecommendations() {
    if (!currentUser) return [];
    // Simple recommendation: books from same categories as user's favorites
    const favoriteBooks = userFavorites.filter(f => f.userId === currentUser.id).map(f => books.find(b => b.id === f.bookId)).filter(b => b);
    const favoriteCategories = favoriteBooks.map(b => b.category);
    const categoryCounts = {};
    favoriteCategories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });
    const topCategory = Object.keys(categoryCounts).sort((a,b) => categoryCounts[b] - categoryCounts[a])[0];
    if (!topCategory) return books.slice(0, 6);
    const recommended = books.filter(b => b.category === topCategory && !userFavorites.some(f => f.bookId === b.id));
    return recommended.slice(0, 6);
}

// ==================== MODAL HANDLERS ====================
function setupUserModals() {
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (loginBtn) loginBtn.onclick = () => loginModal.style.display = 'block';
    if (showRegister) showRegister.onclick = (e) => { e.preventDefault(); loginModal.style.display = 'none'; registerModal.style.display = 'block'; };
    if (showLogin) showLogin.onclick = (e) => { e.preventDefault(); registerModal.style.display = 'none'; loginModal.style.display = 'block'; };
    
    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        if (loginUser(email, password)) loginModal.style.display = 'none';
    });
    
    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        if (registerUser(name, email, password)) registerModal.style.display = 'none';
    });
    
    document.querySelectorAll('.close-login, .close-register, .close-review, .close-progress, .close-lists, .close-addtolist').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', logoutUser);
}

function openReviewModal(book) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    document.getElementById('reviewBookInfo').innerHTML = `<h3>${book.title}</h3><p>${book.author}</p>`;
    document.getElementById('selectedRating').value = getUserRating(book.id);
    document.getElementById('reviewComment').value = '';
    // Update star display
    const stars = document.querySelectorAll('#ratingStars i');
    stars.forEach(star => {
        star.classList.remove('active');
        star.classList.add('far');
        if (parseInt(star.dataset.rating) <= getUserRating(book.id)) {
            star.classList.add('active');
            star.classList.remove('far');
            star.classList.add('fas');
        }
    });
    document.getElementById('submitReviewBtn').onclick = () => {
        const rating = parseInt(document.getElementById('selectedRating').value);
        const comment = document.getElementById('reviewComment').value;
        if (rating > 0) rateBook(book.id, rating);
        if (comment.trim()) addReview(book.id, comment);
        document.getElementById('reviewModal').style.display = 'none';
    };
    document.getElementById('reviewModal').style.display = 'block';
}

function openProgressModal(book) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    const progress = getReadingProgress(book.id);
    const currentPage = progress ? progress.page : 0;
    const totalPages = 200; // Placeholder - ideally from book data
    document.getElementById('progressBookInfo').innerHTML = `<h3>${book.title}</h3>`;
    const slider = document.getElementById('pageSlider');
    const pageSpan = document.getElementById('pageNumber');
    const totalSpan = document.getElementById('totalPages');
    totalSpan.textContent = totalPages;
    slider.value = currentPage;
    pageSpan.textContent = currentPage;
    slider.oninput = () => pageSpan.textContent = slider.value;
    document.getElementById('saveProgressBtn').onclick = () => {
        saveReadingProgress(book.id, parseInt(slider.value), totalPages);
        document.getElementById('progressModal').style.display = 'none';
    };
    document.getElementById('progressModal').style.display = 'block';
}

function openAddToListModal(book) {
    if (!currentUser) { showNotification('پہلے لاگ ان کریں', 'warning'); return; }
    document.getElementById('addToListBookTitle').innerText = book.title;
    const container = document.getElementById('userLists');
    container.innerHTML = '';
    for (const [id, list] of Object.entries(userReadingLists)) {
        const btn = document.createElement('button');
        btn.className = 'btn-secondary';
        btn.style.margin = '0.5rem';
        btn.innerHTML = list.name;
        btn.onclick = () => { addToList(id, book.id); document.getElementById('addToListModal').style.display = 'none'; };
        container.appendChild(btn);
    }
    document.getElementById('createNewListFromAdd').onclick = () => {
        const name = prompt('نئی لسٹ کا نام');
        if (name) {
            const newId = createReadingList(name);
            addToList(newId, book.id);
        }
        document.getElementById('addToListModal').style.display = 'none';
    };
    document.getElementById('addToListModal').style.display = 'block';
}

function showUserProfile() {
    if (!currentUser) return;
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>پروفائل</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body user-profile">
                <h3>${currentUser.name}</h3>
                <p>${currentUser.email}</p>
                <div class="profile-stats">
                    <div class="stat-box"><i class="fas fa-heart"></i><div>${userFavorites.filter(f => f.userId === currentUser.id).length}</div><span>پسندیدہ</span></div>
                    <div class="stat-box"><i class="fas fa-star"></i><div>${Object.values(userRatings).filter(r => r[currentUser.id]).length}</div><span>ریٹنگز</span></div>
                    <div class="stat-box"><i class="fas fa-book"></i><div>${Object.keys(userProgress[currentUser.id] || {}).length}</div><span>پڑھی گئی</span></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';
    modal.querySelector('.close').onclick = () => modal.remove();
}

function showFavorites() {
    if (!currentUser) return;
    const favoriteBooks = books.filter(b => userFavorites.some(f => f.userId === currentUser.id && f.bookId === b.id));
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>پسندیدہ کتابیں</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="books-grid" id="favoritesGrid"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const grid = modal.querySelector('#favoritesGrid');
    if (favoriteBooks.length === 0) grid.innerHTML = '<p>کوئی پسندیدہ کتاب نہیں</p>';
    else {
        grid.innerHTML = favoriteBooks.map(book => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-cover"><i class="fas fa-book"></i></div>
                <div class="book-info">
                    <h3 class="book-title">${escapeHtml(book.title)}</h3>
                    <p class="book-author">${escapeHtml(book.author)}</p>
                    <span class="book-category">${book.category}</span>
                </div>
            </div>
        `).join('');
        grid.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = parseInt(card.dataset.id);
                const book = books.find(b => b.id === bookId);
                if (book) openBookModal(book);
                modal.remove();
            });
        });
    }
    modal.style.display = 'block';
    modal.querySelector('.close').onclick = () => modal.remove();
}

function showReadingHistory() {
    if (!currentUser) return;
    const progress = userProgress[currentUser.id] || {};
    const historyBooks = Object.keys(progress).map(bookId => {
        const book = books.find(b => b.id == bookId);
        if (!book) return null;
        return { ...book, progress: progress[bookId] };
    }).filter(b => b);
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>پڑھنے کی تاریخ</h2>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div id="historyList"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const list = modal.querySelector('#historyList');
    if (historyBooks.length === 0) list.innerHTML = '<p>کوئی تاریخ نہیں</p>';
    else {
        list.innerHTML = historyBooks.map(book => `
            <div class="reading-list-item">
                <div><strong>${escapeHtml(book.title)}</strong><br><small>صفحہ ${book.progress.page} / ${book.progress

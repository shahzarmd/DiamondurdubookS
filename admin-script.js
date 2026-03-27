let books = [];
let categories = [];
let settings = {};
let nextId = 1;

function loadData() {
    const storedBooks = localStorage.getItem('diamond_urdu_books');
    if (storedBooks) { books = JSON.parse(storedBooks); nextId = Math.max(...books.map(b=>b.id),0)+1; }
    else { books = []; nextId = 1; }
    const storedCats = localStorage.getItem('diamond_urdu_categories');
    if (storedCats) categories = JSON.parse(storedCats);
    else categories = [
        { id: 1, name: "ادب", icon: "fa-book", count: 0 },
        { id: 2, name: "شاعری", icon: "fa-pen-fancy", count: 0 },
        { id: 3, name: "تاریخ", icon: "fa-landmark", count: 0 },
        { id: 4, name: "اسلامیات", icon: "fa-mosque", count: 0 },
        { id: 5, name: "ناول", icon: "fa-book-open", count: 0 }
    ];
    const storedSettings = localStorage.getItem('diamond_urdu_settings');
    if (storedSettings) settings = JSON.parse(storedSettings);
    else settings = { siteTitle: "Diamond Urdu Books", itemsPerPage: 12, featuredCount: 6, enableDownloads: true, enablePdfViewer: true };
    updateCategoryCounts();
}

function saveBooks() { localStorage.setItem('diamond_urdu_books', JSON.stringify(books)); }
function saveCategories() { localStorage.setItem('diamond_urdu_categories', JSON.stringify(categories)); }
function saveSettings() { localStorage.setItem('diamond_urdu_settings', JSON.stringify(settings)); }
function updateCategoryCounts() {
    categories.forEach(c => c.count = books.filter(b => b.category === c.name).length);
    saveCategories();
}

function displayBooksTable() {
    const tbody = document.getElementById('booksTableBody');
    if (!tbody) return;
    const search = document.getElementById('adminSearch')?.value.toLowerCase() || '';
    let filtered = books.filter(b => b.title.includes(search) || b.author.includes(search) || b.category.includes(search));
    tbody.innerHTML = filtered.map(b => `
        <tr>
            <td>${b.id}</td>
            <td><strong>${escapeHtml(b.title)}</strong></td>
            <td>${escapeHtml(b.author)}</td>
            <td>${b.year}</td>
            <td><span class="category-badge">${b.category}</span></td>
            <td>${b.views||0}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editBook(${b.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteBook(${b.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function updateDashboardStats() {
    document.getElementById('totalBooks').innerText = books.length;
    document.getElementById('totalViews').innerText = books.reduce((s,b)=>s+(b.views||0),0).toLocaleString();
    document.getElementById('totalDownloads').innerText = books.reduce((s,b)=>s+(b.downloads||0),0).toLocaleString();
    const users = JSON.parse(localStorage.getItem('diamond_users')||'[]');
    document.getElementById('totalUsers').innerText = users.length;
    displayRecentActivity();
}

function displayRecentActivity() {
    const recent = [...books].sort((a,b)=>new Date(b.addedDate)-new Date(a.addedDate)).slice(0,5);
    const list = document.getElementById('activityList');
    if (!list) return;
    list.innerHTML = recent.map(b => `<div class="activity-item"><i class="fas fa-plus-circle"></i><div><div>${escapeHtml(b.title)} شامل کی گئی</div><small>${b.addedDate}</small></div></div>`).join('');
}

function displayCategories() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    updateCategoryCounts();
    container.innerHTML = categories.map(c => `
        <div class="category-card">
            <div><i class="fas ${c.icon}"></i> ${c.name}</div>
            <div>${c.count} کتابیں</div>
            <div><button class="btn-edit" onclick="editCategory(${c.id})"><i class="fas fa-edit"></i></button><button class="btn-delete" onclick="deleteCategory(${c.id})"><i class="fas fa-trash"></i></button></div>
        </div>
    `).join('');
}

// Book CRUD
function addBook(bookData) {
    const newBook = { id: nextId++, ...bookData, views: 0, downloads: 0, addedDate: new Date().toISOString().split('T')[0] };
    books.push(newBook);
    saveBooks();
    updateCategoryCounts();
    displayBooksTable();
    updateDashboardStats();
    displayCategories();
    showNotification('کتاب شامل کر دی گئی', 'success');
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editYear').value = book.year;
    const catSelect = document.getElementById('editCategory');
    catSelect.innerHTML = categories.map(c => `<option value="${c.name}" ${c.name===book.category?'selected':''}>${c.name}</option>`).join('');
    document.getElementById('editDescription').value = book.description || '';
    document.getElementById('editPdfUrl').value = book.pdfUrl || '';
    document.getElementById('editModal').style.display = 'block';
}

function updateBook(id, updated) {
    const idx = books.findIndex(b => b.id === id);
    if (idx !== -1) { books[idx] = { ...books[idx], ...updated }; saveBooks(); updateCategoryCounts(); displayBooksTable(); updateDashboardStats(); displayCategories(); showNotification('کتاب اپ ڈیٹ ہو گئی', 'success'); }
}

function deleteBook(id) {
    window.currentDeleteId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    books = books.filter(b => b.id !== window.currentDeleteId);
    saveBooks();
    updateCategoryCounts();
    displayBooksTable();
    updateDashboardStats();
    displayCategories();
    closeDeleteModal();
    showNotification('کتاب حذف کر دی گئی', 'success');
}

// Category CRUD
function addCategory(cat) {
    const newId = Math.max(...categories.map(c=>c.id),0)+1;
    categories.push({ id: newId, name: cat.name, icon: "fa-book", count: 0, description: cat.description });
    saveCategories();
    displayCategories();
    showNotification('موضوع شامل کر دیا گیا', 'success');
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const newName = prompt('نیا نام:', cat.name);
    if (newName) { cat.name = newName; saveCategories(); displayCategories(); showNotification('موضوع اپ ڈیٹ ہو گیا', 'success'); }
}

function deleteCategory(id) {
    if (confirm('کیا آپ واقعی یہ موضوع حذف کرنا چاہتے ہیں؟')) {
        categories = categories.filter(c => c.id !== id);
        saveCategories();
        displayCategories();
        showNotification('موضوع حذف کر دیا گیا', 'warning');
    }
}

// PDF Upload
function setupFileUpload() {
    const area = document.getElementById('uploadArea');
    const input = document.getElementById('pdfUploadInput');
    area.addEventListener('click', () => input.click());
    area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
    area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('drag-over'); handleFiles(Array.from(e.dataTransfer.files)); });
    input.addEventListener('change', () => handleFiles(Array.from(input.files)));
}

function handleFiles(files) {
    files.forEach(file => {
        if (file.type !== 'application/pdf') { showNotification('صرف PDF فائلز', 'error'); return; }
        if (file.size > 50*1024*1024) { showNotification('فائل بہت بڑی ہے (50MB max)', 'error'); return; }
        const reader = new FileReader();
        reader.onload = e => {
            const uploaded = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs')||'[]');
            uploaded.push({ id: Date.now(), name: file.name, size: file.size, data: e.target.result, uploadDate: new Date().toISOString() });
            localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploaded));
            displayUploadedFiles();
            showNotification(`${file.name} اپ لوڈ ہو گئی`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

function displayUploadedFiles() {
    const list = document.getElementById('uploadedFilesList');
    if (!list) return;
    const files = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs')||'[]');
    if (!files.length) { list.innerHTML = '<div class="empty-state">کوئی فائل نہیں</div>'; return; }
    list.innerHTML = files.map((f, idx) => `
        <div class="file-item">
            <div><i class="fas fa-file-pdf"></i> ${f.name}<br><small>${(f.size/1024/1024).toFixed(2)} MB</small></div>
            <div><button onclick="copyFileUrl(${idx})"><i class="fas fa-copy"></i></button><button onclick="deleteFile(${idx})"><i class="fas fa-trash"></i></button></div>
        </div>
    `).join('');
}

function copyFileUrl(idx) {
    const files = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs')||'[]');
    const file = files[idx];
    if (file && file.data) {
        const blob = dataURLtoBlob(file.data);
        const url = URL.createObjectURL(blob);
        navigator.clipboard.writeText(url);
        showNotification('URL کاپی ہو گئی', 'success');
    }
}

function deleteFile(idx) {
    if (confirm('حذف کریں؟')) {
        let files = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs')||'[]');
        files.splice(idx, 1);
        localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(files));
        displayUploadedFiles();
        showNotification('فائل حذف کر دی گئی', 'success');
    }
}

function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]);
    let n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
}

// Settings
function loadSettings() {
    document.getElementById('siteTitle').value = settings.siteTitle;
    document.getElementById('siteDescription').value = settings.siteDescription;
    document.getElementById('itemsPerPage').value = settings.itemsPerPage;
    document.getElementById('featuredCount').value = settings.featuredCount;
    document.getElementById('enableDownloads').checked = settings.enableDownloads;
    document.getElementById('enablePdfViewer').checked = settings.enablePdfViewer;
}

function saveSettingsFromForm() {
    settings.siteTitle = document.getElementById('siteTitle').value;
    settings.siteDescription = document.getElementById('siteDescription').value;
    settings.itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    settings.featuredCount = parseInt(document.getElementById('featuredCount').value);
    settings.enableDownloads = document.getElementById('enableDownloads').checked;
    settings.enablePdfViewer = document.getElementById('enablePdfViewer').checked;
    saveSettings();
    showNotification('ترتیبات محفوظ ہو گئیں', 'success');
}

// Data export/import
function exportData() {
    const data = { books, categories, settings, exportDate: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = 'data:application/json,' + encodeURIComponent(JSON.stringify(data, null, 2));
    a.download = `diamond-urdu-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = ev => {
            const imported = JSON.parse(ev.target.result);
            if (imported.books) books = imported.books;
            if (imported.categories) categories = imported.categories;
            if (imported.settings) settings = imported.settings;
            saveBooks(); saveCategories(); saveSettings();
            nextId = Math.max(...books.map(b=>b.id),0)+1;
            displayBooksTable(); updateDashboardStats(); displayCategories(); loadSettings();
            showNotification('ڈیٹا امپورٹ ہو گیا', 'success');
        };
        reader.readAsText(file);
    };
    input.click();
}

// Navigation
function navigateTo(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-section="${section}"]`).classList.add('active');
    if (section === 'books') displayBooksTable();
    if (section === 'dashboard') updateDashboardStats();
    if (section === 'categories') displayCategories();
    if (section === 'upload') displayUploadedFiles();
    if (section === 'settings') loadSettings();
}

function showAddBookForm() { navigateTo('add'); document.getElementById('addBookForm').reset(); }
function showAddCategoryModal() { document.getElementById('categoryModal').style.display = 'block'; document.getElementById('addCategoryForm').reset(); }
function closeEditModal() { document.getElementById('editModal').style.display = 'none'; }
function closeDeleteModal() { document.getElementById('deleteModal').style.display = 'none'; }
function showNotification(msg, type='info') {
    const n = document.createElement('div');
    n.className = `notification notification-${type}`;
    n.innerHTML = `<i class="fas ${type==='success'?'fa-check-circle':type==='error'?'fa-exclamation-circle':'fa-info-circle'}"></i><span>${msg}</span>`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
}
function escapeHtml(text) { return text ? text.replace(/[&<>]/g, function(m){if(m==='&')return'&amp;';if(m==='<')return'&lt;';if(m==='>')return'&gt;';return m;}) : ''; }

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    displayBooksTable();
    updateDashboardStats();
    displayCategories();
    loadSettings();
    setupFileUpload();
    displayUploadedFiles();
    document.querySelectorAll('.nav-item[data-section]').forEach(item => item.addEventListener('click', e => { e.preventDefault(); navigateTo(item.dataset.section); }));
    document.getElementById('addBookForm').addEventListener('submit', e => {
        e.preventDefault();
        const pdfFile = document.getElementById('bookPdfFile').files[0];
        let pdfUrl = document.getElementById('bookPdfUrl').value;
        if (pdfFile) {
            const reader = new FileReader();
            reader.onload = ev => {
                const uploaded = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs')||'[]');
                const fileData = { id: Date.now(), name: pdfFile.name, size: pdfFile.size, data: ev.target.result, uploadDate: new Date().toISOString() };
                uploaded.push(fileData);
                localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploaded));
                const blob = dataURLtoBlob(ev.target.result);
                pdfUrl = URL.createObjectURL(blob);
                addBook({
                    title: document.getElementById('bookTitle').value,
                    author: document.getElementById('bookAuthor').value,
                    year: parseInt(document.getElementById('bookYear').value),
                    category: document.getElementById('bookCategory').value,
                    description: document.getElementById('bookDescription').value,
                    pdfUrl
                });
                document.getElementById('addBookForm').reset();
                navigateTo('books');
            };
            reader.readAsDataURL(pdfFile);
        } else if (pdfUrl) {
            addBook({
                title: document.getElementById('bookTitle').value,
                author: document.getElementById('bookAuthor').value,
                year: parseInt(document.getElementById('bookYear').value),
                category: document.getElementById('bookCategory').value,
                description: document.getElementById('bookDescription').value,
                pdfUrl
            });
            document.getElementById('addBookForm').reset();
            navigateTo('books');
        } else showNotification('PDF فائل یا URL درج کریں', 'error');
    });
    document.getElementById('editBookForm').addEventListener('submit', e => {
        e.preventDefault();
        updateBook(parseInt(document.getElementById('editBookId').value), {
            title: document.getElementById('editTitle').value,
            author: document.getElementById('editAuthor').value,
            year: parseInt(document.getElementById('editYear').value),
            category: document.getElementById('editCategory').value,
            description: document.getElementById('editDescription').value,
            pdfUrl: document.getElementById('editPdfUrl').value
        });
        closeEditModal();
    });
    document.getElementById('addCategoryForm').addEventListener('submit', e => {
        e.preventDefault();
        addCategory({ name: document.getElementById('categoryName').value, description: document.getElementById('categoryDescription').value });
        document.getElementById('categoryModal').style.display = 'none';
    });
    document.getElementById('settingsForm').addEventListener('submit', e => { e.preventDefault(); saveSettingsFromForm(); });
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    document.getElementById('adminSearch').addEventListener('input', displayBooksTable);
    document.getElementById('mobileMenuToggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('active'));
    document.querySelectorAll('.close, .close-category, .close-delete').forEach(btn => btn.addEventListener('click', () => btn.closest('.modal').style.display = 'none'));
    window.addEventListener('click', e => { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; });
});                views: 28500,
                downloads: 12345,
                addedDate: "2024-01-20"
            }
        ];
        nextId = 3;
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

function saveBooks() {
    localStorage.setItem('diamond_urdu_books', JSON.stringify(books));
}

function saveCategories() {
    localStorage.setItem('diamond_urdu_categories', JSON.stringify(categories));
}

function saveSettings() {
    localStorage.setItem('diamond_urdu_settings', JSON.stringify(settings));
}

function updateCategoryCounts() {
    categories.forEach(category => {
        category.count = books.filter(book => book.category === category.name).length;
    });
    saveCategories();
}

// Display functions
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
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">کوئی کتاب نہیں ملی</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredBooks.map(book => `
        <tr>
            <td>${book.id}</td>
            <td><strong>${escapeHtml(book.title)}</strong></td>
            <td>${escapeHtml(book.author)}</td>
            <td>${book.year}</td>
            <td><span class="category-badge">${escapeHtml(book.category)}</span></td>
            <td>${book.views || 0}</td>
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

function updateDashboardStats() {
    const totalBooks = document.getElementById('totalBooks');
    const totalViews = document.getElementById('totalViews');
    const totalDownloads = document.getElementById('totalDownloads');
    const todayVisitors = document.getElementById('todayVisitors');
    
    if (totalBooks) totalBooks.textContent = books.length;
    
    const viewsSum = books.reduce((sum, book) => sum + (book.views || 0), 0);
    const downloadsSum = books.reduce((sum, book) => sum + (book.downloads || 0), 0);
    
    if (totalViews) totalViews.textContent = viewsSum.toLocaleString();
    if (totalDownloads) totalDownloads.textContent = downloadsSum.toLocaleString();
    if (todayVisitors) todayVisitors.textContent = Math.floor(Math.random() * 500 + 100).toLocaleString();
    
    displayRecentActivity();
}

function displayRecentActivity() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    const recentBooks = [...books].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)).slice(0, 5);
    
    if (recentBooks.length === 0) {
        activityList.innerHTML = '<div class="activity-item">کوئی حالیہ سرگرمی نہیں</div>';
        return;
    }
    
    activityList.innerHTML = recentBooks.map(book => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-plus-circle"></i>
            </div>
            <div class="activity-details">
                <div class="activity-text">
                    "${escapeHtml(book.title)}" شامل کی گئی
                </div>
                <div class="activity-time">${book.addedDate}</div>
            </div>
        </div>
    `).join('');
}

function displayCategories() {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    updateCategoryCounts();
    
    categoriesList.innerHTML = categories.map(category => `
        <div class="category-card">
            <div class="category-info">
                <h3><i class="fas ${category.icon}"></i> ${escapeHtml(category.name)}</h3>
                <p>${category.count} کتابیں</p>
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

// PDF Upload Functions - FIXED
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const pdfUploadInput = document.getElementById('pdfUploadInput');
    
    if (!uploadArea) return;
    
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.classList.contains('upload-area')) {
            pdfUploadInput.click();
        }
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        handleFileUpload(files);
    });
    
    // File input change
    if (pdfUploadInput) {
        pdfUploadInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleFileUpload(files);
            pdfUploadInput.value = ''; // Reset input
        });
    }
}

function handleFileUpload(files) {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length === 0) {
        showNotification('براہ کرم PDF فائل منتخب کریں', 'error');
        return;
    }
    
    pdfFiles.forEach(file => {
        if (file.size > 50 * 1024 * 1024) {
            showNotification(`${file.name} بہت بڑی ہے (زیادہ سے زیادہ 50MB)`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Store file in localStorage
            const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
            
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result, // Base64 data
                uploadDate: new Date().toISOString()
            };
            
            uploadedFiles.push(fileData);
            localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploadedFiles));
            
            displayUploadedFiles();
            showNotification(`${file.name} کامیابی سے اپ لوڈ ہو گئی!`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

function displayUploadedFiles() {
    const filesList = document.getElementById('uploadedFilesList');
    if (!filesList) return;
    
    const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
    
    if (uploadedFiles.length === 0) {
        filesList.innerHTML = '<div class="empty-state"><i class="fas fa-cloud-upload-alt"></i><p>کوئی فائل اپ لوڈ نہیں کی گئی</p></div>';
        return;
    }
    
    filesList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <i class="fas fa-file-pdf"></i>
                <div>
                    <div class="file-name">${escapeHtml(file.name)}</div>
                    <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div class="file-date">${new Date(file.uploadDate).toLocaleDateString('ur-PK')}</div>
                </div>
            </div>
            <div class="file-actions">
                <button onclick="copyFileUrl(${index})" title="یو آر ایل کاپی کریں">
                    <i class="fas fa-copy"></i>
                </button>
                <button onclick="previewFile(${index})" title="پریو یو کریں">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="deleteFile(${index})" title="حذف کریں">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function copyFileUrl(index) {
    const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
    const file = uploadedFiles[index];
    if (file && file.data) {
        // Create a blob URL
        const blob = dataURLtoBlob(file.data);
        const url = URL.createObjectURL(blob);
        navigator.clipboard.writeText(url);
        showNotification('یو آر ایل کاپی کر دی گئی!', 'success');
    }
}

function previewFile(index) {
    const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
    const file = uploadedFiles[index];
    if (file && file.data) {
        // Open PDF in new window
        const blob = dataURLtoBlob(file.data);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }
}

function deleteFile(index) {
    if (confirm('کیا آپ واقعی یہ فائل حذف کرنا چاہتے ہیں؟')) {
        const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
        uploadedFiles.splice(index, 1);
        localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploadedFiles));
        displayUploadedFiles();
        showNotification('فائل حذف کر دی گئی!', 'success');
    }
}

// Helper function to convert dataURL to Blob
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Book CRUD - FIXED
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
    showNotification('کتاب کامیابی سے شامل کر دی گئی!', 'success');
    return newBook;
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (!book) return;
    
    document.getElementById('editBookId').value = book.id;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editYear').value = book.year;
    document.getElementById('editCategory').value = book.category;
    document.getElementById('editDescription').value = book.description || '';
    document.getElementById('editPdfUrl').value = book.pdfUrl || '';
    
    document.getElementById('editModal').style.display = 'block';
}

function updateBook(id, updatedData) {
    const index = books.findIndex(b => b.id === id);
    if (index !== -1) {
        books[index] = { ...books[index], ...updatedData };
        saveBooks();
        updateCategoryCounts();
        displayBooksTable();
        updateDashboardStats();
        displayCategories();
        showNotification('کتاب اپ ڈیٹ کر دی گئی!', 'success');
    }
}

function deleteBook(id) {
    window.currentDeleteId = id;
    document.getElementById('deleteModal').style.display = 'block';
}

function confirmDelete() {
    const id = window.currentDeleteId;
    books = books.filter(b => b.id !== id);
    saveBooks();
    updateCategoryCounts();
    displayBooksTable();
    updateDashboardStats();
    displayCategories();
    closeDeleteModal();
    showNotification('کتاب حذف کر دی گئی!', 'success');
}

// Category CRUD
function addCategory(categoryData) {
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCategory = {
        id: newId,
        name: categoryData.name,
        slug: categoryData.name,
        count: 0,
        icon: "fa-book",
        description: categoryData.description || ''
    };
    categories.push(newCategory);
    saveCategories();
    displayCategories();
    showNotification('موضوع کامیابی سے شامل کر دیا گیا!', 'success');
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    const newName = prompt('موضوع کا نام تبدیل کریں:', category.name);
    if (newName && newName !== category.name) {
        category.name = newName;
        category.slug = newName;
        saveCategories();
        displayCategories();
        showNotification('موضوع اپ ڈیٹ کر دیا گیا!', 'success');
    }
}

function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category && confirm(`کیا آپ واقعی "${category.name}" موضوع حذف کرنا چاہتے ہیں؟`)) {
        categories = categories.filter(c => c.id !== id);
        saveCategories();
        displayCategories();
        showNotification('موضوع حذف کر دیا گیا!', 'warning');
    }
}

// Settings
function loadSettings() {
    document.getElementById('siteTitle').value = settings.siteTitle || '';
    document.getElementById('siteDescription').value = settings.siteDescription || '';
    document.getElementById('itemsPerPage').value = settings.itemsPerPage || 12;
    document.getElementById('featuredCount').value = settings.featuredCount || 6;
    document.getElementById('enableDownloads').checked = settings.enableDownloads !== false;
    document.getElementById('enablePdfViewer').checked = settings.enablePdfViewer !== false;
}

function saveSettingsFromForm() {
    settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        itemsPerPage: parseInt(document.getElementById('itemsPerPage').value),
        featuredCount: parseInt(document.getElementById('featuredCount').value),
        enableDownloads: document.getElementById('enableDownloads').checked,
        enablePdfViewer: document.getElementById('enablePdfViewer').checked
    };
    saveSettings();
    showNotification('ترتیبات محفوظ کر لی گئیں!', 'success');
}

// Data export/import
function exportData() {
    const data = {
        books: books,
        categories: categories,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `diamond-urdu-books-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('ڈیٹا ایکسپورٹ کر دیا گیا!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.books) books = importedData.books;
                if (importedData.categories) categories = importedData.categories;
                if (importedData.settings) settings = importedData.settings;
                
                saveBooks();
                saveCategories();
                saveSettings();
                
                if (books.length > 0) {
                    nextId = Math.max(...books.map(b => b.id)) + 1;
                }
                
                displayBooksTable();
                updateDashboardStats();
                displayCategories();
                loadSettings();
                
                showNotification('ڈیٹا کامیابی سے امپورٹ ہو گیا!', 'success');
            } catch (error) {
                showNotification('غلط فائل فارمیٹ!', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Navigation
function navigateTo(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[data-section="${section}"]`).classList.add('active');
    
    if (section === 'books') displayBooksTable();
    if (section === 'dashboard') updateDashboardStats();
    if (section === 'categories') displayCategories();
    if (section === 'upload')ess');
    }
}

function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category && confirm(`کیا آپ واقعی "${category.name}" موضوع حذف کرنا چاہتے ہیں؟`)) {
        categories = categories.filter(c => c.id !== id);
        saveCategories();
        displayCategories();
        showNotification('موضوع حذف کر دیا گیا!', 'warning');
    }
}

// PDF Upload
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const pdfUploadInput = document.getElementById('pdfUploadInput');
    
    if (!uploadArea) return;
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    if (pdfUploadInput) {
        pdfUploadInput.addEventListener('change', (e) => {
            handleFiles(Array.from(e.target.files));
        });
    }
}

function handleFiles(files) {
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    pdfFiles.forEach(file => {
        if (file.size > 50 * 1024 * 1024) {
            showNotification(`${file.name} بہت بڑی ہے (زیادہ سے زیادہ 50MB)`, 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = {
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                url: URL.createObjectURL(file),
                uploadDate: new Date().toISOString()
            };
            
            const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
            uploadedFiles.push(fileData);
            localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploadedFiles));
            
            displayUploadedFiles();
            showNotification(`${file.name} کامیابی سے اپ لوڈ ہو گئی!`, 'success');
        };
        reader.readAsDataURL(file);
    });
}

function copyFileUrl(url) {
    navigator.clipboard.writeText(url);
    showNotification('یو آر ایل کاپی کر دی گئی!', 'success');
}

function deleteFile(index) {
    const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
    uploadedFiles.splice(index, 1);
    localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploadedFiles));
    displayUploadedFiles();
    showNotification('فائل حذف کر دی گئی!', 'success');
}

// Settings
function loadSettings() {
    document.getElementById('siteTitle').value = settings.siteTitle || '';
    document.getElementById('siteDescription').value = settings.siteDescription || '';
    document.getElementById('itemsPerPage').value = settings.itemsPerPage || 12;
    document.getElementById('featuredCount').value = settings.featuredCount || 6;
    document.getElementById('enableDownloads').checked = settings.enableDownloads !== false;
    document.getElementById('enablePdfViewer').checked = settings.enablePdfViewer !== false;
}

function saveSettingsFromForm() {
    settings = {
        siteTitle: document.getElementById('siteTitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        itemsPerPage: parseInt(document.getElementById('itemsPerPage').value),
        featuredCount: parseInt(document.getElementById('featuredCount').value),
        enableDownloads: document.getElementById('enableDownloads').checked,
        enablePdfViewer: document.getElementById('enablePdfViewer').checked
    };
    saveSettings();
    showNotification('ترتیبات محفوظ کر لی گئیں!', 'success');
}

// Data export/import
function exportData() {
    const data = {
        books: books,
        categories: categories,
        settings: settings,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `diamond-urdu-books-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('ڈیٹا ایکسپورٹ کر دیا گیا!', 'success');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.books) books = importedData.books;
                if (importedData.categories) categories = importedData.categories;
                if (importedData.settings) settings = importedData.settings;
                
                saveBooks();
                saveCategories();
                saveSettings();
                
                nextId = Math.max(...books.map(b => b.id), 0) + 1;
                
                displayBooksTable();
                updateDashboardStats();
                displayCategories();
                loadSettings();
                
                showNotification('ڈیٹا کامیابی سے امپورٹ ہو گیا!', 'success');
            } catch (error) {
                showNotification('غلط فائل فارمیٹ!', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Navigation
function navigateTo(section) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${section}Section`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.nav-item[data-section="${section}"]`).classList.add('active');
    
    if (section === 'books') displayBooksTable();
    if (section === 'dashboard') updateDashboardStats();
    if (section === 'categories') displayCategories();
    if (section === 'upload') displayUploadedFiles();
    if (section === 'settings') loadSettings();
}

function showAddBookForm() {
    navigateTo('add');
    document.getElementById('addBookForm').reset();
}

function showAddCategoryModal() {
    document.getElementById('categoryModal').style.display = 'block';
    document.getElementById('addCategoryForm').reset();
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    displayBooksTable();
    updateDashboardStats();
    displayCategories();
    loadSettings();
    setupFileUpload();
    displayUploadedFiles();
    
    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.section);
        });
    });
    
    document.getElementById('addBookForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const pdfFile = document.getElementById('bookPdfFile').files[0];
        let pdfUrl = document.getElementById('bookPdfUrl').value;
        
        if (pdfFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const uploadedFiles = JSON.parse(localStorage.getItem('diamond_uploaded_pdfs') || '[]');
                const fileData = {
                    name: pdfFile.name,
                    size: pdfFile.size,
                    type: pdfFile.type,
                    data: event.target.result,
                    url: URL.createObjectURL(pdfFile),
                    uploadDate: new Date().toISOString()
                };
                uploadedFiles.push(fileData);
                localStorage.setItem('diamond_uploaded_pdfs', JSON.stringify(uploadedFiles));
                
                addBook({
                    title: document.getElementById('bookTitle').value,
                    author: document.getElementById('bookAuthor').value,
                    year: parseInt(document.getElementById('bookYear').value),
                    category: document.getElementById('bookCategory').value,
                    description: document.getElementById('bookDescription').value,
                    pdfUrl: fileData.url
                });
                
                e.target.reset();
                navigateTo('books');
            };
            reader.readAsDataURL(pdfFile);
        } else if (pdfUrl) {
            addBook({
                title: document.getElementById('bookTitle').value,
                author: document.getEleme

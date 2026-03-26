// Sample book data (public domain books)
const booksData = [
    {
        id: 1,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        year: 1813,
        category: "fiction",
        description: "A classic novel that follows the character development of Elizabeth Bennet, who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
        pdfUrl: "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm"
    },
    {
        id: 2,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        year: 1988,
        category: "science",
        description: "A landmark volume in science writing by one of the great minds of our time, Stephen Hawking's book explores such profound questions as: How did the universe begin—and what made its start possible?",
        pdfUrl: "https://www.fisica.net/relatividade/stephen_hawking_a_brief_history_of_time.pdf"
    },
    {
        id: 3,
        title: "Meditations",
        author: "Marcus Aurelius",
        year: 180,
        category: "philosophy",
        description: "A series of personal writings by Marcus Aurelius, Roman Emperor from 161 to 180 AD, recording his private notes to himself and ideas on Stoic philosophy.",
        pdfUrl: "https://standardebooks.org/ebooks/marcus-aurelius/meditations/george-long/downloads/marcus-aurelius_meditations_george-long.epub"
    },
    {
        id: 4,
        title: "The Art of War",
        author: "Sun Tzu",
        year: 500,
        category: "history",
        description: "An ancient Chinese military treatise dating from the Late Spring and Autumn Period. The work, which is attributed to the ancient Chinese military strategist Sun Tzu, is composed of 13 chapters.",
        pdfUrl: "https://www.gutenberg.org/files/132/132-h/132-h.htm"
    },
    {
        id: 5,
        title: "Frankenstein",
        author: "Mary Shelley",
        year: 1818,
        category: "fiction",
        description: "A story of a scientist who creates a sapient creature in an unorthodox scientific experiment, exploring themes of ambition, responsibility, and the nature of humanity.",
        pdfUrl: "https://www.gutenberg.org/files/84/84-h/84-h.htm"
    },
    {
        id: 6,
        title: "The Origin of Species",
        author: "Charles Darwin",
        year: 1859,
        category: "science",
        description: "A work of scientific literature by Charles Darwin that is considered to be the foundation of evolutionary biology.",
        pdfUrl: "https://www.gutenberg.org/files/1228/1228-h/1228-h.htm"
    }
];

let currentBooks = [...booksData];

// DOM Elements
const booksGrid = document.getElementById('booksGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const modal = document.getElementById('bookModal');
const pdfModal = document.getElementById('pdfModal');
const closeBtn = document.querySelector('.close');
const closePdfBtn = document.querySelector('.close-pdf');

// Display books
function displayBooks() {
    if (booksGrid) {
        if (currentBooks.length === 0) {
            booksGrid.innerHTML = '<div class="no-results"><i class="fas fa-book-open"></i><p>No books found. Try adjusting your search.</p></div>';
            return;
        }
        
        booksGrid.innerHTML = currentBooks.map(book => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-cover">
                    <i class="fas fa-book"></i>
                </div>
                <div class="book-info">
                    <h3 class="book-title">${escapeHtml(book.title)}</h3>
                    <p class="book-author">by ${escapeHtml(book.author)}</p>
                    <p class="book-year">${book.year}</p>
                    <span class="book-category">${escapeHtml(book.category)}</span>
                </div>
            </div>
        `).join('');
        
        // Add click event to book cards
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', () => {
                const bookId = parseInt(card.dataset.id);
                const book = currentBooks.find(b => b.id === bookId);
                if (book) {
                    openBookModal(book);
                }
            });
        });
    }
}

// Filter and sort books
function filterAndSortBooks() {
    let filtered = [...booksData];
    
    // Apply search filter
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    const category = categoryFilter ? categoryFilter.value : 'all';
    if (category !== 'all') {
        filtered = filtered.filter(book => book.category === category);
    }
    
    // Apply sorting
    const sort = sortFilter ? sortFilter.value : 'title';
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
    
    currentBooks = filtered;
    displayBooks();
}

// Open book modal
function openBookModal(book) {
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalAuthor').textContent = book.author;
    document.getElementById('modalYear').textContent = book.year;
    document.getElementById('modalCategory').textContent = book.category.charAt(0).toUpperCase() + book.category.slice(1);
    document.getElementById('modalDescription').textContent = book.description;
    
    const readOnlineBtn = document.getElementById('readOnlineBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    readOnlineBtn.onclick = () => {
        openPdfViewer(book);
    };
    
    downloadBtn.onclick = () => {
        downloadPdf(book);
    };
    
    modal.style.display = 'block';
}

// Open PDF viewer
function openPdfViewer(book) {
    document.getElementById('pdfTitle').textContent = book.title;
    const pdfFrame = document.getElementById('pdfFrame');
    pdfFrame.src = book.pdfUrl;
    pdfModal.style.display = 'block';
    modal.style.display = 'none';
}

// Download PDF
function downloadPdf(book) {
    // In a real implementation, this would trigger a download
    // For demo purposes, we'll open in new tab
    window.open(book.pdfUrl, '_blank');
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
if (searchInput) {
    searchInput.addEventListener('input', filterAndSortBooks);
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', filterAndSortBooks);
}

if (sortFilter) {
    sortFilter.addEventListener('change', filterAndSortBooks);
}

// Close modal
if (closeBtn) {
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
}

if (closePdfBtn) {
    closePdfBtn.onclick = () => {
        pdfModal.style.display = 'none';
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) pdfFrame.src = '';
    };
}

// Close modal when clicking outside
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
    if (event.target === pdfModal) {
        pdfModal.style.display = 'none';
        const pdfFrame = document.getElementById('pdfFrame');
        if (pdfFrame) pdfFrame.src = '';
    }
};

// Mobile menu toggle (optional)
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
if (mobileMenuBtn) {
    mobileMenuBtn.onclick = () => {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        }
    };
}

// Initialize
displayBooks();

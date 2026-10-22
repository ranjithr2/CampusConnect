/**
 * CampusConnect — Client JavaScript
 * Handles event filtering, search, form double-submission protection,
 * and dynamic confirmation modals.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Prevent duplicate form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                // Allow form submit to proceed while preventing double-click
                setTimeout(() => {
                    submitBtn.disabled = true;
                    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
                }, 10);
            }
        });
    });

    // 2. Client-side Live Event Filter (Search by title, filter by category)
    const searchInput = document.getElementById('eventSearchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const eventCards = document.querySelectorAll('.event-card');

    function filterEvents() {
        if (!eventCards.length) return;
        const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
        const selectedCat = (categoryFilter ? categoryFilter.value : 'ALL').toUpperCase();

        eventCards.forEach(card => {
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            const category = (card.getAttribute('data-category') || '').toUpperCase();

            const matchesQuery = !query || title.includes(query);
            const matchesCat = selectedCat === 'ALL' || category === selectedCat;

            if (matchesQuery && matchesCat) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) searchInput.addEventListener('input', filterEvents);
    if (categoryFilter) categoryFilter.addEventListener('change', filterEvents);

    // 3. Destructive confirmation dialogs
    const confirmButtons = document.querySelectorAll('[data-confirm]');
    confirmButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const msg = btn.getAttribute('data-confirm') || 'Are you sure you want to proceed?';
            if (!confirm(msg)) {
                e.preventDefault();
            }
        });
    });
});

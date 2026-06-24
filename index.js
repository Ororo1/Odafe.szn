/* ODAFE — Dynamic Portfolio Engine */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Initial State & Elements
    // ----------------------------------------------------
    const header = document.getElementById('mainHeader');
    const scrollProgress = document.getElementById('scrollProgress');
    const customCursor = document.getElementById('customCursor');
    const customCursorDot = document.getElementById('customCursorDot');
    const heroBgImg = document.getElementById('heroBgImage');
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-item');
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('section');

    // ----------------------------------------------------
    // 2. Custom Cursor (Hover Devices Only)
    // ----------------------------------------------------
    const hasHover = window.matchMedia('(hover: hover)').matches;
    
    if (hasHover) {
        // Show cursor elements
        customCursor.style.opacity = '1';
        customCursorDot.style.opacity = '1';

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;
        let dotX = 0, dotY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth cursor animation (lerp)
        const renderCursor = () => {
            // Lerp outer cursor (slower)
            cursorX += (mouseX - cursorX) * 0.15;
            cursorY += (mouseY - cursorY) * 0.15;
            customCursor.style.left = `${cursorX}px`;
            customCursor.style.top = `${cursorY}px`;

            // Lerp inner dot (faster)
            dotX += (mouseX - dotX) * 0.3;
            dotY += (mouseY - dotY) * 0.3;
            customCursorDot.style.left = `${dotX}px`;
            customCursorDot.style.top = `${dotY}px`;

            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        // Add hover effect to interactive items
        const hoverElements = document.querySelectorAll('a, button, input, select, textarea, .filter-btn, .item-inner');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                customCursor.classList.remove('hovered');
            });
        });
    } else {
        // Hide cursor elements completely on touch devices
        customCursor.style.display = 'none';
        customCursorDot.style.display = 'none';
    }

    // ----------------------------------------------------
    // 3. Scroll Interactions (Progress, Header, Parallax, Nav Active)
    // ----------------------------------------------------
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolledPercentage = (scrollTop / docHeight) * 100;

        // Progress bar
        scrollProgress.style.width = `${scrolledPercentage}%`;

        // Sticky Header transition
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Parallax scroll on hero background image
        if (heroBgImg && scrollTop < window.innerHeight) {
            const speed = 0.4;
            heroBgImg.style.transform = `scale(1.05) translateY(${scrollTop * speed}px)`;
        }

        // Active Navigation link mapping on scroll
        let currentSec = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.clientHeight;
            if (scrollTop >= secTop && scrollTop < secTop + secHeight) {
                currentSec = sec.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-sec') === currentSec) {
                item.classList.add('active');
            }
        });
    });

    // ----------------------------------------------------
    // 4. Mobile Menu Overlay Toggle
    // ----------------------------------------------------
    const toggleMobileMenu = () => {
        mobileNavToggle.classList.toggle('active');
        mobileNavOverlay.classList.toggle('open');
        document.body.classList.toggle('no-scroll');

        // Simple hamburger lines transform animation via JS or CSS
        const bars = mobileNavToggle.querySelectorAll('.bar');
        if (mobileNavToggle.classList.contains('active')) {
            bars[0].style.transform = 'translateY(7px) rotate(45deg)';
            bars[1].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.transform = 'none';
        }
    };

    mobileNavToggle.addEventListener('click', toggleMobileMenu);

    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Close menu on link click
            if (mobileNavOverlay.classList.contains('open')) {
                toggleMobileMenu();
            }
        });
    });

    // ----------------------------------------------------
    // 5. Lookbook Filtering Logic
    // ----------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const gridItems = document.querySelectorAll('.grid-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Set active class
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            gridItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                // Add a small scale/fade animation before filtering
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';

                setTimeout(() => {
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.style.display = 'block';
                        // Re-trigger visual appearance after render
                        requestAnimationFrame(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        });
                    } else {
                        item.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    // ----------------------------------------------------
    // 6. Custom Lightbox Image Carousel
    // ----------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxId = document.getElementById('lightboxId');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCat = document.getElementById('lightboxCat');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    
    // Maintain list of currently visible/active items for navigation carousel
    let activeItems = [];
    let currentIdx = 0;

    const updateActiveItems = () => {
        // Collect visible elements in grid
        activeItems = Array.from(gridItems).filter(item => item.style.display !== 'none');
    };

    const openLightbox = (item) => {
        updateActiveItems();
        currentIdx = activeItems.indexOf(item);
        
        const innerImg = item.querySelector('.grid-img');
        const itemId = item.querySelector('.item-id').innerText;
        const itemTitle = item.querySelector('.item-title').innerText;
        const itemCat = item.querySelector('.item-cat').innerText;
        const itemDesc = item.getAttribute('data-desc') || '';

        lightboxImg.src = innerImg.src;
        lightboxImg.alt = innerImg.alt;
        lightboxId.innerText = itemId;
        lightboxTitle.innerText = itemTitle;
        lightboxCat.innerText = itemCat;
        lightboxDesc.innerText = itemDesc;

        lightbox.classList.add('active');
        document.body.classList.add('no-scroll');
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
    };

    const navLightbox = (direction) => {
        if (activeItems.length <= 1) return;

        currentIdx = (currentIdx + direction + activeItems.length) % activeItems.length;
        const nextItem = activeItems[currentIdx];

        // Animate swap out
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.95)';

        setTimeout(() => {
            const innerImg = nextItem.querySelector('.grid-img');
            const itemId = nextItem.querySelector('.item-id').innerText;
            const itemTitle = nextItem.querySelector('.item-title').innerText;
            const itemCat = nextItem.querySelector('.item-cat').innerText;
            const itemDesc = nextItem.getAttribute('data-desc') || '';

            lightboxImg.src = innerImg.src;
            lightboxImg.alt = innerImg.alt;
            lightboxId.innerText = itemId;
            lightboxTitle.innerText = itemTitle;
            lightboxCat.innerText = itemCat;
            lightboxDesc.innerText = itemDesc;

            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 200);
    };

    // Listeners for opening lookbook items
    gridItems.forEach(item => {
        item.addEventListener('click', () => openLightbox(item));
    });

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on click outside content
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        navLightbox(-1);
    });

    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation();
        navLightbox(1);
    });

    // Touch swipe gestures for mobile carousel navigation
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    }, { passive: true });

    const handleSwipeGesture = () => {
        const swipeThreshold = 50; // minimum swipe distance in pixels
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swiped left (next)
            navLightbox(1);
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swiped right (previous)
            navLightbox(-1);
        }
    };

    // Keyboard navigation in lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;

        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navLightbox(-1);
        if (e.key === 'ArrowRight') navLightbox(1);
    });

    // Direct inquiry from lightbox pre-fills name of clothing piece
    const lightboxInquireBtn = document.getElementById('lightboxInquire');
    const contactMessageTextarea = document.getElementById('message');
    
    lightboxInquireBtn.addEventListener('click', (e) => {
        closeLightbox();
        // The click event has default behavior href="#contact" which is fine
        const id = lightboxId.innerText;
        const title = lightboxTitle.innerText;
        contactMessageTextarea.value = `Hello, I am interested in purchasing/inquiring about the custom piece: ${title} (${id}). Please provide details on pricing and sizing.`;
        
        // Select custom made-to-order choice in select menu
        const selectElement = document.getElementById('interest');
        selectElement.value = 'lookbook';
    });

    // ----------------------------------------------------
    // 7. Contact Form Simulation
    // ----------------------------------------------------
    const inquiryForm = document.getElementById('inquiryForm');
    const formMessage = document.getElementById('formMessage');
    const submitBtn = document.getElementById('submitBtn');
    const submitBtnText = submitBtn.querySelector('.btn-submit-text');

    inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Visual loading state
        submitBtn.disabled = true;
        submitBtnText.innerText = 'SENDING...';
        formMessage.style.display = 'none';

        // Simulate network inquiry request
        setTimeout(() => {
            inquiryForm.reset();
            submitBtn.disabled = false;
            submitBtnText.innerText = 'SEND INQUIRY';
            
            formMessage.innerText = 'INQUIRY SENT SECURELY. ODAFE STUDIO WILL CONTACT YOU SHORTLY.';
            formMessage.className = 'form-message success';
            
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 6000);
        }, 1500);
    });

    // ----------------------------------------------------
    // 8. Viewport Scroll Reveal Animations
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.animate-on-scroll');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully in view
    });

    revealElements.forEach(el => revealObserver.observe(el));
    
    // Add scroll animations to grid items as they enter the screen too
    const gridObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add slight staggered animation delay to grid items entering view
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, (index % 3) * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05
    });

    gridItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(40px)';
        item.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        gridObserver.observe(item);
    });
});

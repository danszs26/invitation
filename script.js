document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABEL UTAMA ---
    const loadingScreen = document.getElementById('loading-screen');
    const coverPage = document.getElementById('cover-page');
    const progressBar = document.getElementById('progress-bar');
    const greetingBox = document.getElementById('greeting-box');
    const guestNameElement = document.getElementById('guest-name');
    const openButton = document.getElementById('open-button');
    const mainContent = document.getElementById('main-content');
    const backgroundMusic = document.getElementById('background-music');

    // VARIABEL CAROUSEL
    const bgVideoCover = document.getElementById('bg-video-cover');
    const sections = document.querySelectorAll('#section-container .info-section.full-page');
    const sectionContainer = document.getElementById('section-container');
    const bgVideosMain = document.querySelectorAll('.bg-video-main'); 

    let currentPage = 1;
    const totalPages = sections.length; 
    let isTransitioning = false; 

    // VARIABEL UCAPAN
    const guestForm = document.getElementById('guest-form');
    const showWishesBtn = document.getElementById('show-wishes-btn');
    const wishesPopup = document.getElementById('wishes-popup');
    const closePopupBtn = document.querySelector('#wishes-popup .close-btn');
    const wishesList = document.getElementById('wishes-list');


    // --- 1. Ambil Nama Tamu dari URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const guestName = urlParams.get('to') || 'Tamu Undangan'; 
    guestNameElement.textContent = guestName;

    // --- 2. Logika Loading Screen ---
    let progress = 0;
    const interval = setInterval(() => {
        progress += 1;
        progressBar.textContent = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            loadingScreen.classList.add('hidden');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                coverPage.classList.remove('hidden');

                setTimeout(() => {
                    greetingBox.classList.remove('hidden');
                    openButton.style.opacity = 1; 
                }, 1000); 
            }, 500);
        }
    }, 20); 

    // --- 3. Logika Countdown Timer ---
    const eventDate = new Date("May 3, 2026 08:00:00").getTime(); // GANTI TANGGAL INI
    const countdownEl = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    };
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = eventDate - now;

        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        const formatTime = (time) => String(time).padStart(2, '0');

        if (distance > 0) {
            if(countdownEl.days) countdownEl.days.textContent = formatTime(d);
            if(countdownEl.hours) countdownEl.hours.textContent = formatTime(h);
            if(countdownEl.minutes) countdownEl.minutes.textContent = formatTime(m);
            if(countdownEl.seconds) countdownEl.seconds.textContent = formatTime(s);
        } else {
            clearInterval(countdownInterval);
        }
    }
    
    if (countdownEl.days) {
        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); 
    }
    
    
    // --- 4. FUNGSI CAROUSEL ---

    function switchBackground(pageIndex) {
        if (sections.length === 0) return;

        const targetVideoId = sections[pageIndex - 1].getAttribute('data-video-id');
        
        bgVideosMain.forEach(video => {
            video.classList.remove('active');
            video.pause();
            
            if (video.id === targetVideoId) {
                video.classList.add('active');
                video.currentTime = 0; 
                video.play().catch(e => {}); 
            }
        });
    }

    function goToPage(pageIndex) {
        if (isTransitioning || pageIndex < 1 || pageIndex > totalPages) return;

        isTransitioning = true;
        currentPage = pageIndex;
        
        const offset = (pageIndex - 1) * -100;
        sectionContainer.style.transform = `translateY(${offset}vh)`;

        switchBackground(pageIndex);

        setTimeout(() => {
            isTransitioning = false;
        }, 1000); 
    }

    function handleWheel(event) {
        if (mainContent.classList.contains('hidden') || isTransitioning) {
            event.preventDefault(); 
            return;
        }

        const delta = event.deltaY || event.detail || event.wheelDelta;
        
        if (delta > 0) { 
            goToPage(currentPage + 1);
        } else if (delta < 0) { 
            goToPage(currentPage - 1);
        }
        
        event.preventDefault(); 
    }
    
    let touchstartY = 0;
    window.addEventListener('touchstart', (e) => {
        if (mainContent.classList.contains('hidden')) return;
        touchstartY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', (e) => {
        if (mainContent.classList.contains('hidden') || isTransitioning) return;

        const touchendY = e.changedTouches[0].clientY;
        const delta = touchstartY - touchendY; 
        const minSwipeDistance = 50;

        if (Math.abs(delta) < minSwipeDistance) return;

        if (delta > 0) { 
            goToPage(currentPage + 1);
        } else { 
            goToPage(currentPage - 1);
        }
    });

    window.addEventListener('wheel', handleWheel, { passive: false });


    // --- 5. Logika Form Ucapan & Pop-up ---
    
    // Menggunakan localStorage agar data ucapan tetap ada meskipun browser ditutup
    let wishesData = JSON.parse(localStorage.getItem('wishes')) || [];
    
    function saveWishes() {
        localStorage.setItem('wishes', JSON.stringify(wishesData));
    }
    
    // Submit Form
    if (guestForm) {
        guestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('wish-name').value;
            const message = document.getElementById('wish-message').value;
            const attendance = document.getElementById('wish-attendance').value;
            const guests = document.getElementById('wish-guests').value; 
            
            // Validasi: pastikan semua select sudah dipilih (walaupun sudah ada 'required')
            if (!name || !message || !attendance || !guests) {
                 alert("Mohon lengkapi semua isian formulir (Nama, Kehadiran, Jumlah Tamu, dan Ucapan).");
                 return;
            }

            const newWish = {
                name: name,
                message: message,
                attendance: attendance,
                guests: guests, 
                time: new Date().toLocaleString()
            };
            
            wishesData.push(newWish);
            saveWishes();
            
            alert(`Terima kasih! Konfirmasi kehadiran (${attendance}) untuk ${guests} orang dan ucapan Anda sudah terkirim.`);
            guestForm.reset(); 
            
            // Set ulang select ke default setelah reset form
            document.getElementById('wish-attendance').value = "";
            document.getElementById('wish-guests').value = "";
        });
    }

    // Tampilkan Ucapan
    function renderWishes() {
        if (!wishesList) return;
        wishesList.innerHTML = ''; 
        
        if (wishesData.length === 0) {
            wishesList.innerHTML = '<p style="text-align:center; color: var(--popup-text);">Belum ada ucapan. Jadilah yang pertama!</p>';
            return;
        }
        
        // Render ucapan terbaru di atas (reverse slice agar tidak merusak data asli)
        wishesData.slice().reverse().forEach(wish => {
            const item = document.createElement('div');
            item.className = 'wish-item';
            item.innerHTML = `
                <strong>${wish.name}</strong>
                <p>${wish.message}</p>
                <p class="attendance">Kehadiran: ${wish.attendance} (${wish.guests} org)</p>
            `;
            wishesList.appendChild(item);
        });
    }

    // Event listener untuk tombol 'SHOW WISHES'
    if (showWishesBtn) {
        showWishesBtn.addEventListener('click', () => {
            renderWishes();
            wishesPopup.classList.remove('hidden-popup');
        });
    }

    // Event listener untuk tombol tutup pop-up
    if (closePopupBtn) {
        closePopupBtn.addEventListener('click', () => {
            wishesPopup.classList.add('hidden-popup');
        });
    }

    // Tutup pop-up jika mengklik di luar area pop-up
    window.addEventListener('click', (event) => {
        if (event.target === wishesPopup) {
            wishesPopup.classList.add('hidden-popup');
        }
    });


    // --- 6. Fungsi Tombol "LET'S OPEN" ---
    openButton.addEventListener('click', () => {
        
        backgroundMusic.play().catch(error => {});
        
        if(bgVideoCover) bgVideoCover.pause(); 

        coverPage.classList.add('hidden');

        setTimeout(() => {
            coverPage.style.display = 'none';
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = 1; 

            // Inisialisasi carousel
            goToPage(1); 
            
        }, 1000); 
    });
});
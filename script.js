document.addEventListener('DOMContentLoaded', function() {
    const cursor = document.querySelector('.cursor');
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    document.querySelectorAll('a, button, .tag, .link-item, .character').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
        });
    });
    
    const banner = document.querySelector('.banner-image');
    const profilePic = document.querySelector('.profile-pic');
    const profileContainer = document.querySelector('.profile-pic-container');
    
    if (banner) {
        banner.addEventListener('mouseenter', () => {
            banner.style.transform = 'scale(1.05)';
        });
        
        banner.addEventListener('mouseleave', () => {
            banner.style.transform = 'scale(1)';
        });
    }
    
    if (profilePic) {
        profileContainer.addEventListener('mouseenter', () => {
            profilePic.style.transform = 'scale(1.1)';
            profileContainer.style.boxShadow = '0 0 30px rgba(199, 125, 255, 0.6)';
            profileContainer.style.borderColor = 'var(--accent-color)';
        });
        
        profileContainer.addEventListener('mouseleave', () => {
            profilePic.style.transform = 'scale(1)';
            profileContainer.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
            profileContainer.style.borderColor = 'var(--amoled-dark)';
        });
    }
    
    function createSakura() {
        const weebElements = document.querySelector('.weeb-elements');
        if (!weebElements) return;
        
        for (let i = 0; i < 20; i++) {
            const sakura = document.createElement('div');
            sakura.classList.add('sakura');
            
            const size = Math.random() * 8 + 4;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 10 + 10;
            const animationDelay = Math.random() * 10;
            const rotation = Math.random() * 360;
            
            sakura.style.width = `${size}px`;
            sakura.style.height = `${size}px`;
            sakura.style.left = `${left}%`;
            sakura.style.top = `${Math.random() * 20}%`;
            sakura.style.animationDuration = `${animationDuration}s`;
            sakura.style.animationDelay = `${animationDelay}s`;
            sakura.style.transform = `rotate(${rotation}deg)`;
            sakura.style.opacity = Math.random() * 0.5 + 0.3;
            
            const hue = Math.random() * 30 + 320;
            sakura.style.backgroundColor = `hsl(${hue}, 100%, 80%)`;
            
            weebElements.appendChild(sakura);
        }
    }
    
    createSakura();
    
    const introOverlay = document.querySelector('.intro-overlay');
    const bgMusic = document.getElementById('bgMusic');
    const musicControl = document.querySelector('.music-control');
    
    introOverlay.addEventListener('click', () => {
        introOverlay.style.opacity = '0';
        introOverlay.style.backdropFilter = 'blur(0px)';
        
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.log('Autoplay prevented:', e));
        
        setTimeout(() => {
            introOverlay.style.display = 'none';
        }, 1000);
    });
    
    musicControl.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicControl.classList.remove('muted');
        } else {
            bgMusic.pause();
            musicControl.classList.add('muted');
        }
    });
    
    musicControl.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        bgMusic.volume = Math.min(Math.max(bgMusic.volume + delta, 0), 1);
    });
    
    const linkNotification = document.querySelector('.link-notification');
    
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('mouseenter', () => {
            const domain = new URL(link.href).hostname.replace('www.', '');
            linkNotification.textContent = `Opening: ${domain}`;
            linkNotification.style.opacity = '1';
        });
        
        link.addEventListener('mouseleave', () => {
            linkNotification.style.opacity = '0';
        });
    });
    
    document.querySelectorAll('.link-item, .tag, .character').forEach(button => {
        button.addEventListener('click', function(e) {
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 1000);
        });
    });
});
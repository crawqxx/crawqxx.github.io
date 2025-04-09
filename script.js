window.addEventListener('load', function() {
    function getElementWithRetry(selector, retries = 3, delay = 100) {
        return new Promise((resolve) => {
            const tryGet = (attempt) => {
                const element = document.querySelector(selector);
                if (element || attempt >= retries) {
                    resolve(element);
                } else {
                    setTimeout(() => tryGet(attempt + 1), delay);
                }
            };
            tryGet(0);
        });
    }

    let currentActivityIndex = 0;
    let activities = [];
    let audioFiles = [];
    let bgMusic = null;

    async function fetchDiscordPresence() {
        try {
            const response = await fetch('https://api.lanyard.rest/v1/users/1302905329398321152');
            const data = await response.json();
            if (data.success) {
                updatePresence(data.data);
                setupWebsocket();
            }
        } catch (error) {
            console.error('Failed to fetch Discord presence:', error);
        }
    }

    function updatePresence(data) {
        const presenceElement = document.querySelector('.discord-presence');
        if (!presenceElement) return;

        const status = data.discord_status;
        activities = data.activities.filter(a => a.type !== 4);
        const customStatus = data.activities.find(a => a.type === 4);

        document.querySelector('.presence-status').className = `presence-status ${status}`;
        document.querySelector('.presence-username').textContent = data.discord_user.username;

        const prevBtn = document.querySelector('.page-prev');
        const nextBtn = document.querySelector('.page-next');
        const pageIndicator = document.querySelector('.page-indicator');
        
        prevBtn.disabled = activities.length <= 1;
        nextBtn.disabled = activities.length <= 1;
        pageIndicator.style.display = activities.length <= 1 ? 'none' : 'block';
        prevBtn.style.display = activities.length <= 1 ? 'none' : 'block';
        nextBtn.style.display = activities.length <= 1 ? 'none' : 'block';
        pageIndicator.textContent = activities.length > 0 ? `1/${activities.length}` : '0/0';

        if (activities.length > 0) {
            showActivity(0);
        } else {
            document.querySelector('.presence-activity').style.display = 'none';
        }

        if (customStatus) {
            document.querySelector('.presence-status-text').textContent = customStatus.state || '';
            document.querySelector('.presence-status-text').style.display = 'block';
        } else {
            document.querySelector('.presence-status-text').style.display = 'none';
        }
    }

    function showActivity(index) {
        if (index < 0 || index >= activities.length) return;
        
        currentActivityIndex = index;
        const activity = activities[index];
        const activityElement = document.querySelector('.presence-activity');
        activityElement.style.display = 'flex';
        
        document.querySelector('.page-indicator').textContent = `${index + 1}/${activities.length}`;
        document.querySelector('.page-prev').disabled = index === 0;
        document.querySelector('.page-next').disabled = index === activities.length - 1;

        const iconContainer = document.querySelector('.activity-icon-container') || document.createElement('div');
        iconContainer.className = 'activity-icon-container';
        iconContainer.innerHTML = '';

        const mainIcon = document.createElement('div');
        mainIcon.className = 'activity-icon';
        
        if (activity.assets?.large_image) {
            const imageUrl = getImageUrl(activity);
            mainIcon.style.backgroundImage = `url(${imageUrl})`;
        } else {
            mainIcon.style.backgroundImage = '';
        }

        iconContainer.appendChild(mainIcon);

        if (activity.assets?.small_image) {
            const smallIcon = document.createElement('div');
            smallIcon.className = 'activity-icon small-icon';
            const smallImageUrl = getImageUrl(activity, true);
            smallIcon.style.backgroundImage = `url(${smallImageUrl})`;
            iconContainer.appendChild(smallIcon);
        }

        const existingIcon = activityElement.querySelector('.activity-icon-container');
        if (existingIcon) {
            existingIcon.replaceWith(iconContainer);
        } else {
            activityElement.prepend(iconContainer);
        }

        const nameElement = document.querySelector('.activity-name');
        const stateElement = document.querySelector('.activity-state');
        const detailsElement = document.querySelector('.activity-details-line');

        if (activity.type === 2) {
            nameElement.textContent = activity.details || '';
            stateElement.textContent = activity.state || '';
            
            if (activity.id.startsWith('spotify')) {
                detailsElement.textContent = `on ${activity.assets?.large_text || ''}`;
            } else {
                detailsElement.textContent = activity.name || '';
            }
        } else {
            nameElement.textContent = activity.name || '';
            stateElement.textContent = activity.state || '';
            detailsElement.textContent = activity.details || '';
        }
    }

    function getImageUrl(activity, isSmall = false) {
        const imageKey = isSmall ? 'small_image' : 'large_image';
        const image = activity.assets?.[imageKey];
        if (!image) return '';

        if (image.startsWith('mp:external')) {
            return `https://media.discordapp.net/external/${image.replace('mp:external/', '')}`;
        } else if (image.startsWith('spotify:')) {
            return `https://i.scdn.co/image/${image.replace('spotify:', '')}`;
        } else if (activity.application_id) {
            return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
        }
        return '';
    }

    function setupWebsocket() {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        ws.onopen = () => {
            ws.send(JSON.stringify({
                op: 2,
                d: {
                    subscribe_to_id: '1302905329398321152'
                }
            }));
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
                updatePresence(data.d);
            }
        };
    }
    // 123
    function loadAudioFiles() {
        for (let i = 1; i <= 10; i++) {
            try {
                const audio = new Audio(`audios/audio${i}.mp3`);
                audioFiles.push(audio);
            } catch {
                break;
            }
        }
        if (audioFiles.length === 0) {
            const defaultAudio = new Audio('audio.mp3');
            audioFiles.push(defaultAudio);
        }
    }

    function getRandomAudio() {
        return audioFiles[Math.floor(Math.random() * audioFiles.length)];
    }

    function playRandomAudio() {
        if (audioFiles.length === 0) return null;
        const audio = getRandomAudio();
        audio.volume = 0.5;
        audio.loop = false;
        audio.onended = playRandomAudio;
        return audio;
    }

    async function initialize() {
        loadAudioFiles();

        if (window.innerWidth >= 1025) {
            const cursor = await getElementWithRetry('.cursor');
            if (cursor) {
                document.addEventListener('mousemove', (e) => {
                    cursor.style.left = `${e.clientX}px`;
                    cursor.style.top = `${e.clientY}px`;
                });

                document.body.addEventListener('mouseover', (e) => {
                    if (e.target.closest('a, button, .tag, .link-item, .character')) {
                        cursor.classList.add('active');
                    }
                });
                
                document.body.addEventListener('mouseout', (e) => {
                    if (e.target.closest('a, button, .tag, .link-item, .character')) {
                        cursor.classList.remove('active');
                    }
                });
            }
        }

        const banner = await getElementWithRetry('.banner-image');
        if (banner) {
            banner.addEventListener('mouseenter', () => banner.style.transform = 'scale(1.05)');
            banner.addEventListener('mouseleave', () => banner.style.transform = 'scale(1)');
        }

        const profileContainer = await getElementWithRetry('.profile-pic-container');
        const profilePic = await getElementWithRetry('.profile-pic');
        if (profileContainer && profilePic) {
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

        const weebElements = await getElementWithRetry('.weeb-elements');
        if (weebElements) {
            for (let i = 0; i < 20; i++) {
                const sakura = document.createElement('div');
                sakura.className = 'sakura';
                sakura.style.cssText = `
                    width: ${Math.random() * 8 + 4}px;
                    height: ${Math.random() * 8 + 4}px;
                    left: ${Math.random() * 100}%;
                    top: -20px;
                    animation-duration: ${Math.random() * 10 + 10}s;
                    animation-delay: ${Math.random() * 10}s;
                    transform: rotate(${Math.random() * 360}deg);
                    opacity: ${Math.random() * 0.5 + 0.3};
                    background-color: hsl(${Math.random() * 30 + 320}, 100%, 80%);
                `;
                weebElements.appendChild(sakura);
            }
        }

        const introOverlay = await getElementWithRetry('.intro-overlay');
        const introContent = await getElementWithRetry('.intro-content');
        const musicControl = await getElementWithRetry('.music-control');
        const volumeIcon = musicControl?.querySelector('i');
        
        if (introOverlay && introContent) {
            introContent.style.animation = 'introFadeIn 1s ease-out forwards';
            
            introOverlay.addEventListener('click', () => {
                introOverlay.style.opacity = '0';
                introOverlay.style.pointerEvents = 'none';
                introContent.style.opacity = '0';
                introOverlay.style.backdropFilter = 'blur(0px)';
                
                bgMusic = playRandomAudio();
                if (bgMusic) {
                    bgMusic.play().catch(e => console.log('Audio play prevented'));
                }
                
                setTimeout(() => {
                    introOverlay.style.display = 'none';
                }, 1000);
            });
        }

        if (musicControl && volumeIcon) {
            musicControl.addEventListener('click', () => {
                if (!bgMusic) {
                    bgMusic = playRandomAudio();
                    if (bgMusic) {
                        bgMusic.play().catch(e => console.log('Audio play prevented'));
                        volumeIcon.className = 'fas fa-volume-up';
                    }
                    return;
                }
                
                if (bgMusic.paused) {
                    bgMusic.play();
                    volumeIcon.className = 'fas fa-volume-up';
                } else {
                    bgMusic.pause();
                    volumeIcon.className = 'fas fa-volume-mute';
                }
            });

            musicControl.addEventListener('mouseenter', () => {
                musicControl.style.transform = 'scale(1.2)';
            });

            musicControl.addEventListener('mouseleave', () => {
                musicControl.style.transform = 'scale(1)';
            });
        }

        const linkNotification = await getElementWithRetry('.link-notification');
        if (linkNotification) {
            document.body.addEventListener('mouseover', (e) => {
                const link = e.target.closest('a[target="_blank"]');
                if (link) {
                    try {
                        const domain = new URL(link.href).hostname.replace('www.', '');
                        linkNotification.textContent = `Opening: ${domain}`;
                        linkNotification.style.opacity = '1';
                    } catch {
                        linkNotification.style.opacity = '0';
                    }
                }
            });
            
            document.body.addEventListener('mouseout', (e) => {
                if (e.target.closest('a[target="_blank"]')) {
                    linkNotification.style.opacity = '0';
                }
            });
        }

        document.body.addEventListener('click', (e) => {
            const button = e.target.closest('.link-item, .tag, .character');
            if (button) {
                const rect = button.getBoundingClientRect();
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                ripple.style.cssText = `
                    left: ${e.clientX - rect.left}px;
                    top: ${e.clientY - rect.top}px;
                `;
                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 1000);
            }
        });

        document.querySelector('.page-prev')?.addEventListener('click', () => {
            if (currentActivityIndex > 0) {
                showActivity(currentActivityIndex - 1);
            }
        });

        document.querySelector('.page-next')?.addEventListener('click', () => {
            if (currentActivityIndex < activities.length - 1) {
                showActivity(currentActivityIndex + 1);
            }
        });

        fetchDiscordPresence();
    }

    initialize().catch(console.error);
});
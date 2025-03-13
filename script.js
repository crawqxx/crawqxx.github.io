document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('popup');
    const redirectBtn = document.getElementById('redirectBtn');
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmRedirectBtn = document.getElementById('confirmRedirectBtn');
    const cancelRedirectBtn = document.getElementById('cancelRedirectBtn');

    setTimeout(() => {
        popup.classList.add('active');
    }, 100);

    redirectBtn.addEventListener('click', function () {
        confirmationModal.classList.add('active');
    });

    confirmRedirectBtn.addEventListener('click', function () {
        window.location.href = 'https://guns.lol/craw';
    });

    cancelRedirectBtn.addEventListener('click', function () {
        confirmationModal.classList.remove('active');
    });

    const countdownDate = new Date('November 6, 2026 00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        const years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));
        const days = Math.floor((distance % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('years').innerText = years;
        document.getElementById('days').innerText = days;
        document.getElementById('hours').innerText = hours;
        document.getElementById('minutes').innerText = minutes;
        document.getElementById('seconds').innerText = seconds;

        document.getElementById('yearsLabel').innerText = years === 1 ? 'Year' : 'Years';
        document.getElementById('daysLabel').innerText = days === 1 ? 'Day' : 'Days';
        document.getElementById('hoursLabel').innerText = hours === 1 ? 'Hour' : 'Hours';
        document.getElementById('minutesLabel').innerText = minutes === 1 ? 'Minute' : 'Minutes';
        document.getElementById('secondsLabel').innerText = seconds === 1 ? 'Second' : 'Seconds';

        if (distance < 0) {
            clearInterval(countdownInterval);
            document.getElementById('countdown').innerHTML = '<div class="timer">Countdown expired!</div>';
        }
    }

    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
});
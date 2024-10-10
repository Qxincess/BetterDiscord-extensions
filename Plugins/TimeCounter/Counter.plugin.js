/**
 * @name TimeCounter
 * @author VoidArchive
 * @description Check how many hours you wasted on discord.
 * @version 1.0
 * @authorId 725560508371173377
 * @source https://github.com/Javalined/BetterDiscord-extensions/tree/main/Plugins/TimeCounter
 **/

module.exports = class Counter {
    start() {
        this.createCounter();
        this.startTime = new Date();
        this.updateCounter();
    }

    stop() {
        const counterElement = document.getElementById('usage-counter');
        if (counterElement) {
            counterElement.remove();
        }
        clearInterval(this.intervalId);
    }

    createCounter() {
        const counterElement = document.createElement('div');
        counterElement.id = 'usage-counter';
        counterElement.style.position = 'fixed';
        counterElement.style.left = '840px';
        counterElement.style.color = 'white';
        counterElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        counterElement.style.padding = '5px';
        counterElement.style.borderRadius = '5px';
        counterElement.style.fontSize = '14px';
        counterElement.style.zIndex = '1';
        counterElement.innerHTML = 'Time in Discord: 00:00:00';
        document.body.appendChild(counterElement);
    }

    updateCounter() {
        this.intervalId = setInterval(() => {
            const currentTime = new Date();
            const elapsedTime = new Date(currentTime - this.startTime);
            const hours = String(elapsedTime.getUTCHours()).padStart(2, '0');
            const minutes = String(elapsedTime.getUTCMinutes()).padStart(2, '0');
            const seconds = String(elapsedTime.getUTCSeconds()).padStart(2, '0');

            const counterElement = document.getElementById('usage-counter');
            if (counterElement) {
                counterElement.innerHTML = `Time in Discord: ${hours}:${minutes}:${seconds}`;
            }
        }, 1000);
    }
};

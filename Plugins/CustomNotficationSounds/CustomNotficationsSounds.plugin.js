/**
 * @name CustomNotificationSounds
 * @author Marshal
 * @description Custom your own notfication push sound effects
 * @version 1.0.0 
 * @authorId 725560508371173377
 */

const { Webpack, Patcher, Settings } = BdApi;

module.exports = class CustomNotificationSounds {
    constructor() {
        this.pluginName = "CustomNotificationSounds";
        this.defaultSettings = {
            sounds: [
                // Example configuration
             { type: "user", id: "123456789012345678", soundUrl: "https://example.com/sound.mp3" },
             { type: "server", id: "1321962678897344684", soundUrl: "https://example.com/sound.mp3" },
 /THERE IS NO PARAMETER THAT INDICATES THE LIMITS, USE WISELY./
            ],
        };
    }

    load() {
        // Attempt to load saved settings. Fallback to defaults if none exists
        this.settings = BdApi.loadData(this.pluginName, "settings") || this.defaultSettings;
        console.log(`${this.pluginName}: Settings loaded successfully.`);
    }

    start() {
        console.log(`${this.pluginName}: Plugin started.`);
        this.patchMessages();
    }

    stop() {
        console.log(`${this.pluginName}: Plugin stopped.`);
        Patcher.unpatchAll(this.pluginName);
    }

    patchMessages() {
        const Dispatcher = Webpack.getModule(m => m.dispatch && m.subscribe);

        if (!Dispatcher) {
            console.error(`${this.pluginName}: Failed to find Dispatcher module. Plugin may not work as intended.`);
            return;
        }

        Patcher.before(this.pluginName, Dispatcher, "dispatch", (thisObject, args) => {
            const event = args[0];

            if (event.type === "MESSAGE_CREATE") {
                const message = event.message;

                const match = this.settings.sounds.find(sound =>
                    (sound.type === "user" && sound.id === message.author.id) ||
                    (sound.type === "server" && sound.id === message.guild_id)
                );

                if (match) {
                    console.log(`${this.pluginName}: Match found. Playing sound for ${match.type} ID ${match.id}`);
                    this.playSound(match.soundUrl);
                } else {
                    console.log(`${this.pluginName}: No matching sound configuration for this event.`);
                }
            }
        });
    }

    playSound(url) {
        if (!url) {
            console.error(`${this.pluginName}: Sound URL is undefined. Check your settings.`);
            return;
        }

        const audio = new Audio(url);
        audio
            .play()
            .then(() => console.log(`${this.pluginName}: Sound played successfully.`))
            .catch(err => console.error(`${this.pluginName}: Failed to play sound.`, err));
    }

    getSettingsPanel() {
        return Settings.SettingPanel.build(
            this.saveSettings.bind(this),
            new Settings.SettingGroup("Custom Sounds Configuration").append(
                new Settings.TextArea(
                    "Custom Sounds JSON",
                    "Define your custom sounds in JSON format. Use the example below as a reference.\n\nExample:\n[\n  { \"type\": \"user\", \"id\": \"123456789012345678\", \"soundUrl\": \"https://example.com/sound.mp3\" }\n]",
                    JSON.stringify(this.settings.sounds, null, 2),
                    value => {
                        try {
                            this.settings.sounds = JSON.parse(value);
                            console.log(`${this.pluginName}: Settings updated successfully.`);
                        } catch (error) {
                            BdApi.alert("Invalid JSON", "The JSON you provided is invalid. Please fix it and try again.");
                            console.error(`${this.pluginName}: Failed to parse settings JSON.`, error);
                        }
                    }
                )
            )
        );
    }

    saveSettings() {
        BdApi.saveData(this.pluginName, "settings", this.settings);
        console.log(`${this.pluginName}: Settings saved successfully.`);
    }
}

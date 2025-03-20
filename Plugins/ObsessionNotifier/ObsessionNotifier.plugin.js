/**
 * @name ObsessionNotifier
 * @author Marshal
 * @version 1.0.0
 * @authorId 725560508371173377
 * @description Alerts you whenever your obsession sends a message (It's actually inspired by DBD Obsession perks lol)
 * @source https://github.com/Qxincess/BetterDiscord-extensions/tree/main/Plugins/ObsessionNotifier
 */

const config = {
  info: {
      name: "ObsessionNotifier",
      authors: [{ name: "Marshal" }],
      version: "1.0.0",
      description: "Notifies you when your obsession messages.",
  }
};

module.exports = class ObsessionNotifier {
  constructor() {
      this.settings = BdApi.loadData(config.info.name, "settings") || {
          obsessions: [],
          highlightColor: "#ff0000",
          notificationEnabled: true
      };
      this.messageHandler = null;
      this.lastNotifiedMessageId = null;
  }

  start() {
      this.patchMessages();
      this.addStyles();
  }

  stop() {
      this.unpatchMessages();
      BdApi.clearCSS("obsession-highlighting");
  }

  patchMessages() {
      const Dispatcher = BdApi.findModuleByProps("dispatch", "subscribe");
      this.messageHandler = (event) => {
          if (event.type === "MESSAGE_CREATE" && this.settings.obsessions.includes(event.message.author.id)) {
              if (this.lastNotifiedMessageId !== event.message.id) {
                  this.notify(event.message.author, event.message.content);
                  this.highlightMessage(event.message.id);
                  this.lastNotifiedMessageId = event.message.id;
              }
          }
      };
      Dispatcher.subscribe("MESSAGE_CREATE", this.messageHandler);
  }

  unpatchMessages() {
      const Dispatcher = BdApi.findModuleByProps("dispatch", "subscribe");
      if (this.messageHandler) {
          Dispatcher.unsubscribe("MESSAGE_CREATE", this.messageHandler);
      }
  }

  notify(user, message) {
      if (this.settings.notificationEnabled) {
          new Notification(`Your obsession sent a message`, {
              body: message,
              icon: user.avatarURL
          });
          BdApi.showToast(`${user.username}: ${message}`, { type: "info", timeout: 5000 });
      }
  }

  highlightMessage(messageId) {
      BdApi.injectCSS("obsession-highlighting", `
          [data-list-id="chat-messages"] [id="chat-messages-${messageId}"] {
              background-color: ${this.settings.highlightColor} !important;
          }
      `);
  }

  addStyles() {
      BdApi.injectCSS("obsession-highlighting", "");
  }

  getSettingsPanel() {
      const panel = document.createElement("div");
      panel.innerHTML = `
          <div style="padding: 10px; display: flex; flex-direction: column; gap: 10px;">
              <label style="color : white;">Obsession User IDs (comma separated):</label>
              <input type="text" id="obsession-ids" value="${this.settings.obsessions.join(", ")}" style="width: 100%; padding: 5px; border-radius: 5px; border: 1px solid #ccc;"/>
              <button id="save-obsessions" style="padding: 5px; border-radius: 5px; cursor: pointer; background: #5865F2; color: white; border: none;">Save</button>
              <label style="color : white;">Highlight Color:</label>
              <input type="color" id="highlight-color" value="${this.settings.highlightColor}" style="width: 100%; cursor: pointer;"/>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                  <label style="color : white;">Enable Notifications:</label>
                  <input type="checkbox" id="notification-enabled" ${this.settings.notificationEnabled ? "checked" : ""}/>
              </div>
          </div>
      `;
      
      panel.querySelector("#save-obsessions").addEventListener("click", () => {
          this.settings.obsessions = panel.querySelector("#obsession-ids").value.split(",").map(id => id.trim());
          this.settings.highlightColor = panel.querySelector("#highlight-color").value;
          this.settings.notificationEnabled = panel.querySelector("#notification-enabled").checked;
          BdApi.saveData(config.info.name, "settings", this.settings);
          BdApi.showToast("Settings Saved!", { type: "success" });
      });
      
      return panel;
  }
};

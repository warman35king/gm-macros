import * as helpers from "./helpers.js";
import { shoulderOfTheMartyrsVow } from "./Shoulder_of_the_Martyr's_Vow.js";
import { skyfang } from "./skyfang.js";
let socket;
Hooks.once("init", function () {
	console.log("GM Macro | Initializing module");

	// Create the namespace
	game.gmmacro = {
		version: "1.0.0",
	};
});

async function socketReady() {
	socket = socketlib.registerModule("gm-macros");
	socket.register("updateActor", helpers.updateActor);
	socket.register("updateToken", helpers.updateToken);
	socket.register("updateItem", helpers.updateItem);
	socket.register("updateActorEffect", helpers.updateActorEffect);
	socket.register("updateItemEffect", helpers.updateItemEffect);
	socket.register("skyfang", skyfang);
	socket.register("shoulderOfTheMartyrsVow", shoulderOfTheMartyrsVow);
}

Hooks.once("socketlib.ready", socketReady);

async function registerAPI() {
	game.gmmacro = {
		...game.gmmacro,
		getSocket: async () => socket,
		updateActor: async (actorId, updateData) =>
			await socket.executeAsGM("updateActor", {
				actorId,
				updateData,
			}),
		updateToken: async (tokenId, updateData) =>
			await socket.executeAsGM("updateToken", {
				tokenId,
				updateData,
			}),
		updateItem: async (actorId, itemId, updateData) =>
			await socket.executeAsGM("updateItem", {
				actorId,
				itemId,
				updateData,
			}),
		updateActorEffect: async (actorId, effectId, updateData) =>
			await socket.executeAsGM("updateActorEffect", {
				actorId,
				effectId,
				updateData,
			}),
		updateItemEffect: async (actorId, itemId, effectId, updateData) =>
			await socket.executeAsGM("updateItemEffect", {
				actorId,
				itemId,
				effectId,
				updateData,
			}),
		skyfang: async (actorId,itemId) =>
			await socket.executeAsGM("skyfang", { actorId,itemId }),
		
		shoulderOfTheMartyrsVow: async (actorId, itemId) =>
			await socket.executeAsGM("shoulderOfTheMartyrsVow", { actorId, itemId }),
		// Add more functions as needed
		// test: async (msg) =>
		// 	await game.gmmacro.socket.executeAsGM("test", { msg }),
	};

	for (let i = 1; i <= 15; i++) {
		console.log(`✅ game.gmmacro API ready. (${i}/15)`);
	}
}

Hooks.once("ready", registerAPI);

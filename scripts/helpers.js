export function updateActor({ actorId, updateData }) {
	const actor = game.actors.get(actorId);
	if (!actor) return ui.notifications.error("Actor not found");
	return actor.update(updateData);
}

export function updateToken({ tokenId, updateData }) {
	const token = canvas.tokens.get(tokenId);
	if (!token) return ui.notifications.error("Token not found");
	return token.document.update(updateData);
}

export function updateItem({ actorId, itemId, updateData }) {
	const actor = game.actors.get(actorId);
	if (!actor) return ui.notifications.error("Actor not found");
	const item = actor.items.get(itemId);
	if (!item) return ui.notifications.error("Item not found on actor");
	return item.update(updateData);
}

export function updateActorEffect({ actorId, effectId, updateData }) {
	const actor = game.actors.get(actorId);
	if (!actor) return ui.notifications.error("Actor not found");
	const effect = actor.effects.get(effectId);
	if (!effect) return ui.notifications.error("Effect not found on actor");
	return effect.update(updateData);
}
export function updateItemEffect({ actorId, itemId, effectId, updateData }) {
	const actor = game.actors.get(actorId);
	if (!actor) return ui.notifications.error("Actor not found");
	const item = actor.items.get(itemId);
	if (!item) return ui.notifications.error("Item not found on actor");
	const effect = item.effects.get(effectId);
	if (!effect) return ui.notifications.error("Effect not found on actor");
	return effect.update(updateData);
}

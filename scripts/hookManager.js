const registeredHooks = {};

export function registerItemHook({ actorId, itemName, hookType, callback }) {
  const key = `${actorId}:${itemName}:${hookType}`;
  if (registeredHooks[key]) return; // Already registered

  const hookId = Hooks.on(hookType, callback);
  registeredHooks[key] = hookId;
}

export function unregisterItemHook({ actorId, itemName, hookType }) {
  const key = `${actorId}:${itemName}:${hookType}`;
  const hookId = registeredHooks[key];
  if (hookId) {
    Hooks.off(hookType, hookId);
    delete registeredHooks[key];
  }
}

export function scanActorsForItem(itemName, hookType, callback) {
  for (const actor of game.actors) {
    const item = actor.items.find(i => i.name === itemName && i.system.equipped);
    if (item) {
      registerItemHook({ actorId: actor.id, itemName, hookType, callback });
    } else {
      unregisterItemHook({ actorId: actor.id, itemName, hookType });
    }
  }
}
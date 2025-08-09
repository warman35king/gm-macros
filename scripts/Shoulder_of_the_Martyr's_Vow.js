export async function shoulderOfTheMartyrsVow({ actorId, itemId }) {
  const actor = game.actors.get(actorId);
  const itemName = "Shoulder of the Martyr's Vow";
  const item = actor.items.get(itemId);
  if (!item) return ui.notifications.error(`Item '${itemName}' not found.`);
  const effects = item.effects.contents;
  const buffOptions = ["Inspire Valor","Radiant Charge","Holy Retaliation"];
  const burdenEffect = effects.find(e=>e.name==="Martyr's Toll");

  const useItem = await Dialog.confirm({
    title: `Use ${item.name}?`,
    content: `<p>Do you want to activate ${item.name}?</p>`,
    yes: () => true,
    no: () => false,
    defaultYes: true,
    render: html => {
      html[0].closest(".app").classList.add("dnd5e", "sheet");
    }
  });

  if (!useItem) {
    ui.notifications.info(`Did not use ${item.name}.`);
    return;
  }

  // Consume 1 use from each activity (if possible)
  if (item.system.activities) {
    for (const [key, activity] of Object.entries(item.system.activities)) {
      if (activity.uses?.value > 0) {
        const newUsesValue = activity.uses.spent + 1;
        await item.update({ [`system.activities.${key}.uses.spent`]: newUsesValue });
      } else {
        ui.notifications.warn(`Activity ${activity.label} has no remaining uses.`);
      }
    }
  }
  if (item.system.uses?.value > 0) {
    const useCharge = await Dialog.confirm({
      title : itemName,
      content: `<p>${itemName} has <strong>${item.system.uses.value}/${item.system.uses.max}</strong> charges. Do you want to use 1 charge to avoid the debuff? </p>`,
      yes: () => true,
      no: () => false,
      defaultYes: true,
      render: html => {
    html[0].closest(".app").classList.add("dnd5e", "sheet");
  },
    });
    if (useCharge) {
      const spentCharges = item.system.spent;
      await item.update({"system.uses.value": spentCharges + 1 });
      const actorBurden = actor.effects.getName(burdenEffect?.name);
      if(!actorBurden.disabled) await burdenEffect.update({"disabled": true});
    }else await burdenEffect.update({"disabled": false});
    
  }else await burdenEffect.update({"disabled": false});
  
  let selectedBuff = null;
  await new Promise((resolve) => {
    new Dialog({
      title: `${itemName} - Choose Buff`,
      content: `
        <form>
          <div class="form-group">
            <label for="buffSelect">Select a buff to apply:</label>
            <select id="buffSelect" name="buffSelect">
              ${buffOptions.map(buff => `<option value="${buff}">${buff}</option>`).join('')}
            </select>
          </div>
        </form>
      `,
      buttons: {
        ok: {
          label: "Apply",
          callback: (html) => {
            selectedBuff = html.find('[name="buffSelect"]').val();
            resolve(true);
          }
        },
        cancel: {
          label: "Cancel",
          callback: () => resolve(false)
        }
      },
      default: "ok",
      close: () => resolve(false)
    }).render(true);
  });

if (!selectedBuff) return ui.notifications.info("Buff selection cancelled.");

  const buffEffect = effects.find(e => e.name === selectedBuff);
  if (!buffEffect) {
    return ui.notifications.error(`Buff '${selectedBuff}' not found on ${itemName}.`);
  }
  
  // Try to get the actor's token on the canvas
const actorToken = canvas.tokens.placeables.find(t => t.actor?.id === actor.id);

if (!actorToken) {
  return ui.notifications.error(`${actor.name} must be present on the scene to use ${itemName}.`);
}

if (selectedBuff === "Inspire Valor") {
  // Find the user's token on canvas
  const actorToken = canvas.tokens.placeables.find(t => t.actor?.id === actor.id);

  if (!actorToken) {
    return ui.notifications.error(`${actor.name} must be present on the scene to use ${itemName}.`);
  }

  // Find nearby allies within 30 feet, same disposition, excluding self
  const allies = canvas.tokens.placeables.filter(token =>
    token.actor?.type === "character" &&
    token.document.disposition === actorToken.document.disposition &&
    token.id !== actorToken.id &&
    canvas.grid.measureDistance(actorToken.center, token.center) <= 30
  );

  if (allies.length === 0) return ui.notifications.warn("No nearby allies to target.");

  const allyOptions = allies.map(t => `<option value="${t.id}">${t.name}</option>`).join("");

  const targetId = await Dialog.prompt({
    title: "Choose Ally",
    content: `<p>Select an ally to receive the buff:</p><select id="allySelect">${allyOptions}</select>`,
    label: "Select",
    callback: html => html.find("#allySelect").val(),
    render: html => html[0].closest(".app").classList.add("dnd5e", "sheet")
  });

  const targetToken = canvas.tokens.get(targetId);
  if (!targetToken) return ui.notifications.error("No valid ally selected.");

  const effectData = duplicate(buffEffect.toObject());
  effectData.origin = `Actor.${actor.id}`;
  effectData.label = selectedBuff;
  effectData.flags = effectData.flags || {};
  effectData.flags.core = effectData.flags.core || {};
  effectData.flags.core.sourceId = actor.uuid;
  effectData.flags.dae = effectData.flags.dae || {};
  effectData.flags.dae.transfer = false;
  effectData.disabled = false;
  effectData.icon = effectData.icon || item.img;

  await targetToken.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
} else {

  const effectData = duplicate(buffEffect.toObject());
  effectData.origin = `Actor.${actor.id}`; // Optional: still links to the source actor
  effectData.label = selectedBuff;
  effectData.flags = effectData.flags || {};
  effectData.flags.core = effectData.flags.core || {};
  effectData.flags.core.sourceId = actor.uuid; // Set source to actor
  effectData.flags.dae = effectData.flags.dae || {};
  effectData.flags.dae.transfer = false; // Ensures it doesn't re-trigger the ItemMacro if DAE is involved
  effectData.disabled = false;
  effectData.icon = effectData.icon || item.img; // Optional: fallback to item icon

  await targetToken.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
}
}
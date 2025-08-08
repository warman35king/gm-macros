export async function silveredSteelPlateSaveHooks() {
    Hooks.on("midi-qol.preCheckSaves", async (workflow) => {
    if (!workflow?.targets?.size) return;

    for (let targetToken of workflow.targets) {
        const targetActor = targetToken.actor;
        const attacker = workflow?.actor;
        if (!targetActor || !attacker) continue;

        // Check if target has effect or item granting bonus
        const item = targetActor.items.find(i => i.name === "Silvered Steel Plate");
        
        if (!item) continue;
        const effect = item.effects.find(e => e.name === "Heathen's be Damned");
        if(!effect)continue;

        const creatureType = attacker.system.details.type.value.toLowerCase();
        const isUndeadOrFiend = creatureType === "fiend" || creatureType === "undead";
        if (!isUndeadOrFiend) continue;

        const description =  workflow.item.system.description.value.toLowerCase()??"";
        const isFrightenOrCharm = description.includes("frighten") || description.includes("charm");

        if (!isFrightenOrCharm) continue;
        await targetActor.setFlag("midi-qol", "advantage.ability.save.all", true);
        await effect.update({disabled:false})
    }
    });
    Hooks.on("midi-qol.RollComplete", async (workflow) => {
    for (let target of workflow.targets) {
        await target.actor.unsetFlag("midi-qol", "advantage.ability.save.all");
    }
    });
}
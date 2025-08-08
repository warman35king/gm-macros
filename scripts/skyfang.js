export async function skyfang({actorId,itemId}){
    const actor = game.actors.get(actorId);
    const item = actor.items.get(itemId);
    const token = item.parent?.getActiveTokens()[0];
    const charges = item.system.uses?.value ?? 0;
    const effect = item.effects.find(e => e.name === "Gleaming Edge");
    const gridSize = canvas.dimensions.size;// pixels per grid square
    const gridDistance = canvas.grid.distance; // feet per square
    const feetToPixels = (feet) => feet * (gridSize / gridDistance);


    if (!effect) {
    return;
    }

    if(!token){
    return;
    }

    function isEnvironmentBright(){
    return !canvas.scene.environment.darknessLevel>0
    }

    function isNearActiveLight(token,elevationThreshold = 1) {
    const tokenCenter = token.center;
    const tokenElevation = token.document.elevation ?? 0;
    
    for (const light of canvas.lighting.placeables) {
        const lightDoc = light.document;

        if (!lightDoc.visible || lightDoc.hidden || light.emitsDarkness) continue;

        const brightRadiusPixels = feetToPixels(lightDoc.config.bright);
        if (brightRadiusPixels<=0) continue;
        
        const lightCenter = light.center;
        const dx = tokenCenter.x - lightCenter.x;
        const dy = tokenCenter.y - lightCenter.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance > brightRadiusPixels) continue;
        const lightElevation = lightDoc.elevation ?? 0;
        const elevationDiff = Math.abs(tokenElevation-lightElevation);
        if(elevationDiff>elevationThreshold) continue;

        const ray = new Ray(lightCenter,tokenCenter);
        if(isLightBlocked(ray,token)) continue;
        return true;
    }
    return false;
    }

    function isLightBlocked(ray,token) {
    const tokenCenter = token.center
    for (const wall of canvas.walls.placeables) {
        const type = wall.document.light ?? 0;
        if (type === 0) continue;

        const [x1, y1, x2, y2] = wall.document.c;
        const wallSegment = new Ray({ x: x1, y: y1 }, { x: x2, y: y2 });

        if (!foundry.utils.lineSegmentIntersects(ray.A, ray.B, wallSegment.A, wallSegment.B)) continue;

        const dir = wall.document.dir ?? 0;
        if (dir !== 0) {
        const wallVec = { x: x2 - x1, y: y2 - y1 };
        const tokenVec = { x: tokenCenter.x - x1, y: tokenCenter.y - y1 };
        const normal = { x: -wallVec.y, y: wallVec.x }; // Left-hand normal

        const dot = (tokenVec.x * normal.x + tokenVec.y * normal.y);
        if ((dir === 1 && dot < 0) || (dir === 2 && dot > 0)) continue; // Wrong side for blocking
        }

        // Distance check if needed
        const threshold = wall.document.threshold?.light ?? 0;
        const dist = canvas.grid.measureDistance(tokenCenter, wallSegment.project(tokenCenter));

        if (type === 20) return true;
        if (type === 30 && dist > threshold) return true; // Proximity block when outside range
        if (type === 40 && dist <= threshold) return true; // Reverse Proximity block when inside range
    }

    return false;
    }

    if((isNearActiveLight(token)||isEnvironmentBright())&&charges>0){
    await item.update({ "system.uses.spent": 1 });
    await effect.update({disabled:false})
    ui.notifications.info("Gleaming Edge reactivated")
    }
}


if (!item?.system?.activities) {
  ui.notifications.warn("This item has no activities.");
  return;
}
const activitiesEntries = [...item.system.activities.entries()];
console.log("Activities entries:", activitiesEntries)
const activities = activitiesEntries
  .filter(([_, a]) => {
    const isReaction = a.activation?.type === "reaction";
    if (isReaction) console.debug("Skipping reaction activity:", a.name);
    return a?.name && !isReaction;
  })
  .map(([key, activity]) => ({
    id: key,
    name: activity.name,
    type: activity.activation?.type ?? "special",
    cost: activity.activation?.cost ?? 1
  }));
console.log(activities)
if (activities.length === 0) {
  ui.notifications.warn("This item has no usable activities.");
  return;
}

const content = `<form>
  <div class="form-group">
    <label>Choose Activity:</label>
    <select id="activitySelect" name="activity">
      ${activities.map(a => `<option value="${a.id}">${a.name} (${a.type}, cost: ${a.cost})</option>`).join('')}
    </select>
  </div>
</form>`;

new Dialog({
  title: `${item.name} - Choose Activity`,
  content,
  buttons: {
    use: {
      icon: '<i class="fas fa-bolt"></i>',
      label: "Use Activity",
      callback: async (html) => {
        const selectedId = html.find("#activitySelect")[0]?.value;
        console.log(selectedId)
        const activity = item.system.activities.get(selectedId);
        console.log(activity)

        if (!activity) {
          ui.notifications.error("Invalid activity selected.");
          return;
        }
        const config = {
          midiOptions: {
            configureDialog: true
          },
          event: new MouseEvent("click")
        };
        console.log("Using activity:", activity.name);
        try {
          await activity.use(config, {}, {});
          console.log("✅ Activity used successfully.");
        } catch (err) {
          console.error("❌ Error using activity:", err);
        }
        console.log("Activity used successfully.");
      }
    },
    cancel: {
      label: "Cancel"
    }
  },
  default: "use"
}).render(true);
const useItem = await Dialog.confirm({
  title: "Use Item",
  content: `<p>Do you want to use ${item.name}?</p>`,
  yes: () => true,
  no: () => false
});
if (!useItem) return;

const itemCharges = item.system.uses?.value ?? 0;

let useCharge = false;

if (itemCharges > 0) {
  useCharge = await Dialog.confirm({
    title: "Use a Charge?",
    content: `<p>Item has ${itemCharges} charge(s). Use one?</p>`,
    yes: () => true,
    no: () => false
  });
}

const activityName = useCharge ? "Vow of no Exposure" : "Vow of Exposure";
const activities = item.system.activities ?? {};
const activity = Object.values(activities).find(a => a.name === activityName);

if (!activity) return;

await activity.use({}, {}, {});

if (useCharge) {
  await item.update({ "system.uses.value": itemCharges - 1 });
}
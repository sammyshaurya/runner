const fs = require('fs');
const csv = require('csv-parser');

const FILE_NAME = 'dataStore_fixed.csv';
const SKIP = 70000; // default skip 70k

const rows = [];
let count = 0;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

fs.createReadStream(FILE_NAME)
  .pipe(csv())
  .on('data', (row) => {
    count++;

    if (count <= SKIP) return;

    rows.push(row);
  })
  .on('end', async () => {
    console.log(`Total rows read: ${count}`);
    console.log(`Skipped: ${SKIP}`);
    console.log(`Processing: ${rows.length}`);

    let success = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const body = {
        value: {
          materialNumber: row["Material Number"],
          materialType: row["Material Type"],
          materialGroup: row["Material Group"],
          materialDescription: row["Material Description"],
          netWeight: row["Net Weight"],
          volumetricWeight: row["Volumetric Weight"],
          plantID: row["Plant ID"],
          plannedDeliveryTimeMinutes: row["Planned Delivery Time (Minutes)"],
          productHierarchy: row["Product Hierarchy"],
          grossWeight: row["Gross Weight"],
          length: row["Length"],
          width: row["Width"],
          height: row["Height"],
          materialNameUS: row["Material Name US"],
          materialNameCA: row["Material Name CA"],
          materialNameFRCA: row["Material Name FR CA"],
          materialImage: row["Material Image"],
          timeToInstallMinutes: row["Time To Install (Minutes)"]
        },
        lookupStoreId: {
          key: row["Material Code"],
          lookupStoreMasterId: "material-master",
          createdByOrg: "2e313d3e-b14f-4a17-a41a-c5e03c5240ee"
        }
      };

      try {
        const res = await fetch('https://api-staging.fareyeconnect.com/setu/lookup-store-data', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer c598a5b7-f64b-412a-bcaf-43712a8a8817", // ✅ from GitHub secret
            'current-organization': '2e313d3e-b14f-4a17-a41a-c5e03c5240ee'
          },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          success++;
        } else {
          failed++;
          const errText = await res.text();
          console.error(`❌ ${row["Material Code"]} → ${res.status}`, errText);
        }

        console.log(`[#${i + 1}] ${row["Material Code"]} → ${res.status}`);

      } catch (err) {
        failed++;
        console.error(`❌ Error for ${row["Material Code"]}`, err.message);
      }

      // ⏱️ prevent rate limit
      await sleep(100); // 100ms delay
    }

    console.log("\n===== SUMMARY =====");
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log("Done 🚀");
  });
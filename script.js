const fs = require('fs');
const csv = require('csv-parser');

const rows = [];

fs.createReadStream('dataStore_fixed.csv')
  .pipe(csv())
  .on('data', (row) => rows.push(row))
  .on('end', async () => {
    console.log(`Processing ${rows.length} rows...`);

    for (const row of rows) {
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
            'Authorization': "Bearer c598a5b7-f64b-412a-bcaf-43712a8a8817",
            'current-organization': '2e313d3e-b14f-4a17-a41a-c5e03c5240ee'
          },
          body: JSON.stringify(body)
        });

        const data = await res.text();

        console.log(`✅ ${row["Material Code"]} → ${res.status}`);
      } catch (err) {
        console.error(`❌ Error for ${row["Material Code"]}`, err);
      }
    }

    console.log("Done 🚀");
  });
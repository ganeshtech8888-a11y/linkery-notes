import mongoose from "mongoose";

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌  MONGO_URI is not set");
  process.exit(1);
}

const TARGET_DB  = "linkery-notes";
const TARGET_COL = "memos";

const SOURCES = [
  { db: "pulse-memo-pro", col: "memos" },
  { db: "pulse-memo-pro", col: "notes" },
];

async function run() {
  const conn = await mongoose.createConnection(uri as string).asPromise();
  console.log("✅  Connected to MongoDB Atlas\n");

  const targetDb  = conn.useDb(TARGET_DB, { useCache: true });
  const targetCol = targetDb.collection(TARGET_COL);

  const existingCount = await targetCol.countDocuments();
  console.log(`📋  Target '${TARGET_DB}.${TARGET_COL}' already has ${existingCount} doc(s)\n`);

  let totalMigrated = 0;

  for (const src of SOURCES) {
    try {
      const sourceCol = conn.useDb(src.db, { useCache: true }).collection(src.col);
      const docs = await sourceCol.find({}).toArray();

      console.log(`🔍  '${src.db}.${src.col}' → ${docs.length} doc(s) found`);
      if (docs.length === 0) continue;

      const existingIds = new Set(
        (await targetCol.find({}, { projection: { _id: 1 } }).toArray()).map(
          (d: any) => d._id.toString()
        )
      );

      const newDocs = docs.filter((d: any) => !existingIds.has(d._id.toString()));
      console.log(`   ↳  ${newDocs.length} new | ${docs.length - newDocs.length} duplicate(s) skipped`);

      if (newDocs.length > 0) {
        const result = await targetCol.insertMany(newDocs, { ordered: false });
        console.log(`   ✅  Inserted ${result.insertedCount} doc(s)`);
        totalMigrated += result.insertedCount;
      }
    } catch (err: any) {
      console.log(`   ⚠️   '${src.db}.${src.col}' skipped — ${err.codeName ?? err.message}`);
    }
  }

  const finalCount = await targetCol.countDocuments();
  console.log(`\n🎉  Migration complete — ${totalMigrated} new doc(s) migrated`);
  console.log(`📊  '${TARGET_DB}.${TARGET_COL}' now contains ${finalCount} total doc(s)`);

  if (finalCount > 0) {
    console.log("\n📄  Sample (up to 3):");
    const sample = await targetCol.find({}).limit(3).toArray();
    sample.forEach((doc: any, i: number) => {
      console.log(`   [${i + 1}] ${doc.title ?? "(no title)"} — ${doc.url}`);
    });
  }

  await conn.close();
  console.log("\n🔌  Connection closed");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

import app from './app';
const mongoose = require('mongoose');
import cron from "node-cron";
import { deleteExpiredEntriesAndAssociatedData } from './controllers/timeControllers';

const DB = process.env.DATABASE?.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD || ""
  ) || ""; 
  
  mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'));

const PORT = process.env.PORT || 5000;

cron.schedule("0 0 * * *", async () => {
  console.log("Running cron job to clean up expired entries...");
  try {
      await deleteExpiredEntriesAndAssociatedData({} as any, {} as any); 
  } catch (error) {
      console.error("Error during scheduled cleanup:", error);
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
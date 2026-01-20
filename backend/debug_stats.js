import mongoose from 'mongoose';
import Invoice from './src/models/Invoice.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Get the most recent invoice
        const recent = await Invoice.findOne().sort({ createdAt: -1 });
        if (!recent) {
            console.log('No invoices at all.');
            return;
        }

        console.log('--- RECENT INVOICE ---');
        console.log('ID:', recent.invoiceIds);
        console.log('Amount:', recent.paidAmount);
        console.log('CreatedAt (UTC):', recent.createdAt);
        console.log('InvoiceDate:', recent.invoiceDate);

        // 2. Simulate Frontend Range for "Today" (Assuming IST ~ UTC+5.5)
        // If frontend sends: 2025-12-31T00:00:00 local
        // Start: 2025-12-30T18:30:00.000Z
        // End: 2025-12-31T18:29:59.999Z

        const todayStartStr = new Date().toLocaleDateString('en-CA'); // e.g. 2025-12-31

        // Emulate what frontend does:
        const localStart = new Date(todayStartStr + 'T00:00:00');
        const start = new Date(localStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(localStart);
        end.setHours(23, 59, 59, 999);

        const from = start.toISOString();
        const to = end.toISOString();

        console.log('--- FILTER RANGE ---');
        console.log('From (UTC):', from);
        console.log('To (UTC):', to);

        // 3. Test Match
        const isMatch = recent.createdAt >= new Date(from) && recent.createdAt <= new Date(to);
        console.log('Does recent invoice match range?', isMatch);

        // 4. Run Aggregation
        const matchStage = {
            createdAt: { $gte: new Date(from), $lte: new Date(to) }
        };
        const stats = await Invoice.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$paidAmount" },
                }
            }
        ]);
        console.log('Aggregation Result:', stats);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
};

run();

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const TABLE = process.env.SUPABASE_TABLE || 'tartans';
const NAME_COL = process.env.SUPABASE_NAME_COLUMN || 'name';
const URL_COL = process.env.SUPABASE_URL_COLUMN || 'image_url';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    console.error('Missing Supabase credentials. Check your .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

// Strip BOM from the first header and normalize names
const normalizeHeader = (header) =>
    header.replace(/^\uFEFF/, '').trim(); // remove BOM and trim

const rows = [];
fs.createReadStream('1783.csv')
    .pipe(csv({
        mapHeaders: ({ header }) => normalizeHeader(header)
    }))
    .on('data', (row) => rows.push(row))
    .on('end', async () => {
        console.log(`CSV loaded: ${rows.length} rows. Starting updates...`);

        for (const r of rows) {
            // Fallback in case headers are slightly off
            const tartanName =
                (r.tartan_name ?? r['\uFEFFtartan_name'] ?? '').trim();
            const imageUrl = (r.image_url ?? '').trim();

            if (!tartanName || !imageUrl) {
                console.warn('Skipping invalid row:', r);
                continue;
            }

            const { error, data } = await supabase
                .from(TABLE)
                .update({ [URL_COL]: imageUrl })
                .eq(NAME_COL, tartanName)
                .select('*'); // so we can verify matches

            if (error) {
                console.error(`❌ ${tartanName}: ${error.message}`);
            } else if (!data || data.length === 0) {
                console.warn(`⚠️ No matching record found for "${tartanName}"`);
            } else {
                console.log(`✅ Updated "${tartanName}" (${data.length} row${data.length > 1 ? 's' : ''})`);
            }
        }

        console.log('🎉 All updates attempted.');
    })
    .on('error', (err) => {
        console.error('Failed to read CSV:', err.message);
        process.exit(1);
    });
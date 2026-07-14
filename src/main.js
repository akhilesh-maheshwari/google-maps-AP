import { Actor } from 'apify';

await Actor.init();

try {

  // ──────────────────────────────
  // 1. GET INPUT
  // ──────────────────────────────
  const input          = await Actor.getInput();
  const serviceTagName = input.fileName    || '';
  const searchTerms    = input.searchTerms || [];
  const location       = input.location    || '';
  const maxPlaces      = input.maxPlaces   || 150;
  const language       = input.language    || 'en';
  const includeReviews = input.includeReviews ?? false;
  const maxReviews     = input.maxReviews  || 10;
  const includeImages  = input.includeImages ?? false;

  const serviceName    = 'Google Maps Scraper';
  const serviceOption1 = 'google-maps';
  const requestSource  = 'Google_Maps_Scraper_AP';
  const boomerangInputUrl = 'https://maps.boomerangserver.co.in/webhook/submit-scrap';
  const boomerangStatUrl  = 'https://maps.boomerangserver.co.in/webhook/scrape-status-abhijit';

  console.log('Tag Name     :', serviceTagName);
  console.log('Service      :', serviceName);
  console.log('Search Terms :', searchTerms.length);
  console.log('Location     :', location);
  console.log('Max Places   :', maxPlaces);
  console.log('Language     :', language);

  if (!serviceTagName.trim()) throw new Error('fileName is required!');
  if (!searchTerms.length)    throw new Error('At least one search term is required!');
  if (!location.trim())       throw new Error('Location is required!');

  // ──────────────────────────────
  // 2. VALIDATE + CLEAN SEARCH TERMS
  // ──────────────────────────────
  const validTerms = searchTerms
    .map(t => (typeof t === 'string' ? t.trim() : ''))
    .filter(t => t.length > 0);

  console.log('Valid Terms:', validTerms.length);
  if (!validTerms.length) throw new Error('No valid search terms found!');

  const rowCount   = validTerms.length;
  const csvContent = 'searchTerm\n' + validTerms.join('\n');
  const fileName   = serviceTagName.replace(/[^a-zA-Z0-9]/g, '_') + '_' + new Date().toISOString().replace(/[:.]/g, '-') + '.csv';

  console.log('CSV preview:\n', csvContent.split('\n').slice(0, 4).join('\n'));

  // ──────────────────────────────
  // 3. GET APIFY RUN DETAILS
  // ──────────────────────────────
  const env    = Actor.getEnv();
  const userId = env.userId     || 'unknown';
  const runId  = env.actorRunId || 'unknown';
  const now    = new Date();
  const time   = now.toLocaleString('en-US', {
    year    : 'numeric',
    month   : 'long',
    day     : 'numeric',
    hour    : 'numeric',
    minute  : '2-digit',
    hour12  : true,
    timeZone: 'Asia/Kolkata'
  });

  console.log('User ID :', userId);
  console.log('Run ID  :', runId);
  console.log('Time    :', time);

  // ──────────────────────────────
  // 4. CALCULATE COST
  // ──────────────────────────────
  const PRICE_PER_PLACE = 0.005;
  const totalPlaces     = rowCount * maxPlaces;
  const creditsCost     = parseFloat((totalPlaces * PRICE_PER_PLACE).toFixed(3));

  console.log('Search Terms   :', rowCount);
  console.log('Max per term   :', maxPlaces);
  console.log('Total places   :', totalPlaces);
  console.log('Credits cost   : $', creditsCost);

  // ──────────────────────────────
  // 5. FETCH DRIVE CSV + PUSH ROWS
  // ──────────────────────────────
  const fetchAndPushDriveData = async (outputLink, batch_number) => {
    try {
      const fileIdMatch = outputLink.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!fileIdMatch) {
        console.log(`  Batch ${batch_number} -- Could not extract file ID from Drive link.`);
        return 0;
      }
      const fileId = fileIdMatch[1];
      const csvUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      console.log(`  Batch ${batch_number} -- Fetching CSV from Drive...`);
      const csvRes  = await fetch(csvUrl, { signal: AbortSignal.timeout(60000) });
      const csvText = await csvRes.text();

      const parseCSV = (text) => {
        const rows    = [];
        let current   = '';
        let inQuotes  = false;
        let fields    = [];

        for (let i = 0; i < text.length; i++) {
          const char     = text[i];
          const nextChar = text[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            fields.push(current.trim());
            current = '';
          } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
            if (char === '\r') i++;
            fields.push(current.trim());
            rows.push(fields);
            fields  = [];
            current = '';
          } else {
            current += char;
          }
        }

        if (current || fields.length) {
          fields.push(current.trim());
          if (fields.some(f => f !== '')) rows.push(fields);
        }

        return rows;
      };

      const rows    = parseCSV(csvText);
      const headers = rows[0];
      const data    = rows.slice(1);

      console.log(`  Batch ${batch_number} -- ${data.length} rows found. Pushing to dataset...`);

      const items = [];
      for (const row of data) {
        if (!row.some(f => f !== '')) continue;
        const rowObj = {};
        headers.forEach((h, i) => { rowObj[h] = row[i] !== undefined ? row[i] : ''; });
        items.push(rowObj);
      }
      if (items.length > 0) {
        await Actor.pushData(items);
      }

      console.log(`  Batch ${batch_number} -- ${items.length} rows saved to dataset.`);
      return items.length;
    } catch (err) {
      console.log(`  Batch ${batch_number} -- Failed to fetch Drive data: ${err.message}`);
      return 0;
    }
  };

  // ──────────────────────────────
  // 6. STEP 1 -- TRIGGER WORKFLOW 1
  // ──────────────────────────────
  console.log('\n====================================');
  console.log('Step 1 : Setting up master & batches');
  console.log('====================================');

  let wf1Res;
  try {
    wf1Res = await fetch(
      'https://frontend.boomerangserver.co.in/webhook/Universal_masterflow',
      {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal : AbortSignal.timeout(300000),
        body   : JSON.stringify({
          userId,
          runId,
          time,
          serviceTagName,
          rowCount,
          creditsCost,
          csvContent,
          uploadedFile     : '',
          fileName,
          boomerangInputUrl,
          service_option_1 : serviceOption1,
          service_name     : serviceName,
          request_source   : requestSource,
          location,
          maxPlaces,
          language,
          includeReviews,
          maxReviews       : includeReviews ? maxReviews : 0,
          includeImages
        })
      }
    );
  } catch (fetchErr) {
    throw new Error(`Step 1 failed: ${fetchErr.message}`);
  }

  const wf1Text = await wf1Res.text();
  console.log('n8n step 1 status  :', wf1Res.status);
  console.log('n8n step 1 response:', wf1Text);

  if (!wf1Res.ok) throw new Error(`Step 1 error ${wf1Res.status}: ${wf1Text.slice(0, 200)}`);

  let wf1Data;
  try {
    wf1Data = JSON.parse(wf1Text);
  } catch (e) {
    throw new Error(`Step 1 JSON parse failed: ${wf1Text.slice(0, 200)}`);
  }

  const request_unique_id = wf1Data.request_unique_id || '';
  const masterFileUrl     = wf1Data.masterFileUrl     || '';
  const total_batches     = parseInt(wf1Data.total_batches || '0');
  const batchFolderId     = wf1Data.batchFolderId     || '';
  const nocodb_master_id  = wf1Data.nocodb_master_id  || '';
  const batch_id          = wf1Data.batch_id          || '';

  if (!request_unique_id) throw new Error('No request_unique_id returned from Step 1!');

  console.log('\nStep 1 Complete!');
  console.log('   Request ID    :', request_unique_id);
  console.log('   Master File   :', masterFileUrl);
  console.log('   Total Batches :', total_batches);

  // ──────────────────────────────
  // 7. STEP 2 -- PROCESS BATCHES
  // ──────────────────────────────
  let completedBatches = 0;
  let round            = 0;
  let allOutputLinks   = [];
  let allBatchResults  = [];
  let totalCharged     = 0;

  const getNextBatchJobs = async () => {
    try {
      const wf2Res = await fetch(
        'https://frontend.boomerangserver.co.in/webhook/universal_batch_process',
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal : AbortSignal.timeout(300000),
          body   : JSON.stringify({
            request_unique_id,
            batchFolderId,
            userId,
            runId,
            time,
            serviceTagName,
            rowCount,
            creditsCost,
            boomerangInputUrl,
            service_option_1 : serviceOption1,
            service_name     : serviceName,
            entity           : validTerms.join(','),
            location,
            max_results      : maxPlaces,
            request_source   : requestSource
          })
        }
      );
      const wf2Text = await wf2Res.text();
      console.log('n8n step 2 status  :', wf2Res.status);
      console.log('n8n step 2 response:', wf2Text);
      if (!wf2Text || wf2Text.trim() === '') return null;
      const wf2Data = JSON.parse(wf2Text);
      return wf2Data.batchJobs || null;
    } catch (err) {
      console.log('No response, please try again.');
      return null;
    }
  };

  let batchJobs = await getNextBatchJobs();

  while (!batchJobs || batchJobs.length === 0) {
    console.log('No slots available (backend full). Waiting 2 mins before retry...');
    await new Promise(r => setTimeout(r, 2 * 60 * 1000));
    batchJobs = await getNextBatchJobs();
  }

  while (batchJobs && batchJobs.length > 0) {

    round++;
    console.log(`\n====================================`);
    console.log(`Step 2 : Round ${round} -- ${batchJobs.length} batch(es)`);
    console.log(`         Processed so far : ${allBatchResults.length}/${total_batches}`);
    console.log(`====================================`);

    console.log(`\n  Sending ${batchJobs.length} batches to n8n for status checking...`);

    const batchStatusResults = await Promise.all(
      batchJobs.map(async (job) => {
        const { request_id, driveInputLink, batch_number, nocodb_id } = job;
        console.log(`  Batch ${batch_number} -- Polling status (request_id: ${request_id})...`);

        const maxAttempts  = 10;
        const pollInterval = 180000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            const statusRes = await fetch(
              'https://frontend.boomerangserver.co.in/webhook/Status_and_output_universal',
              {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal : AbortSignal.timeout(120000),
                body   : JSON.stringify({
                  request_id,
                  batch_number,
                  driveInputLink,
                  request_unique_id,
                  batchFolderId,
                  boomerangStatUrl,
                  userId,
                  runId,
                  time,
                  serviceTagName,
                  rowCount   : job.batch_size || rowCount,
                  creditsCost
                })
              }
            );
            const statusText = await statusRes.text();

            if (statusText.includes('<html>') || statusText.includes('504')) {
              console.log(`  Batch ${batch_number} -- 504, retrying (${attempt}/${maxAttempts})...`);
              await new Promise(r => setTimeout(r, pollInterval));
              continue;
            }

            const statusData = JSON.parse(statusText);
            console.log(`  Batch ${batch_number} status:`, statusData.status);

            if (statusData.status === 'Completed' || statusData.status === 'Failed') {
              return { ...statusData, job };
            }

            console.log(`  Batch ${batch_number} still processing, attempt ${attempt}/${maxAttempts}. Waiting 3 min...`);
            await new Promise(r => setTimeout(r, pollInterval));

          } catch (err) {
            console.log(`  Batch ${batch_number} poll error (attempt ${attempt}): ${err.message}`);
            await new Promise(r => setTimeout(r, pollInterval));
          }
        }

        console.log(`  Batch ${batch_number} timed out after ${maxAttempts} attempts.`);

        try {
          await fetch(
            'https://frontend.boomerangserver.co.in/webhook/Status_and_output_universal',
            {
              method : 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal : AbortSignal.timeout(30000),
              body   : JSON.stringify({
                userId,
                runId,
                time,
                serviceTagName,
                rowCount          : job.batch_size || rowCount,
                creditsCost,
                request_id,
                requestStatus     : 'Error',
                driveInputLink,
                boomerangOutputUrl: `https://maps.boomerangserver.co.in/webhook/scrape-download-abhijit?request_id=${request_id}`,
                batch_number,
                request_unique_id,
                batchFolderId,
                service_option_1  : serviceOption1,
                service_name      : serviceName,
                request_source    : requestSource,
                reason            : `Timed out after ${maxAttempts} attempts`
              })
            }
          );
          console.log(`  Batch ${batch_number} -- Error status sent to webhook.`);
        } catch (err) {
          console.log(`  Batch ${batch_number} -- Failed to notify webhook: ${err.message}`);
        }

        return { status: 'Error', job };
      })
    );

    const hasTimeout = batchStatusResults.some(r => r.status === 'GatewayTimeout');
    if (hasTimeout) {
      console.log('\n504 Gateway Timeout -- stopping. Please try again.');
      break;
    }

    const batchResults = [];

    for (const result of batchStatusResults) {
      const { job } = result;
      const { request_id, driveInputLink, batch_number, nocodb_id } = job;

      if (result.status !== 'Completed') {
        console.log(`  Batch ${batch_number} did not complete. Skipping output.`);
        const failedResult = {
          batch_number,
          request_id,
          status       : result.status || 'Error',
          places_found : 0,
          output_url   : ''
        };
        batchResults.push(failedResult);
        allOutputLinks.push('');
        console.log(`  Batch ${batch_number} (failed) -- skipped dataset push to preserve column order.`);
        continue;
      }

      const boomerangOutputUrl = `https://maps.boomerangserver.co.in/webhook/scrape-download-abhijit?request_id=${request_id}`;

      let outputLink = '';
      try {
        const outputRes = await fetch(
          'https://frontend.boomerangserver.co.in/webhook/Status_and_output_universal',
          {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal : AbortSignal.timeout(60000),
            body   : JSON.stringify({
              userId,
              runId,
              time,
              serviceTagName,
              rowCount         : job.batch_size || rowCount,
              creditsCost,
              request_id,
              requestStatus    : result.status,
              driveInputLink,
              boomerangOutputUrl,
              batch_number,
              request_unique_id,
              batchFolderId,
              service_option_1 : serviceOption1,
              service_name     : serviceName,
              request_source   : requestSource
            })
          }
        );
        const outputText = await outputRes.text();
        console.log(`  Batch ${batch_number} output raw response:`, outputText);
        if (outputRes.ok) {
          try {
            const outputData = JSON.parse(outputText);
            outputLink = outputData['Output Link'] || outputData.outputLink || outputData.driveOutputLink || outputData.webViewLink || '';
          } catch (e) {
            console.log(`  Batch ${batch_number} output parse failed.`);
          }
        } else {
          console.log(`  No response, please try again.`);
        }
      } catch (fetchErr) {
        console.log(`  No response, please try again.`);
      }

      batchResults.push({
        batch_number,
        request_id,
        status       : result.status,
        places_found : result.places_found || 0,
        output_url   : outputLink
      });
      allOutputLinks.push(outputLink);

      // ──────────────────────────────
      // CHARGE-AFTER-DELIVERY
      // Fetch Drive rows FIRST, then charge.
      // ──────────────────────────────
      let rowsPushed = 0;
      if (outputLink) {
        rowsPushed = await fetchAndPushDriveData(outputLink, batch_number);
      } else {
        console.log(`  Batch ${batch_number} -- No output link, skipping Drive fetch and charge.`);
      }

      if (rowsPushed > 0) {
        const batchCost = parseFloat((rowsPushed * PRICE_PER_PLACE).toFixed(3));
        totalCharged   += batchCost;
        console.log(`  Batch ${batch_number} -- Charging for ${rowsPushed} places ($${batchCost}). Total charged: $${totalCharged.toFixed(3)}`);
        await Actor.charge({ eventName: serviceOption1, count: rowsPushed });
      } else {
        console.log(`  Batch ${batch_number} -- 0 rows pushed, skipping charge.`);
      }
    }

    console.log(`\nRound ${round} Results:`);
    for (const result of batchResults) {
      console.log(`\n   Batch ${result.batch_number}`);
      console.log(`      Request ID  : ${result.request_id}`);
      console.log(`      Status      : ${result.status}`);
      console.log(`      Output Link : ${result.output_url}`);
    }

    allBatchResults = allBatchResults.concat(batchResults);

    console.log(`\nChecking for next pending batch...`);
    batchJobs = await getNextBatchJobs();

    if (!batchJobs || batchJobs.length === 0) {
      console.log('No more pending batches -- all done!');
      break;
    }
  }

  // ──────────────────────────────
  // 8. FINAL SUMMARY
  // ──────────────────────────────
  const completedCount = allBatchResults.filter(b => b.status === 'Completed').length;
  const errorCount     = allBatchResults.filter(b => b.status !== 'Completed').length;

  console.log('\n====================================');
  console.log('ALL BATCHES COMPLETED!');
  console.log('====================================');
  console.log('Run ID          :', runId);
  console.log('Total Processed :', allBatchResults.length);
  console.log('Completed       :', completedCount);
  console.log('Errors          :', errorCount);
  console.log('Total Charged   : $', totalCharged.toFixed(3));
  console.log('\nOutput Links:');
  allOutputLinks.forEach((link, i) => console.log(`  Batch ${i + 1} : ${link || 'Failed'}`));
  console.log('====================================');

} catch (err) {
  console.log('Error:', err.message);
}

await Actor.exit();

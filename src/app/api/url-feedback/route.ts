import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Reuse the pool connection logic from the scan-url route
let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    const host = process.env.POSTGRES_HOST;
    const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
    const database = process.env.POSTGRES_DATABASE;
    const user = process.env.POSTGRES_USER;
    const password = process.env.POSTGRES_PASSWORD;

    if (!host || !database || !user || !password) {
      console.error('Missing PostgreSQL connection details in environment variables');
      return null;
    }

    try {
      pool = new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: {
          // Disable certificate validation to resolve self-signed certificate issue
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000, // 10 seconds
      });

      pool.on('error', (err) => {
        console.error('PostgreSQL pool error:', err);
        pool = null; // Reset pool on error
      });
    } catch (err) {
      console.error('Failed to create PostgreSQL pool:', err);
      return null;
    }
  }
  return pool;
}

export async function POST(request: Request) {
  try {
    const { url, originalVerdict, userVerdict, comment } = await request.json();

    // Basic validation
    if (!url || !originalVerdict || !userVerdict) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate verdict values
    const validVerdicts = ['Safe', 'Suspicious', 'Malicious'];
    if (!validVerdicts.includes(userVerdict)) {
      return NextResponse.json({ error: 'Invalid user verdict' }, { status: 400 });
    }

    console.log(`Received feedback for URL: ${url} - Original: ${originalVerdict}, User: ${userVerdict}`);

    // Get client IP for tracking (optional)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    const db = getPool();
    if (!db) {
      console.error('Database connection not available');
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }

    // Check if feedback for this URL and user verdict already exists
    // We use ON CONFLICT to handle race conditions atomically
    const upsertQuery = `
      INSERT INTO url_scan_feedback (
        url, original_verdict, user_verdict, user_comment, user_ip, feedback_count
      ) VALUES ($1, $2, $3, $4, $5, 1)
      ON CONFLICT (url, user_verdict) 
      DO UPDATE SET 
        feedback_count = url_scan_feedback.feedback_count + 1,
        submitted_at = NOW(),
        user_comment = COALESCE($4, url_scan_feedback.user_comment)
      RETURNING id, feedback_count
    `;
    
    const upsertResult = await db.query(upsertQuery, [
      url, 
      originalVerdict,
      userVerdict,
      comment || null,
      ip
    ]);
    
    const feedbackId = upsertResult.rows[0].id;
    console.log(`Processed feedback #${feedbackId}, new count: ${upsertResult.rows[0].feedback_count}`);

    // Get total feedback count by verdict for this URL
    const statsQuery = `
      SELECT user_verdict, SUM(feedback_count) as count
      FROM url_scan_feedback
      WHERE url = $1
      GROUP BY user_verdict
      ORDER BY count DESC
    `;
    
    const statsResult = await db.query(statsQuery, [url]);
    
    // Calculate majority verdict if available
    let majorityVerdict = null;
    let totalFeedbacks = 0;
    
    if (statsResult.rows.length > 0) {
      totalFeedbacks = statsResult.rows.reduce((acc, row) => acc + parseInt(row.count), 0);
      majorityVerdict = statsResult.rows[0].user_verdict; // Top verdict by count
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      feedbackStats: statsResult.rows.map(row => ({
        user_verdict: row.user_verdict,
        count: parseInt(row.count)
      })),
      totalFeedbacks,
      majorityVerdict
    });

  } catch (error) {
    console.error('Error recording feedback:', error);
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}

// Also support GET to retrieve feedback stats for a URL
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }
  
  try {
    const db = getPool();
    if (!db) {
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
    }
    
    // Get feedback stats for this URL
    const statsQuery = `
      SELECT user_verdict, SUM(feedback_count) as count
      FROM url_scan_feedback
      WHERE url = $1
      GROUP BY user_verdict
      ORDER BY count DESC
    `;
    
    const statsResult = await db.query(statsQuery, [url]);
    
    // Calculate majority verdict and total
    let majorityVerdict = null;
    let totalFeedbacks = 0;
    
    if (statsResult.rows.length > 0) {
      totalFeedbacks = statsResult.rows.reduce((acc, row) => acc + parseInt(row.count), 0);
      majorityVerdict = statsResult.rows[0].user_verdict;
    }
    
    return NextResponse.json({
      url,
      feedbackStats: statsResult.rows.map(row => ({
        user_verdict: row.user_verdict,
        count: parseInt(row.count)
      })),
      totalFeedbacks,
      majorityVerdict,
      hasFeedback: statsResult.rows.length > 0
    });
    
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback stats' }, { status: 500 });
  }
} 
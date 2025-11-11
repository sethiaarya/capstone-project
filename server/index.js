// server/index.js
import express from "express";
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGURL,
  ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Health
app.get("/api/health", async (_req,res)=>{
  try{ await pool.query("select 1"); res.json({ok:true}); }
  catch(e){ res.status(500).json({ok:false,error:String(e)}); }
});

/* ======== READ ======== */
app.get("/api/trips", async (_req,res)=>{
  try{
    const q = await pool.query(
      `select id, title, destination, start_date, end_date, budget, created_at
         from trips
         order by start_date asc, created_at desc`
    );
    res.json(q.rows);
  }catch(e){ res.status(500).json({error:String(e)}); }
});

app.get("/api/wishlist", async (_req,res)=>{
  try{
    const q = await pool.query(
      `select id,
              destination as place,
              coalesce(note,'') as note,
              added_at
         from wishlist
         order by added_at desc`
    );
    res.json(q.rows);
  }catch(e){ res.status(500).json({error:String(e)}); }
});

app.get("/api/saved", async (_req,res)=>{
  try{
    const q = await pool.query(
      `select id, destination_title, destination_region, image_url, saved_at
         from saved_destinations
         order by saved_at desc`
    );
    res.json(q.rows);
  }catch(e){ res.status(500).json({error:String(e)}); }
});

app.get("/api/activity", async (_req,res)=>{
  try{
    const [trips, wish, saved] = await Promise.all([
      pool.query(`select 'Trip' as type, title, destination as detail, created_at from trips`),
      pool.query(`select 'Wishlist' as type, destination as title, coalesce(note,'') as detail, added_at as created_at from wishlist`),
      pool.query(`select 'Saved' as type, destination_title as title, coalesce(destination_region,'') as detail, saved_at as created_at from saved_destinations`)
    ]);
    const all = [...trips.rows, ...wish.rows, ...saved.rows]
      .sort((a,b)=> new Date(b.created_at) - new Date(a.created_at));
    res.json(all);
  }catch(e){ res.status(500).json({error:String(e)}); }
});

/* ======== WRITE ======== */
app.post("/api/trips", async (req,res)=>{
  try{
    const { title, destination, start_date, end_date, budget } = req.body;
    const q = await pool.query(
      `insert into trips (title, destination, start_date, end_date, budget)
       values ($1,$2,$3,$4,$5)
       returning id, title, destination, start_date, end_date, budget, created_at`,
      [title, destination, start_date, end_date, budget]
    );
    res.json(q.rows[0]);
  }catch(e){ res.status(500).json({error:String(e)}); }
});

app.post("/api/wishlist", async (req,res)=>{
  try{
    const { place, note } = req.body;
    // tolerate missing 'note' column by trying; if it fails, try without note
    try{
      const q = await pool.query(
        `insert into wishlist (destination, note)
         values ($1,$2)
         returning id, destination as place, coalesce(note,'') as note, added_at`,
        [place, note]
      );
      return res.json(q.rows[0]);
    }catch(inner){
      // fallback if 'note' doesn't exist
      const q2 = await pool.query(
        `insert into wishlist (destination)
         values ($1)
         returning id, destination as place, '' as note, added_at`,
        [place]
      );
      return res.json(q2.rows[0]);
    }
  }catch(e){ res.status(500).json({error:String(e)}); }
});

/* HTML fallbacks - serve pages from organized structure */
app.get("/pages/flights.html", (_req,res)=>{
  res.sendFile(path.join(__dirname,"..","public","pages","flights.html"));
});
app.get("/pages/personal_dashboard.html", (_req,res)=>{
  res.sendFile(path.join(__dirname,"..","public","pages","personal_dashboard.html"));
});

// Boot
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`✅ Server running at http://localhost:${PORT}`));

const express = require('express')
const path = require('path')
const app = express()
const port = 3000
const config = require('./config.json')
const { startPuppeteer } = require('./puppeteer.js')
app.use(express.static(path.join(__dirname, 'public')));

const { Pool } = require('pg')

const { user, host, database, password, pgport, mesh_table, poi_table } = config;

// 创建数据库连接池
const pool = new Pool({
  user,
  host,
  database,
  password, // 请替换为你的数据库密码
  port: pgport,
})
// 数据库连接
pool.connect((err, client, done) => {
  if (err) {
    console.error('数据库连接错误:', err)
  } else {
    console.log('成功连接到PostgreSQL数据库')
    createTable(poi_table)
  }
})
const createTable = (poi_table) => {
  const query = `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = '${poi_table}'
    )`;
  
  pool.query(query, (err, result) => {
    if (err) {
      console.error('查询表是否存在时出错:', err);
      return;
    }

    if (!result.rows[0].exists) {
      // ... existing code ...
      const createPoiTableSQL = `
        CREATE TABLE ${poi_table} (
          gid SERIAL PRIMARY KEY,	
          uid VARCHAR(255),
          geom GEOMETRY(Point, 4326),
          addr VARCHAR(255),
          cp VARCHAR(50),
          direction VARCHAR(20),
          distance VARCHAR(255),
          title VARCHAR(255),
          city VARCHAR(255),
          type INT,
          poi_type VARCHAR(50),
          point_x NUMERIC,
          point_y NUMERIC,
          postcode VARCHAR(10),
          phone_number VARCHAR(20),
          tag VARCHAR(100),
          tel VARCHAR(20),
          lng NUMERIC,
          lat NUMERIC,
          zip VARCHAR(20),
          name VARCHAR(255),
          parent_poi_addr VARCHAR(255),
          parent_poi_point_x NUMERIC,
          parent_poi_point_y NUMERIC,
          parent_poi_direction VARCHAR(20),
          parent_poi_distance VARCHAR(255),
          edz_name VARCHAR(255),
          street VARCHAR(255),
          street_number VARCHAR(255),
          district VARCHAR(20),
          province VARCHAR(20),
          adcode VARCHAR(20),
          city_code VARCHAR(20),
          country VARCHAR(20),
          country_code VARCHAR(50),
          town VARCHAR(20),
          town_code VARCHAR(20),
          business VARCHAR(255),
          poi_desc VARCHAR(255)
        )`;
        // 执行创建表的SQL语句
        pool.query(createPoiTableSQL, (err, result) => {
          if (err) {
            console.error('创建POI表失败:', err);
            return;
          }
          console.log('POI表创建成功');
        });
        // 这里接下来怎么做
        // ... existing code ...
    } else {
      console.log(`表 ${mesh_table} 已存在`);
    }
  });
}

app.get('/beijing-mesh', async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const result = await pool.query(
      `SELECT * FROM ${mesh_table} WHERE status = 1 LIMIT $1 OFFSET $2`,  // 修正 WHERE 子句位置
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('查询出错:', err);
    res.status(500).json({ error: '查询数据库时出错' });
  }
});

// 添加 body-parser 中间件来解析 POST 请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/insertdata', async (req, res) => {
  const data = req.body;
  console.log(data, 'insertdata')
  try {
    // 批量插入数据
    for (const item of data) {
      await pool.query(
        `INSERT INTO ${poi_table} (
          uid, geom, cp, direction, distance, title, point_x, point_y,
          city, poi_type, type, addr, postcode, phone_number, tag, tel,
          lng, lat, zip, name, parent_poi_addr, parent_poi_point_x,
          parent_poi_point_y, parent_poi_direction, parent_poi_distance,
          edz_name, street, street_number, district, province, adcode,
          country, country_code, town, town_code, business, poi_desc
        ) VALUES (
          $1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
          $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38
        )`,
        [
          item.uid, item.point_x, item.point_x, item.cp, item.direction, item.distance,
          item.title, item.point_x, item.point_y, item.city, item.poi_type,
          item.type, item.addr, item.postcode, item.phone_number, item.tag,
          item.tel, item.lng, item.lat, item.zip, item.name, item.parent_poi_addr,
          item.parent_poi_point_x, item.parent_poi_point_y, item.parent_poi_direction,
          item.parent_poi_distance, item.edz_name, item.street, item.street_number,
          item.district, item.province, item.adcode, item.country, item.country_code,
          item.town, item.town_code, item.business, item.poi_desc
        ]
      );
    }
    res.json({ message: '数据插入成功', data, });
  } catch (err) {
    console.error('插入数据出错:', err);
    res.status(500).json({ error: '插入数据时出错' });
  }
});

app.post('/updatastatus', async (req, res) => {
  const data = req.body;
  try {
    // 使用 IN 操作符一次性更新多个 gid
    const query = `
      UPDATE ${mesh_table}
      SET status = 0
      WHERE gid = ANY($1)
    `;
    await pool.query(query, [data]);
    res.json({ message: '数据修改成功' });
  } catch (err) {
    console.error('更新状态出错:', err);
    res.status(500).json({ error: '更新状态时出错' });
  }
})
app.post('/test', async (req, res) => {
  const data = req.body;
  console.log(data, 'data')
  res.json({ message: 'get' });
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// startPuppeteer();
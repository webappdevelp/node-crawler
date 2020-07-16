// const Koa = require('koa');
const Express = require('express');
// const Router = require('koa-router');
const cheerio = require('cheerio');
const curl = require('superagent');
const nodeExcel = require('excel-export');

require('superagent-charset')(curl);
const app = Express();
// const router = new Router();


app.get('/', async (req, res) => {
  const url = 'http://www.weather.com.cn/weather/101280601.shtml';
  try {
    const html = await curl.get(url).charset('utf-8');
    const $ = cheerio.load(html.text, { decodeEntities: false });
    const weathers = [];
    $('#7d ul.t li').each((i, el) => {
      const day = $('h1', el).text();
      const wea = $('.wea', el).text();
      const tem = $('.tem', el).text().replace(/\n/g, '');
      const win = $('.win', el).text().replace(/\n/g, '');
      weathers.push({ day, wea, tem, win });
    });
    const excelConfig = {};
    excelConfig.stylesXmlFile = 'styles.xml';
    excelConfig.name = 'mysheet';
    excelConfig.cols = [
      { caption: '日期', type: 'string' },
      { caption: '天气', type: 'string' },
      { caption: '气温', type: 'string' },
      { caption: '风力', type: 'string' }
    ];
    const rows = [];
    weathers.forEach((val, i) => {
      if (!rows[i]) rows[i] = [];
      rows[i].push(val.day, val.wea, val.tem, val.win);
    });
    excelConfig.rows = rows;
    const result = nodeExcel.execute(excelConfig);
    res.set('Content-Type', 'application/vnd.openxmlformats');
    res.set("Content-Disposition", "attachment; filename=" + "weather.xlsx");
    res.end(result, 'binary');
  } catch (err) {
    res.end(err);
  }
});

/* router.get('/weather', async (req, res) => {
  res.end('weather');
});

app.use(router.routes());
app.use(router.allowedMethods()); */

app.listen(3000, () => console.log('服务已启动'));
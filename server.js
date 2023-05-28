const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');
const todos = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
    'Content-Type': 'application/json'
  }
  // 接收POST API的body資料
  let body = '';
  req.on('data', (chunk) => {
    console.log(chunk);
    body += chunk;
  })

  // GET 請求
  if (req.url == '/todos' && req.method == 'GET') {
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': 'success',
      'data': todos,
    }));
    res.end();
    // POST 請求 ↓
  } else if (req.url == '/todos' && req.method == 'POST') {
    // 先使用end確保body有資料並觸發函式內的程式碼
    req.on('end', () => {
      try {
        // 使用JSON.parse取body資料(從字串轉物件再讀取裡面的屬性title,就會得到對應屬性值)
        const title = JSON.parse(body).title;
        // POST新增的資料有正確的物件包覆上方JSON.parse(body)內的title屬性
        if (title !== undefined) {
          //  自組物件資料集，push到data
          const todo = {
            "title": title,
            "id": uuidv4(),
          }
          // 設定好後，把todo物件Push到變數todos空陣列內，再到Postman測試就會看到body內有前面新增的資料了
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': 'success',
            'data': todos,
          }));
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (err) {
        errorHandle(res);
      }
    })
    // DELETE 請求＿所有 ↓
  } else if (req.url == '/todos' && req.method == 'DELETE') {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(JSON.stringify({
      'status': "success",
      'data': todos,
    }));
    res.end();
    // DELETE 請求＿單筆 ↓
  } else if (req.url.startsWith('/todos/') && req.method == 'DELETE') {
    const id = req.url.split('/').pop();
    const index = todos.findIndex((item) => item.id == id);
    // 判斷有此筆代辦事項才做刪除
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        'status': "success",
        'data': todos,
      }));
      res.end();
    } else {
      errorHandle(res);
    }

  } else if (req.url.startsWith('/todos/') && req.method == 'PATCH') {
    req.on('end', () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex((item) => item.id == id);
        if (todo !== undefined && index !== -1) {
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.write(JSON.stringify({
            'status': "success",
            'data': todos,
          }));
          res.end();
        } else {
          errorHandle(res);
        }
      } catch {
        errorHandle(res);
      }
    })
  }
  else if (req.method == 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  }
  else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({
      'status': 'false',
      'message': '無此網站路由'
    }));
    res.end();
  }

}
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005); // 瀏覽器使用 127.0.0.1:3005開啟
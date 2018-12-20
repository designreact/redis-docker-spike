const { handler } = require('./index');

function rinseAndRepeat() {
  setTimeout(() => {
    handler();
    rinseAndRepeat();
  }, 1000)
}

rinseAndRepeat();
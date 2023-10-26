global.WebSocket = require("ws");
const { CONFIG } = require("./config");
const { lastDecimalDigit, getPercentage } = require("./ticks");
const websocket = new WebSocket(
  `wss://ws.derivws.com/websockets/v3?app_id=${CONFIG.app_id}`
);

function predictNextNumber(sequence) {
  const lastNumber = sequence[sequence.length - 1];
  const nextNumber = lastNumber + 1; // Dự đoán số tiếp theo là số lớn hơn 1 đơn vị so với số cuối cùng

  return nextNumber;
}

const getThreeSmallestValues = (obj) => {
  const keyValueArray = Object.entries(obj);
  keyValueArray.sort((a, b) => a[1] - b[1]);
  return keyValueArray.slice(0, 3).map((i) => Number(i[0]));
};

const website_status = (req_id) => ({
  req_id,
  website_status: 1,
});

const authorize = (req_id) => ({
  req_id,
  authorize: CONFIG.user_token,
});

const ticks_history = (req_id) => ({
  ticks_history: "R_100",
  style: "ticks",
  end: "latest",
  count: 100,
  granularity: 60,
  adjust_start_time: 1,
  subscribe: 1,
  req_id,
});

const proposal = (req_id, amount, barrier) => ({
  amount,
  req_id,
  proposal: 1,
  subscribe: 1,
  basis: "stake",
  contract_type: "DIGITDIFF",
  currency: "USD",
  symbol: "R_100",
  duration: 1,
  duration_unit: "t",
  barrier: barrier,
});

const buy_contract = (req_id, proposal_id, amount) => ({
  buy: proposal_id,
  price: amount,
  req_id,
});

const ping = (req_id) => ({
  req_id,
  ping: 1,
});

const balance = (req_id) => ({
  balance: 1,
  subscribe: 1,
  account: "CR6060048",
  req_id,
});

const payload = (data) => {
  req_id++;
  return JSON.stringify(data);
};

const ping_interval = 12000; // it's in milliseconds, which equals to 120 seconds
let interval;
let req_id = 1;
let siteStatus = "up";
let accountInfo = {
  balance: 0,
  user_id: null,
  account_list: [],
};
let prices = [];
let latestTick = null;
let buyReqId = null;
let isBuy = true;
websocket.addEventListener("open", (event) => {
  websocket.send(payload(ping(req_id)));
  websocket.send(payload(website_status(req_id)));
  websocket.send(payload(authorize(req_id)));
  websocket.send(payload(ticks_history(req_id)));
  websocket.send(payload(balance(req_id)));

  setInterval(() => {
    websocket.send(payload(balance(req_id)));
  }, 5000);
  interval = setInterval(() => {
    websocket.send(payload(ping(req_id)));
  }, ping_interval);
});

// subscribe to close event
websocket.addEventListener("close", (event) => {
  clearInterval(interval);
});

const array = [];
// subscribe to message event
websocket.addEventListener("message", (event) => {
  const receivedMessage = JSON.parse(event.data);
  switch (receivedMessage.msg_type) {
    case "ping":
      break;
    case "website_status":
      siteStatus = receivedMessage.website_status?.site_status;
      break;
    case "authorize":
      accountInfo.balance = receivedMessage.authorize?.balance;
      accountInfo.user_id = receivedMessage.authorize?.user_id;
      accountInfo.account_list = receivedMessage.authorize?.account_list;
      break;
    case "history":
      prices = receivedMessage.history?.prices || [];
      break;
    case "tick":
      let quote = receivedMessage.tick?.quote;
      prices.push(quote);
      prices.shift();
      latestTick = lastDecimalDigit(quote);
      const percentage = getPercentage(prices);
      const smallest = getThreeSmallestValues(percentage);
      const randomItem = smallest[Math.floor(Math.random() * smallest.length)];
      const probability = predictNextNumber(array);
      console.log("Tick_OK: ", probability);
      console.log("Tick: ", latestTick);
      array.push(latestTick);
      // if (smallest.includes(latestTick)) {
      //   if (isBuy) {
      //     isBuy = false;
      //     // websocket.send(payload(proposal(req_id, 5, randomItem)));
      //     console.log(proposal(req_id, 5, randomItem))
      //   } else {
      //     isBuy = true;
      //   }
      // }
      break;
    case "proposal":
      console.log(
        "Buying contract! with number = ",
        receivedMessage?.proposal?.contract_details?.barrier
      );
      const propId = receivedMessage.proposal?.id;
      websocket.send(payload(buy_contract(req_id, propId, 5)));
      buyReqId = null;
      break;
    case "balance":
      // console.log('===================')
      // console.log('CURRENT BALANCE: ', receivedMessage.balance?.balance)
      // console.log('===================')
      break;
    case "buy":
      break;
    default:
      console.log("No type", receivedMessage);
      break;
  }
});

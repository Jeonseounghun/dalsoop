var express = require("express");
var got = require("got");
var url = require("url")
var http = require(`http`);
var uuid = require("uuid").v4;

var router = express.Router();

var secretKey = "test_sk_aBX7zk2yd8yLP949jwLrx9POLqKQ";
function get_query() { var url = document.location.href; var qs = url.substring(url.indexOf('?') + 1).split('&'); for (var i = 0, result = {}; i < qs.length; i++) { qs[i] = qs[i].split('='); result[qs[i][0]] = decodeURIComponent(qs[i][1]); } return result; }


router.get("/", function (req, res) {
  res.render("index", {
    title: "구매하기",
    orderId: uuid(),
    customerName: "김토스",
  });
});

router.get("/success", function (req, res) {
  got
    .post("https://api.tosspayments.com/v1/payments/" + req.query.paymentKey, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      json: {
        orderId: req.query.orderId,
        amount: req.query.amount,
      },
      responseType: "json",
    })
    .then(function (response) {
      console.log(response.body);
      // TODO: 구매 완료 비즈니스 로직 구현

      res.render("success", {
        title: "성공적으로 구매했습니다",
        amount: response.body.totalAmount,
      });
    })
    .catch(function (error) {
      res.redirect(
        `/fail?code=${error.response?.body?.code}&message=${error.response?.body?.message}`
      );
    });
});

router.get("/billingkey", function (req, res) {

  got
    .post('https://api.tosspayments.com/v1/billing/authorizations/' + req.query.authKey, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      json: {
        customerKey: req.query.customerKey,
      },
      responseType: "json",
    })
    .then(function (response) {
      console.log(response.body);
      // TODO: 구매 완료 비즈니스 로직 구현
      res.render("billingkey", {
        title: "성공적으로 구매했습니다",
        billkey: response.body.billingKey,
        customerKey: response.body.customerKey,
        secretKey: "Basic " + Buffer.from(secretKey + ":").toString("base64"),
      })
    })
    .catch(function (error) {
      res.redirect(
        `/fail?code=${error.response?.body?.code}&message=${error.response?.body?.message}`
      );
    });
})

router.get("/billingbuy", function (req, res) {
  got
    .post('https://api.tosspayments.com/v1/billing/' + req.query.billingkey, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      json: {
        customerKey: req.query.customerKey,
        amount: 100,
        orderId: req.query.orderid,
        orderName: "달숲정기구독"
      },
      responseType: "json",
    })
    .then(function (response) {
      console.log(response.body);
      // TODO: 구매 완료 비즈니스 로직 구현
      res.render("billingbuy", {
        title: "정기구독완료",
        totalAmount: response.body.totalAmount
      });
    })
    .catch(function (error) {
      res.redirect(
        `/fail?code=${error.response?.body?.code}&message=${error.response?.body?.message}`
      );
    });



});

router.get("/fail", function (req, res) {
  res.render("fail", {
    message: req.query.message,
    code: req.query.code,
  });
});

module.exports = router;

/** BizTime express application. */

//** Requirements */

const express = require("express"), app = express(), ExpressError = require("./expressError");

app.use(express.json());

//** Routes */

const { companyRoutes } = require("./routes/companies"), { invoiceRoutes } = require("./routes/invoices"), { industryRoutes } = require("./routes/industries");

app.use("/companies", companyRoutes);
app.use("/invoices", invoiceRoutes);
app.use("/industries", industryRoutes);

/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: err,
  });
});


module.exports = app;
